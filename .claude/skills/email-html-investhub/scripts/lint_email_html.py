#!/usr/bin/env python3
"""
Contrôle d'un email HTML (ou d'un fragment de gabarit) contre les règles
d'intégration email InvestHub.

Usage :
  python3 lint_email_html.py email.html                 # document complet
  python3 lint_email_html.py gabarit.html --fragment    # fragment injecté par la plateforme
  python3 lint_email_html.py email.html --text-out email.txt   # génère aussi la version texte
  python3 lint_email_html.py email.html --json          # sortie machine
  python3 lint_email_html.py --contrast "#000E2B" "#CBFF99"    # ratio de contraste WCAG

Code de sortie : 0 si aucune erreur, 1 sinon. Les alertes n'empêchent pas la
livraison mais doivent être justifiées dans le récap.

Aucune dépendance hors bibliothèque standard.
"""

from __future__ import annotations

import argparse
import html as htmlmod
import json
import os
import re
import sys
from html.parser import HTMLParser

MAX_STYLE_CHARS = 8192
MAX_HTML_BYTES = 100 * 1024
WARN_HTML_BYTES = 90 * 1024
MIN_FONT_PX = 14
MIN_TOUCH_PX = 44

VOID_TAGS = {"img", "br", "hr", "meta", "link", "input", "area", "base", "col", "wbr", "source"}
FORBIDDEN_TAGS = {"script", "form", "iframe", "svg", "button", "input", "select", "textarea",
                  "video", "audio", "object", "embed", "canvas"}
FORBIDDEN_CSS = [
    (r"display\s*:\s*(flex|grid|inline-flex|inline-grid)", "flexbox / grid"),
    (r"(^|;|\s)position\s*:", "position"),
    (r"box-shadow\s*:", "box-shadow"),
    (r"(^|;|\s)transform\s*:", "transform"),
    (r"animation(-[a-z]+)?\s*:", "animation"),
    (r"transition(-[a-z]+)?\s*:", "transition"),
    (r"background-image\s*:", "background-image"),
    (r"(linear|radial|conic)-gradient\(", "dégradé"),
]
TEXT_BLOCKS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "div", "blockquote"}
GENERIC_LINK_TEXTS = {"cliquez ici", "cliquer ici", "click here", "ici", "here", "lien", "link", "cliquez", "click"}
SHORTENERS = ("bit.ly", "tinyurl.com", "t.co/", "goo.gl", "lnkd.in", "ow.ly", "buff.ly", "rebrand.ly", "cutt.ly")
INTERNAL_HOSTS = ("atlassian.net", "/browse/", "confluence", "jira")
PURE_COLORS = {"#ffffff", "#fff", "#000000", "#000", "white", "black"}


# --------------------------------------------------------------------------- #
# Utilitaires
# --------------------------------------------------------------------------- #

def parse_style(style: str) -> dict:
    out = {}
    for decl in style.split(";"):
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        out[k.strip().lower()] = v.strip()
    return out


def px(value: str | None) -> float | None:
    if value is None:
        return None
    m = re.match(r"\s*(-?\d+(\.\d+)?)\s*px", value)
    return float(m.group(1)) if m else None


def padding_vertical(style: dict) -> float:
    top = px(style.get("padding-top"))
    bottom = px(style.get("padding-bottom"))
    short = style.get("padding")
    if short:
        parts = re.findall(r"-?\d+(?:\.\d+)?(?:px)?", short.replace("!important", ""))
        nums = [float(p.replace("px", "")) for p in parts]
        if nums:
            if len(nums) == 1:
                t = b = nums[0]
            elif len(nums) == 2:
                t = b = nums[0]
            elif len(nums) == 3:
                t, b = nums[0], nums[2]
            else:
                t, b = nums[0], nums[2]
            top = t if top is None else top
            bottom = b if bottom is None else bottom
    return (top or 0) + (bottom or 0)


def normalize_color(value: str) -> str:
    v = value.strip().lower().replace("!important", "").strip()
    return v


