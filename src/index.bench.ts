import { createHash } from 'node:crypto';
import { bench, describe } from 'vitest';
import md5 from './index.js';

function cryptoMd5(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex');
}

const SHORT = 'hello world';
const MEDIUM = 'a'.repeat(56);  // overflows into second block
const LONG = 'a'.repeat(1_000);
const UNICODE = '中文abc😀'.repeat(10);

const OPTS = { iterations: 100_000 };

describe('short string (11 bytes)', () => {
  bench('tiny-md5', () => { md5(SHORT); }, OPTS);
  bench('node:crypto', () => { cryptoMd5(SHORT); }, OPTS);
});

describe('medium string (56 bytes, two-block boundary)', () => {
  bench('tiny-md5', () => { md5(MEDIUM); }, OPTS);
  bench('node:crypto', () => { cryptoMd5(MEDIUM); }, OPTS);
});

describe('long string (1 000 bytes)', () => {
  bench('tiny-md5', () => { md5(LONG); }, OPTS);
  bench('node:crypto', () => { cryptoMd5(LONG); }, OPTS);
});

describe('unicode string', () => {
  bench('tiny-md5', () => { md5(UNICODE); }, OPTS);
  bench('node:crypto', () => { cryptoMd5(UNICODE); }, OPTS);
});

