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
