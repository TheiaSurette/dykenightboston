// TwiML is XML 1.0; use its character ranges without changing valid plain text.
// https://www.w3.org/TR/xml/#charsets
export function hasValidAnnouncementCharacters(text: string): boolean {
  return Array.from(text).every((character) => {
    const codePoint = character.codePointAt(0)!;
    return codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd
      || (codePoint >= 0x20 && codePoint <= 0xd7ff)
      || (codePoint >= 0xe000 && codePoint <= 0xfffd)
      || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
  });
}
