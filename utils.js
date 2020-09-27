
function checkInt(value) {
    return (parseInt(value) === value);
}

function checkInts(arrayish) {
    if (!checkInt(arrayish.length)) { return false; }

    for (var i = 0; i < arrayish.length; i++) {
        if (!checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
            return false;
        }
    }

    return true;
}

function coerceArray(arg, copy) {

    // ArrayBuffer view
    if (arg.buffer && arg.name === 'Uint8Array') {

        if (copy) {
            if (arg.slice) {
                arg = arg.slice();
            } else {
                arg = Array.prototype.slice.call(arg);
            }
        }

        return arg;
    }

    // It's an array; check it is a valid representation of a byte
    if (Array.isArray(arg)) {
        if (!checkInts(arg)) {
            throw new Error('Array contains invalid value: ' + arg);
        }

        return new Uint8Array(arg);
    }

    // Something else, but behaves like an array (maybe a Buffer? Arguments?)
    if (checkInt(arg.length) && checkInts(arg)) {
        return new Uint8Array(arg);
    }

    throw new Error('unsupported array-like object');
}

function createArray(length) {
    return new Uint8Array(length);
}

function copyArray(sourceArray, targetArray, targetStart, sourceStart, sourceEnd) {
    if (sourceStart != null || sourceEnd != null) {
        if (sourceArray.slice) {
            sourceArray = sourceArray.slice(sourceStart, sourceEnd);
        } else {
            sourceArray = Array.prototype.slice.call(sourceArray, sourceStart, sourceEnd);
        }
    }
    targetArray.set(sourceArray, targetStart);
}

function convertToInt32(bytes) {
    var result = [];
    for (var i = 0; i < bytes.length; i += 4) {
        result.push(
            (bytes[i    ] << 24) |
            (bytes[i + 1] << 16) |
            (bytes[i + 2] <<  8) |
             bytes[i + 3]
        );
    }
    return result;
}

var convertUtf8 = (function() {
        function toBytes(text) {
            var result = [], i = 0;
            text = encodeURI(text);
            while (i < text.length) {
                var c = text.charCodeAt(i++);

                // if it is a % sign, encode the following 2 bytes as a hex value
                if (c === 37) {
                    result.push(parseInt(text.substr(i, 2), 16))
                    i += 2;

                // otherwise, just the actual byte
                } else {
                    result.push(c)
                }
            }

            return coerceArray(result);
        }

        function fromBytes(bytes) {
            var result = [], i = 0;

            while (i < bytes.length) {
                var c = bytes[i];

                if (c < 128) {
                    result.push(String.fromCharCode(c));
                    i++;
                } else if (c > 191 && c < 224) {
                    result.push(String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f)));
                    i += 2;
                } else {
                    result.push(String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)));
                    i += 3;
                }
            }

            return result.join('');
        }

        return {
            toBytes: toBytes,
            fromBytes: fromBytes,
        }
    })();

    var convertHex = (function() {
        function toBytes(text) {
            var result = [];
            for (var i = 0; i < text.length; i += 2) {
                result.push(parseInt(text.substr(i, 2), 16));
            }

            return result;
        }

        // http://ixti.net/development/javascript/2011/11/11/base64-encodedecode-of-utf8-in-browser-with-js.html
        var Hex = '0123456789abcdef';

        function fromBytes(bytes) {
                var result = [];
                for (var i = 0; i < bytes.length; i++) {
                    var v = bytes[i];
                    result.push(Hex[(v & 0xf0) >> 4] + Hex[v & 0x0f]);
                }
                return result.join('');
        }

        return {
            toBytes: toBytes,
            fromBytes: fromBytes,
        }
    })();

export { checkInt, checkInts, coerceArray, createArray, copyArray, convertToInt32, convertUtf8, convertHex };
