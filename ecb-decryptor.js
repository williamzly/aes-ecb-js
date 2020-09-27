import AES from './ecb-core.js'
import { coerceArray, copyArray, convertToInt32, createArray } from './utils';
import { Si, T5, T6, T7, T8 } from './constants';

function Decryptor(key) {
  this._aes = new AES(key);
  defineDecrypt();
}

function defineDecrypt() {
  AES.prototype.decrypt = function(ciphertext) {
    if (ciphertext.length != 16) {
        throw new Error('invalid ciphertext size (must be 16 bytes)');
    }

    var rounds = this._Kd.length - 1;
    var a = [0, 0, 0, 0];

    // convert plaintext to (ints ^ key)
    var t = convertToInt32(ciphertext);
    for (var i = 0; i < 4; i++) {
        t[i] ^= this._Kd[0][i];
    }

    // apply round transforms
    for (var r = 1; r < rounds; r++) {
        for (var i = 0; i < 4; i++) {
            a[i] = (T5[(t[ i          ] >> 24) & 0xff] ^
                    T6[(t[(i + 3) % 4] >> 16) & 0xff] ^
                    T7[(t[(i + 2) % 4] >>  8) & 0xff] ^
                    T8[ t[(i + 1) % 4]        & 0xff] ^
                    this._Kd[r][i]);
        }
        t = a.slice();
    }

    // the last round is special
    var result = createArray(16), tt;
    for (var i = 0; i < 4; i++) {
        tt = this._Kd[rounds][i];
        result[4 * i    ] = (Si[(t[ i         ] >> 24) & 0xff] ^ (tt >> 24)) & 0xff;
        result[4 * i + 1] = (Si[(t[(i + 3) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff;
        result[4 * i + 2] = (Si[(t[(i + 2) % 4] >>  8) & 0xff] ^ (tt >>  8)) & 0xff;
        result[4 * i + 3] = (Si[ t[(i + 1) % 4]        & 0xff] ^  tt       ) & 0xff;
    }

    return result;
 }

 Decryptor.prototype.decrypt = function(ciphertext) {
    ciphertext = coerceArray(ciphertext);

    if ((ciphertext.length % 16) !== 0) {
        throw new Error('invalid ciphertext size (must be multiple of 16 bytes)');
    }

    var plaintext = createArray(ciphertext.length);
    var block = createArray(16);

    for (var i = 0; i < ciphertext.length; i += 16) {
        copyArray(ciphertext, block, 0, i, i + 16);
        block = this._aes.decrypt(block);
        copyArray(block, plaintext, i);
    }

    return plaintext;
  }
}

export { defineDecrypt };
export default Decryptor;
