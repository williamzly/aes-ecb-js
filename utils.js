
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

export { checkInt, checkInts, coerceArray, createArray, copyArray, convertToInt32 };
