import AES from './ecb-core.js';
import { coerceArray, copyArray, convertToInt32, createArray } from './utils.js';
import { S, T1, T2, T3, T4 } from './constants.js';

function Encryptor(key) {
  defineEncrypt();
  this._aes = new AES(key);
}

function defineEncrypt() {
  AES.prototype.encrypt = function(plaintext) {
    if (plaintext.length != 16) {
        throw new Error('invalid plaintext size (must be 16 bytes)');
    }

    var rounds = this._Ke.length - 1;
    var a = [0, 0, 0, 0];

    // convert plaintext to (ints ^ key)
    var t = convertToInt32(plaintext);
    for (var i = 0; i < 4; i++) {
        t[i] ^= this._Ke[0][i];
    }

    // apply round transforms
    for (var r = 1; r < rounds; r++) {
        for (var i = 0; i < 4; i++) {
            a[i] = (T1[(t[ i         ] >> 24) & 0xff] ^
                    T2[(t[(i + 1) % 4] >> 16) & 0xff] ^
                    T3[(t[(i + 2) % 4] >>  8) & 0xff] ^
                    T4[ t[(i + 3) % 4]        & 0xff] ^
                    this._Ke[r][i]);
        }
        t = a.slice();
    }

    // the last round is special
    var result = createArray(16), tt;
    for (var i = 0; i < 4; i++) {
        tt = this._Ke[rounds][i];
        result[4 * i    ] = (S[(t[ i         ] >> 24) & 0xff] ^ (tt >> 24)) & 0xff;
        result[4 * i + 1] = (S[(t[(i + 1) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff;
        result[4 * i + 2] = (S[(t[(i + 2) % 4] >>  8) & 0xff] ^ (tt >>  8)) & 0xff;
        result[4 * i + 3] = (S[ t[(i + 3) % 4]        & 0xff] ^  tt       ) & 0xff;
    }

    return result;
  }

  Encryptor.prototype.encrypt = function(plaintext) {
        plaintext = coerceArray(plaintext);

        if ((plaintext.length % 16) !== 0) {
            throw new Error('invalid plaintext size (must be multiple of 16 bytes)');
        }

        var ciphertext = createArray(plaintext.length);
        var block = createArray(16);

        for (var i = 0; i < plaintext.length; i += 16) {
            copyArray(plaintext, block, 0, i, i + 16);
            block = this._aes.encrypt(block);
            copyArray(block, ciphertext, i);
        }

        return ciphertext;
    }
}

export { defineEncrypt };
export default Encryptor;
