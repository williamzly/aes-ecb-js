import assert from 'assert';
import { Encryptor, Decryptor } from './index.js';
import * as vectors from './test-vectors.json';

vectors.default.forEach(v => {
  const encryptor = new Encryptor(v.key);
  const decryptor = new Decryptor(v.key);
  for (var i = 0; i < v.plaintext.length; i++) {
    const ciphertext = encryptor.encrypt(v.plaintext[i]);
    assert(bufferEquals(ciphertext, v.encrypted[i]), 'encrypted dose not equal expected');

    const plaintext = decryptor.decrypt(ciphertext);
    assert(bufferEquals(plaintext, v.plaintext[i]), 'decrypted dose not equal expected');
  }
})
console.log('SUCCESS');

function bufferEquals(a, b) {
    if (a.length != b.length) { return false; }
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) { return false; }
    }
    return true;
}
