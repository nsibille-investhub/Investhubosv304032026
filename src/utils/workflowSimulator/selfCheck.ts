import type { SimRawActionEntry, SimulatorFile } from './types';

const EXPECTED_WORKFLOWS = 28;

const entryCode = (entry: SimRawActionEntry) =>
  typeof entry === 'string' ? entry : entry.code ?? entry.action ?? '';

/** Contrôle de cohérence du fichier, affiché en console uniquement. */
export function runSimulatorSelfCheck(data: SimulatorFile): boolean {
  const failures: string[] = [];

  if (data.workflows.length !== EXPECTED_WORKFLOWS) {
    failures.push(`${data.workflows.length} workflows chargés, ${EXPECTED_WORKFLOWS} attendus`);
  }

  data.workflows.forEach(wf => {
    const outside = wf.sequence.filter(code => !wf.reachable_states.includes(code));
    if (outside.length) failures.push(`workflow ${wf.id} : séquence hors reachable_states (${outside.join(', ')})`);
    (wf.blocks ?? []).forEach(name => {
      const block = data.blocks?.[name];
      if (!block) {
        failures.push(`workflow ${wf.id} : bloc ${name} absent de blocks`);
        return;
      }
      const off = (block.variant ?? []).filter(code => !wf.reachable_states.includes(code));
      if (off.length) failures.push(`workflow ${wf.id} : variante du bloc ${name} hors reachable_states (${off.join(', ')})`);
    });
  });

  Object.entries(data.actions_by_state).forEach(([state, byRole]) => {
    Object.entries(byRole).forEach(([role, entries]) => {
      entries.forEach(entry => {
        const code = entryCode(entry);
        if (!(code in data.actions)) failures.push(`actions_by_state.${state}.${role} : action "${code}" absente du dictionnaire`);
      });
    });
  });

  const label = '[Simulateur] Contrôle du fichier de scénarios';
  if (failures.length === 0) {
    console.info(`${label} : OK (${data.workflows.length} workflows, ${data.states.length} états)`);
    return true;
  }
  console.groupCollapsed(`${label} : ${failures.length} écart(s)`);
  failures.forEach(f => console.warn(f));
  console.groupEnd();
  return false;
}
