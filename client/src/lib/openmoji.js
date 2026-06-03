// Converts an emoji glyph into an OpenMoji SVG URL.
// OpenMoji filenames are the uppercase hex codepoints joined by '-',
// with the FE0F variation selector stripped for the emoji we use.
export function emojiToOpenMojiUrl(emoji) {
  if (!emoji) return null;
  const code = Array.from(emoji)
    .map((ch) => ch.codePointAt(0))
    .filter((cp) => cp !== 0xfe0f) // drop variation selector
    .map((cp) => cp.toString(16).toUpperCase())
    .join('-');
  return `https://openmoji.org/data/color/svg/${code}.svg`;
}