def relative_luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

    def lin(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast_ratio(fg: str, bg: str) -> float:
    l1, l2 = relative_luminance(fg), relative_luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


# --------------------------------------------------------------------------- #
# Collecte des éléments
# --------------------------------------------------------------------------- #

def has_descendant(elements: list[dict], el: dict, tag: str) -> bool:
    todo = list(el["children"])
    while todo:
        c = elements[todo.pop()]
        if c["tag"] == tag:
            return True
        todo.extend(c["children"])
    return False


class Collector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.elements: list[dict] = []
        self.stack: list[int] = []

    def handle_starttag(self, tag, attrs):
        attrs_d = {}
        for k, v in attrs:
            attrs_d[k.lower()] = v if v is not None else ""
        el = {
            "tag": tag.lower(),
            "attrs": attrs_d,
            "style_raw": attrs_d.get("style", ""),
            "style": parse_style(attrs_d.get("style", "")),
            "line": self.getpos()[0],
            "text": "",
            "children": [],
            "parent": self.stack[-1] if self.stack else None,
        }
        idx = len(self.elements)
        self.elements.append(el)
        if self.stack:
            self.elements[self.stack[-1]]["children"].append(idx)
        if el["tag"] not in VOID_TAGS:
            self.stack.append(idx)

    def handle_endtag(self, tag):
        tag = tag.lower()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.elements[self.stack[i]]["tag"] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if not data.strip():
            return
        for idx in self.stack:
            self.elements[idx]["text"] += data


class Report:
    def __init__(self) -> None:
        self.items: list[dict] = []

    def add(self, level: str, code: str, message: str, line: int | None = None) -> None:
        self.items.append({"level": level, "code": code, "message": message, "line": line})

    def error(self, code, message, line=None):
        self.add("ERREUR", code, message, line)

    def warn(self, code, message, line=None):
        self.add("ALERTE", code, message, line)

    def info(self, code, message, line=None):
        self.add("INFO", code, message, line)

    def count(self, level: str) -> int:
        return sum(1 for i in self.items if i["level"] == level)


# --------------------------------------------------------------------------- #
# Contrôles
# --------------------------------------------------------------------------- #

def check_document(raw: str, report: Report) -> None:
    head = raw[:1500]
    m = re.search(r"<!DOCTYPE[^>]*>", head, re.I)
    if not m:
        report.error("DOCTYPE", "Doctype absent. Attendu : XHTML 1.0 Transitional ou HTML 4.01 Transitional.", 1)
    else:
        d = m.group(0)
        if not re.search(r"(XHTML 1\.0 Transitional|HTML 4\.01 Transitional)", d, re.I):
            report.error("DOCTYPE", "Doctype non conforme : utiliser XHTML 1.0 Transitional ou HTML 4.01 Transitional "
                                    "(le doctype HTML5 change le rendu des images et des espaces dans plusieurs clients).", 1)

    html_tag = re.search(r"<html\b[^>]*>", raw, re.I)
    if not html_tag:
        report.error("HTML", "Balise <html> absente.", 1)
    else:
        lang = re.search(r"\blang\s*=\s*[\"']([a-zA-Z-]+)[\"']", html_tag.group(0))
        if not lang:
            report.error("LANG", "Attribut lang absent sur <html> (lecteurs d'écran, correcteurs, traduction automatique).", 1)
        elif lang.group(1).lower().split("-")[0] not in ("fr", "en"):
            report.warn("LANG", f"lang=\"{lang.group(1)}\" : vérifier la langue du contenu (fr ou en attendu).", 1)

    if not re.search(r"<meta[^>]+charset\s*=\s*[\"']?utf-8", raw, re.I):
        report.error("CHARSET", "Déclaration UTF-8 absente : <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">.")

    if not re.search(r"<meta[^>]+name\s*=\s*[\"']color-scheme[\"'][^>]+light dark", raw, re.I):
        report.error("DARKMODE", "<meta name=\"color-scheme\" content=\"light dark\"> absent : Apple Mail n'appliquera pas vos styles sombres.")
    if not re.search(r"<meta[^>]+name\s*=\s*[\"']supported-color-schemes[\"'][^>]+light dark", raw, re.I):
        report.error("DARKMODE", "<meta name=\"supported-color-schemes\" content=\"light dark\"> absent.")

    if not re.search(r"OfficeDocumentSettings", raw) or not re.search(r"<o:PixelsPerInch>\s*96\s*</o:PixelsPerInch>", raw):
        report.error("MSO-DPI", "Bloc OfficeDocumentSettings avec PixelsPerInch à 96 absent du <head> (mise à l'échelle Outlook).")

    if not re.search(r"prefers-color-scheme\s*:\s*dark", raw, re.I):
        report.warn("DARKMODE", "Aucune media query @media (prefers-color-scheme: dark) : Apple Mail, Outlook Mac et Thunderbird n'auront pas de version sombre maîtrisée.")

    uses_webfont = bool(re.search(r"fonts\.googleapis|@font-face|@import", raw, re.I))
    mso_blocks = re.findall(r"<!--\[if[^\]]*mso[^\]]*\]>(.*?)<!\[endif\]-->", raw, re.I | re.S)
    mso_font_fallback = any(re.search(r"font-family\s*:\s*[^;]*(Arial|Helvetica)", b, re.I) for b in mso_blocks)
    if uses_webfont and not mso_font_fallback:
        report.error("MSO-FONT", "Web font utilisée sans forçage Arial/Helvetica dans un bloc <!--[if mso]> : Outlook basculera en Times New Roman.")

    if not re.search(r"mso-hide\s*:\s*all", raw, re.I):
        report.info("PREHEADER", "Aucun preheader masqué détecté (span/div avec display:none et mso-hide:all). Facultatif mais recommandé.")

    if not re.search(r"d[ée]sabonn|d[ée]sinscri|unsubscribe|se d[ée]sinscrire", raw, re.I):
        report.warn("UNSUB", "Aucun lien de désabonnement visible dans le corps. Obligatoire pour tout envoi marketing.")

    size = len(raw.encode("utf-8"))
    if size > MAX_HTML_BYTES:
        report.error("POIDS", f"Source HTML de {size} octets : au-dessus de 100 Ko, Gmail tronque le message.")
    elif size > WARN_HTML_BYTES:
        report.warn("POIDS", f"Source HTML de {size} octets : proche de la limite de 100 Ko de Gmail.")
    else:
        report.info("POIDS", f"Source HTML : {size} octets (limite 102 400).")


def check_style_blocks(raw: str, report: Report, fragment: bool) -> None:
    blocks = list(re.finditer(r"<style\b[^>]*>(.*?)</style>", raw, re.I | re.S))
    if fragment and blocks:
        report.warn("STYLE", "Un fragment de gabarit ne devrait pas porter de bloc <style> : la plateforme fournit l'enveloppe. Tout doit être inline.")
    for b in blocks:
        css = b.group(1)
        line = raw.count("\n", 0, b.start()) + 1
        if len(css) > MAX_STYLE_CHARS:
            report.error("STYLE-8K", f"Bloc <style> de {len(css)} caractères : au-dessus de 8 192, Gmail supprime tout le bloc.", line)
        if "<!--" in css or "-->" in css:
            report.error("STYLE-COMMENT", "Commentaire HTML dans un bloc <style> : Yahoo supprime tout ce qui suit.", line)
        if re.search(r"background-image\s*:", css, re.I):
            report.error("STYLE-BGIMG", "background-image dans un bloc <style> : Gmail supprime tout le bloc.", line)
        if css.count("{") != css.count("}"):
            report.error("STYLE-SYNTAX", "Accolades déséquilibrées dans le bloc <style> : Gmail supprime tout le bloc à la première erreur de syntaxe.", line)
        if re.search(r"\s!important", css):
            report.error("IMPORTANT", "Espace avant !important dans le <style> : Yahoo supprime la déclaration. Écrire valeur!important.", line)
        for mfs in re.finditer(r"font-size\s*:\s*(\d+(?:\.\d+)?)px", css, re.I):
            if float(mfs.group(1)) < MIN_FONT_PX and float(mfs.group(1)) > 2:
                report.error("FONT-MIN", f"font-size {mfs.group(1)}px dans le <style> : jamais sous {MIN_FONT_PX}px.", line)
        for pat, label in FORBIDDEN_CSS:
            if label == "background-image":
                continue
            if re.search(pat, css, re.I):
                report.error("CSS-INTERDIT", f"{label} dans le <style> : non supporté par les clients mail cibles.", line)
        report.info("STYLE", f"Bloc <style> : {len(css)} caractères (limite {MAX_STYLE_CHARS}).", line)


def check_elements(raw: str, elements: list[dict], report: Report, fragment: bool) -> None:
    has_ghost = bool(re.search(r"<!--\[if[^\]]*mso[^\]]*\]>\s*<table", raw, re.I))
    has_vml = bool(re.search(r"<v:(roundrect|rect)\b", raw, re.I))
    button_tds = 0
    div_count = 0
    h1_count = 0
    semantic = 0
    fonts_seen: set[str] = set()

    for el in elements:
        tag, attrs, style, sraw, line = el["tag"], el["attrs"], el["style"], el["style_raw"], el["line"]

        if tag in FORBIDDEN_TAGS:
            report.error("BALISE-INTERDITE", f"<{tag}> : zéro JavaScript, formulaire, iframe, SVG ou contrôle de formulaire dans un email.", line)
            continue

        if re.search(r"\s!important", sraw):
            report.error("IMPORTANT", "Espace avant !important dans un style inline : Yahoo supprime la déclaration.", line)

        for pat, label in FORBIDDEN_CSS:
            if re.search(pat, sraw, re.I):
                report.error("CSS-INTERDIT", f"{label} en CSS inline sur <{tag}> : non supporté par les clients mail cibles.", line)

        if "border-radius" in style or any(k.endswith("radius") for k in style):
            report.warn("OUTLOOK-RADIUS", f"border-radius sur <{tag}> : Outlook rend des angles droits. Acceptable seulement si le design tient en angles droits.", line)

        if "max-width" in style and tag != "div":
            if not has_ghost:
                report.error("OUTLOOK-MAXWIDTH", f"max-width sur <{tag}> sans ghost table MSO : Outlook ignore max-width et rend pleine largeur. Encadrer d'une table <!--[if mso]> de largeur fixe.", line)

        if "font-family" in style:
            fonts_seen.add(style["font-family"].lower())

        # Tailles de police
        fs = px(style.get("font-size"))
        if fs is not None:
            hidden = re.search(r"display\s*:\s*none|mso-hide\s*:\s*all", sraw, re.I)
            lh = px(style.get("line-height"))
            spacer = fs <= 2 and (lh is None or lh <= 2) and not el["text"].strip().replace("\xa0", "")
            if fs < MIN_FONT_PX and not hidden and not spacer:
                report.error("FONT-MIN", f"font-size {fs:g}px sur <{tag}> : corps à 16px, jamais sous {MIN_FONT_PX}px.", line)
            if lh is not None and tag in TEXT_BLOCKS and "mso-line-height-rule" not in sraw.lower() and not hidden and not spacer:
                report.warn("MSO-LH", f"line-height sans mso-line-height-rule:exactly sur <{tag}> : Outlook peut agrandir l'interlignage.", line)
            if tag == "p" and lh is not None and fs >= MIN_FONT_PX and lh / fs < 1.3:
                report.warn("INTERLIGNAGE", f"<p> à {fs:g}px avec line-height {lh:g}px (ratio {lh / fs:.2f}) : viser 1.4 à 1.5.", line)
        elif "line-height" in style and tag in TEXT_BLOCKS and "mso-line-height-rule" not in sraw.lower():
            report.warn("MSO-LH", f"line-height sans mso-line-height-rule:exactly sur <{tag}>.", line)

        # Couleurs pures
        for key in ("color", "background-color", "background"):
            val = style.get(key)
            if val and normalize_color(val).split()[0] in PURE_COLORS:
                report.warn("DARKMODE-PUR", f"{key}:{val} sur <{tag}> : le blanc et le noir purs déclenchent l'inversion la plus agressive en dark mode. Préférer #FAFAFA / #222222.", line)
        if attrs.get("bgcolor", "").lower() in PURE_COLORS:
            report.warn("DARKMODE-PUR", f"bgcolor={attrs['bgcolor']} sur <{tag}> : préférer un off-white type #FAFAFA.", line)

        if tag == "table":
            has_th = has_descendant(elements, el, "th")
            if attrs.get("role", "").lower() != "presentation" and not has_th:
                report.error("TABLE-ROLE", "table sans role=\"presentation\" : les lecteurs d'écran annoncent un tableau de données.", line)
            for a in ("cellpadding", "cellspacing", "border"):
                if attrs.get(a) != "0":
                    report.error("TABLE-ATTR", f"table sans {a}=\"0\" en attribut HTML.", line)
            if "width" not in attrs:
                report.error("TABLE-WIDTH", "table sans attribut width (Outlook et Samsung Mail se calent sur l'attribut HTML, pas sur le CSS).", line)

        if tag == "div":
            div_count += 1
            if any(k.startswith("padding") for k in style):
                report.error("PADDING-DIV", "padding sur <div> : le padding se pose sur <td>, jamais sur <div>.", line)

        if tag == "img":
            if any(k.startswith("padding") for k in style) or any(k.startswith("margin") for k in style):
                report.error("PADDING-IMG", "padding ou margin sur <img> : Outlook les ignore. Poser l'espacement sur le <td> parent.", line)
            if "alt" not in attrs:
                report.error("IMG-ALT", "<img> sans attribut alt. alt=\"\" si décorative, alt descriptif et stylé sinon.", line)
            if "width" not in attrs:
                report.error("IMG-WIDTH", "<img> sans attribut width.", line)
            responsive = bool(re.search(r"width\s*:\s*100%", sraw, re.I))
            if "height" not in attrs and not responsive:
                report.error("IMG-HEIGHT", "<img> à largeur fixe sans attribut height : la mise en page saute tant que l'image n'est pas chargée.", line)
            if responsive and re.search(r"(^|;)\s*height\s*:", sraw, re.I):
                report.error("IMG-CSS-HEIGHT", "height en CSS sur une image responsive : Yahoo le convertit en min-height et casse le ratio. Retirer le height CSS.", line)
            if not re.search(r"display\s*:\s*block", sraw, re.I):
                report.error("IMG-BLOCK", "<img> sans display:block : espace fantôme sous l'image dans Gmail et Outlook.", line)
            src = attrs.get("src", "")
            if src.startswith("data:"):
                report.error("IMG-BASE64", "Image en base64 : bloquée par Gmail et Outlook. Héberger en HTTPS.", line)
            elif not src.startswith("https://") and not (fragment and src.startswith("$")) and not src.startswith("{{"):
                report.error("IMG-HTTPS", f"src=\"{src[:60]}\" : les images doivent être servies en HTTPS depuis un domaine stable.", line)
            alt = attrs.get("alt", "")
            try:
                w = float(attrs.get("width", "0") or 0)
            except ValueError:
                w = 0
            if alt.strip() and w >= 200 and not re.search(r"(color|font-family|font-size)\s*:", sraw, re.I):
                report.warn("IMG-ALT-STYLE", "alt non stylé (font-size, color, font-family) sur une image large : illisible images bloquées.", line)

        if tag == "a":
            text = " ".join(el["text"].split()).lower().strip(" .:!»«\"'")
            if text in GENERIC_LINK_TEXTS:
                report.error("LIEN-GENERIQUE", f"Libellé de lien \"{text}\" : le libellé doit décrire la destination (accessibilité, anti-spam).", line)
            href = attrs.get("href", "")
            if any(s in href for s in SHORTENERS):
                report.warn("LIEN-COURT", f"URL raccourcie ({href[:50]}) : pénalisée par les filtres. Pointer vers le domaine de l'expéditeur.", line)
            if any(s in href.lower() for s in INTERNAL_HOSTS):
                report.error("LIEN-INTERNE", f"Lien vers un outil interne ({href[:60]}) : un destinataire externe ne doit jamais recevoir un lien Jira ou Confluence.", line)
            if any(k.startswith("padding") for k in style) and re.search(r"background", sraw, re.I):
                report.warn("BOUTON-A", "Bouton construit sur le <a> (fond + padding) : Outlook ignore le padding du lien. Poser bgcolor et padding sur le <td>, lien texte dedans, VML en conditionnel MSO.", line)

        if tag == "td":
            bg = attrs.get("bgcolor") or style.get("background-color")
            child_a = [elements[c] for c in el["children"] if elements[c]["tag"] == "a"]
            if bg and child_a and el["text"].strip():
                button_tds += 1
                lh = px(style.get("line-height")) or px(child_a[0]["style"].get("line-height")) or 20
                total = padding_vertical(style) + lh
                if total < MIN_TOUCH_PX:
                    report.warn("BOUTON-44", f"Bouton d'environ {total:g}px de haut : zone cliquable minimum 44px (padding vertical + line-height).", line)

        if tag == "h1":
            h1_count += 1
        if tag in ("h1", "h2", "h3", "p", "ul", "ol"):
            semantic += 1

    if button_tds and not has_vml:
        report.warn("BOUTON-VML", f"{button_tds} bouton(s) en <td bgcolor> sans version VML (<v:roundrect>) en conditionnel MSO : dans Outlook le bouton perd son padding.")
    if div_count:
        report.info("DIV", f"{div_count} <div> dans le corps : tolérés sans padding ni largeur (preheader), la structure reste en tables.")
    if not fragment:
        if h1_count == 0:
            report.warn("H1", "Aucun <h1> : la hiérarchie sémantique (h1, h2, p, listes) sert les lecteurs d'écran.")
        elif h1_count > 1:
            report.warn("H1", f"{h1_count} <h1> : un seul titre principal par email.")
    if semantic == 0 and elements:
        report.warn("SEMANTIQUE", "Aucun <h1>/<h2>/<p>/<ul> : le texte est posé directement dans des <td>. Utiliser de vraies balises sémantiques.")
    for f in fonts_seen:
        if "arial" not in f and "helvetica" not in f:
            report.warn("FONT-STACK", f"Pile de polices sans Arial ni Helvetica : \"{f[:60]}\". Attendu : 'DM Sans', Helvetica, Arial, sans-serif.")
            break


def load_variable_catalog(start_dir: str, explicit: str | None) -> tuple[set[str], str | None]:
    """Cherche mailTemplateVariables.ts : chemin explicite, puis en remontant depuis le fichier, puis depuis le dossier courant."""
    candidates = []
    if explicit:
        candidates.append(explicit)
    for root in (start_dir, os.getcwd()):
        cur = os.path.abspath(root)
        for _ in range(8):
            candidates.append(os.path.join(cur, "src", "utils", "mailTemplateVariables.ts"))
            parent = os.path.dirname(cur)
            if parent == cur:
                break
            cur = parent
    for path in candidates:
        if path and os.path.isfile(path):
            content = open(path, encoding="utf-8").read()
            names = set(re.findall(r"^\s*'?(\$[A-Za-z_][A-Za-z0-9_.]*)'?\s*:\s*\{", content, re.M))
            if names:
                return names, path
    return set(), None


def load_starter_pack_usage(catalog_path: str | None) -> tuple[set[str], set[str]]:
    """Variables réellement passées à un point d'envoi (verified) et variables seulement proposées, d'après le Starter Pack."""
    verified: set[str] = set()
    proposed: set[str] = set()
    if not catalog_path:
        return verified, proposed
    folder = os.path.join(os.path.dirname(catalog_path), "starterPack")
    if not os.path.isdir(folder):
        return verified, proposed
    for name in os.listdir(folder):
        if not name.startswith("section-") or not name.endswith(".ts"):
            continue
        content = open(os.path.join(folder, name), encoding="utf-8").read()
        for block in re.findall(r"(?<![A-Za-z])variables:\s*\[(.*?)\]", content, re.S):
            verified.update(re.findall(r"\$[A-Za-z_][A-Za-z0-9_.]*", block))
        for block in re.findall(r"proposedVariables:\s*\[(.*?)\]", content, re.S):
            proposed.update(re.findall(r"name:\s*'(\$[A-Za-z_][A-Za-z0-9_.]*)'", block))
    return verified, proposed


def check_variables(raw: str, report: Report, catalog: set[str], catalog_path: str | None) -> None:
    used = set(v.rstrip(".") for v in re.findall(r"\$[A-Za-z_][A-Za-z0-9_.]*", raw))
    if not used:
        report.warn("VARIABLES", "Aucune variable $ dans le fragment : un gabarit de plateforme porte au moins $logo, $appname, $year et $mirror.")
        return
    report.info("VARIABLES", "Variables utilisées : " + ", ".join(sorted(used)))
    if not catalog:
        report.warn("VARIABLES", "Catalogue src/utils/mailTemplateVariables.ts introuvable : impossible de vérifier que les variables existent côté plateforme.")
        return
    unknown = sorted(v for v in used if v not in catalog)
    for v in unknown:
        report.error("VARIABLE-INCONNUE", f"{v} n'existe pas dans le catalogue ({os.path.relpath(catalog_path)}). Ne jamais inventer une variable : elle ne serait pas remplacée à l'envoi.")
    verified, proposed = load_starter_pack_usage(catalog_path)
    if verified:
        for v in sorted(used - set(unknown)):
            if v not in verified:
                note = "proposée dans le Starter Pack mais pas encore passée par le back" if v in proposed else "jamais vérifiée à un point d'envoi du Starter Pack"
                report.warn("VARIABLE-NON-VERIFIEE", f"{v} : {note}. Confirmer avec l'équipe back qu'elle est injectée sur ce gabarit, sinon le destinataire verra le jeton en clair.")


# --------------------------------------------------------------------------- #
# Version texte
# --------------------------------------------------------------------------- #

def html_to_text(raw: str) -> str:
    s = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    s = re.sub(r"<(head|style|script|title)\b.*?</\1>", "", s, flags=re.S | re.I)
    s = re.sub(r"<(span|div)[^>]*(display\s*:\s*none|mso-hide)[^>]*>.*?</\1>", "", s, flags=re.S | re.I)
    s = re.sub(r"<img\b[^>]*alt\s*=\s*[\"']([^\"']*)[\"'][^>]*>", lambda m: m.group(1).strip(), s, flags=re.I)
    s = re.sub(r"<a\b[^>]*href\s*=\s*[\"']([^\"']+)[\"'][^>]*>(.*?)</a>",
               lambda m: f"{re.sub('<[^>]+>', '', m.group(2)).strip()} ({m.group(1)})", s, flags=re.S | re.I)
    s = re.sub(r"<li\b[^>]*>", "\n- ", s, flags=re.I)
    s = re.sub(r"<(h[1-6])\b[^>]*>", "\n\n", s, flags=re.I)
    s = re.sub(r"</(p|h[1-6]|tr|table|ul|ol|li)>", "\n\n", s, flags=re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</td>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = htmlmod.unescape(s)
    s = re.sub(r"[ \t\xa0]+", " ", s)
    s = re.sub(r" *\n *", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip() + "\n"


# --------------------------------------------------------------------------- #
# Point d'entrée
# --------------------------------------------------------------------------- #

def run(path: str, fragment: bool, variables: str | None) -> Report:
    raw = open(path, encoding="utf-8").read()
    report = Report()
    if not fragment:
        check_document(raw, report)
    check_style_blocks(raw, report, fragment)
    collector = Collector()
    collector.feed(raw)
    check_elements(raw, collector.elements, report, fragment)
    if fragment:
        catalog, catalog_path = load_variable_catalog(os.path.dirname(os.path.abspath(path)), variables)
        check_variables(raw, report, catalog, catalog_path)
    return report


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", nargs="?", help="fichier HTML à contrôler")
    ap.add_argument("--fragment", action="store_true", help="fragment de gabarit injecté par la plateforme (pas de doctype/head)")
    ap.add_argument("--variables", help="chemin vers mailTemplateVariables.ts (détecté automatiquement sinon)")
    ap.add_argument("--text-out", help="écrit la version texte brut dans ce fichier")
    ap.add_argument("--json", action="store_true", help="sortie JSON")
    ap.add_argument("--contrast", nargs=2, metavar=("FG", "BG"), help="calcule le ratio de contraste WCAG entre deux couleurs hex")
    args = ap.parse_args()

    if args.contrast:
        ratio = contrast_ratio(*args.contrast)
        verdict = "texte courant OK (>= 4.5)" if ratio >= 4.5 else ("titres seulement (>= 3)" if ratio >= 3 else "insuffisant")
        print(f"{args.contrast[0]} sur {args.contrast[1]} : {ratio:.2f}:1, {verdict}")
        return 0

    if not args.file:
        ap.print_help()
        return 2

    report = run(args.file, args.fragment, args.variables)

    if args.text_out:
        text = html_to_text(open(args.file, encoding="utf-8").read())
        with open(args.text_out, "w", encoding="utf-8") as fh:
            fh.write(text)
        report.info("TEXTE", f"Version texte écrite dans {args.text_out} ({len(text)} caractères).")

    errors, warns = report.count("ERREUR"), report.count("ALERTE")
    if args.json:
        print(json.dumps({"file": args.file, "errors": errors, "warnings": warns, "items": report.items}, ensure_ascii=False, indent=2))
        return 1 if errors else 0

    order = {"ERREUR": 0, "ALERTE": 1, "INFO": 2}
    for item in sorted(report.items, key=lambda i: (order[i["level"]], i["line"] or 0)):
        where = f"l.{item['line']}" if item["line"] else "   "
        print(f"{item['level']:<6} {where:>6}  [{item['code']}] {item['message']}")
    mode = "fragment" if args.fragment else "document"
    print(f"\n{args.file} ({mode}) : {errors} erreur(s), {warns} alerte(s).")
    print("Livrable" if errors == 0 else "Corriger les erreurs avant livraison.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
