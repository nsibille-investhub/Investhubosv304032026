/** PDF d'une page, texte seul, pour les documents de démonstration de la maquette. */
function buildDemoPdf(lines: string[]): Blob {
  const escape = (text: string) => text.replace(/[\u00a0\u202f]/g, ' ').replace(/[\\()]/g, char => `\\${char}`);
  const content = [
    'BT',
    '/F1 12 Tf',
    '72 770 Td',
    '18 TL',
    ...lines.map(line => `(${escape(line)}) Tj T*`),
    'ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  // Un octet par caractère (Latin-1) : les accents suivent l'encodage WinAnsi de la police.
  const bytes = Uint8Array.from(pdf, char => {
    const code = char.charCodeAt(0);
    // 0x80 : symbole euro en WinAnsi.
    if (code === 0x20ac) return 0x80;
    return code < 256 ? code : 63;
  });
  return new Blob([bytes], { type: 'application/pdf' });
}

/** Ouvre un document de démonstration en PDF dans un nouvel onglet. */
export function openDemoPdf(lines: string[]) {
  const url = URL.createObjectURL(buildDemoPdf(lines));
  window.open(url, '_blank', 'noopener');
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/** Télécharge un document de démonstration en PDF. */
export function downloadDemoPdf(lines: string[], fileName: string) {
  const url = URL.createObjectURL(buildDemoPdf(lines));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
