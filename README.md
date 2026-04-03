# tiny-md5

A minimal MD5 hash function built for the browser. Computes an MD5 hex digest from a UTF-8 string.

> **Note:** This implementation is optimized for size and browser compatibility. It may not be 100% accurate for all edge cases and is not intended for cryptographic or security-sensitive use.

## Install

```sh
pnpm install tiny-md5
```

## Usage

```ts
import md5 from 'tiny-md5';

md5('hello'); // '5d41402abc4b2a76b9719d911017c592'
```

## Size

~500 bytes (minified + gzipped)

## Tests

16 tests — all passing.

| Suite | Tests |
|---|---|
| RFC 1321 known vectors | 7 |
| Unicode edge cases (`\0`, `\uFFFF`, emoji, CJK, block boundaries) | 7 |
| Random ASCII inputs vs `node:crypto` | 5 000 000 |
| Random Unicode inputs vs `node:crypto` | 5 000 000 |

Run with:

```sh
pnpm test
```

## Benchmarks

Compared against Node's built-in `node:crypto` MD5 (native C++). tiny-md5 is a pure-JS implementation, so it trades some speed for zero dependencies and a tiny bundle footprint.

| Input | tiny-md5 | node:crypto | ratio |
|---|---|---|---|
| Short — 11 bytes | ~1 004 000 ops/s | ~1 062 000 ops/s | **on par** (1.06×) |
| Medium — 56 bytes (two-block boundary) | ~609 000 ops/s | ~967 000 ops/s | 1.59× slower |
| Long — 1 000 bytes | ~93 000 ops/s | ~540 000 ops/s | 5.82× slower |
| Unicode — mixed multi-byte | ~337 000 ops/s | ~860 000 ops/s | 2.55× slower |

> For short strings (the common browser use-case) tiny-md5 matches `node:crypto` throughput. The gap widens for longer inputs because native crypto amortises its fixed overhead more efficiently.

Run with:

```sh
pnpm bench
```
