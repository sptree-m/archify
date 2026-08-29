// Shared font metrics used by render-time fitting and validation.
//
// M PLUS 1 Code is a Japanese programming font whose Latin glyphs are
// approximately half-em and CJK full-width glyphs are one-em. Archify's
// textUnits() counts Latin as 1 unit and CJK/East-Asian-Wide as 2 units, so a
// 0.5 advance factor maps those units to the font's intended monospace grid.
//
// Keep this module zero-install: the renderer must be deterministic even when
// the font is not installed. Final artifacts use a local-only CSS stack and
// never fetch a font from the network.

export const DEFAULT_FONT_PROFILE = 'mplus-1-code';

export const FONT_PROFILES = Object.freeze({
  'mplus-1-code': Object.freeze({
    id: 'mplus-1-code',
    family: 'M PLUS 1 Code',
    cssFamily: "'M PLUS 1 Code', 'Noto Sans Mono CJK JP', 'Yu Gothic UI', monospace",
    widthFactor: 0.5,
    horizontalPadding: 8,
  }),
  'jetbrains-mono': Object.freeze({
    id: 'jetbrains-mono',
    family: 'JetBrains Mono',
    cssFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK JP', monospace",
    widthFactor: 0.6,
    horizontalPadding: 8,
  }),
});

export function resolveFontProfile(requested = process.env.ARCHIFY_FONT_PROFILE) {
  const key = requested || DEFAULT_FONT_PROFILE;
  return FONT_PROFILES[key] || FONT_PROFILES[DEFAULT_FONT_PROFILE];
}
