/**
 * Masks: `9` = digit, `A` = letter (converted to uppercase),
 * any other character is a literal.
 */
export const MASKS = {
  DTA: '99/9999999-9',
  DI: '99/9999999-9',
  DUIMP: '99AA9999999999-9',
} as const;

export const PATTERNS = {
  DTA: /^\d{2}\/\d{7}-\d$/,
  DI: /^\d{2}\/\d{7}-\d$/,
  DUIMP: /^\d{2}[A-Z]{2}\d{10}-\d$/,
} as const;

export const EXAMPLES = {
  DTA: '25/0000000-1',
  DI: '25/0000000-1',
  DUIMP: '26BR0000123456-7',
} as const;

/** Strips everything that is not a letter or a digit. */
export function unmask(value: string): string {
  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

const matchesToken = (token: string, char: string) =>
  token === '9' ? /\d/.test(char) : /[A-Z]/.test(char);

export function applyMask(value: string, mask: string): string {
  const raw = unmask(value);
  let output = '';
  let cursor = 0;

  for (const token of mask) {
    if (cursor >= raw.length) break;

    if (token === '9' || token === 'A') {
      while (cursor < raw.length && !matchesToken(token, raw[cursor])) cursor++;
      if (cursor >= raw.length) break;
      output += raw[cursor++];
    } else {
      output += token;
    }
  }

  return output;
}
