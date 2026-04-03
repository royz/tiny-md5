import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import md5 from './index.js';

const RANDOM_TEST_COUNT = 5_000_000;

function referenceMd5(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex');
}

// RFC 1321 official test vectors — must pass exactly
const RFC_VECTORS: [string, string][] = [
  ['', 'd41d8cd98f00b204e9800998ecf8427e'],
  ['a', '0cc175b9c0f1b6a831c399e269772661'],
  ['abc', '900150983cd24fb0d6963f7d28e17f72'],
  ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
  ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
  ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    'd174ab98d277d9f5a5611c2c9f419d9f'],
  ['12345678901234567890123456789012345678901234567890123456789012345678901234567890',
    '57edf4a22be3c955ac49da2e2107b67a'],
];

describe('RFC 1321 known vectors', () => {
  for (const [input, expected] of RFC_VECTORS) {
    test(`md5("${input.slice(0, 20)}")`, () => {
      expect(md5(input)).toBe(expected);
    });
  }
});

describe('Unicode edge cases', () => {
  const cases = [
    '\u0000',       // null byte
    '\uFFFF',       // max BMP char
    '😀',           // emoji (4-byte UTF-8)
    '中文',          // CJK characters
    'a'.repeat(55), // boundary: 55 bytes → single 512-bit block
    'a'.repeat(56), // boundary: overflows into second block
    'a'.repeat(64), // exactly two 512-bit blocks
  ];

  for (const input of cases) {
    test(`matches crypto for "${input.slice(0, 10)}" (len=${input.length})`, () => {
      expect(md5(input)).toBe(referenceMd5(input));
    });
  }
});

describe(`${RANDOM_TEST_COUNT} random inputs`, () => {
  // Deterministic LCG — same seed = reproducible failures
  let seed = 0xdeadbeef;
  function lcg(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  }

  function randomAsciiString(len: number): string {
    const chars: string[] = [];
    for (let i = 0; i < len; i++) {
      chars.push(String.fromCodePoint((lcg() % 0x7e) + 0x20)); // printable ASCII
    }
    return chars.join('');
  }

  test(`all ${RANDOM_TEST_COUNT.toLocaleString()} inputs match Node crypto (ASCII)`, { timeout: 60_000 }, () => {
    const COUNT = RANDOM_TEST_COUNT;
    for (let i = 0; i < COUNT; i++) {
      const len = (lcg() % 64) + 1; // 1–64 chars
      const s = randomAsciiString(len);
      const got = md5(s);
      if (got !== referenceMd5(s)) {
        expect(got, `Failed at i=${i}, input="${s}"`).toBe(referenceMd5(s));
      }
    }
  });

  test(`${RANDOM_TEST_COUNT.toLocaleString()} inputs including multi-byte Unicode`, { timeout: 60_000 }, () => {
    const COUNT = RANDOM_TEST_COUNT;
    // Use spread so multi-codepoint chars (emoji) are never split into lone surrogates
    const pool = [...'abcABC012 \t\n\r\u00e9\u4e2d\u00a3\u20ac😀'];
    for (let i = 0; i < COUNT; i++) {
      const len = (lcg() % 32) + 1;
      const chars: string[] = [];
      for (let j = 0; j < len; j++) {
        chars.push(pool[lcg() % pool.length]);
      }
      const s = chars.join('');
      const got = md5(s);
      if (got !== referenceMd5(s)) {
        expect(got, `Failed at i=${i}, input="${s}"`).toBe(referenceMd5(s));
      }
    }
  });
});
