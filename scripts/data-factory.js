// The implementation as of mid July 2014 not very efficient, though it should
// be sufficient for small data packages. For bigger data packages it is would
// be better to manipulate `Uint8Array` objects directly, at the expense of user
// friendlyness of the API.

/*jslint browser: true, node: true, maxerr: 50, maxlen: 80 */

/*global define, ArrayBuffer, Uint8Array */

define(['./util'], function (util) {
    'use strict';

    var create, createByte, createWord, createDword, createQword, createWstring, hexToBytes, createFromHexString,
        internalProto = {};

    internalProto.setLittleEndian = function (offs, value, nBytes) {
        var i;
        for (i = 0; i < nBytes; i += 1) {
            /*jslint bitwise: true */
            this.arr[offs + i] = (value >> (8 * i)) & 0xff;
            /*jslint bitwise: false */
        }
    };

    internalProto.getLittleEndian = function (offs, nBytes) {
        var i, value = 0;
        for (i = 0; i < nBytes; i += 1) {
            /*jslint bitwise: true */
            value += this.arr[offs + i] << (8 * i);
            /*jslint bitwise: false */
        }
        return value;
    };

    internalProto.appendQword = function (value) {
        this.setLittleEndian(this.arr.length, value, 8);
    };

    internalProto.appendDword = function (value) {
        this.setLittleEndian(this.arr.length, value, 4);
    };

    internalProto.appendWord = function (value) {
        this.setLittleEndian(this.arr.length, value, 2);
    };

    internalProto.getByte = function (offs) {
        return this.arr[offs];
    };

    internalProto.getWord = function (offs) {
        return this.getLittleEndian(offs, 2);
    };

    internalProto.getDword = function (offs) {
        return this.getLittleEndian(offs, 4);
    };

    internalProto.appendData = function (data) {
        Array.prototype.push.apply(this.arr, data.byteArray);
    };

    internalProto.slice = function (offs, end) {
        return create(this.arr.slice(offs, end));
    };

    internalProto.setByte = function (offs, value) {
        this.arr[offs] = value;
    };

    internalProto.appendByte = function (value) {
        this.setByte(this.arr.length, value);
    };

    internalProto.appendWchar = function (character) {
        // As described in "PIMA 15740:2000", characters are encoded in PTP as
        // ISO10646 2-byte characters.
        this.appendWord(character.charCodeAt(0));
    };

    internalProto.getWchar = function (offs) {
        return String.fromCharCode(this.getWord(offs));
    };

    // String will be null terminated. Result is undefined if string is too
    // long to be stored in the first byte.
    internalProto.appendWstring = function (string, includingLength = true) {
        var i, lengthWithNull = string.length + 1;
        if (includingLength) {
            this.appendByte(lengthWithNull);
        }
        for (i = 0; i < string.length; i += 1) {
            this.appendWchar(string[i]);
        }
        this.appendWord(0);
    };

    internalProto.getWstring = function (offs) {
        var i, character, string = '', length;

        length = this.getByte(offs);
        for (i = 0; i < length; i += 1) {
            character = this.getWchar(offs + 1 + 2 * i);
            if (character === '\u0000') {
                break;
            }
            string += character;
        }

        return string;
    };

    internalProto.getWstringLength = function (offs) {
        return 1 + 2 * this.getByte(offs);
    };

    internalProto.setDword = function (offs, value) {
        this.setLittleEndian(offs, value, 4);
    };

    internalProto.setWord = function (offs, value) {
        this.setLittleEndian(offs, value, 2);
    };

    internalProto.appendArray = function (arrToAppend) {
        var i;
        for (i = 0; i < arrToAppend.length; i += 1) {
            this.arr.push(arrToAppend[i]);
        }
    };

    internalProto.wordArray = function () {
        var i, wordArray = [];

        for (i = 0; i < Math.floor(this.arr.length / 2); i += 1) {
            wordArray.push(this.getLittleEndian(2 * i, 2));
        }

        return wordArray;
    };

    internalProto.dwordArray = function () {
        var i, dwordArray = [];

        for (i = 0; i < Math.floor(this.arr.length / 4); i += 1) {
            dwordArray.push(this.getLittleEndian(4 * i, 4));
        }

        return dwordArray;
    };

    internalProto.shift = function (maxNumberOfBytes) {
        var i, outputData = create();
        for (i = 0; i < maxNumberOfBytes; i += 1) {
            if (this.arr.length === 0) {
                break;
            }
            outputData.appendByte(this.arr.shift());
        }
        return outputData;
    };

    internalProto.toString = function () {
        var s = '', hex, separator = '';
        this.arr.forEach(function (x) {
            hex = x.toString(16);
            s += separator + (hex.length === 1 ? '0' : '') + hex;
            separator = ' ';
        });
        return s;
    };

    internalProto.toHex = function () {
        var mapping = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        var result = "";
        for (var c of this.arr) {
            result = result + mapping[(c >>> 4)] + mapping[c % 16]
        }
        return result;
    };

    create = function (values) {
        var internal = Object.create(internalProto, {
            arr: {value: []}
        });

        if (typeof ArrayBuffer === 'function' &&
                values instanceof ArrayBuffer) {
            internal.appendArray(new Uint8Array(values));
        } else if (values instanceof Array) {
            internal.appendArray(values);
        } else if (typeof Buffer === 'function' && values instanceof Buffer) {
            internal.appendArray(Array.prototype.slice.call(values, 0));
        }

        return Object.create(null, {

            setByte: {value: function (offs, value) {
                internal.setByte(offs, value);
            }},

            appendByte: {value: function (value) {
                internal.appendByte(value);
            }},

            appendWchar: {value: function (character) {
                internal.appendWchar(character);
            }},

            getWchar: {value: function (offs) {
                return internal.getWchar(offs);
            }},

            appendWstring: {value: function (string, includingLength) {
                internal.appendWstring(string, includingLength);
            }},

            getWstring: {value: function (offs) {
                return internal.getWstring(offs);
            }},

            getWstringLength: {value: function (offs) {
                return internal.getWstringLength(offs);
            }},

            appendQword: {value: function (value) {
                internal.appendQword(value);
            }},

            appendDword: {value: function (value) {
                internal.appendDword(value);
            }},

            appendWord: {value: function (value) {
                internal.appendWord(value);
            }},

            getByte: {value: function (offs) {
                return internal.getByte(offs);
            }},

            setWord: {value: function (offs, value) {
                internal.setWord(offs, value);
            }},

            getWord: {value: function (offs) {
                return internal.getWord(offs);
            }},

            setDword: {value: function (offs, value) {
                internal.setDword(offs, value);
            }},

            getDword: {value: function (offs) {
                return internal.getDword(offs);
            }},

            appendData: {value: function (data) {
                internal.appendData(data);
            }},

            slice: {value: function (offs, end) {
                return internal.slice(offs, end);
            }},

            length: {get: function () {
                return internal.arr.length;
            }},

            buffer: {get: function () {
                return (util.isRunningInBrowser ?
                        (new Uint8Array(internal.arr)).buffer :
                        new Buffer(internal.arr));
            }},

            toString: {value: function () {
                return internal.toString();
            }},

            toHex: {value: function () {
                return internal.toHex();
            }},

            toBigEndianHex: {value: function() {
                let hex = internal.toHex();
                let bigEndianHex = "0x";
                let i;
                for (i = hex.length; i > 0; i-=2) {
                    let byte = hex.substring(i - 2, i);
                    bigEndianHex = bigEndianHex + byte;
                }
                return bigEndianHex;
            }},

            array: {get: function () {
                return internal.arr;
            }},

            byteArray: {get: function () {
                return internal.arr;
            }},

            wordArray: {get: function () {
                return internal.wordArray();
            }},

            dwordArray: {get: function () {
                return internal.dwordArray();
            }},

            shift: {value: function (maxNumberOfBytes) {
                return internal.shift(maxNumberOfBytes);
            }}
        });
    };

    createByte = function (value) {
        var obj = create();
        obj.appendByte(value);
        return obj;
    };

    createWord = function (value) {
        var obj = create();
        obj.appendWord(value);
        return obj;
    };

    createDword = function (value) {
        var obj = create();
        obj.appendDword(value);
        return obj;
    };

    createQword = function (value) {
        var obj = create();
        obj.appendQword(value);
        return obj;
    };

    createWstring = function (value) {
        var obj = create();
        obj.appendWstring(value);
        return obj;
    };

    hexToBytes = function (hexString) {
        var c, cnt = 0, result = [], mapping = {
            '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15
        };
        for (var i = 0; i < hexString.length; i++) {
            c = hexString[i];
            if (c == ' ') {
                continue;
            }
            if (cnt % 2 == 0) {
                result.push(mapping[c]);
            } else {
                result[result.length-1] = result[result.length-1] * 16 + mapping[c]
            }
            cnt += 1;
        }
        return result;
    };

    createFromHexString = function (value) {
        var obj = create(hexToBytes(value));
        return obj;
    };

    return Object.create(null, {
        create: {value: create},
        createByte: {value: createByte},
        createWord: {value: createWord},
        createDword: {value: createDword},
        createQword: {value: createQword},
        createWstring: {value: createWstring},
        createFromHexString: {value: createFromHexString}
    });
});
