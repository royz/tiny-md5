// K constants: K[i] = floor(abs(sin(i+1)) * 2^32)
const K_TABLE: number[] = [];
for (let tableIdx = 0; tableIdx < 64;) {
  K_TABLE[tableIdx] = 0 | (Math.abs(Math.sin(++tableIdx)) * 4294967296);
}

// Left-rotation shift amounts for each of the 64 steps (4 rounds × 16 steps)
const SHIFT_AMOUNTS: number[] = [
  7, 12, 17, 22, // Round 1 (F)
  5, 9, 14, 20, // Round 2 (G)
  4, 11, 16, 23, // Round 3 (H)
  6, 10, 15, 21, // Round 4 (I)
];

export default function md5(input: string): string {
  // Initial hash state: A, B, C, D
  const hashState: number[] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
  const messageWords: number[] = [];

  // Encode input as UTF-8 bytes (as Latin-1 chars), then append 0x80 padding marker
  const utf8Padded: string = unescape(encodeURI(input)) + '\x80';
  const messageByteLen: number = utf8Padded.length - 1; // byte count of the original UTF-8 message

  // Total 32-bit word slots needed, padded to fill complete 512-bit (16-word) blocks
  const totalWords: number = (messageByteLen / 4 + 2) | 15;

  // Store original message bit-length at the second-to-last word (MD5 length field)
  messageWords[totalWords - 1] = messageByteLen * 8;

  // Pack UTF-8 padded bytes into 32-bit message words (little-endian)
  for (let bytePos = messageByteLen; bytePos >= 0; bytePos--) {
    messageWords[bytePos >> 2] |= utf8Padded.charCodeAt(bytePos) << ((bytePos & 3) * 8);
  }

  // Process each 512-bit (16-word) block
  for (let blockOffset = 0; blockOffset < totalWords; blockOffset += 16) {
    let a = hashState[0], b = hashState[1], c = hashState[2], d = hashState[3];

    for (let step = 0; step < 64; step++) {
      const round = step >> 4; // 0–3

      // Auxiliary mixing function for this round
      const mixResult = [
        b & c | ~b & d, // F (Round 1)
        d & b | ~d & c, // G (Round 2)
        b ^ c ^ d,      // H (Round 3)
        c ^ (b | ~d),   // I (Round 4)
      ][round];

      // Message word index for this step
      const wordIndex = [
        step,
        5 * step + 1,
        3 * step + 5,
        7 * step,
      ][round] & 15;

      const shiftAmt = SHIFT_AMOUNTS[4 * round + step % 4];
      const rotInput = a + mixResult + K_TABLE[step] + ((messageWords[blockOffset | wordIndex]) | 0);

      // Rotate state: new B = B + leftRotate(A + mix + K + M, s)
      a = d;
      d = c;
      c = b;
      b = (b + (rotInput << shiftAmt | rotInput >>> (32 - shiftAmt))) | 0;
    }

    hashState[0] = (hashState[0] + a) | 0;
    hashState[1] = (hashState[1] + b) | 0;
    hashState[2] = (hashState[2] + c) | 0;
    hashState[3] = (hashState[3] + d) | 0;
  }

  // Convert each 32-bit hash word to 8 hex nibbles in little-endian byte order
  let hexStr = '';
  for (let nibbleIdx = 0; nibbleIdx < 32; nibbleIdx++) {
    hexStr += ((hashState[nibbleIdx >> 3] >> ((1 ^ nibbleIdx) * 4)) & 15).toString(16);
  }

  return hexStr;
}