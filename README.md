AES-ECB-JS
======

[![npm version](https://www.npmjs.com/package/aes-ecb-js)

A pure JavaScript implementation of the AES block cipher algorithm and ECB operation.
Refrence to https://github.com/ricmoo/aes-js
Provide min package size for implement ECB mode AES algorithm.


#### How to use

To install `aes-ecb-js` in your node.js project:

```
npm install aes-ecb-js
```

And to use it by importing minimal object.

```javascript
import { Encryptor, convertUtf8, pkcs7pad } from 'aes-ecb-js'

let encryptor;
export function encryptOpenid(openid, aes_key) {
  if (!encryptor) {
    encryptor = new Encryptor(convertUtf8.toBytes(aes_key));
  }
  return aesEncrypt(`${openid}:${Math.floor(new Date().getTime() / 1000)}`)
}

```



