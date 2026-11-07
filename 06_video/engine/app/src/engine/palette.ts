import { hexToLinear } from './util';

// Marking-session palette (docs/TREATMENT.md): paper and ink, one red for the checker's pen,
// and a dark screen for the AI's own answers. Legacy keys from the upstream engine are kept so
// engine code (HUD, heat ramp) still compiles; scenes use the named keys below.
export const HEX = {
  paper: '#EEE9DF', // paper background
  ink: '#16161A', // type and line work
  graphite: '#6B6760', // secondary text, gridlines, captions
  rule: '#C9C2B4', // hairlines and table rules on paper
  pen: '#C8301E', // the red pen: only the checker uses it
  penDark: '#8E1F12', // the nib body / pen shadow
  screen: '#0E0F11', // the AI's answer screen
  screenText: '#D9D4CA', // mono text on the screen
  screenDim: '#6E6A63', // secondary text on the screen
  // legacy aliases (upstream engine)
  ink2: '#1C1C21',
  ash: '#9C978F',
  bone: '#EEE9DF',
  signal: '#C8301E',
  ember: '#E0563F',
  blood: '#8E1F12',
  acid: '#C8301E',
} as const;

export type PaletteKey = keyof typeof HEX;

/** Linear RGB triplets for GL uniforms. */
export const LIN: Record<PaletteKey, [number, number, number]> = Object.fromEntries(
  Object.entries(HEX).map(([k, v]) => [k, hexToLinear(v)]),
) as Record<PaletteKey, [number, number, number]>;

/** CSS rgba() for Canvas2D. */
export function rgba(key: PaletteKey | string, a = 1): string {
  const hex = (HEX as Record<string, string>)[key] ?? key;
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
