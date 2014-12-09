/*!
 * Sir Trevor JS v0.4.0
 *
 * Released under the MIT license
 * www.opensource.org/licenses/MIT
 *
 * 2014-12-08
 */


!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SirTrevor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/');

},{"./src/":174}],2:[function(require,module,exports){
(function (process){
 /*!
  * https://github.com/paulmillr/es6-shim
  * @license es6-shim Copyright 2013-2014 by Paul Miller (http://paulmillr.com)
  *   and contributors,  MIT License
  * es6-shim: v0.21.1
  * see https://github.com/paulmillr/es6-shim/blob/master/LICENSE
  * Details and documentation:
  * https://github.com/paulmillr/es6-shim/
  */

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
  'use strict';

  var isCallableWithoutNew = function (func) {
    try { func(); }
    catch (e) { return false; }
    return true;
  };

  var supportsSubclassing = function (C, f) {
    /* jshint proto:true */
    try {
      var Sub = function () { C.apply(this, arguments); };
      if (!Sub.__proto__) { return false; /* skip test on IE < 11 */ }
      Object.setPrototypeOf(Sub, C);
      Sub.prototype = Object.create(C.prototype, {
        constructor: { value: C }
      });
      return f(Sub);
    } catch (e) {
      return false;
    }
  };

  var arePropertyDescriptorsSupported = function () {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) { /* this is IE 8. */
      return false;
    }
  };

  var startsWithRejectsRegex = function () {
    var rejectsRegex = false;
    if (String.prototype.startsWith) {
      try {
        '/a/'.startsWith(/a/);
      } catch (e) { /* this is spec compliant */
        rejectsRegex = true;
      }
    }
    return rejectsRegex;
  };

  /*jshint evil: true */
  var getGlobal = new Function('return this;');
  /*jshint evil: false */

  var globals = getGlobal();
  var global_isFinite = globals.isFinite;
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
  var startsWithIsCompliant = startsWithRejectsRegex();
  var _slice = Array.prototype.slice;
  var _indexOf = Function.call.bind(String.prototype.indexOf);
  var _toString = Function.call.bind(Object.prototype.toString);
  var _hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
  var ArrayIterator; // make our implementation private

  var Symbol = globals.Symbol || {};
  var Type = {
    string: function (x) { return _toString(x) === '[object String]'; },
    regex: function (x) { return _toString(x) === '[object RegExp]'; },
    symbol: function (x) {
      /*jshint notypeof: true */
      return typeof globals.Symbol === 'function' && typeof x === 'symbol';
      /*jshint notypeof: false */
    }
  };

  var defineProperty = function (object, name, value, force) {
    if (!force && name in object) { return; }
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };

  // Define configurable, writable and non-enumerable props
  // if they don’t exist.
  var defineProperties = function (object, map) {
    Object.keys(map).forEach(function (name) {
      var method = map[name];
      defineProperty(object, name, method, false);
    });
  };

  // Simple shim for Object.create on ES3 browsers
  // (unlike real shim, no attempt to support `prototype === null`)
  var create = Object.create || function (prototype, properties) {
    function Type() {}
    Type.prototype = prototype;
    var object = new Type();
    if (typeof properties !== 'undefined') {
      defineProperties(object, properties);
    }
    return object;
  };

  // This is a private name in the es6 spec, equal to '[Symbol.iterator]'
  // we're going to use an arbitrary _-prefixed name to make our shims
  // work properly with each other, even though we don't have full Iterator
  // support.  That is, `Array.from(map.keys())` will work, but we don't
  // pretend to export a "real" Iterator interface.
  var $iterator$ = Type.symbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';
  // Firefox ships a partial implementation using the name @@iterator.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
  // So use that name if we detect it.
  if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }
  var addIterator = function (prototype, impl) {
    if (!impl) { impl = function iterator() { return this; }; }
    var o = {};
    o[$iterator$] = impl;
    defineProperties(prototype, o);
    if (!prototype[$iterator$] && Type.symbol($iterator$)) {
      // implementations are buggy when $iterator$ is a Symbol
      prototype[$iterator$] = impl;
    }
  };

  // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
  // can be replaced with require('is-arguments') if we ever use a build process instead
  var isArguments = function isArguments(value) {
    var str = _toString(value);
    var result = str === '[object Arguments]';
    if (!result) {
      result = str !== '[object Array]' &&
        value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        _toString(value.callee) === '[object Function]';
    }
    return result;
  };

  var emulateES6construct = function (o) {
    if (!ES.TypeIsObject(o)) { throw new TypeError('bad object'); }
    // es5 approximation to es6 subclass semantics: in es6, 'new Foo'
    // would invoke Foo.@@create to allocation/initialize the new object.
    // In es5 we just get the plain object.  So if we detect an
    // uninitialized object, invoke o.constructor.@@create
    if (!o._es6construct) {
      if (o.constructor && ES.IsCallable(o.constructor['@@create'])) {
        o = o.constructor['@@create'](o);
      }
      defineProperties(o, { _es6construct: true });
    }
    return o;
  };

  var ES = {
    CheckObjectCoercible: function (x, optMessage) {
      /* jshint eqnull:true */
      if (x == null) {
        throw new TypeError(optMessage || 'Cannot call method on ' + x);
      }
      return x;
    },

    TypeIsObject: function (x) {
      /* jshint eqnull:true */
      // this is expensive when it returns false; use this function
      // when you expect it to return true in the common case.
      return x != null && Object(x) === x;
    },

    ToObject: function (o, optMessage) {
      return Object(ES.CheckObjectCoercible(o, optMessage));
    },

    IsCallable: function (x) {
      return typeof x === 'function' &&
        // some versions of IE say that typeof /abc/ === 'function'
        _toString(x) === '[object Function]';
    },

    ToInt32: function (x) {
      return x >> 0;
    },

    ToUint32: function (x) {
      return x >>> 0;
    },

    ToInteger: function (value) {
      var number = +value;
      if (Number.isNaN(number)) { return 0; }
      if (number === 0 || !Number.isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    },

    ToLength: function (value) {
      var len = ES.ToInteger(value);
      if (len <= 0) { return 0; } // includes converting -0 to +0
      if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }
      return len;
    },

    SameValue: function (a, b) {
      if (a === b) {
        // 0 === -0, but they are not identical.
        if (a === 0) { return 1 / a === 1 / b; }
        return true;
      }
      return Number.isNaN(a) && Number.isNaN(b);
    },

    SameValueZero: function (a, b) {
      // same as SameValue except for SameValueZero(+0, -0) == true
      return (a === b) || (Number.isNaN(a) && Number.isNaN(b));
    },

    IsIterable: function (o) {
      return ES.TypeIsObject(o) &&
        (typeof o[$iterator$] !== 'undefined' || isArguments(o));
    },

    GetIterator: function (o) {
      if (isArguments(o)) {
        // special case support for `arguments`
        return new ArrayIterator(o, 'value');
      }
      var itFn = o[$iterator$];
      if (!ES.IsCallable(itFn)) {
        throw new TypeError('value is not an iterable');
      }
      var it = itFn.call(o);
      if (!ES.TypeIsObject(it)) {
        throw new TypeError('bad iterator');
      }
      return it;
    },

    IteratorNext: function (it) {
      var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
      if (!ES.TypeIsObject(result)) {
        throw new TypeError('bad iterator');
      }
      return result;
    },

    Construct: function (C, args) {
      // CreateFromConstructor
      var obj;
      if (ES.IsCallable(C['@@create'])) {
        obj = C['@@create']();
      } else {
        // OrdinaryCreateFromConstructor
        obj = create(C.prototype || null);
      }
      // Mark that we've used the es6 construct path
      // (see emulateES6construct)
      defineProperties(obj, { _es6construct: true });
      // Call the constructor.
      var result = C.apply(obj, args);
      return ES.TypeIsObject(result) ? result : obj;
    }
  };

  var numberConversion = (function () {
    // from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js#L176-L266
    // with permission and license, per https://twitter.com/inexorabletash/status/372206509540659200

    function roundToEven(n) {
      var w = Math.floor(n), f = n - w;
      if (f < 0.5) {
        return w;
      }
      if (f > 0.5) {
        return w + 1;
      }
      return w % 2 ? w + 1 : w;
    }

    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << (ebits - 1)) - 1,
        s, e, f,
        i, bits, str, bytes;

      // Compute sign, exponent, fraction
      if (v !== v) {
        // NaN
        // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
        e = (1 << ebits) - 1;
        f = Math.pow(2, fbits - 1);
        s = 0;
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1;
        f = 0;
        s = (v < 0) ? 1 : 0;
      } else if (v === 0) {
        e = 0;
        f = 0;
        s = (1 / v === -Infinity) ? 1 : 0;
      } else {
        s = v < 0;
        v = Math.abs(v);

        if (v >= Math.pow(2, 1 - bias)) {
          e = Math.min(Math.floor(Math.log(v) / Math.LN2), 1023);
          f = roundToEven(v / Math.pow(2, e) * Math.pow(2, fbits));
          if (f / Math.pow(2, fbits) >= 2) {
            e = e + 1;
            f = 1;
          }
          if (e > bias) {
            // Overflow
            e = (1 << ebits) - 1;
            f = 0;
          } else {
            // Normal
            e = e + bias;
            f = f - Math.pow(2, fbits);
          }
        } else {
          // Subnormal
          e = 0;
          f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
        }
      }

      // Pack sign, exponent, fraction
      bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = Math.floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = Math.floor(e / 2);
      }
      bits.push(s ? 1 : 0);
      bits.reverse();
      str = bits.join('');

      // Bits to bytes
      bytes = [];
      while (str.length) {
        bytes.push(parseInt(str.slice(0, 8), 2));
        str = str.slice(8);
      }
      return bytes;
    }

    function unpackIEEE754(bytes, ebits, fbits) {
      // Bytes to bits
      var bits = [], i, j, b, str,
          bias, s, e, f;

      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1];
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0);
          b = b >> 1;
        }
      }
      bits.reverse();
      str = bits.join('');

      // Unpack sign, exponent, fraction
      bias = (1 << (ebits - 1)) - 1;
      s = parseInt(str.slice(0, 1), 2) ? -1 : 1;
      e = parseInt(str.slice(1, 1 + ebits), 2);
      f = parseInt(str.slice(1 + ebits), 2);

      // Produce number
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
      } else if (e > 0) {
        // Normalized
        return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
      } else if (f !== 0) {
        // Denormalized
        return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
      } else {
        return s < 0 ? -0 : 0;
      }
    }

    function unpackFloat64(b) { return unpackIEEE754(b, 11, 52); }
    function packFloat64(v) { return packIEEE754(v, 11, 52); }
    function unpackFloat32(b) { return unpackIEEE754(b, 8, 23); }
    function packFloat32(v) { return packIEEE754(v, 8, 23); }

    var conversions = {
      toFloat32: function (num) { return unpackFloat32(packFloat32(num)); }
    };
    if (typeof Float32Array !== 'undefined') {
      var float32array = new Float32Array(1);
      conversions.toFloat32 = function (num) {
        float32array[0] = num;
        return float32array[0];
      };
    }
    return conversions;
  }());

  defineProperties(String, {
    fromCodePoint: function fromCodePoint(_) { // length = 1
      var result = [];
      var next;
      for (var i = 0, length = arguments.length; i < length; i++) {
        next = Number(arguments[i]);
        if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {
          throw new RangeError('Invalid code point ' + next);
        }

        if (next < 0x10000) {
          result.push(String.fromCharCode(next));
        } else {
          next -= 0x10000;
          result.push(String.fromCharCode((next >> 10) + 0xD800));
          result.push(String.fromCharCode((next % 0x400) + 0xDC00));
        }
      }
      return result.join('');
    },

    raw: function raw(callSite) { // raw.length===1
      var cooked = ES.ToObject(callSite, 'bad callSite');
      var rawValue = cooked.raw;
      var rawString = ES.ToObject(rawValue, 'bad raw value');
      var len = rawString.length;
      var literalsegments = ES.ToLength(len);
      if (literalsegments <= 0) {
        return '';
      }

      var stringElements = [];
      var nextIndex = 0;
      var nextKey, next, nextSeg, nextSub;
      while (nextIndex < literalsegments) {
        nextKey = String(nextIndex);
        next = rawString[nextKey];
        nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 >= literalsegments) {
          break;
        }
        next = nextIndex + 1 < arguments.length ? arguments[nextIndex + 1] : '';
        nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex++;
      }
      return stringElements.join('');
    }
  });

  // Firefox 31 reports this function's length as 0
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1062484
  if (String.fromCodePoint.length !== 1) {
    var originalFromCodePoint = Function.apply.bind(String.fromCodePoint);
    defineProperty(String, 'fromCodePoint', function (_) { return originalFromCodePoint(this, arguments); }, true);
  }

  var StringShims = {
    // Fast repeat, uses the `Exponentiation by squaring` algorithm.
    // Perf: http://jsperf.com/string-repeat2/2
    repeat: (function () {
      var repeat = function (s, times) {
        if (times < 1) { return ''; }
        if (times % 2) { return repeat(s, times - 1) + s; }
        var half = repeat(s, times / 2);
        return half + half;
      };

      return function (times) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        times = ES.ToInteger(times);
        if (times < 0 || times === Infinity) {
          throw new RangeError('Invalid String#repeat value');
        }
        return repeat(thisStr, times);
      };
    })(),

    startsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (Type.regex(searchStr)) {
        throw new TypeError('Cannot call method "startsWith" with a regex');
      }
      searchStr = String(searchStr);
      var startArg = arguments.length > 1 ? arguments[1] : void 0;
      var start = Math.max(ES.ToInteger(startArg), 0);
      return thisStr.slice(start, start + searchStr.length) === searchStr;
    },

    endsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (Type.regex(searchStr)) {
        throw new TypeError('Cannot call method "endsWith" with a regex');
      }
      searchStr = String(searchStr);
      var thisLen = thisStr.length;
      var posArg = arguments.length > 1 ? arguments[1] : void 0;
      var pos = typeof posArg === 'undefined' ? thisLen : ES.ToInteger(posArg);
      var end = Math.min(Math.max(pos, 0), thisLen);
      return thisStr.slice(end - searchStr.length, end) === searchStr;
    },

    includes: function includes(searchString) {
      var position = arguments.length > 1 ? arguments[1] : void 0;
      // Somehow this trick makes method 100% compat with the spec.
      return _indexOf(this, searchString, position) !== -1;
    },

    codePointAt: function (pos) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      var position = ES.ToInteger(pos);
      var length = thisStr.length;
      if (position < 0 || position >= length) { return; }
      var first = thisStr.charCodeAt(position);
      var isEnd = (position + 1 === length);
      if (first < 0xD800 || first > 0xDBFF || isEnd) { return first; }
      var second = thisStr.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) { return first; }
      return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
    }
  };
  defineProperties(String.prototype, StringShims);

  var hasStringTrimBug = '\u0085'.trim().length !== 1;
  if (hasStringTrimBug) {
    var originalStringTrim = String.prototype.trim;
    delete String.prototype.trim;
    // whitespace from: http://es5.github.io/#x15.5.4.20
    // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
    var ws = [
      '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
      '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
      '\u2029\uFEFF'
    ].join('');
    var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
    defineProperties(String.prototype, {
      trim: function () {
        if (typeof this === 'undefined' || this === null) {
          throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimRegexp, '');
      }
    });
  }

  // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype-@@iterator
  var StringIterator = function (s) {
    this._s = String(ES.CheckObjectCoercible(s));
    this._i = 0;
  };
  StringIterator.prototype.next = function () {
    var s = this._s, i = this._i;
    if (typeof s === 'undefined' || i >= s.length) {
      this._s = void 0;
      return { value: void 0, done: true };
    }
    var first = s.charCodeAt(i), second, len;
    if (first < 0xD800 || first > 0xDBFF || (i + 1) == s.length) {
      len = 1;
    } else {
      second = s.charCodeAt(i + 1);
      len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
    }
    this._i = i + len;
    return { value: s.substr(i, len), done: false };
  };
  addIterator(StringIterator.prototype);
  addIterator(String.prototype, function () {
    return new StringIterator(this);
  });

  if (!startsWithIsCompliant) {
    // Firefox has a noncompliant startsWith implementation
    defineProperties(String.prototype, {
      startsWith: StringShims.startsWith,
      endsWith: StringShims.endsWith
    });
  }

  var ArrayShims = {
    from: function (iterable) {
      var mapFn = arguments.length > 1 ? arguments[1] : void 0;

      var list = ES.ToObject(iterable, 'bad iterable');
      if (typeof mapFn !== 'undefined' && !ES.IsCallable(mapFn)) {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }

      var hasThisArg = arguments.length > 2;
      var thisArg = hasThisArg ? arguments[2] : void 0;

      var usingIterator = ES.IsIterable(list);
      // does the spec really mean that Arrays should use ArrayIterator?
      // https://bugs.ecmascript.org/show_bug.cgi?id=2416
      //if (Array.isArray(list)) { usingIterator=false; }

      var length;
      var result, i, value;
      if (usingIterator) {
        i = 0;
        result = ES.IsCallable(this) ? Object(new this()) : [];
        var it = usingIterator ? ES.GetIterator(list) : null;
        var iterationValue;

        do {
          iterationValue = ES.IteratorNext(it);
          if (!iterationValue.done) {
            value = iterationValue.value;
            if (mapFn) {
              result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
            } else {
              result[i] = value;
            }
            i += 1;
          }
        } while (!iterationValue.done);
        length = i;
      } else {
        length = ES.ToLength(list.length);
        result = ES.IsCallable(this) ? Object(new this(length)) : new Array(length);
        for (i = 0; i < length; ++i) {
          value = list[i];
          if (mapFn) {
            result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
          } else {
            result[i] = value;
          }
        }
      }

      result.length = length;
      return result;
    },

    of: function () {
      return Array.from(arguments);
    }
  };
  defineProperties(Array, ArrayShims);

  var arrayFromSwallowsNegativeLengths = function () {
    try {
      return Array.from({ length: -1 }).length === 0;
    } catch (e) {
      return false;
    }
  };
  // Fixes a Firefox bug in v32
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1063993
  if (!arrayFromSwallowsNegativeLengths()) {
    defineProperty(Array, 'from', ArrayShims.from, true);
  }

  // Our ArrayIterator is private; see
  // https://github.com/paulmillr/es6-shim/issues/252
  ArrayIterator = function (array, kind) {
      this.i = 0;
      this.array = array;
      this.kind = kind;
  };

  defineProperties(ArrayIterator.prototype, {
    next: function () {
      var i = this.i, array = this.array;
      if (!(this instanceof ArrayIterator)) {
        throw new TypeError('Not an ArrayIterator');
      }
      if (typeof array !== 'undefined') {
        var len = ES.ToLength(array.length);
        for (; i < len; i++) {
          var kind = this.kind;
          var retval;
          if (kind === 'key') {
            retval = i;
          } else if (kind === 'value') {
            retval = array[i];
          } else if (kind === 'entry') {
            retval = [i, array[i]];
          }
          this.i = i + 1;
          return { value: retval, done: false };
        }
      }
      this.array = void 0;
      return { value: void 0, done: true };
    }
  });
  addIterator(ArrayIterator.prototype);

  var ArrayPrototypeShims = {
    copyWithin: function (target, start) {
      var end = arguments[2]; // copyWithin.length must be 2
      var o = ES.ToObject(this);
      var len = ES.ToLength(o.length);
      target = ES.ToInteger(target);
      start = ES.ToInteger(start);
      var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
      var from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      end = typeof end === 'undefined' ? len : ES.ToInteger(end);
      var fin = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
      var count = Math.min(fin - from, len - to);
      var direction = 1;
      if (from < to && to < (from + count)) {
        direction = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count > 0) {
        if (_hasOwnProperty(o, from)) {
          o[to] = o[from];
        } else {
          delete o[from];
        }
        from += direction;
        to += direction;
        count -= 1;
      }
      return o;
    },

    fill: function (value) {
      var start = arguments.length > 1 ? arguments[1] : void 0;
      var end = arguments.length > 2 ? arguments[2] : void 0;
      var O = ES.ToObject(this);
      var len = ES.ToLength(O.length);
      start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);
      end = ES.ToInteger(typeof end === 'undefined' ? len : end);

      var relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      var relativeEnd = end < 0 ? len + end : end;

      for (var i = relativeStart; i < len && i < relativeEnd; ++i) {
        O[i] = value;
      }
      return O;
    },

    find: function find(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#find: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0, value; i < length; i++) {
        value = list[i];
        if (thisArg) {
          if (predicate.call(thisArg, value, i, list)) { return value; }
        } else {
          if (predicate(value, i, list)) { return value; }
        }
      }
      return;
    },

    findIndex: function findIndex(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#findIndex: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0; i < length; i++) {
        if (thisArg) {
          if (predicate.call(thisArg, list[i], i, list)) { return i; }
        } else {
          if (predicate(list[i], i, list)) { return i; }
        }
      }
      return -1;
    },

    keys: function () {
      return new ArrayIterator(this, 'key');
    },

    values: function () {
      return new ArrayIterator(this, 'value');
    },

    entries: function () {
      return new ArrayIterator(this, 'entry');
    }
  };
  // Safari 7.1 defines Array#keys and Array#entries natively,
  // but the resulting ArrayIterator objects don't have a "next" method.
  if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {
    delete Array.prototype.keys;
  }
  if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {
    delete Array.prototype.entries;
  }

  // Chrome 38 defines Array#keys and Array#entries, and Array#@@iterator, but not Array#values
  if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {
    defineProperties(Array.prototype, {
      values: Array.prototype[$iterator$]
    });
    if (Type.symbol(Symbol.unscopables)) {
      Array.prototype[Symbol.unscopables].values = true;
    }
  }
  defineProperties(Array.prototype, ArrayPrototypeShims);

  addIterator(Array.prototype, function () { return this.values(); });
  // Chrome defines keys/values/entries on Array, but doesn't give us
  // any way to identify its iterator.  So add our own shimmed field.
  if (Object.getPrototypeOf) {
    addIterator(Object.getPrototypeOf([].values()));
  }

  var maxSafeInteger = Math.pow(2, 53) - 1;
  defineProperties(Number, {
    MAX_SAFE_INTEGER: maxSafeInteger,
    MIN_SAFE_INTEGER: -maxSafeInteger,
    EPSILON: 2.220446049250313e-16,

    parseInt: globals.parseInt,
    parseFloat: globals.parseFloat,

    isFinite: function (value) {
      return typeof value === 'number' && global_isFinite(value);
    },

    isInteger: function (value) {
      return Number.isFinite(value) &&
        ES.ToInteger(value) === value;
    },

    isSafeInteger: function (value) {
      return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
    },

    isNaN: function (value) {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN('foo') => true
      return value !== value;
    }
  });

  // Work around bugs in Array#find and Array#findIndex -- early
  // implementations skipped holes in sparse arrays. (Note that the
  // implementations of find/findIndex indirectly use shimmed
  // methods of Number, so this test has to happen down here.)
  if (![, 1].find(function (item, idx) { return idx === 0; })) {
    defineProperty(Array.prototype, 'find', ArrayPrototypeShims.find, true);
  }
  if ([, 1].findIndex(function (item, idx) { return idx === 0; }) !== 0) {
    defineProperty(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex, true);
  }

  if (supportsDescriptors) {
    defineProperties(Object, {
      getPropertyDescriptor: function (subject, name) {
        var pd = Object.getOwnPropertyDescriptor(subject, name);
        var proto = Object.getPrototypeOf(subject);
        while (typeof pd === 'undefined' && proto !== null) {
          pd = Object.getOwnPropertyDescriptor(proto, name);
          proto = Object.getPrototypeOf(proto);
        }
        return pd;
      },

      getPropertyNames: function (subject) {
        var result = Object.getOwnPropertyNames(subject);
        var proto = Object.getPrototypeOf(subject);

        var addProperty = function (property) {
          if (result.indexOf(property) === -1) {
            result.push(property);
          }
        };

        while (proto !== null) {
          Object.getOwnPropertyNames(proto).forEach(addProperty);
          proto = Object.getPrototypeOf(proto);
        }
        return result;
      }
    });

    defineProperties(Object, {
      // 19.1.3.1
      assign: function (target, source) {
        if (!ES.TypeIsObject(target)) {
          throw new TypeError('target must be an object');
        }
        return Array.prototype.reduce.call(arguments, function (target, source) {
          return Object.keys(Object(source)).reduce(function (target, key) {
            target[key] = source[key];
            return target;
          }, target);
        });
      },

      is: function (a, b) {
        return ES.SameValue(a, b);
      },

      // 19.1.3.9
      // shim from https://gist.github.com/WebReflection/5593554
      setPrototypeOf: (function (Object, magic) {
        var set;

        var checkArgs = function (O, proto) {
          if (!ES.TypeIsObject(O)) {
            throw new TypeError('cannot set prototype on a non-object');
          }
          if (!(proto === null || ES.TypeIsObject(proto))) {
            throw new TypeError('can only set prototype to an object or null' + proto);
          }
        };

        var setPrototypeOf = function (O, proto) {
          checkArgs(O, proto);
          set.call(O, proto);
          return O;
        };

        try {
          // this works already in Firefox and Safari
          set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
          set.call({}, null);
        } catch (e) {
          if (Object.prototype !== {}[magic]) {
            // IE < 11 cannot be shimmed
            return;
          }
          // probably Chrome or some old Mobile stock browser
          set = function (proto) {
            this[magic] = proto;
          };
          // please note that this will **not** work
          // in those browsers that do not inherit
          // __proto__ by mistake from Object.prototype
          // in these cases we should probably throw an error
          // or at least be informed about the issue
          setPrototypeOf.polyfill = setPrototypeOf(
            setPrototypeOf({}, null),
            Object.prototype
          ) instanceof Object;
          // setPrototypeOf.polyfill === true means it works as meant
          // setPrototypeOf.polyfill === false means it's not 100% reliable
          // setPrototypeOf.polyfill === undefined
          // or
          // setPrototypeOf.polyfill ==  null means it's not a polyfill
          // which means it works as expected
          // we can even delete Object.prototype.__proto__;
        }
        return setPrototypeOf;
      })(Object, '__proto__')
    });
  }

  // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,
  // but Object.create(null) does.
  if (Object.setPrototypeOf && Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&
      Object.getPrototypeOf(Object.create(null)) === null) {
    (function () {
      var FAKENULL = Object.create(null);
      var gpo = Object.getPrototypeOf, spo = Object.setPrototypeOf;
      Object.getPrototypeOf = function (o) {
        var result = gpo(o);
        return result === FAKENULL ? null : result;
      };
      Object.setPrototypeOf = function (o, p) {
        if (p === null) { p = FAKENULL; }
        return spo(o, p);
      };
      Object.setPrototypeOf.polyfill = false;
    })();
  }

  try {
    Object.keys('foo');
  } catch (e) {
    var originalObjectKeys = Object.keys;
    Object.keys = function (obj) {
      return originalObjectKeys(ES.ToObject(obj));
    };
  }

  var MathShims = {
    acosh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < 1) { return NaN; }
      if (value === 1) { return 0; }
      if (value === Infinity) { return value; }
      return Math.log(value + Math.sqrt(value * value - 1));
    },

    asinh: function (value) {
      value = Number(value);
      if (value === 0 || !global_isFinite(value)) {
        return value;
      }
      return value < 0 ? -Math.asinh(-value) : Math.log(value + Math.sqrt(value * value + 1));
    },

    atanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < -1 || value > 1) {
        return NaN;
      }
      if (value === -1) { return -Infinity; }
      if (value === 1) { return Infinity; }
      if (value === 0) { return value; }
      return 0.5 * Math.log((1 + value) / (1 - value));
    },

    cbrt: function (value) {
      value = Number(value);
      if (value === 0) { return value; }
      var negate = value < 0, result;
      if (negate) { value = -value; }
      result = Math.pow(value, 1 / 3);
      return negate ? -result : result;
    },

    clz32: function (value) {
      // See https://bugs.ecmascript.org/show_bug.cgi?id=2465
      value = Number(value);
      var number = ES.ToUint32(value);
      if (number === 0) {
        return 32;
      }
      return 32 - (number).toString(2).length;
    },

    cosh: function (value) {
      value = Number(value);
      if (value === 0) { return 1; } // +0 or -0
      if (Number.isNaN(value)) { return NaN; }
      if (!global_isFinite(value)) { return Infinity; }
      if (value < 0) { value = -value; }
      if (value > 21) { return Math.exp(value) / 2; }
      return (Math.exp(value) + Math.exp(-value)) / 2;
    },

    expm1: function (value) {
      value = Number(value);
      if (value === -Infinity) { return -1; }
      if (!global_isFinite(value) || value === 0) { return value; }
      return Math.exp(value) - 1;
    },

    hypot: function (x, y) {
      var anyNaN = false;
      var allZero = true;
      var anyInfinity = false;
      var numbers = [];
      Array.prototype.every.call(arguments, function (arg) {
        var num = Number(arg);
        if (Number.isNaN(num)) {
          anyNaN = true;
        } else if (num === Infinity || num === -Infinity) {
          anyInfinity = true;
        } else if (num !== 0) {
          allZero = false;
        }
        if (anyInfinity) {
          return false;
        } else if (!anyNaN) {
          numbers.push(Math.abs(num));
        }
        return true;
      });
      if (anyInfinity) { return Infinity; }
      if (anyNaN) { return NaN; }
      if (allZero) { return 0; }

      numbers.sort(function (a, b) { return b - a; });
      var largest = numbers[0];
      var divided = numbers.map(function (number) { return number / largest; });
      var sum = divided.reduce(function (sum, number) { return sum += number * number; }, 0);
      return largest * Math.sqrt(sum);
    },

    log2: function (value) {
      return Math.log(value) * Math.LOG2E;
    },

    log10: function (value) {
      return Math.log(value) * Math.LOG10E;
    },

    log1p: function (value) {
      value = Number(value);
      if (value < -1 || Number.isNaN(value)) { return NaN; }
      if (value === 0 || value === Infinity) { return value; }
      if (value === -1) { return -Infinity; }
      var result = 0;
      var n = 50;

      if (value < 0 || value > 1) { return Math.log(1 + value); }
      for (var i = 1; i < n; i++) {
        if ((i % 2) === 0) {
          result -= Math.pow(value, i) / i;
        } else {
          result += Math.pow(value, i) / i;
        }
      }

      return result;
    },

    sign: function (value) {
      var number = +value;
      if (number === 0) { return number; }
      if (Number.isNaN(number)) { return number; }
      return number < 0 ? -1 : 1;
    },

    sinh: function (value) {
      value = Number(value);
      if (!global_isFinite(value) || value === 0) { return value; }
      return (Math.exp(value) - Math.exp(-value)) / 2;
    },

    tanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value === 0) { return value; }
      if (value === Infinity) { return 1; }
      if (value === -Infinity) { return -1; }
      return (Math.exp(value) - Math.exp(-value)) / (Math.exp(value) + Math.exp(-value));
    },

    trunc: function (value) {
      var number = Number(value);
      return number < 0 ? -Math.floor(-number) : Math.floor(number);
    },

    imul: function (x, y) {
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
      x = ES.ToUint32(x);
      y = ES.ToUint32(y);
      var ah  = (x >>> 16) & 0xffff;
      var al = x & 0xffff;
      var bh  = (y >>> 16) & 0xffff;
      var bl = y & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    },

    fround: function (x) {
      if (x === 0 || x === Infinity || x === -Infinity || Number.isNaN(x)) {
        return x;
      }
      var num = Number(x);
      return numberConversion.toFloat32(num);
    }
  };
  defineProperties(Math, MathShims);

  if (Math.imul(0xffffffff, 5) !== -5) {
    // Safari 6.1, at least, reports "0" for this value
    Math.imul = MathShims.imul;
  }

  // Promises
  // Simplest possible implementation; use a 3rd-party library if you
  // want the best possible speed and/or long stack traces.
  var PromiseShim = (function () {

    var Promise, Promise$prototype;

    ES.IsPromise = function (promise) {
      if (!ES.TypeIsObject(promise)) {
        return false;
      }
      if (!promise._promiseConstructor) {
        // _promiseConstructor is a bit more unique than _status, so we'll
        // check that instead of the [[PromiseStatus]] internal field.
        return false;
      }
      if (typeof promise._status === 'undefined') {
        return false; // uninitialized
      }
      return true;
    };

    // "PromiseCapability" in the spec is what most promise implementations
    // call a "deferred".
    var PromiseCapability = function (C) {
      if (!ES.IsCallable(C)) {
        throw new TypeError('bad promise constructor');
      }
      var capability = this;
      var resolver = function (resolve, reject) {
        capability.resolve = resolve;
        capability.reject = reject;
      };
      capability.promise = ES.Construct(C, [resolver]);
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2478
      if (!capability.promise._es6construct) {
        throw new TypeError('bad promise constructor');
      }
      if (!(ES.IsCallable(capability.resolve) &&
            ES.IsCallable(capability.reject))) {
        throw new TypeError('bad promise constructor');
      }
    };

    // find an appropriate setImmediate-alike
    var setTimeout = globals.setTimeout;
    var makeZeroTimeout;
    if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {
      makeZeroTimeout = function () {
        // from http://dbaron.org/log/20100309-faster-timeouts
        var timeouts = [];
        var messageName = 'zero-timeout-message';
        var setZeroTimeout = function (fn) {
          timeouts.push(fn);
          window.postMessage(messageName, '*');
        };
        var handleMessage = function (event) {
          if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length === 0) { return; }
            var fn = timeouts.shift();
            fn();
          }
        };
        window.addEventListener('message', handleMessage, true);
        return setZeroTimeout;
      };
    }
    var makePromiseAsap = function () {
      // An efficient task-scheduler based on a pre-existing Promise
      // implementation, which we can use even if we override the
      // global Promise below (in order to workaround bugs)
      // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
      var P = globals.Promise;
      return P && P.resolve && function (task) {
        return P.resolve().then(task);
      };
    };
    var enqueue = ES.IsCallable(globals.setImmediate) ?
      globals.setImmediate.bind(globals) :
      typeof process === 'object' && process.nextTick ? process.nextTick :
      makePromiseAsap() ||
      (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() :
      function (task) { setTimeout(task, 0); }); // fallback

    var triggerPromiseReactions = function (reactions, x) {
      reactions.forEach(function (reaction) {
        enqueue(function () {
          // PromiseReactionTask
          var handler = reaction.handler;
          var capability = reaction.capability;
          var resolve = capability.resolve;
          var reject = capability.reject;
          try {
            var result = handler(x);
            if (result === capability.promise) {
              throw new TypeError('self resolution');
            }
            var updateResult =
              updatePromiseFromPotentialThenable(result, capability);
            if (!updateResult) {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    var updatePromiseFromPotentialThenable = function (x, capability) {
      if (!ES.TypeIsObject(x)) {
        return false;
      }
      var resolve = capability.resolve;
      var reject = capability.reject;
      try {
        var then = x.then; // only one invocation of accessor
        if (!ES.IsCallable(then)) { return false; }
        then.call(x, resolve, reject);
      } catch (e) {
        reject(e);
      }
      return true;
    };

    var promiseResolutionHandler = function (promise, onFulfilled, onRejected) {
      return function (x) {
        if (x === promise) {
          return onRejected(new TypeError('self resolution'));
        }
        var C = promise._promiseConstructor;
        var capability = new PromiseCapability(C);
        var updateResult = updatePromiseFromPotentialThenable(x, capability);
        if (updateResult) {
          return capability.promise.then(onFulfilled, onRejected);
        } else {
          return onFulfilled(x);
        }
      };
    };

    Promise = function (resolver) {
      var promise = this;
      promise = emulateES6construct(promise);
      if (!promise._promiseConstructor) {
        // we use _promiseConstructor as a stand-in for the internal
        // [[PromiseStatus]] field; it's a little more unique.
        throw new TypeError('bad promise');
      }
      if (typeof promise._status !== 'undefined') {
        throw new TypeError('promise already initialized');
      }
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
      if (!ES.IsCallable(resolver)) {
        throw new TypeError('not a valid resolver');
      }
      promise._status = 'unresolved';
      promise._resolveReactions = [];
      promise._rejectReactions = [];

      var resolve = function (resolution) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._resolveReactions;
        promise._result = resolution;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-resolution';
        triggerPromiseReactions(reactions, resolution);
      };
      var reject = function (reason) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._rejectReactions;
        promise._result = reason;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-rejection';
        triggerPromiseReactions(reactions, reason);
      };
      try {
        resolver(resolve, reject);
      } catch (e) {
        reject(e);
      }
      return promise;
    };
    Promise$prototype = Promise.prototype;
    var _promiseAllResolver = function (index, values, capability, remaining) {
      var done = false;
      return function (x) {
        if (done) { return; } // protect against being called multiple times
        done = true;
        values[index] = x;
        if ((--remaining.count) === 0) {
          var resolve = capability.resolve;
          resolve(values); // call w/ this===undefined
        }
      };
    };

    defineProperties(Promise, {
      '@@create': function (obj) {
        var constructor = this;
        // AllocatePromise
        // The `obj` parameter is a hack we use for es5
        // compatibility.
        var prototype = constructor.prototype || Promise$prototype;
        obj = obj || create(prototype);
        defineProperties(obj, {
          _status: void 0,
          _result: void 0,
          _resolveReactions: void 0,
          _rejectReactions: void 0,
          _promiseConstructor: void 0
        });
        obj._promiseConstructor = constructor;
        return obj;
      },

      all: function all(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          var values = [], remaining = { count: 1 };
          for (var index = 0; ; index++) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              break;
            }
            var nextPromise = C.resolve(next.value);
            var resolveElement = _promiseAllResolver(
              index, values, capability, remaining
            );
            remaining.count++;
            nextPromise.then(resolveElement, capability.reject);
          }
          if ((--remaining.count) === 0) {
            resolve(values); // call w/ this===undefined
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      },

      race: function race(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          while (true) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              // If iterable has no items, resulting promise will never
              // resolve; see:
              // https://github.com/domenic/promises-unwrapping/issues/75
              // https://bugs.ecmascript.org/show_bug.cgi?id=2515
              break;
            }
            var nextPromise = C.resolve(next.value);
            nextPromise.then(resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      },

      reject: function reject(reason) {
        var C = this;
        var capability = new PromiseCapability(C);
        var rejectPromise = capability.reject;
        rejectPromise(reason); // call with this===undefined
        return capability.promise;
      },

      resolve: function resolve(v) {
        var C = this;
        if (ES.IsPromise(v)) {
          var constructor = v._promiseConstructor;
          if (constructor === C) { return v; }
        }
        var capability = new PromiseCapability(C);
        var resolvePromise = capability.resolve;
        resolvePromise(v); // call with this===undefined
        return capability.promise;
      }
    });

    defineProperties(Promise$prototype, {
      'catch': function (onRejected) {
        return this.then(void 0, onRejected);
      },

      then: function then(onFulfilled, onRejected) {
        var promise = this;
        if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }
        // this.constructor not this._promiseConstructor; see
        // https://bugs.ecmascript.org/show_bug.cgi?id=2513
        var C = this.constructor;
        var capability = new PromiseCapability(C);
        if (!ES.IsCallable(onRejected)) {
          onRejected = function (e) { throw e; };
        }
        if (!ES.IsCallable(onFulfilled)) {
          onFulfilled = function (x) { return x; };
        }
        var resolutionHandler = promiseResolutionHandler(promise, onFulfilled, onRejected);
        var resolveReaction = { capability: capability, handler: resolutionHandler };
        var rejectReaction = { capability: capability, handler: onRejected };
        switch (promise._status) {
          case 'unresolved':
            promise._resolveReactions.push(resolveReaction);
            promise._rejectReactions.push(rejectReaction);
            break;
          case 'has-resolution':
            triggerPromiseReactions([resolveReaction], promise._result);
            break;
          case 'has-rejection':
            triggerPromiseReactions([rejectReaction], promise._result);
            break;
          default:
            throw new TypeError('unexpected');
        }
        return capability.promise;
      }
    });

    return Promise;
  }());

  // Chrome's native Promise has extra methods that it shouldn't have. Let's remove them.
  if (globals.Promise) {
    delete globals.Promise.accept;
    delete globals.Promise.defer;
    delete globals.Promise.prototype.chain;
  }

  // export the Promise constructor.
  defineProperties(globals, { Promise: PromiseShim });
  // In Chrome 33 (and thereabouts) Promise is defined, but the
  // implementation is buggy in a number of ways.  Let's check subclassing
  // support to see if we have a buggy implementation.
  var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function (S) {
    return S.resolve(42) instanceof S;
  });
  var promiseIgnoresNonFunctionThenCallbacks = (function () {
    try {
      globals.Promise.reject(42).then(null, 5).then(null, function () {});
      return true;
    } catch (ex) {
      return false;
    }
  }());
  var promiseRequiresObjectContext = (function () {
    try { Promise.call(3, function () {}); } catch (e) { return true; }
    return false;
  }());
  if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks || !promiseRequiresObjectContext) {
    /*globals Promise: true */
    Promise = PromiseShim;
    /*globals Promise: false */
    defineProperty(globals, 'Promise', PromiseShim, true);
  }

  // Map and Set require a true ES5 environment
  // Their fast path also requires that the environment preserve
  // property insertion order, which is not guaranteed by the spec.
  var testOrder = function (a) {
    var b = Object.keys(a.reduce(function (o, k) {
      o[k] = true;
      return o;
    }, {}));
    return a.join(':') === b.join(':');
  };
  var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
  // some engines (eg, Chrome) only preserve insertion order for string keys
  var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);

  if (supportsDescriptors) {

    var fastkey = function fastkey(key) {
      if (!preservesInsertionOrder) {
        return null;
      }
      var type = typeof key;
      if (type === 'string') {
        return '$' + key;
      } else if (type === 'number') {
        // note that -0 will get coerced to "0" when used as a property key
        if (!preservesNumericInsertionOrder) {
          return 'n' + key;
        }
        return key;
      }
      return null;
    };

    var emptyObject = function emptyObject() {
      // accomodate some older not-quite-ES5 browsers
      return Object.create ? Object.create(null) : {};
    };

    var collectionShims = {
      Map: (function () {

        var empty = {};

        function MapEntry(key, value) {
          this.key = key;
          this.value = value;
          this.next = null;
          this.prev = null;
        }

        MapEntry.prototype.isRemoved = function () {
          return this.key === empty;
        };

        function MapIterator(map, kind) {
          this.head = map._head;
          this.i = this.head;
          this.kind = kind;
        }

        MapIterator.prototype = {
          next: function () {
            var i = this.i, kind = this.kind, head = this.head, result;
            if (typeof this.i === 'undefined') {
              return { value: void 0, done: true };
            }
            while (i.isRemoved() && i !== head) {
              // back up off of removed entries
              i = i.prev;
            }
            // advance to next unreturned element.
            while (i.next !== head) {
              i = i.next;
              if (!i.isRemoved()) {
                if (kind === 'key') {
                  result = i.key;
                } else if (kind === 'value') {
                  result = i.value;
                } else {
                  result = [i.key, i.value];
                }
                this.i = i;
                return { value: result, done: false };
              }
            }
            // once the iterator is done, it is done forever.
            this.i = void 0;
            return { value: void 0, done: true };
          }
        };
        addIterator(MapIterator.prototype);

        function Map(iterable) {
          var map = this;
          if (!ES.TypeIsObject(map)) {
            throw new TypeError('Map does not accept arguments when called as a function');
          }
          map = emulateES6construct(map);
          if (!map._es6map) {
            throw new TypeError('bad map');
          }

          var head = new MapEntry(null, null);
          // circular doubly-linked list.
          head.next = head.prev = head;

          defineProperties(map, {
            _head: head,
            _storage: emptyObject(),
            _size: 0
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = map.set;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              if (!ES.TypeIsObject(nextItem)) {
                throw new TypeError('expected iterable of pairs');
              }
              adder.call(map, nextItem[0], nextItem[1]);
            }
          }
          return map;
        }
        var Map$prototype = Map.prototype;
        defineProperties(Map, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Map$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6map: true });
            return obj;
          }
        });

        Object.defineProperty(Map.prototype, 'size', {
          configurable: true,
          enumerable: false,
          get: function () {
            if (typeof this._size === 'undefined') {
              throw new TypeError('size method called on incompatible Map');
            }
            return this._size;
          }
        });

        defineProperties(Map.prototype, {
          get: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              var entry = this._storage[fkey];
              if (entry) {
                return entry.value;
              } else {
                return;
              }
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return i.value;
              }
            }
            return;
          },

          has: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              return typeof this._storage[fkey] !== 'undefined';
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return true;
              }
            }
            return false;
          },

          set: function (key, value) {
            var head = this._head, i = head, entry;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] !== 'undefined') {
                this._storage[fkey].value = value;
                return this;
              } else {
                entry = this._storage[fkey] = new MapEntry(key, value);
                i = head.prev;
                // fall through
              }
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.value = value;
                return this;
              }
            }
            entry = entry || new MapEntry(key, value);
            if (ES.SameValue(-0, key)) {
              entry.key = +0; // coerce -0 to +0 in entry
            }
            entry.next = this._head;
            entry.prev = this._head.prev;
            entry.prev.next = entry;
            entry.next.prev = entry;
            this._size += 1;
            return this;
          },

          'delete': function (key) {
            var head = this._head, i = head;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] === 'undefined') {
                return false;
              }
              i = this._storage[fkey].prev;
              delete this._storage[fkey];
              // fall through
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.key = i.value = empty;
                i.prev.next = i.next;
                i.next.prev = i.prev;
                this._size -= 1;
                return true;
              }
            }
            return false;
          },

          clear: function () {
            this._size = 0;
            this._storage = emptyObject();
            var head = this._head, i = head, p = i.next;
            while ((i = p) !== head) {
              i.key = i.value = empty;
              p = i.next;
              i.next = i.prev = head;
            }
            head.next = head.prev = head;
          },

          keys: function () {
            return new MapIterator(this, 'key');
          },

          values: function () {
            return new MapIterator(this, 'value');
          },

          entries: function () {
            return new MapIterator(this, 'key+value');
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var it = this.entries();
            for (var entry = it.next(); !entry.done; entry = it.next()) {
              if (context) {
                callback.call(context, entry.value[1], entry.value[0], this);
              } else {
                callback(entry.value[1], entry.value[0], this);
              }
            }
          }
        });
        addIterator(Map.prototype, function () { return this.entries(); });

        return Map;
      })(),

      Set: (function () {
        // Creating a Map is expensive.  To speed up the common case of
        // Sets containing only string or numeric keys, we use an object
        // as backing storage and lazily create a full Map only when
        // required.
        var SetShim = function Set(iterable) {
          var set = this;
          if (!ES.TypeIsObject(set)) {
            throw new TypeError('Set does not accept arguments when called as a function');
          }
          set = emulateES6construct(set);
          if (!set._es6set) {
            throw new TypeError('bad set');
          }

          defineProperties(set, {
            '[[SetData]]': null,
            _storage: emptyObject()
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = set.add;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              adder.call(set, nextItem);
            }
          }
          return set;
        };
        var Set$prototype = SetShim.prototype;
        defineProperties(SetShim, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Set$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6set: true });
            return obj;
          }
        });

        // Switch from the object backing storage to a full Map.
        var ensureMap = function ensureMap(set) {
          if (!set['[[SetData]]']) {
            var m = set['[[SetData]]'] = new collectionShims.Map();
            Object.keys(set._storage).forEach(function (k) {
              // fast check for leading '$'
              if (k.charCodeAt(0) === 36) {
                k = k.slice(1);
              } else if (k.charAt(0) === 'n') {
                k = +k.slice(1);
              } else {
                k = +k;
              }
              m.set(k, k);
            });
            set._storage = null; // free old backing storage
          }
        };

        Object.defineProperty(SetShim.prototype, 'size', {
          configurable: true,
          enumerable: false,
          get: function () {
            if (typeof this._storage === 'undefined') {
              // https://github.com/paulmillr/es6-shim/issues/176
              throw new TypeError('size method called on incompatible Set');
            }
            ensureMap(this);
            return this['[[SetData]]'].size;
          }
        });

        defineProperties(SetShim.prototype, {
          has: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              return !!this._storage[fkey];
            }
            ensureMap(this);
            return this['[[SetData]]'].has(key);
          },

          add: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              this._storage[fkey] = true;
              return this;
            }
            ensureMap(this);
            this['[[SetData]]'].set(key, key);
            return this;
          },

          'delete': function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              var hasFKey = _hasOwnProperty(this._storage, fkey);
              return (delete this._storage[fkey]) && hasFKey;
            }
            ensureMap(this);
            return this['[[SetData]]']['delete'](key);
          },

          clear: function () {
            if (this._storage) {
              this._storage = emptyObject();
              return;
            }
            return this['[[SetData]]'].clear();
          },

          values: function () {
            ensureMap(this);
            return this['[[SetData]]'].values();
          },

          entries: function () {
            ensureMap(this);
            return this['[[SetData]]'].entries();
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var entireSet = this;
            ensureMap(entireSet);
            this['[[SetData]]'].forEach(function (value, key) {
              if (context) {
                callback.call(context, key, key, entireSet);
              } else {
                callback(key, key, entireSet);
              }
            });
          }
        });
        defineProperty(SetShim, 'keys', SetShim.values, true);
        addIterator(SetShim.prototype, function () { return this.values(); });

        return SetShim;
      })()
    };
    defineProperties(globals, collectionShims);

    if (globals.Map || globals.Set) {
      /*
        - In Firefox < 23, Map#size is a function.
        - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
        - In Firefox 24, Map and Set do not implement forEach
        - In Firefox 25 at least, Map and Set are callable without "new"
      */
      if (
        typeof globals.Map.prototype.clear !== 'function' ||
        new globals.Set().size !== 0 ||
        new globals.Map().size !== 0 ||
        typeof globals.Map.prototype.keys !== 'function' ||
        typeof globals.Set.prototype.keys !== 'function' ||
        typeof globals.Map.prototype.forEach !== 'function' ||
        typeof globals.Set.prototype.forEach !== 'function' ||
        isCallableWithoutNew(globals.Map) ||
        isCallableWithoutNew(globals.Set) ||
        !supportsSubclassing(globals.Map, function (M) {
          var m = new M([]);
          // Firefox 32 is ok with the instantiating the subclass but will
          // throw when the map is used.
          m.set(42, 42);
          return m instanceof M;
        })
      ) {
        globals.Map = collectionShims.Map;
        globals.Set = collectionShims.Set;
      }
    }
    if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
      defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
    }
    // Shim incomplete iterator implementations.
    addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
    addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
  }

  return globals;
}));


}).call(this,require('_process'))
},{"_process":4}],3:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('eventable', function() {
      return (root.Eventable = factory());
    });
  } else if (typeof exports !== 'undefined') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // enviroments that support module.exports, like Node.
    module.exports = factory();
  } else {
    // Browser globals
    root.Eventable = factory();
  }
}(this, function() {

  // Copy and pasted straight out of Backbone 1.0.0
  // We'll try and keep this updated to the latest

  var array = [];
  var slice = array.slice;

  function once(func) {
    var memo, times = 2;

    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  }

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Eventable = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var func = once(function() {
        self.off(name, func);
        callback.apply(this, arguments);
      });
      func._callback = callback;
      return this.on(name, func, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : Object.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  function addListenMethod(method, implementation) {
    Eventable[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = (new Date()).getTime());
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  }

  addListenMethod('listenTo', 'on');
  addListenMethod('listenToOnce', 'once');

  // Aliases for backwards compatibility.
  Eventable.bind   = Eventable.on;
  Eventable.unbind = Eventable.off;

  return Eventable;

}));

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forOwn = require('lodash.forown'),
    isFunction = require('lodash.isfunction');

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    objectClass = '[object Object]',
    stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
 * length of `0` and objects with no own enumerable properties are considered
 * "empty".
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Array|Object|string} value The value to inspect.
 * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({});
 * // => true
 *
 * _.isEmpty('');
 * // => true
 */
function isEmpty(value) {
  var result = true;
  if (!value) {
    return result;
  }
  var className = toString.call(value),
      length = value.length;

  if ((className == arrayClass || className == stringClass || className == argsClass ) ||
      (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
    return !length;
  }
  forOwn(value, function() {
    return (result = false);
  });
  return result;
}

module.exports = isEmpty;

},{"lodash.forown":6,"lodash.isfunction":29}],6:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":7,"lodash._objecttypes":25,"lodash.keys":26}],7:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":8,"lodash.bind":11,"lodash.identity":22,"lodash.support":23}],8:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    noop = require('lodash.noop');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = isNative(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._isnative":9,"lodash.noop":10}],9:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],10:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],11:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":12,"lodash._slice":21}],12:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push,
    unshift = arrayRef.unshift;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    // clone `bindData`
    bindData = slice(bindData);
    if (bindData[2]) {
      bindData[2] = slice(bindData[2]);
    }
    if (bindData[3]) {
      bindData[3] = slice(bindData[3]);
    }
    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":13,"lodash._basecreatewrapper":17,"lodash._slice":21,"lodash.isfunction":29}],13:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      // avoid `arguments` object deoptimizations by using `slice` instead
      // of `Array.prototype.slice.call` and not assigning `arguments` to a
      // variable as a ternary expression
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":14,"lodash._setbinddata":8,"lodash._slice":21,"lodash.isobject":30}],14:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    noop = require('lodash.noop');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":15,"lodash.isobject":30,"lodash.noop":16}],15:[function(require,module,exports){
module.exports=require(9)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],16:[function(require,module,exports){
module.exports=require(10)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":10}],17:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":18,"lodash._setbinddata":8,"lodash._slice":21,"lodash.isobject":30}],18:[function(require,module,exports){
module.exports=require(14)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":14,"lodash._isnative":19,"lodash.isobject":30,"lodash.noop":20}],19:[function(require,module,exports){
module.exports=require(9)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],20:[function(require,module,exports){
module.exports=require(10)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":10}],21:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],22:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],23:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":24}],24:[function(require,module,exports){
module.exports=require(9)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],25:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],26:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._isnative":27,"lodash._shimkeys":28,"lodash.isobject":30}],27:[function(require,module,exports){
module.exports=require(9)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],28:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":25}],29:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],30:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":31}],31:[function(require,module,exports){
module.exports=require(25)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],32:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a string.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
 * @example
 *
 * _.isString('fred');
 * // => true
 */
function isString(value) {
  return typeof value == 'string' ||
    value && typeof value == 'object' && toString.call(value) == stringClass || false;
}

module.exports = isString;

},{}],33:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 */
function isUndefined(value) {
  return typeof value == 'undefined';
}

module.exports = isUndefined;

},{}],34:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isFunction = require('lodash.isfunction');

/**
 * Resolves the value of property `key` on `object`. If `key` is a function
 * it will be invoked with the `this` binding of `object` and its result returned,
 * else the property value is returned. If `object` is falsey then `undefined`
 * is returned.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {Object} object The object to inspect.
 * @param {string} key The name of the property to resolve.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = {
 *   'cheese': 'crumpets',
 *   'stuff': function() {
 *     return 'nonsense';
 *   }
 * };
 *
 * _.result(object, 'cheese');
 * // => 'crumpets'
 *
 * _.result(object, 'stuff');
 * // => 'nonsense'
 */
function result(object, key) {
  if (object) {
    var value = object[key];
    return isFunction(value) ? object[key]() : value;
  }
}

module.exports = result;

},{"lodash.isfunction":29}],35:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var defaults = require('lodash.defaults'),
    escape = require('lodash.escape'),
    escapeStringChar = require('lodash._escapestringchar'),
    keys = require('lodash.keys'),
    reInterpolate = require('lodash._reinterpolate'),
    templateSettings = require('lodash.templatesettings'),
    values = require('lodash.values');

/** Used to match empty string literals in compiled template source */
var reEmptyStringLeading = /\b__p \+= '';/g,
    reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
    reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

/**
 * Used to match ES6 template delimiters
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
 */
var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

/** Used to ensure capturing order of template delimiters */
var reNoMatch = /($^)/;

/** Used to match unescaped characters in compiled string literals */
var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

/**
 * A micro-templating method that handles arbitrary delimiters, preserves
 * whitespace, and correctly escapes quotes within interpolated code.
 *
 * Note: In the development build, `_.template` utilizes sourceURLs for easier
 * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
 *
 * For more information on precompiling templates see:
 * http://lodash.com/custom-builds
 *
 * For more information on Chrome extension sandboxes see:
 * http://developer.chrome.com/stable/extensions/sandboxingEval.html
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} text The template text.
 * @param {Object} data The data object used to populate the text.
 * @param {Object} [options] The options object.
 * @param {RegExp} [options.escape] The "escape" delimiter.
 * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
 * @param {Object} [options.imports] An object to import into the template as local variables.
 * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
 * @param {string} [sourceURL] The sourceURL of the template's compiled source.
 * @param {string} [variable] The data object variable name.
 * @returns {Function|string} Returns a compiled function when no `data` object
 *  is given, else it returns the interpolated text.
 * @example
 *
 * // using the "interpolate" delimiter to create a compiled template
 * var compiled = _.template('hello <%= name %>');
 * compiled({ 'name': 'fred' });
 * // => 'hello fred'
 *
 * // using the "escape" delimiter to escape HTML in data property values
 * _.template('<b><%- value %></b>', { 'value': '<script>' });
 * // => '<b>&lt;script&gt;</b>'
 *
 * // using the "evaluate" delimiter to generate HTML
 * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
 * _.template(list, { 'people': ['fred', 'barney'] });
 * // => '<li>fred</li><li>barney</li>'
 *
 * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
 * _.template('hello ${ name }', { 'name': 'pebbles' });
 * // => 'hello pebbles'
 *
 * // using the internal `print` function in "evaluate" delimiters
 * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
 * // => 'hello barney!'
 *
 * // using a custom template delimiters
 * _.templateSettings = {
 *   'interpolate': /{{([\s\S]+?)}}/g
 * };
 *
 * _.template('hello {{ name }}!', { 'name': 'mustache' });
 * // => 'hello mustache!'
 *
 * // using the `imports` option to import jQuery
 * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
 * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
 * // => '<li>fred</li><li>barney</li>'
 *
 * // using the `sourceURL` option to specify a custom sourceURL for the template
 * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
 * compiled(data);
 * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
 *
 * // using the `variable` option to ensure a with-statement isn't used in the compiled template
 * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
 * compiled.source;
 * // => function(data) {
 *   var __t, __p = '', __e = _.escape;
 *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
 *   return __p;
 * }
 *
 * // using the `source` property to inline compiled templates for meaningful
 * // line numbers in error messages and a stack trace
 * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
 *   var JST = {\
 *     "main": ' + _.template(mainText).source + '\
 *   };\
 * ');
 */
function template(text, data, options) {
  // based on John Resig's `tmpl` implementation
  // http://ejohn.org/blog/javascript-micro-templating/
  // and Laura Doktorova's doT.js
  // https://github.com/olado/doT
  var settings = templateSettings.imports._.templateSettings || templateSettings;
  text = String(text || '');

  // avoid missing dependencies when `iteratorTemplate` is not defined
  options = defaults({}, options, settings);

  var imports = defaults({}, options.imports, settings.imports),
      importsKeys = keys(imports),
      importsValues = values(imports);

  var isEvaluating,
      index = 0,
      interpolate = options.interpolate || reNoMatch,
      source = "__p += '";

  // compile the regexp to match each delimiter
  var reDelimiters = RegExp(
    (options.escape || reNoMatch).source + '|' +
    interpolate.source + '|' +
    (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
    (options.evaluate || reNoMatch).source + '|$'
  , 'g');

  text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
    interpolateValue || (interpolateValue = esTemplateValue);

    // escape characters that cannot be included in string literals
    source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

    // replace delimiters with snippets
    if (escapeValue) {
      source += "' +\n__e(" + escapeValue + ") +\n'";
    }
    if (evaluateValue) {
      isEvaluating = true;
      source += "';\n" + evaluateValue + ";\n__p += '";
    }
    if (interpolateValue) {
      source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
    }
    index = offset + match.length;

    // the JS engine embedded in Adobe products requires returning the `match`
    // string in order to produce the correct `offset` value
    return match;
  });

  source += "';\n";

  // if `variable` is not specified, wrap a with-statement around the generated
  // code to add the data object to the top of the scope chain
  var variable = options.variable,
      hasVariable = variable;

  if (!hasVariable) {
    variable = 'obj';
    source = 'with (' + variable + ') {\n' + source + '\n}\n';
  }
  // cleanup code by stripping empty strings
  source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
    .replace(reEmptyStringMiddle, '$1')
    .replace(reEmptyStringTrailing, '$1;');

  // frame code as the function body
  source = 'function(' + variable + ') {\n' +
    (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
    "var __t, __p = '', __e = _.escape" +
    (isEvaluating
      ? ', __j = Array.prototype.join;\n' +
        "function print() { __p += __j.call(arguments, '') }\n"
      : ';\n'
    ) +
    source +
    'return __p\n}';

  try {
    var result = Function(importsKeys, 'return ' + source ).apply(undefined, importsValues);
  } catch(e) {
    e.source = source;
    throw e;
  }
  if (data) {
    return result(data);
  }
  // provide the compiled function's source by its `toString` method, in
  // supported environments, or the `source` property as a convenience for
  // inlining compiled templates during the build process
  result.source = source;
  return result;
}

module.exports = template;

},{"lodash._escapestringchar":36,"lodash._reinterpolate":37,"lodash.defaults":38,"lodash.escape":40,"lodash.keys":45,"lodash.templatesettings":49,"lodash.values":50}],36:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to escape characters for inclusion in compiled string literals */
var stringEscapes = {
  '\\': '\\',
  "'": "'",
  '\n': 'n',
  '\r': 'r',
  '\t': 't',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

/**
 * Used by `template` to escape characters for inclusion in compiled
 * string literals.
 *
 * @private
 * @param {string} match The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeStringChar(match) {
  return '\\' + stringEscapes[match];
}

module.exports = escapeStringChar;

},{}],37:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to match "interpolate" template delimiters */
var reInterpolate = /<%=([\s\S]+?)%>/g;

module.exports = reInterpolate;

},{}],38:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object for all destination properties that resolve to `undefined`. Once a
 * property is set, additional defaults of the same property will be ignored.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The destination object.
 * @param {...Object} [source] The source objects.
 * @param- {Object} [guard] Allows working with `_.reduce` without using its
 *  `key` and `object` arguments as sources.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * var object = { 'name': 'barney' };
 * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
 * // => { 'name': 'barney', 'employer': 'slate' }
 */
var defaults = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) return result;
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard == 'number' ? 2 : args.length;
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (typeof result[index] == 'undefined') result[index] = iterable[index];
    }
    }
  }
  return result
};

module.exports = defaults;

},{"lodash._objecttypes":39,"lodash.keys":45}],39:[function(require,module,exports){
module.exports=require(25)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],40:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var escapeHtmlChar = require('lodash._escapehtmlchar'),
    keys = require('lodash.keys'),
    reUnescapedHtml = require('lodash._reunescapedhtml');

/**
 * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
 * corresponding HTML entities.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} string The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('Fred, Wilma, & Pebbles');
 * // => 'Fred, Wilma, &amp; Pebbles'
 */
function escape(string) {
  return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
}

module.exports = escape;

},{"lodash._escapehtmlchar":41,"lodash._reunescapedhtml":43,"lodash.keys":45}],41:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var htmlEscapes = require('lodash._htmlescapes');

/**
 * Used by `escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} match The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeHtmlChar(match) {
  return htmlEscapes[match];
}

module.exports = escapeHtmlChar;

},{"lodash._htmlescapes":42}],42:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Used to convert characters to HTML entities:
 *
 * Though the `>` character is escaped for symmetry, characters like `>` and `/`
 * don't require escaping in HTML and have no special meaning unless they're part
 * of a tag or an unquoted attribute value.
 * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
 */
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

module.exports = htmlEscapes;

},{}],43:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var htmlEscapes = require('lodash._htmlescapes'),
    keys = require('lodash.keys');

/** Used to match HTML entities and HTML characters */
var reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

module.exports = reUnescapedHtml;

},{"lodash._htmlescapes":44,"lodash.keys":45}],44:[function(require,module,exports){
module.exports=require(42)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.template/node_modules/lodash.escape/node_modules/lodash._escapehtmlchar/node_modules/lodash._htmlescapes/index.js":42}],45:[function(require,module,exports){
module.exports=require(26)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/index.js":26,"lodash._isnative":46,"lodash._shimkeys":47,"lodash.isobject":30}],46:[function(require,module,exports){
module.exports=require(9)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],47:[function(require,module,exports){
module.exports=require(28)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":28,"lodash._objecttypes":48}],48:[function(require,module,exports){
module.exports=require(25)
},{"/Users/andrewwalker/sites/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],49:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var escape = require('lodash.escape'),
    reInterpolate = require('lodash._reinterpolate');

/**
 * By default, the template delimiters used by Lo-Dash are similar to those in
 * embedded Ruby (ERB). Change the following template settings to use alternative
 * delimiters.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var templateSettings = {

  /**
   * Used to detect `data` property values to be HTML-escaped.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'escape': /<%-([\s\S]+?)%>/g,

  /**
   * Used to detect code to be evaluated.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'evaluate': /<%([\s\S]+?)%>/g,

  /**
   * Used to detect `data` property values to inject.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'interpolate': reInterpolate,

  /**
   * Used to reference the data object in the template text.
   *
   * @memberOf _.templateSettings
   * @type string
   */
  'variable': '',

  /**
   * Used to import variables into the compiled template.
   *
   * @memberOf _.templateSettings
   * @type Object
   */
  'imports': {

    /**
     * A reference to the `lodash` function.
     *
     * @memberOf _.templateSettings.imports
     * @type Function
     */
    '_': { 'escape': escape }
  }
};

module.exports = templateSettings;

},{"lodash._reinterpolate":37,"lodash.escape":40}],50:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Creates an array composed of the own enumerable property values of `object`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property values.
 * @example
 *
 * _.values({ 'one': 1, 'two': 2, 'three': 3 });
 * // => [1, 2, 3] (property order is not guaranteed across environments)
 */
function values(object) {
  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = values;

},{"lodash.keys":45}],51:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to generate unique IDs */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} [prefix] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return String(prefix == null ? '' : prefix) + id;
}

module.exports = uniqueId;

},{}],52:[function(require,module,exports){
var baseFlatten = require('../internals/baseFlatten'), map = require('../collections/map');
function flatten(array, isShallow, callback, thisArg) {
    if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array ? null : isShallow;
        isShallow = false;
    }
    if (callback != null) {
        array = map(array, callback, thisArg);
    }
    return baseFlatten(array, isShallow);
}
module.exports = flatten;
},{"../collections/map":56,"../internals/baseFlatten":65}],53:[function(require,module,exports){
var createCallback = require('../functions/createCallback'), slice = require('../internals/slice');
var undefined;
var nativeMax = Math.max;
function last(array, callback, thisArg) {
    var n = 0, length = array ? array.length : 0;
    if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
            n++;
        }
    } else {
        n = callback;
        if (n == null || thisArg) {
            return array ? array[length - 1] : undefined;
        }
    }
    return slice(array, nativeMax(0, length - n));
}
module.exports = last;
},{"../functions/createCallback":59,"../internals/slice":79}],54:[function(require,module,exports){
var arrayRef = [];
var splice = arrayRef.splice;
function pull(array) {
    var args = arguments, argsIndex = 0, argsLength = args.length, length = array ? array.length : 0;
    while (++argsIndex < argsLength) {
        var index = -1, value = args[argsIndex];
        while (++index < length) {
            if (array[index] === value) {
                splice.call(array, index--, 1);
                length--;
            }
        }
    }
    return array;
}
module.exports = pull;
},{}],55:[function(require,module,exports){
var baseIndexOf = require('../internals/baseIndexOf'), forOwn = require('../objects/forOwn'), isArray = require('../objects/isArray'), isString = require('../objects/isString');
var nativeMax = Math.max;
function contains(collection, target, fromIndex) {
    var index = -1, indexOf = baseIndexOf, length = collection ? collection.length : 0, result = false;
    fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
    if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
    } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
    } else {
        forOwn(collection, function (value) {
            if (++index >= fromIndex) {
                return !(result = value === target);
            }
        });
    }
    return result;
}
module.exports = contains;
},{"../internals/baseIndexOf":66,"../objects/forOwn":83,"../objects/isArray":85,"../objects/isString":88}],56:[function(require,module,exports){
var createCallback = require('../functions/createCallback'), forOwn = require('../objects/forOwn');
function map(collection, callback, thisArg) {
    var index = -1, length = collection ? collection.length : 0;
    callback = createCallback(callback, thisArg, 3);
    if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
            result[index] = callback(collection[index], index, collection);
        }
    } else {
        result = [];
        forOwn(collection, function (value, key, collection) {
            result[++index] = callback(value, key, collection);
        });
    }
    return result;
}
module.exports = map;
},{"../functions/createCallback":59,"../objects/forOwn":83}],57:[function(require,module,exports){
var isString = require('../objects/isString'), slice = require('../internals/slice'), values = require('../objects/values');
function toArray(collection) {
    if (collection && typeof collection.length == 'number') {
        return slice(collection);
    }
    return values(collection);
}
module.exports = toArray;
},{"../internals/slice":79,"../objects/isString":88,"../objects/values":90}],58:[function(require,module,exports){
var createWrapper = require('../internals/createWrapper'), slice = require('../internals/slice');
function bind(func, thisArg) {
    return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
}
module.exports = bind;
},{"../internals/createWrapper":68,"../internals/slice":79}],59:[function(require,module,exports){
var baseCreateCallback = require('../internals/baseCreateCallback'), baseIsEqual = require('../internals/baseIsEqual'), isObject = require('../objects/isObject'), keys = require('../objects/keys'), property = require('../utilities/property');
function createCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
    }
    if (type != 'object') {
        return property(func);
    }
    var props = keys(func), key = props[0], a = func[key];
    if (props.length == 1 && a === a && !isObject(a)) {
        return function (object) {
            var b = object[key];
            return a === b && (a !== 0 || 1 / a == 1 / b);
        };
    }
    return function (object) {
        var length = props.length, result = false;
        while (length--) {
            if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
                break;
            }
        }
        return result;
    };
}
module.exports = createCallback;
},{"../internals/baseCreateCallback":63,"../internals/baseIsEqual":67,"../objects/isObject":87,"../objects/keys":89,"../utilities/property":95}],60:[function(require,module,exports){
var arrayPool = [];
module.exports = arrayPool;
},{}],61:[function(require,module,exports){
var baseCreate = require('./baseCreate'), isObject = require('../objects/isObject'), setBindData = require('./setBindData'), slice = require('./slice');
var arrayRef = [];
var push = arrayRef.push;
function baseBind(bindData) {
    var func = bindData[0], partialArgs = bindData[2], thisArg = bindData[4];
    function bound() {
        if (partialArgs) {
            var args = slice(partialArgs);
            push.apply(args, arguments);
        }
        if (this instanceof bound) {
            var thisBinding = baseCreate(func.prototype), result = func.apply(thisBinding, args || arguments);
            return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
}
module.exports = baseBind;
},{"../objects/isObject":87,"./baseCreate":62,"./setBindData":77,"./slice":79}],62:[function(require,module,exports){
var isNative = require('./isNative'), isObject = require('../objects/isObject'), noop = require('../utilities/noop');
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;
function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
}
if (!nativeCreate) {
    baseCreate = function () {
        function Object() {
        }
        return function (prototype) {
            if (isObject(prototype)) {
                Object.prototype = prototype;
                var result = new Object();
                Object.prototype = null;
            }
            return result || window.Object();
        };
    }();
}
module.exports = baseCreate;
},{"../objects/isObject":87,"../utilities/noop":94,"./isNative":72}],63:[function(require,module,exports){
var bind = require('../functions/bind'), identity = require('../utilities/identity'), setBindData = require('./setBindData'), support = require('../support');
var reFuncName = /^\s*function[ \n\r\t]+\w/;
var reThis = /\bthis\b/;
var fnToString = Function.prototype.toString;
function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
        return identity;
    }
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
        if (support.funcNames) {
            bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
            var source = fnToString.call(func);
            if (!support.funcNames) {
                bindData = !reFuncName.test(source);
            }
            if (!bindData) {
                bindData = reThis.test(source);
                setBindData(func, bindData);
            }
        }
    }
    if (bindData === false || bindData !== true && bindData[1] & 1) {
        return func;
    }
    switch (argCount) {
    case 1:
        return function (value) {
            return func.call(thisArg, value);
        };
    case 2:
        return function (a, b) {
            return func.call(thisArg, a, b);
        };
    case 3:
        return function (value, index, collection) {
            return func.call(thisArg, value, index, collection);
        };
    case 4:
        return function (accumulator, value, index, collection) {
            return func.call(thisArg, accumulator, value, index, collection);
        };
    }
    return bind(func, thisArg);
}
module.exports = baseCreateCallback;
},{"../functions/bind":58,"../support":91,"../utilities/identity":93,"./setBindData":77}],64:[function(require,module,exports){
var baseCreate = require('./baseCreate'), isObject = require('../objects/isObject'), setBindData = require('./setBindData'), slice = require('./slice');
var arrayRef = [];
var push = arrayRef.push;
function baseCreateWrapper(bindData) {
    var func = bindData[0], bitmask = bindData[1], partialArgs = bindData[2], partialRightArgs = bindData[3], thisArg = bindData[4], arity = bindData[5];
    var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, key = func;
    function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
            var args = slice(partialArgs);
            push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
            args || (args = slice(arguments));
            if (partialRightArgs) {
                push.apply(args, partialRightArgs);
            }
            if (isCurry && args.length < arity) {
                bitmask |= 16 & ~32;
                return baseCreateWrapper([
                    func,
                    isCurryBound ? bitmask : bitmask & ~3,
                    args,
                    null,
                    thisArg,
                    arity
                ]);
            }
        }
        args || (args = arguments);
        if (isBindKey) {
            func = thisBinding[key];
        }
        if (this instanceof bound) {
            thisBinding = baseCreate(func.prototype);
            var result = func.apply(thisBinding, args);
            return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
}
module.exports = baseCreateWrapper;
},{"../objects/isObject":87,"./baseCreate":62,"./setBindData":77,"./slice":79}],65:[function(require,module,exports){
var isArguments = require('../objects/isArguments'), isArray = require('../objects/isArray');
function baseFlatten(array, isShallow, isStrict, fromIndex) {
    var index = (fromIndex || 0) - 1, length = array ? array.length : 0, result = [];
    while (++index < length) {
        var value = array[index];
        if (value && typeof value == 'object' && typeof value.length == 'number' && (isArray(value) || isArguments(value))) {
            if (!isShallow) {
                value = baseFlatten(value, isShallow, isStrict);
            }
            var valIndex = -1, valLength = value.length, resIndex = result.length;
            result.length += valLength;
            while (++valIndex < valLength) {
                result[resIndex++] = value[valIndex];
            }
        } else if (!isStrict) {
            result.push(value);
        }
    }
    return result;
}
module.exports = baseFlatten;
},{"../objects/isArguments":84,"../objects/isArray":85}],66:[function(require,module,exports){
function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1, length = array ? array.length : 0;
    while (++index < length) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}
module.exports = baseIndexOf;
},{}],67:[function(require,module,exports){
var forIn = require('../objects/forIn'), getArray = require('./getArray'), isFunction = require('../objects/isFunction'), objectTypes = require('./objectTypes'), releaseArray = require('./releaseArray');
var argsClass = '[object Arguments]', arrayClass = '[object Array]', boolClass = '[object Boolean]', dateClass = '[object Date]', numberClass = '[object Number]', objectClass = '[object Object]', regexpClass = '[object RegExp]', stringClass = '[object String]';
var objectProto = Object.prototype;
var toString = objectProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
    if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
            return !!result;
        }
    }
    if (a === b) {
        return a !== 0 || 1 / a == 1 / b;
    }
    var type = typeof a, otherType = typeof b;
    if (a === a && !(a && objectTypes[type]) && !(b && objectTypes[otherType])) {
        return false;
    }
    if (a == null || b == null) {
        return a === b;
    }
    var className = toString.call(a), otherClass = toString.call(b);
    if (className == argsClass) {
        className = objectClass;
    }
    if (otherClass == argsClass) {
        otherClass = objectClass;
    }
    if (className != otherClass) {
        return false;
    }
    switch (className) {
    case boolClass:
    case dateClass:
        return +a == +b;
    case numberClass:
        return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
    case regexpClass:
    case stringClass:
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'), bWrapped = hasOwnProperty.call(b, '__wrapped__');
        if (aWrapped || bWrapped) {
            return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        if (className != objectClass) {
            return false;
        }
        var ctorA = a.constructor, ctorB = b.constructor;
        if (ctorA != ctorB && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
    }
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());
    var length = stackA.length;
    while (length--) {
        if (stackA[length] == a) {
            return stackB[length] == b;
        }
    }
    var size = 0;
    result = true;
    stackA.push(a);
    stackB.push(b);
    if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result || isWhere) {
            while (size--) {
                var index = length, value = b[size];
                if (isWhere) {
                    while (index--) {
                        if (result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB)) {
                            break;
                        }
                    }
                } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
                    break;
                }
            }
        }
    } else {
        forIn(b, function (value, key, b) {
            if (hasOwnProperty.call(b, key)) {
                size++;
                return result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB);
            }
        });
        if (result && !isWhere) {
            forIn(a, function (value, key, a) {
                if (hasOwnProperty.call(a, key)) {
                    return result = --size > -1;
                }
            });
        }
    }
    stackA.pop();
    stackB.pop();
    if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
    }
    return result;
}
module.exports = baseIsEqual;
},{"../objects/forIn":82,"../objects/isFunction":86,"./getArray":70,"./objectTypes":74,"./releaseArray":76}],68:[function(require,module,exports){
var baseBind = require('./baseBind'), baseCreateWrapper = require('./baseCreateWrapper'), isFunction = require('../objects/isFunction'), slice = require('./slice');
var arrayRef = [];
var push = arrayRef.push, unshift = arrayRef.unshift;
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, isPartial = bitmask & 16, isPartialRight = bitmask & 32;
    if (!isBindKey && !isFunction(func)) {
        throw new TypeError();
    }
    if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
        bindData = slice(bindData);
        if (bindData[2]) {
            bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
            bindData[3] = slice(bindData[3]);
        }
        if (isBind && !(bindData[1] & 1)) {
            bindData[4] = thisArg;
        }
        if (!isBind && bindData[1] & 1) {
            bitmask |= 8;
        }
        if (isCurry && !(bindData[1] & 4)) {
            bindData[5] = arity;
        }
        if (isPartial) {
            push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        if (isPartialRight) {
            unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
    }
    var creater = bitmask == 1 || bitmask === 17 ? baseBind : baseCreateWrapper;
    return creater([
        func,
        bitmask,
        partialArgs,
        partialRightArgs,
        thisArg,
        arity
    ]);
}
module.exports = createWrapper;
},{"../objects/isFunction":86,"./baseBind":61,"./baseCreateWrapper":64,"./slice":79}],69:[function(require,module,exports){
var htmlEscapes = require('./htmlEscapes');
function escapeHtmlChar(match) {
    return htmlEscapes[match];
}
module.exports = escapeHtmlChar;
},{"./htmlEscapes":71}],70:[function(require,module,exports){
var arrayPool = require('./arrayPool');
function getArray() {
    return arrayPool.pop() || [];
}
module.exports = getArray;
},{"./arrayPool":60}],71:[function(require,module,exports){
var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    };
module.exports = htmlEscapes;
},{}],72:[function(require,module,exports){
var objectProto = Object.prototype;
var toString = objectProto.toString;
var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
}
module.exports = isNative;
},{}],73:[function(require,module,exports){
var maxPoolSize = 40;
module.exports = maxPoolSize;
},{}],74:[function(require,module,exports){
var objectTypes = {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    };
module.exports = objectTypes;
},{}],75:[function(require,module,exports){
var htmlEscapes = require('./htmlEscapes'), keys = require('../objects/keys');
var reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');
module.exports = reUnescapedHtml;
},{"../objects/keys":89,"./htmlEscapes":71}],76:[function(require,module,exports){
var arrayPool = require('./arrayPool'), maxPoolSize = require('./maxPoolSize');
function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
        arrayPool.push(array);
    }
}
module.exports = releaseArray;
},{"./arrayPool":60,"./maxPoolSize":73}],77:[function(require,module,exports){
var isNative = require('./isNative'), noop = require('../utilities/noop');
var descriptor = {
        'configurable': false,
        'enumerable': false,
        'value': null,
        'writable': false
    };
var defineProperty = function () {
        try {
            var o = {}, func = isNative(func = Object.defineProperty) && func, result = func(o, o, o) && func;
        } catch (e) {
        }
        return result;
    }();
var setBindData = !defineProperty ? noop : function (func, value) {
        descriptor.value = value;
        defineProperty(func, '__bindData__', descriptor);
    };
module.exports = setBindData;
},{"../utilities/noop":94,"./isNative":72}],78:[function(require,module,exports){
var objectTypes = require('./objectTypes');
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var shimKeys = function (object) {
    var index, iterable = object, result = [];
    if (!iterable)
        return result;
    if (!objectTypes[typeof object])
        return result;
    for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
        }
    }
    return result;
};
module.exports = shimKeys;
},{"./objectTypes":74}],79:[function(require,module,exports){
function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
        end = array ? array.length : 0;
    }
    var index = -1, length = end - start || 0, result = Array(length < 0 ? 0 : length);
    while (++index < length) {
        result[index] = array[start + index];
    }
    return result;
}
module.exports = slice;
},{}],80:[function(require,module,exports){
var baseCreateCallback = require('../internals/baseCreateCallback'), keys = require('./keys'), objectTypes = require('../internals/objectTypes');
var assign = function (object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable)
        return result;
    var args = arguments, argsIndex = 0, argsLength = typeof guard == 'number' ? 2 : args.length;
    if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
    } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
    }
    while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
            var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
            while (++ownIndex < length) {
                index = ownProps[ownIndex];
                result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
            }
        }
    }
    return result;
};
module.exports = assign;
},{"../internals/baseCreateCallback":63,"../internals/objectTypes":74,"./keys":89}],81:[function(require,module,exports){
var keys = require('./keys'), objectTypes = require('../internals/objectTypes');
var defaults = function (object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable)
        return result;
    var args = arguments, argsIndex = 0, argsLength = typeof guard == 'number' ? 2 : args.length;
    while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
            var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
            while (++ownIndex < length) {
                index = ownProps[ownIndex];
                if (typeof result[index] == 'undefined')
                    result[index] = iterable[index];
            }
        }
    }
    return result;
};
module.exports = defaults;
},{"../internals/objectTypes":74,"./keys":89}],82:[function(require,module,exports){
var baseCreateCallback = require('../internals/baseCreateCallback'), objectTypes = require('../internals/objectTypes');
var forIn = function (collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable)
        return result;
    if (!objectTypes[typeof iterable])
        return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    for (index in iterable) {
        if (callback(iterable[index], index, collection) === false)
            return result;
    }
    return result;
};
module.exports = forIn;
},{"../internals/baseCreateCallback":63,"../internals/objectTypes":74}],83:[function(require,module,exports){
var baseCreateCallback = require('../internals/baseCreateCallback'), keys = require('./keys'), objectTypes = require('../internals/objectTypes');
var forOwn = function (collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable)
        return result;
    if (!objectTypes[typeof iterable])
        return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1, ownProps = objectTypes[typeof iterable] && keys(iterable), length = ownProps ? ownProps.length : 0;
    while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false)
            return result;
    }
    return result;
};
module.exports = forOwn;
},{"../internals/baseCreateCallback":63,"../internals/objectTypes":74,"./keys":89}],84:[function(require,module,exports){
var argsClass = '[object Arguments]';
var objectProto = Object.prototype;
var toString = objectProto.toString;
function isArguments(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' && toString.call(value) == argsClass || false;
}
module.exports = isArguments;
},{}],85:[function(require,module,exports){
var isNative = require('../internals/isNative');
var arrayClass = '[object Array]';
var objectProto = Object.prototype;
var toString = objectProto.toString;
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;
var isArray = nativeIsArray || function (value) {
        return value && typeof value == 'object' && typeof value.length == 'number' && toString.call(value) == arrayClass || false;
    };
module.exports = isArray;
},{"../internals/isNative":72}],86:[function(require,module,exports){
function isFunction(value) {
    return typeof value == 'function';
}
module.exports = isFunction;
},{}],87:[function(require,module,exports){
var objectTypes = require('../internals/objectTypes');
function isObject(value) {
    return !!(value && objectTypes[typeof value]);
}
module.exports = isObject;
},{"../internals/objectTypes":74}],88:[function(require,module,exports){
var stringClass = '[object String]';
var objectProto = Object.prototype;
var toString = objectProto.toString;
function isString(value) {
    return typeof value == 'string' || value && typeof value == 'object' && toString.call(value) == stringClass || false;
}
module.exports = isString;
},{}],89:[function(require,module,exports){
var isNative = require('../internals/isNative'), isObject = require('./isObject'), shimKeys = require('../internals/shimKeys');
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;
var keys = !nativeKeys ? shimKeys : function (object) {
        if (!isObject(object)) {
            return [];
        }
        return nativeKeys(object);
    };
module.exports = keys;
},{"../internals/isNative":72,"../internals/shimKeys":78,"./isObject":87}],90:[function(require,module,exports){
var keys = require('./keys');
function values(object) {
    var index = -1, props = keys(object), length = props.length, result = Array(length);
    while (++index < length) {
        result[index] = object[props[index]];
    }
    return result;
}
module.exports = values;
},{"./keys":89}],91:[function(require,module,exports){
var isNative = require('./internals/isNative');
var reThis = /\bthis\b/;
var support = {};
support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function () {
    return this;
});
support.funcNames = typeof Function.name == 'string';
module.exports = support;
},{"./internals/isNative":72}],92:[function(require,module,exports){
var escapeHtmlChar = require('../internals/escapeHtmlChar'), keys = require('../objects/keys'), reUnescapedHtml = require('../internals/reUnescapedHtml');
function escape(string) {
    return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
}
module.exports = escape;
},{"../internals/escapeHtmlChar":69,"../internals/reUnescapedHtml":75,"../objects/keys":89}],93:[function(require,module,exports){
function identity(value) {
    return value;
}
module.exports = identity;
},{}],94:[function(require,module,exports){
function noop() {
}
module.exports = noop;
},{}],95:[function(require,module,exports){
function property(key) {
    return function (object) {
        return object[key];
    };
}
module.exports = property;
},{}],96:[function(require,module,exports){
var buildCommandPatch = require('./api/command-patch'), buildCommand = require('./api/command'), Node = require('./api/node'), buildSelection = require('./api/selection'), buildSimpleCommand = require('./api/simple-command');
'use strict';
module.exports = function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
};
},{"./api/command":98,"./api/command-patch":97,"./api/node":99,"./api/selection":100,"./api/simple-command":101}],97:[function(require,module,exports){
'use strict';
module.exports = function (scribe) {
    function CommandPatch(commandName) {
        this.commandName = commandName;
    }
    CommandPatch.prototype.execute = function (value) {
        scribe.transactionManager.run(function () {
            document.execCommand(this.commandName, false, value || null);
        }.bind(this));
    };
    CommandPatch.prototype.queryState = function () {
        return document.queryCommandState(this.commandName);
    };
    CommandPatch.prototype.queryEnabled = function () {
        return document.queryCommandEnabled(this.commandName);
    };
    return CommandPatch;
};
},{}],98:[function(require,module,exports){
'use strict';
module.exports = function (scribe) {
    function Command(commandName) {
        this.commandName = commandName;
        this.patch = scribe.commandPatches[this.commandName];
    }
    Command.prototype.execute = function (value) {
        if (this.patch) {
            this.patch.execute(value);
        } else {
            scribe.transactionManager.run(function () {
                document.execCommand(this.commandName, false, value || null);
            }.bind(this));
        }
    };
    Command.prototype.queryState = function () {
        if (this.patch) {
            return this.patch.queryState();
        } else {
            return document.queryCommandState(this.commandName);
        }
    };
    Command.prototype.queryEnabled = function () {
        if (this.patch) {
            return this.patch.queryEnabled();
        } else {
            return document.queryCommandEnabled(this.commandName);
        }
    };
    return Command;
};
},{}],99:[function(require,module,exports){
'use strict';
function Node(node) {
    this.node = node;
}
Node.prototype.getAncestor = function (nodeFilter) {
    var isTopContainerElement = function (element) {
        return element && element.attributes && element.attributes.getNamedItem('contenteditable');
    };
    if (isTopContainerElement(this.node)) {
        return;
    }
    var currentNode = this.node.parentNode;
    while (currentNode && !isTopContainerElement(currentNode)) {
        if (nodeFilter(currentNode)) {
            return currentNode;
        }
        currentNode = currentNode.parentNode;
    }
};
Node.prototype.nextAll = function () {
    var all = [];
    var el = this.node.nextSibling;
    while (el) {
        all.push(el);
        el = el.nextSibling;
    }
    return all;
};
module.exports = Node;
},{}],100:[function(require,module,exports){
var elementHelper = require('../element');
'use strict';
module.exports = function (scribe) {
    function Selection() {
        this.selection = window.getSelection();
        if (this.selection.rangeCount) {
            this.range = this.selection.getRangeAt(0);
        }
    }
    Selection.prototype.getContaining = function (nodeFilter) {
        var range = this.range;
        if (!range) {
            return;
        }
        var node = new scribe.api.Node(this.range.commonAncestorContainer);
        var isTopContainerElement = node.node && node.node.attributes && node.node.attributes.getNamedItem('contenteditable');
        return !isTopContainerElement && nodeFilter(node.node) ? node.node : node.getAncestor(nodeFilter);
    };
    Selection.prototype.placeMarkers = function () {
        var range = this.range;
        if (!range) {
            return;
        }
        var startMarker = document.createElement('em');
        startMarker.classList.add('scribe-marker');
        var endMarker = document.createElement('em');
        endMarker.classList.add('scribe-marker');
        var rangeEnd = this.range.cloneRange();
        rangeEnd.collapse(false);
        rangeEnd.insertNode(endMarker);
        if (endMarker.nextSibling && endMarker.nextSibling.nodeType === Node.TEXT_NODE && endMarker.nextSibling.data === '') {
            endMarker.parentNode.removeChild(endMarker.nextSibling);
        }
        if (endMarker.previousSibling && endMarker.previousSibling.nodeType === Node.TEXT_NODE && endMarker.previousSibling.data === '') {
            endMarker.parentNode.removeChild(endMarker.previousSibling);
        }
        if (!this.selection.isCollapsed) {
            var rangeStart = this.range.cloneRange();
            rangeStart.collapse(true);
            rangeStart.insertNode(startMarker);
            if (startMarker.nextSibling && startMarker.nextSibling.nodeType === Node.TEXT_NODE && startMarker.nextSibling.data === '') {
                startMarker.parentNode.removeChild(startMarker.nextSibling);
            }
            if (startMarker.previousSibling && startMarker.previousSibling.nodeType === Node.TEXT_NODE && startMarker.previousSibling.data === '') {
                startMarker.parentNode.removeChild(startMarker.previousSibling);
            }
        }
        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
    };
    Selection.prototype.getMarkers = function () {
        return scribe.el.querySelectorAll('em.scribe-marker');
    };
    Selection.prototype.removeMarkers = function () {
        var markers = this.getMarkers();
        Array.prototype.forEach.call(markers, function (marker) {
            marker.parentNode.removeChild(marker);
        });
    };
    Selection.prototype.selectMarkers = function (keepMarkers) {
        var markers = this.getMarkers();
        if (!markers.length) {
            return;
        }
        var newRange = document.createRange();
        newRange.setStartBefore(markers[0]);
        if (markers.length >= 2) {
            newRange.setEndAfter(markers[1]);
        } else {
            newRange.setEndAfter(markers[0]);
        }
        if (!keepMarkers) {
            this.removeMarkers();
        }
        this.selection.removeAllRanges();
        this.selection.addRange(newRange);
    };
    Selection.prototype.isCaretOnNewLine = function () {
        function isEmptyInlineElement(node) {
            var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
            var currentNode = treeWalker.root;
            while (currentNode) {
                var numberOfChildren = currentNode.childNodes.length;
                if (numberOfChildren > 1 || numberOfChildren === 1 && currentNode.textContent.trim() !== '')
                    return false;
                if (numberOfChildren === 0) {
                    return currentNode.textContent.trim() === '';
                }
                currentNode = treeWalker.nextNode();
            }
            ;
        }
        ;
        var containerPElement = this.getContaining(function (node) {
                return node.nodeName === 'P';
            });
        if (containerPElement) {
            return isEmptyInlineElement(containerPElement);
        } else {
            return false;
        }
    };
    return Selection;
};
},{"../element":103}],101:[function(require,module,exports){
'use strict';
module.exports = function (api, scribe) {
    function SimpleCommand(commandName, nodeName) {
        scribe.api.Command.call(this, commandName);
        this.nodeName = nodeName;
    }
    SimpleCommand.prototype = Object.create(api.Command.prototype);
    SimpleCommand.prototype.constructor = SimpleCommand;
    SimpleCommand.prototype.queryState = function () {
        var selection = new scribe.api.Selection();
        return scribe.api.Command.prototype.queryState.call(this) && !!selection.getContaining(function (node) {
            return node.nodeName === this.nodeName;
        }.bind(this));
    };
    return SimpleCommand;
};
},{}],102:[function(require,module,exports){
var flatten = require('lodash-amd/modern/arrays/flatten'), toArray = require('lodash-amd/modern/collections/toArray'), elementHelpers = require('./element'), nodeHelpers = require('./node');
function observeDomChanges(el, callback) {
    function includeRealMutations(mutations) {
        var allChangedNodes = flatten(mutations.map(function (mutation) {
                var added = toArray(mutation.addedNodes);
                var removed = toArray(mutation.removedNodes);
                return added.concat(removed);
            }));
        var realChangedNodes = allChangedNodes.filter(function (n) {
                return !nodeHelpers.isEmptyTextNode(n);
            }).filter(function (n) {
                return !elementHelpers.isSelectionMarkerNode(n);
            });
        return realChangedNodes.length > 0;
    }
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var runningPostMutation = false;
    var observer = new MutationObserver(function (mutations) {
            if (!runningPostMutation && includeRealMutations(mutations)) {
                runningPostMutation = true;
                try {
                    callback();
                } catch (e) {
                    throw e;
                } finally {
                    setTimeout(function () {
                        runningPostMutation = false;
                    }, 0);
                }
            }
        });
    observer.observe(el, {
        attributes: true,
        childList: true,
        subtree: true
    });
    return observer;
}
module.exports = observeDomChanges;
},{"./element":103,"./node":105,"lodash-amd/modern/arrays/flatten":52,"lodash-amd/modern/collections/toArray":57}],103:[function(require,module,exports){
var contains = require('lodash-amd/modern/collections/contains');
'use strict';
var blockElementNames = [
        'P',
        'LI',
        'DIV',
        'BLOCKQUOTE',
        'UL',
        'OL',
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'TABLE',
        'TH',
        'TD'
    ];
function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
}
function isSelectionMarkerNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker';
}
function isCaretPositionNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.className === 'caret-position';
}
function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
        node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
}
module.exports = {
    isBlockElement: isBlockElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    isCaretPositionNode: isCaretPositionNode,
    unwrap: unwrap
};
},{"lodash-amd/modern/collections/contains":55}],104:[function(require,module,exports){
var pull = require('lodash-amd/modern/arrays/pull');
'use strict';
function EventEmitter() {
    this._listeners = {};
}
EventEmitter.prototype.on = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];
    listeners.push(fn);
    this._listeners[eventName] = listeners;
};
EventEmitter.prototype.off = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];
    if (fn) {
        pull(listeners, fn);
    } else {
        delete this._listeners[eventName];
    }
};
EventEmitter.prototype.trigger = function (eventName, args) {
    var listeners = this._listeners[eventName] || [];
    listeners.forEach(function (listener) {
        listener.apply(null, args);
    });
};
module.exports = EventEmitter;
},{"lodash-amd/modern/arrays/pull":54}],105:[function(require,module,exports){
'use strict';
function isEmptyTextNode(node) {
    return node.nodeType === Node.TEXT_NODE && node.textContent === '';
}
function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function removeNode(node) {
    return node.parentNode.removeChild(node);
}
module.exports = {
    isEmptyTextNode: isEmptyTextNode,
    insertAfter: insertAfter,
    removeNode: removeNode
};
},{}],106:[function(require,module,exports){
var indent = require('./commands/indent'), insertList = require('./commands/insert-list'), outdent = require('./commands/outdent'), redo = require('./commands/redo'), subscript = require('./commands/subscript'), superscript = require('./commands/superscript'), undo = require('./commands/undo');
'use strict';
module.exports = {
    indent: indent,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    subscript: subscript,
    superscript: superscript,
    undo: undo
};
},{"./commands/indent":107,"./commands/insert-list":108,"./commands/outdent":109,"./commands/redo":110,"./commands/subscript":111,"./commands/superscript":112,"./commands/undo":113}],107:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var indentCommand = new scribe.api.Command('indent');
        indentCommand.queryEnabled = function () {
            var selection = new scribe.api.Selection();
            var listElement = selection.getContaining(function (element) {
                    return element.nodeName === 'UL' || element.nodeName === 'OL';
                });
            return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && !listElement;
        };
        scribe.commands.indent = indentCommand;
    };
};
},{}],108:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var InsertListCommand = function (commandName) {
            scribe.api.Command.call(this, commandName);
        };
        InsertListCommand.prototype = Object.create(scribe.api.Command.prototype);
        InsertListCommand.prototype.constructor = InsertListCommand;
        InsertListCommand.prototype.execute = function (value) {
            function splitList(listItemElements) {
                if (listItemElements.length > 0) {
                    var newListNode = document.createElement(listNode.nodeName);
                    listItemElements.forEach(function (listItemElement) {
                        newListNode.appendChild(listItemElement);
                    });
                    listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
                }
            }
            if (this.queryState()) {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var listNode = selection.getContaining(function (node) {
                        return node.nodeName === 'OL' || node.nodeName === 'UL';
                    });
                var listItemElement = selection.getContaining(function (node) {
                        return node.nodeName === 'LI';
                    });
                scribe.transactionManager.run(function () {
                    if (listItemElement) {
                        var nextListItemElements = new scribe.api.Node(listItemElement).nextAll();
                        splitList(nextListItemElements);
                        selection.placeMarkers();
                        var pNode = document.createElement('p');
                        pNode.innerHTML = listItemElement.innerHTML;
                        listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
                        listItemElement.parentNode.removeChild(listItemElement);
                    } else {
                        var selectedListItemElements = Array.prototype.map.call(listNode.querySelectorAll('li'), function (listItemElement) {
                                return range.intersectsNode(listItemElement) && listItemElement;
                            }).filter(function (listItemElement) {
                                return listItemElement;
                            });
                        var lastSelectedListItemElement = selectedListItemElements.slice(-1)[0];
                        var listItemElementsAfterSelection = new scribe.api.Node(lastSelectedListItemElement).nextAll();
                        splitList(listItemElementsAfterSelection);
                        selection.placeMarkers();
                        var documentFragment = document.createDocumentFragment();
                        selectedListItemElements.forEach(function (listItemElement) {
                            var pElement = document.createElement('p');
                            pElement.innerHTML = listItemElement.innerHTML;
                            documentFragment.appendChild(pElement);
                        });
                        listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);
                        selectedListItemElements.forEach(function (listItemElement) {
                            listItemElement.parentNode.removeChild(listItemElement);
                        });
                    }
                    if (listNode.childNodes.length === 0) {
                        listNode.parentNode.removeChild(listNode);
                    }
                    selection.selectMarkers();
                }.bind(this));
            } else {
                scribe.api.Command.prototype.execute.call(this, value);
            }
        };
        InsertListCommand.prototype.queryEnabled = function () {
            return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements();
        };
        scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
        scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
    };
};
},{}],109:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var outdentCommand = new scribe.api.Command('outdent');
        outdentCommand.queryEnabled = function () {
            var selection = new scribe.api.Selection();
            var listElement = selection.getContaining(function (element) {
                    return element.nodeName === 'UL' || element.nodeName === 'OL';
                });
            return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && !listElement;
        };
        scribe.commands.outdent = outdentCommand;
    };
};
},{}],110:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var redoCommand = new scribe.api.Command('redo');
        redoCommand.execute = function () {
            var historyItem = scribe.undoManager.redo();
            if (typeof historyItem !== 'undefined') {
                scribe.restoreFromHistory(historyItem);
            }
        };
        redoCommand.queryEnabled = function () {
            return scribe.undoManager.position < scribe.undoManager.stack.length - 1;
        };
        scribe.commands.redo = redoCommand;
        scribe.el.addEventListener('keydown', function (event) {
            if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
                event.preventDefault();
                redoCommand.execute();
            }
        });
    };
};
},{}],111:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var subscriptCommand = new scribe.api.Command('subscript');
        scribe.commands.subscript = subscriptCommand;
    };
};
},{}],112:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var superscriptCommand = new scribe.api.Command('superscript');
        scribe.commands.superscript = superscriptCommand;
    };
};
},{}],113:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var undoCommand = new scribe.api.Command('undo');
        undoCommand.execute = function () {
            var historyItem = scribe.undoManager.undo();
            if (typeof historyItem !== 'undefined') {
                scribe.restoreFromHistory(historyItem);
            }
        };
        undoCommand.queryEnabled = function () {
            return scribe.undoManager.position > 1;
        };
        scribe.commands.undo = undoCommand;
        scribe.el.addEventListener('keydown', function (event) {
            if (!event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
                event.preventDefault();
                undoCommand.execute();
            }
        });
    };
};
},{}],114:[function(require,module,exports){
var contains = require('lodash-amd/modern/collections/contains'), observeDomChanges = require('../../dom-observer');
'use strict';
module.exports = function () {
    return function (scribe) {
        var pushHistoryOnFocus = function () {
                setTimeout(function () {
                    scribe.pushHistory();
                }.bind(scribe), 0);
                scribe.el.removeEventListener('focus', pushHistoryOnFocus);
            }.bind(scribe);
        scribe.el.addEventListener('focus', pushHistoryOnFocus);
        scribe.el.addEventListener('focus', function placeCaretOnFocus() {
            var selection = new scribe.api.Selection();
            if (selection.range) {
                var isFirefoxBug = scribe.allowsBlockElements() && selection.range.startContainer === scribe.el;
                if (isFirefoxBug) {
                    var focusElement = getFirstDeepestChild(scribe.el.firstChild);
                    var range = selection.range;
                    range.setStart(focusElement, 0);
                    range.setEnd(focusElement, 0);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);
                }
            }
            function getFirstDeepestChild(node) {
                var treeWalker = document.createTreeWalker(node);
                var previousNode = treeWalker.currentNode;
                if (treeWalker.firstChild()) {
                    if (treeWalker.currentNode.nodeName === 'BR') {
                        return previousNode;
                    } else {
                        return getFirstDeepestChild(treeWalker.currentNode);
                    }
                } else {
                    return treeWalker.currentNode;
                }
            }
        }.bind(scribe));
        var applyFormatters = function () {
                if (!scribe._skipFormatters) {
                    var selection = new scribe.api.Selection();
                    var isEditorActive = selection.range;
                    var runFormatters = function () {
                            if (isEditorActive) {
                                selection.placeMarkers();
                            }
                            scribe.setHTML(scribe._htmlFormatterFactory.format(scribe.getHTML()));
                            selection.selectMarkers();
                        }.bind(scribe);
                    if (isEditorActive) {
                        scribe.undoManager.undo();
                        scribe.transactionManager.run(runFormatters);
                    } else {
                        runFormatters();
                    }
                }
                delete scribe._skipFormatters;
            }.bind(scribe);
        observeDomChanges(scribe.el, applyFormatters);
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keydown', function (event) {
                if (event.keyCode === 13) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var headingNode = selection.getContaining(function (node) {
                            return /^(H[1-6])$/.test(node.nodeName);
                        });
                    if (headingNode && range.collapsed) {
                        var contentToEndRange = range.cloneRange();
                        contentToEndRange.setEndAfter(headingNode, 0);
                        var contentToEndFragment = contentToEndRange.cloneContents();
                        if (contentToEndFragment.firstChild.textContent === '') {
                            event.preventDefault();
                            scribe.transactionManager.run(function () {
                                var pNode = document.createElement('p');
                                var brNode = document.createElement('br');
                                pNode.appendChild(brNode);
                                headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);
                                range.setStart(pNode, 0);
                                range.setEnd(pNode, 0);
                                selection.selection.removeAllRanges();
                                selection.selection.addRange(range);
                            });
                        }
                    }
                }
            });
        }
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keydown', function (event) {
                if (event.keyCode === 13 || event.keyCode === 8) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    if (range.collapsed) {
                        var containerLIElement = selection.getContaining(function (node) {
                                return node.nodeName === 'LI';
                            });
                        if (containerLIElement && containerLIElement.textContent.trim() === '') {
                            event.preventDefault();
                            var listNode = selection.getContaining(function (node) {
                                    return node.nodeName === 'UL' || node.nodeName === 'OL';
                                });
                            var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
                            command.execute();
                        }
                    }
                }
            });
        }
        scribe.el.addEventListener('paste', function handlePaste(event) {
            if (event.clipboardData) {
                event.preventDefault();
                if (contains(event.clipboardData.types, 'text/html')) {
                    scribe.insertHTML(event.clipboardData.getData('text/html'));
                } else {
                    scribe.insertPlainText(event.clipboardData.getData('text/plain'));
                }
            } else {
                var selection = new scribe.api.Selection();
                selection.placeMarkers();
                var bin = document.createElement('div');
                document.body.appendChild(bin);
                bin.setAttribute('contenteditable', true);
                bin.focus();
                setTimeout(function () {
                    var data = bin.innerHTML;
                    bin.parentNode.removeChild(bin);
                    selection.selectMarkers();
                    scribe.el.focus();
                    scribe.insertHTML(data);
                }, 1);
            }
        });
    };
};
},{"../../dom-observer":102,"lodash-amd/modern/collections/contains":55}],115:[function(require,module,exports){
var last = require('lodash-amd/modern/arrays/last');
'use strict';
function wrapChildNodes(scribe, parentNode) {
    var groups = Array.prototype.reduce.call(parentNode.childNodes, function (accumulator, binChildNode) {
            var group = last(accumulator);
            if (!group) {
                startNewGroup();
            } else {
                var isBlockGroup = scribe.element.isBlockElement(group[0]);
                if (isBlockGroup === scribe.element.isBlockElement(binChildNode)) {
                    group.push(binChildNode);
                } else {
                    startNewGroup();
                }
            }
            return accumulator;
            function startNewGroup() {
                var newGroup = [binChildNode];
                accumulator.push(newGroup);
            }
        }, []);
    var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
            var isBlockGroup = scribe.element.isBlockElement(group[0]);
            return !isBlockGroup;
        });
    consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
        var pElement = document.createElement('p');
        nodes[0].parentNode.insertBefore(pElement, nodes[0]);
        nodes.forEach(function (node) {
            pElement.appendChild(node);
        });
    });
    parentNode._isWrapped = true;
}
function traverse(scribe, parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
    var node = treeWalker.firstChild();
    while (node) {
        if (node.nodeName === 'BLOCKQUOTE' && !node._isWrapped) {
            wrapChildNodes(scribe, node);
            traverse(scribe, parentNode);
            break;
        }
        node = treeWalker.nextSibling();
    }
}
module.exports = function () {
    return function (scribe) {
        scribe.registerHTMLFormatter('normalize', function (html) {
            var bin = document.createElement('div');
            bin.innerHTML = html;
            wrapChildNodes(scribe, bin);
            traverse(scribe, bin);
            return bin.innerHTML;
        });
    };
};
},{"lodash-amd/modern/arrays/last":53}],116:[function(require,module,exports){
var element = require('../../../../element'), contains = require('lodash-amd/modern/collections/contains');
'use strict';
var html5VoidElements = [
        'AREA',
        'BASE',
        'BR',
        'COL',
        'COMMAND',
        'EMBED',
        'HR',
        'IMG',
        'INPUT',
        'KEYGEN',
        'LINK',
        'META',
        'PARAM',
        'SOURCE',
        'TRACK',
        'WBR'
    ];
function parentHasNoTextContent(element, node) {
    if (element.isCaretPositionNode(node)) {
        return true;
    } else {
        return node.parentNode.textContent.trim() === '';
    }
}
function traverse(element, parentNode) {
    var node = parentNode.firstElementChild;
    function isEmpty(node) {
        if (node.children.length === 0 && element.isBlockElement(node) || node.children.length === 1 && element.isSelectionMarkerNode(node.children[0])) {
            return true;
        }
        if (!element.isBlockElement(node) && node.children.length === 0) {
            return parentHasNoTextContent(element, node);
        }
        return false;
    }
    while (node) {
        if (!element.isSelectionMarkerNode(node)) {
            if (isEmpty(node) && node.textContent.trim() === '' && !contains(html5VoidElements, node.nodeName)) {
                node.appendChild(document.createElement('br'));
            } else if (node.children.length > 0) {
                traverse(element, node);
            }
        }
        node = node.nextElementSibling;
    }
}
module.exports = function () {
    return function (scribe) {
        scribe.registerHTMLFormatter('normalize', function (html) {
            var bin = document.createElement('div');
            bin.innerHTML = html;
            traverse(scribe.element, bin);
            return bin.innerHTML;
        });
    };
};
},{"../../../../element":103,"lodash-amd/modern/collections/contains":55}],117:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var nbspCharRegExp = /(\s|&nbsp;)+/g;
        scribe.registerHTMLFormatter('export', function (html) {
            return html.replace(nbspCharRegExp, ' ');
        });
    };
};
},{}],118:[function(require,module,exports){
var escape = require('lodash-amd/modern/utilities/escape');
'use strict';
module.exports = function () {
    return function (scribe) {
        scribe.registerPlainTextFormatter(escape);
    };
};
},{"lodash-amd/modern/utilities/escape":92}],119:[function(require,module,exports){
'use strict';
function hasContent(rootNode) {
    var treeWalker = document.createTreeWalker(rootNode);
    while (treeWalker.nextNode()) {
        if (treeWalker.currentNode) {
            if (~['br'].indexOf(treeWalker.currentNode.nodeName.toLowerCase()) || treeWalker.currentNode.length > 0) {
                return true;
            }
        }
    }
    return false;
}
module.exports = function () {
    return function (scribe) {
        scribe.el.addEventListener('keydown', function (event) {
            if (event.keyCode === 13) {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var blockNode = selection.getContaining(function (node) {
                        return node.nodeName === 'LI' || /^(H[1-6])$/.test(node.nodeName);
                    });
                if (!blockNode) {
                    event.preventDefault();
                    scribe.transactionManager.run(function () {
                        if (scribe.el.lastChild.nodeName === 'BR') {
                            scribe.el.removeChild(scribe.el.lastChild);
                        }
                        var brNode = document.createElement('br');
                        range.insertNode(brNode);
                        range.collapse(false);
                        var contentToEndRange = range.cloneRange();
                        contentToEndRange.setEndAfter(scribe.el.lastChild, 0);
                        var contentToEndFragment = contentToEndRange.cloneContents();
                        if (!hasContent(contentToEndFragment)) {
                            var bogusBrNode = document.createElement('br');
                            range.insertNode(bogusBrNode);
                        }
                        var newRange = range.cloneRange();
                        newRange.setStartAfter(brNode, 0);
                        newRange.setEndAfter(brNode, 0);
                        selection.selection.removeAllRanges();
                        selection.selection.addRange(newRange);
                    });
                }
            }
        }.bind(this));
        if (scribe.getHTML().trim() === '') {
            scribe.setContent('');
        }
    };
};
},{}],120:[function(require,module,exports){
var boldCommand = require('./patches/commands/bold'), indentCommand = require('./patches/commands/indent'), insertHTMLCommand = require('./patches/commands/insert-html'), insertListCommands = require('./patches/commands/insert-list'), outdentCommand = require('./patches/commands/outdent'), createLinkCommand = require('./patches/commands/create-link'), events = require('./patches/events');
'use strict';
module.exports = {
    commands: {
        bold: boldCommand,
        indent: indentCommand,
        insertHTML: insertHTMLCommand,
        insertList: insertListCommands,
        outdent: outdentCommand,
        createLink: createLinkCommand
    },
    events: events
};
},{"./patches/commands/bold":121,"./patches/commands/create-link":122,"./patches/commands/indent":123,"./patches/commands/insert-html":124,"./patches/commands/insert-list":125,"./patches/commands/outdent":126,"./patches/events":127}],121:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var boldCommand = new scribe.api.CommandPatch('bold');
        boldCommand.queryEnabled = function () {
            var selection = new scribe.api.Selection();
            var headingNode = selection.getContaining(function (node) {
                    return /^(H[1-6])$/.test(node.nodeName);
                });
            return scribe.api.CommandPatch.prototype.queryEnabled.apply(this, arguments) && !headingNode;
        };
        scribe.commandPatches.bold = boldCommand;
    };
};
},{}],122:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var createLinkCommand = new scribe.api.CommandPatch('createLink');
        scribe.commandPatches.createLink = createLinkCommand;
        createLinkCommand.execute = function (value) {
            var selection = new scribe.api.Selection();
            if (selection.selection.isCollapsed) {
                var aElement = document.createElement('a');
                aElement.setAttribute('href', value);
                aElement.textContent = value;
                selection.range.insertNode(aElement);
                var newRange = document.createRange();
                newRange.setStartBefore(aElement);
                newRange.setEndAfter(aElement);
                selection.selection.removeAllRanges();
                selection.selection.addRange(newRange);
            } else {
                scribe.api.CommandPatch.prototype.execute.call(this, value);
            }
        };
    };
};
},{}],123:[function(require,module,exports){
'use strict';
var INVISIBLE_CHAR = '\ufeff';
module.exports = function () {
    return function (scribe) {
        var indentCommand = new scribe.api.CommandPatch('indent');
        indentCommand.execute = function (value) {
            scribe.transactionManager.run(function () {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var isCaretOnNewLine = range.commonAncestorContainer.nodeName === 'P' && range.commonAncestorContainer.innerHTML === '<br>';
                if (isCaretOnNewLine) {
                    var textNode = document.createTextNode(INVISIBLE_CHAR);
                    range.insertNode(textNode);
                    range.setStart(textNode, 0);
                    range.setEnd(textNode, 0);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);
                }
                scribe.api.CommandPatch.prototype.execute.call(this, value);
                selection = new scribe.api.Selection();
                var blockquoteNode = selection.getContaining(function (node) {
                        return node.nodeName === 'BLOCKQUOTE';
                    });
                if (blockquoteNode) {
                    blockquoteNode.removeAttribute('style');
                }
            }.bind(this));
        };
        scribe.commandPatches.indent = indentCommand;
    };
};
},{}],124:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
        var element = scribe.element;
        insertHTMLCommandPatch.execute = function (value) {
            scribe.transactionManager.run(function () {
                scribe.api.CommandPatch.prototype.execute.call(this, value);
                sanitize(scribe.el);
                function sanitize(parentNode) {
                    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
                    var node = treeWalker.firstChild();
                    if (!node) {
                        return;
                    }
                    do {
                        if (node.nodeName === 'SPAN') {
                            element.unwrap(parentNode, node);
                        } else {
                            node.style.lineHeight = null;
                            if (node.getAttribute('style') === '') {
                                node.removeAttribute('style');
                            }
                        }
                        sanitize(node);
                    } while (node = treeWalker.nextSibling());
                }
            }.bind(this));
        };
        scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
};
},{}],125:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var element = scribe.element;
        var nodeHelpers = scribe.node;
        var InsertListCommandPatch = function (commandName) {
            scribe.api.CommandPatch.call(this, commandName);
        };
        InsertListCommandPatch.prototype = Object.create(scribe.api.CommandPatch.prototype);
        InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;
        InsertListCommandPatch.prototype.execute = function (value) {
            scribe.transactionManager.run(function () {
                scribe.api.CommandPatch.prototype.execute.call(this, value);
                if (this.queryState()) {
                    var selection = new scribe.api.Selection();
                    var listElement = selection.getContaining(function (node) {
                            return node.nodeName === 'OL' || node.nodeName === 'UL';
                        });
                    if (listElement.nextElementSibling && listElement.nextElementSibling.childNodes.length === 0) {
                        nodeHelpers.removeNode(listElement.nextElementSibling);
                    }
                    if (listElement) {
                        var listParentNode = listElement.parentNode;
                        if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                            selection.placeMarkers();
                            nodeHelpers.insertAfter(listElement, listParentNode);
                            selection.selectMarkers();
                            if (listParentNode.childNodes.length === 2 && nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                                nodeHelpers.removeNode(listParentNode);
                            }
                            if (listParentNode.childNodes.length === 0) {
                                nodeHelpers.removeNode(listParentNode);
                            }
                        }
                    }
                    var listItemElements = Array.prototype.slice.call(listElement.childNodes);
                    listItemElements.forEach(function (listItemElement) {
                        var listItemElementChildNodes = Array.prototype.slice.call(listItemElement.childNodes);
                        listItemElementChildNodes.forEach(function (listElementChildNode) {
                            if (listElementChildNode.nodeName === 'SPAN') {
                                var spanElement = listElementChildNode;
                                element.unwrap(listItemElement, spanElement);
                            } else if (listElementChildNode.nodeType === Node.ELEMENT_NODE) {
                                listElementChildNode.style.lineHeight = null;
                                if (listElementChildNode.getAttribute('style') === '') {
                                    listElementChildNode.removeAttribute('style');
                                }
                            }
                        });
                    });
                }
            }.bind(this));
        };
        scribe.commandPatches.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
        scribe.commandPatches.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
};
},{}],126:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var outdentCommand = new scribe.api.CommandPatch('outdent');
        outdentCommand.execute = function () {
            scribe.transactionManager.run(function () {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var blockquoteNode = selection.getContaining(function (node) {
                        return node.nodeName === 'BLOCKQUOTE';
                    });
                if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
                    selection.placeMarkers();
                    selection.selectMarkers(true);
                    var selectedNodes = range.cloneContents();
                    blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
                    range.deleteContents();
                    selection.selectMarkers();
                    if (blockquoteNode.textContent === '') {
                        blockquoteNode.parentNode.removeChild(blockquoteNode);
                    }
                } else {
                    var pNode = selection.getContaining(function (node) {
                            return node.nodeName === 'P';
                        });
                    if (pNode) {
                        var nextSiblingNodes = new scribe.api.Node(pNode).nextAll();
                        if (nextSiblingNodes.length) {
                            var newContainerNode = document.createElement(blockquoteNode.nodeName);
                            nextSiblingNodes.forEach(function (siblingNode) {
                                newContainerNode.appendChild(siblingNode);
                            });
                            blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
                        }
                        selection.placeMarkers();
                        blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
                        selection.selectMarkers();
                        if (blockquoteNode.innerHTML === '') {
                            blockquoteNode.parentNode.removeChild(blockquoteNode);
                        }
                    } else {
                        scribe.api.CommandPatch.prototype.execute.call(this);
                    }
                }
            }.bind(this));
        };
        scribe.commandPatches.outdent = outdentCommand;
    };
};
},{}],127:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        var element = scribe.element;
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keyup', function (event) {
                if (event.keyCode === 8 || event.keyCode === 46) {
                    var selection = new scribe.api.Selection();
                    var containerPElement = selection.getContaining(function (node) {
                            return node.nodeName === 'P';
                        });
                    if (containerPElement) {
                        scribe.undoManager.undo();
                        scribe.transactionManager.run(function () {
                            selection.placeMarkers();
                            var pElementChildNodes = Array.prototype.slice.call(containerPElement.childNodes);
                            pElementChildNodes.forEach(function (pElementChildNode) {
                                if (pElementChildNode.nodeName === 'SPAN') {
                                    var spanElement = pElementChildNode;
                                    element.unwrap(containerPElement, spanElement);
                                } else if (pElementChildNode.nodeType === Node.ELEMENT_NODE) {
                                    pElementChildNode.style.lineHeight = null;
                                    if (pElementChildNode.getAttribute('style') === '') {
                                        pElementChildNode.removeAttribute('style');
                                    }
                                }
                            });
                            selection.selectMarkers();
                        });
                    }
                }
            });
        }
    };
};
},{}],128:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        if (scribe.getHTML().trim() === '') {
            scribe.setContent('<p><br></p>');
        }
    };
};
},{}],129:[function(require,module,exports){
var defaults = require('lodash-amd/modern/objects/defaults'), flatten = require('lodash-amd/modern/arrays/flatten'), commands = require('./plugins/core/commands'), events = require('./plugins/core/events'), replaceNbspCharsFormatter = require('./plugins/core/formatters/html/replace-nbsp-chars'), enforcePElements = require('./plugins/core/formatters/html/enforce-p-elements'), ensureSelectableContainers = require('./plugins/core/formatters/html/ensure-selectable-containers'), escapeHtmlCharactersFormatter = require('./plugins/core/formatters/plain-text/escape-html-characters'), inlineElementsMode = require('./plugins/core/inline-elements-mode'), patches = require('./plugins/core/patches'), setRootPElement = require('./plugins/core/set-root-p-element'), Api = require('./api'), buildTransactionManager = require('./transaction-manager'), buildUndoManager = require('./undo-manager'), EventEmitter = require('./event-emitter'), elementHelpers = require('./element'), nodeHelpers = require('./node');
'use strict';
function Scribe(el, options) {
    EventEmitter.call(this);
    this.el = el;
    this.commands = {};
    this.options = defaults(options || {}, {
        allowBlockElements: true,
        debug: false
    });
    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();
    this.api = new Api(this);
    this.node = nodeHelpers;
    this.element = elementHelpers;
    var TransactionManager = buildTransactionManager(this);
    this.transactionManager = new TransactionManager();
    var UndoManager = buildUndoManager(this);
    this.undoManager = new UndoManager();
    this.el.setAttribute('contenteditable', true);
    this.el.addEventListener('input', function () {
        this.transactionManager.run();
    }.bind(this), false);
    if (this.allowsBlockElements()) {
        this.use(setRootPElement());
        this.use(enforcePElements());
        this.use(ensureSelectableContainers());
    } else {
        this.use(inlineElementsMode());
    }
    this.use(escapeHtmlCharactersFormatter());
    this.use(replaceNbspCharsFormatter());
    var mandatoryPatches = [
            patches.commands.bold,
            patches.commands.indent,
            patches.commands.insertHTML,
            patches.commands.insertList,
            patches.commands.outdent,
            patches.commands.createLink,
            patches.events
        ];
    var mandatoryCommands = [
            commands.indent,
            commands.insertList,
            commands.outdent,
            commands.redo,
            commands.subscript,
            commands.superscript,
            commands.undo
        ];
    var allPlugins = [].concat(mandatoryPatches, mandatoryCommands);
    allPlugins.forEach(function (plugin) {
        this.use(plugin());
    }.bind(this));
    this.use(events());
}
Scribe.prototype = Object.create(EventEmitter.prototype);
Scribe.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
};
Scribe.prototype.setHTML = function (html, skipFormatters) {
    if (skipFormatters) {
        this._skipFormatters = true;
    }
    this.el.innerHTML = html;
};
Scribe.prototype.getHTML = function () {
    return this.el.innerHTML;
};
Scribe.prototype.getContent = function () {
    return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
};
Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
};
Scribe.prototype.pushHistory = function () {
    var previousUndoItem = this.undoManager.stack[this.undoManager.position];
    var previousContent = previousUndoItem && previousUndoItem.replace(/<em class="scribe-marker">/g, '').replace(/<\/em>/g, '');
    if (!previousUndoItem || previousUndoItem && this.getHTML() !== previousContent) {
        var selection = new this.api.Selection();
        selection.placeMarkers();
        var html = this.getHTML();
        selection.removeMarkers();
        this.undoManager.push(html);
        return true;
    } else {
        return false;
    }
};
Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
};
Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem, true);
    var selection = new this.api.Selection();
    selection.selectMarkers();
    this.trigger('content-changed');
};
Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
};
Scribe.prototype.setContent = function (content) {
    if (!this.allowsBlockElements()) {
        content = content + '<br>';
    }
    this.setHTML(content);
    this.trigger('content-changed');
};
Scribe.prototype.insertPlainText = function (plainText) {
    this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
};
Scribe.prototype.insertHTML = function (html) {
    this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
};
Scribe.prototype.isDebugModeEnabled = function () {
    return this.options.debug;
};
Scribe.prototype.registerHTMLFormatter = function (phase, fn) {
    this._htmlFormatterFactory.formatters[phase].push(fn);
};
Scribe.prototype.registerPlainTextFormatter = function (fn) {
    this._plainTextFormatterFactory.formatters.push(fn);
};
function FormatterFactory() {
    this.formatters = [];
}
FormatterFactory.prototype.format = function (html) {
    var formatted = this.formatters.reduce(function (formattedData, formatter) {
            return formatter(formattedData);
        }, html);
    return formatted;
};
function HTMLFormatterFactory() {
    this.formatters = {
        sanitize: [],
        normalize: [],
        'export': []
    };
}
HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;
HTMLFormatterFactory.prototype.format = function (html) {
    var formatters = flatten([
            this.formatters.sanitize,
            this.formatters.normalize
        ]);
    var formatted = formatters.reduce(function (formattedData, formatter) {
            return formatter(formattedData);
        }, html);
    return formatted;
};
HTMLFormatterFactory.prototype.formatForExport = function (html) {
    return this.formatters['export'].reduce(function (formattedData, formatter) {
        return formatter(formattedData);
    }, html);
};
module.exports = Scribe;
},{"./api":96,"./element":103,"./event-emitter":104,"./node":105,"./plugins/core/commands":106,"./plugins/core/events":114,"./plugins/core/formatters/html/enforce-p-elements":115,"./plugins/core/formatters/html/ensure-selectable-containers":116,"./plugins/core/formatters/html/replace-nbsp-chars":117,"./plugins/core/formatters/plain-text/escape-html-characters":118,"./plugins/core/inline-elements-mode":119,"./plugins/core/patches":120,"./plugins/core/set-root-p-element":128,"./transaction-manager":130,"./undo-manager":131,"lodash-amd/modern/arrays/flatten":52,"lodash-amd/modern/objects/defaults":81}],130:[function(require,module,exports){
var assign = require('lodash-amd/modern/objects/assign');
'use strict';
module.exports = function (scribe) {
    function TransactionManager() {
        this.history = [];
    }
    assign(TransactionManager.prototype, {
        start: function () {
            this.history.push(1);
        },
        end: function () {
            this.history.pop();
            if (this.history.length === 0) {
                scribe.pushHistory();
                scribe.trigger('content-changed');
            }
        },
        run: function (transaction) {
            this.start();
            try {
                if (transaction) {
                    transaction();
                }
            } finally {
                this.end();
            }
        }
    });
    return TransactionManager;
};
},{"lodash-amd/modern/objects/assign":80}],131:[function(require,module,exports){
'use strict';
module.exports = function (scribe) {
    function UndoManager() {
        this.position = -1;
        this.stack = [];
        this.debug = scribe.isDebugModeEnabled();
    }
    UndoManager.prototype.maxStackSize = 100;
    UndoManager.prototype.push = function (item) {
        if (this.debug) {
            console.log('UndoManager.push: %s', item);
        }
        this.stack.length = ++this.position;
        this.stack.push(item);
        while (this.stack.length > this.maxStackSize) {
            this.stack.shift();
            --this.position;
        }
    };
    UndoManager.prototype.undo = function () {
        if (this.position > 0) {
            return this.stack[--this.position];
        }
    };
    UndoManager.prototype.redo = function () {
        if (this.position < this.stack.length - 1) {
            return this.stack[++this.position];
        }
    };
    return UndoManager;
};
},{}],132:[function(require,module,exports){
'use strict';
module.exports = function () {
    return function (scribe) {
        scribe.registerPlainTextFormatter(function (html) {
            return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
        });
    };
};
},{}],133:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

},{}],134:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var Blocks = require('./blocks');

var BlockControl = function(type) {
  this.type = type;
  this.block_type = Blocks[this.type].prototype;
  this.can_be_rendered = this.block_type.toolbarEnabled;

  this._ensureElement();
};

Object.assign(BlockControl.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  tagName: 'a',
  className: "st-block-control",

  attributes: function() {
    return {
      'data-type': this.block_type.type
    };
  },

  render: function() {
    this.$el.html('<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>' + _.result(this.block_type, 'title'));
    return this;
  }
});

module.exports = BlockControl;

},{"./blocks":152,"./events":162,"./function-bind":171,"./lodash":176,"./renderable":178}],135:[function(require,module,exports){
"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

var _ = require('./lodash');

var Blocks = require('./blocks');
var BlockControl = require('./block-control');
var EventBus = require('./event-bus');

var BlockControls = function(available_types, mediator) {
  this.available_types = available_types || [];
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(BlockControls.prototype, require('./function-bind'), require('./mediated-events'), require('./renderable'), require('./events'), {

  bound: ['handleControlButtonClick'],
  block_controls: null,

  className: "st-block-controls",
  eventNamespace: 'block-controls',

  mediatedEvents: {
    'render': 'renderInContainer',
    'show': 'show',
    'hide': 'hide'
  },

  initialize: function() {
    for(var block_type in this.available_types) {
      if (Blocks.hasOwnProperty(block_type)) {
        var block_control = new BlockControl(block_type);
        if (block_control.can_be_rendered) {
          this.$el.append(block_control.render().$el);
        }
      }
    }

    this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
    this.mediator.on('block-controls:show', this.renderInContainer);
  },

  show: function() {
    this.$el.addClass('st-block-controls--active');

    EventBus.trigger('block:controls:shown');
  },

  hide: function() {
    this.removeCurrentContainer();
    this.$el.removeClass('st-block-controls--active');

    EventBus.trigger('block:controls:hidden');
  },

  handleControlButtonClick: function(e) {
    e.stopPropagation();

    this.mediator.trigger('block:create', $(e.currentTarget).attr('data-type'));
  },

  renderInContainer: function(container) {
    this.removeCurrentContainer();

    container.append(this.$el.detach());
    container.addClass('with-st-controls');

    this.currentContainer = container;
    this.show();
  },

  removeCurrentContainer: function() {
    if (!_.isUndefined(this.currentContainer)) {
      this.currentContainer.removeClass("with-st-controls");
      this.currentContainer = undefined;
    }
  }
});

module.exports = BlockControls;

},{"./block-control":134,"./blocks":152,"./event-bus":161,"./events":162,"./function-bind":171,"./lodash":176,"./mediated-events":177,"./renderable":178}],136:[function(require,module,exports){
"use strict";

var BlockDeletion = function() {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, require('./function-bind'), require('./renderable'), {

  tagName: 'a',
  className: 'st-block-ui-btn st-block-ui-btn--delete st-icon',

  attributes: {
    html: 'delete',
    'data-icon': 'bin'
  }

});

module.exports = BlockDeletion;

},{"./function-bind":171,"./renderable":178}],137:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');
var config = require('./config');

var EventBus = require('./event-bus');
var Blocks = require('./blocks');

var BLOCK_OPTION_KEYS = ['convertToMarkdown', 'convertFromMarkdown'];

var BlockManager = function(options, editorInstance, mediator) {
  this.options = options;
  this.blockOptions = BLOCK_OPTION_KEYS.reduce(function(acc, key) {
    acc[key] = options[key];
    return acc;
  }, {});
  this.instance_scope = editorInstance;
  this.mediator = mediator;

  this.blocks = [];
  this.blockCounts = {};
  this.blockTypes = {};

  this._setBlocksTypes();
  this._setRequired();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(BlockManager.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), {

  eventNamespace: 'block',

  mediatedEvents: {
    'create': 'createBlock',
    'remove': 'removeBlock',
    'rerender': 'rerenderBlock'
  },

  initialize: function() {},

  createBlock: function(type, data) {
    type = utils.classify(type);

    // Run validations
    if (!this.canCreateBlock(type)) { return; }

    var block = new Blocks[type](data, this.instance_scope, this.mediator,
                                 this.blockOptions);
    this.blocks.push(block);

    this._incrementBlockTypeCount(type);
    this.mediator.trigger('block:render', block);

    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    utils.log("Block created of type " + type);
  },

  removeBlock: function(blockID) {
    var block = this.findBlockById(blockID),
    type = utils.classify(block.type);

    this.mediator.trigger('block-controls:reset');
    this.blocks = this.blocks.filter(function(item) {
      return (item.blockID !== block.blockID);
    });

    this._decrementBlockTypeCount(type);
    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    EventBus.trigger("block:remove");
  },

  rerenderBlock: function(blockID) {
    var block = this.findBlockById(blockID);
    if (!_.isUndefined(block) && !block.isEmpty() &&
        block.drop_options.re_render_on_reorder) {
      block.beforeLoadingData();
    }
  },

  triggerBlockCountUpdate: function() {
    this.mediator.trigger('block:countUpdate', this.blocks.length);
  },

  canCreateBlock: function(type) {
    if(this.blockLimitReached()) {
      utils.log("Cannot add any more blocks. Limit reached.");
      return false;
    }

    if (!this.isBlockTypeAvailable(type)) {
      utils.log("Block type not available " + type);
      return false;
    }

    // Can we have another one of these blocks?
    if (!this.canAddBlockType(type)) {
      utils.log("Block Limit reached for type " + type);
      return false;
    }

    return true;
  },

  validateBlockTypesExist: function(shouldValidate) {
    if (config.skipValidation || !shouldValidate) { return false; }

    (this.required || []).forEach(function(type, index) {
      if (!this.isBlockTypeAvailable(type)) { return; }

      if (this._getBlockTypeCount(type) === 0) {
        utils.log("Failed validation on required block type " + type);
        this.mediator.trigger('errors:add',
                              { text: i18n.t("errors:type_missing", { type: type }) });

      } else {
        var blocks = this.getBlocksByType(type).filter(function(b) {
          return !b.isEmpty();
        });

        if (blocks.length > 0) { return false; }

        this.mediator.trigger('errors:add', {
          text: i18n.t("errors:required_type_empty", {type: type})
        });

        utils.log("A required block type " + type + " is empty");
      }
    }, this);
  },

  findBlockById: function(blockID) {
    return this.blocks.find(function(b) {
      return b.blockID === blockID;
    });
  },

  getBlocksByType: function(type) {
    return this.blocks.filter(function(b) {
      return utils.classify(b.type) === type;
    });
  },

  getBlocksByIDs: function(block_ids) {
    return this.blocks.filter(function(b) {
      return block_ids.includes(b.blockID);
    });
  },

  blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  isBlockTypeAvailable: function(t) {
    return !_.isUndefined(this.blockTypes[t]);
  },

  canAddBlockType: function(type) {
    var block_type_limit = this._getBlockTypeLimit(type);
    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
  },

  _setBlocksTypes: function() {
    this.blockTypes = utils.flatten(
      _.isUndefined(this.options.blockTypes) ?
      Blocks : this.options.blockTypes);
  },

  _setRequired: function() {
    this.required = false;

    if (Array.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
      this.required = this.options.required;
    }
  },

  _incrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] + 1;
  },

  _decrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] - 1;
  },

  _getBlockTypeCount: function(type) {
    return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
  },

  _blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  _getBlockTypeLimit: function(t) {
    if (!this.isBlockTypeAvailable(t)) { return 0; }
    return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
  }

});

module.exports = BlockManager;


},{"./blocks":152,"./config":158,"./event-bus":161,"./events":162,"./function-bind":171,"./lodash":176,"./mediated-events":177,"./utils":182}],138:[function(require,module,exports){
"use strict";

var template = [
  "<div class='st-block-positioner__inner'>",
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>",
  "</div>"
].join("\n");

var BlockPositioner = function(block_element, mediator) {
  this.mediator = mediator;
  this.$block = block_element;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositioner.prototype, require('./function-bind'), require('./renderable'), {

  total_blocks: 0,

  bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'st-block-positioner--is-visible',

  initialize: function(){
    this.$el.append(template);
    this.$select = this.$('.st-block-positioner__select');

    this.$select.on('change', this.onSelectChange);

    this.mediator.on("blocks:countUpdate", this.onBlockCountChange);
  },

  onBlockCountChange: function(new_count) {
    if (new_count !== this.total_blocks) {
      this.total_blocks = new_count;
      this.renderPositionList();
    }
  },

  onSelectChange: function() {
    var val = this.$select.val();
    if (val !== 0) {
      this.mediator.trigger(
        "blocks:changePosition", this.$block, val,
        (val === 1 ? 'before' : 'after'));
      this.toggle();
    }
  },

  renderPositionList: function() {
    var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
    for(var i = 1; i <= this.total_blocks; i++) {
      inner += "<option value="+i+">"+i+"</option>";
    }
    this.$select.html(inner);
  },

  toggle: function() {
    this.$select.val(0);
    this.$el.toggleClass(this.visibleClass);
  },

  show: function(){
    this.$el.addClass(this.visibleClass);
  },

  hide: function(){
    this.$el.removeClass(this.visibleClass);
  }

});

module.exports = BlockPositioner;

},{"./function-bind":171,"./renderable":178}],139:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var EventBus = require('./event-bus');

var BlockReorder = function(block_element, mediator) {
  this.$block = block_element;
  this.blockID = this.$block.attr('id');
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['onMouseDown', 'onDragStart', 'onDragEnd', 'onDrop'],

  className: 'st-block-ui-btn st-block-ui-btn--reorder st-icon',
  tagName: 'a',

  attributes: function() {
    return {
      'html': 'reorder',
      'draggable': 'true',
      'data-icon': 'move'
    };
  },

  initialize: function() {
    this.$el.bind('mousedown touchstart', this.onMouseDown)
      .bind('dragstart', this.onDragStart)
      .bind('dragend touchend', this.onDragEnd);

    this.$block.dropArea()
      .bind('drop', this.onDrop);
  },

  blockId: function() {
    return this.$block.attr('id');
  },

  onMouseDown: function() {
    this.mediator.trigger("block-controls:hide");
    EventBus.trigger("block:reorder:down");
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.$block,
    item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
    block = $('#' + item_id);

    if (!_.isUndefined(item_id) && !_.isEmpty(block) &&
        dropped_on.attr('id') !== item_id &&
          dropped_on.attr('data-instance') === block.attr('data-instance')
       ) {
       dropped_on.after(block);
     }
     this.mediator.trigger("block:rerender", item_id);
     EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function(ev) {
    var btn = $(ev.currentTarget).parent();

    ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
    ev.originalEvent.dataTransfer.setData('Text', this.blockId());

    EventBus.trigger("block:reorder:dragstart");
    this.$block.addClass('st-block--dragging');
  },

  onDragEnd: function(ev) {
    EventBus.trigger("block:reorder:dragend");
    this.$block.removeClass('st-block--dragging');
  },

  render: function() {
    return this;
  }

});

module.exports = BlockReorder;

},{"./event-bus":161,"./function-bind":171,"./lodash":176,"./renderable":178}],140:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var EventBus = require('./event-bus');

module.exports = {

  /**
   * Internal storage object for the block
   */
  blockStorage: {},

  /**
   * Initialize the store, including the block type
   */
  createStore: function(blockData) {
    this.blockStorage = {
      type: utils.underscored(this.type),
      data: blockData || {}
    };
  },

  /**
   * Serialize the block and save the data into the store
   */
  save: function() {
    var data = this._serializeData();

    if (!_.isEmpty(data)) {
      this.setData(data);
    }
  },

  getData: function() {
    this.save();
    return this.blockStorage;
  },

  getBlockData: function() {
    this.save();
    return this.blockStorage.data;
  },

  _getData: function() {
    return this.blockStorage.data;
  },

  /**
   * Set the block data.
   * This is used by the save() method.
   */
  setData: function(blockData) {
    utils.log("Setting data for block " + this.blockID);
    Object.assign(this.blockStorage.data, blockData || {});
  },

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  _serializeData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    utils.log("loadData for " + this.blockID);
    EventBus.trigger("editor/block/loadData");
    this.loadData(this._getData());
  },

  _loadData: function() {
    utils.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this._getData())) {
      this.beforeLoadingData();
    }
  }

};

},{"./event-bus":161,"./lodash":176,"./utils":182}],141:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var bestNameFromField = function(field) {
  var msg = field.attr("data-st-name") || field.attr("name");

  if (!msg) {
    msg = 'Field';
  }

  return utils.capitalize(msg);
};

module.exports = {

  errors: [],

  valid: function(){
    this.performValidations();
    return this.errors.length === 0;
  },

  // This method actually does the leg work
  // of running our validators and custom validators
  performValidations: function() {
    this.resetErrors();

    var required_fields = this.$('.st-required');
    required_fields.each(function (i, f) {
      this.validateField(f);
    }.bind(this));
    this.validations.forEach(this.runValidator, this);

    this.$el.toggleClass('st-block--with-errors', this.errors.length > 0);
  },

  // Everything in here should be a function that returns true or false
  validations: [],

  validateField: function(field) {
    field = $(field);

    var content = field.attr('contenteditable') ? field.text() : field.val();

    if (content.length === 0) {
      this.setError(field, i18n.t("errors:block_empty",
                                 { name: bestNameFromField(field) }));
    }
  },

  runValidator: function(validator) {
    if (!_.isUndefined(this[validator])) {
      this[validator].call(this);
    }
  },

  setError: function(field, reason) {
    var $msg = this.addMessage(reason, "st-msg--error");
    field.addClass('st-error');

    this.errors.push({ field: field, reason: reason, msg: $msg });
  },

  resetErrors: function() {
    this.errors.forEach(function(error){
      error.field.removeClass('st-error');
      error.msg.remove();
    });

    this.$messages.removeClass("st-block__messages--is-visible");
    this.errors = [];
  }

};

},{"./lodash":176,"./utils":182}],142:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var Scribe = require('scribe-editor');
var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');

var config = require('./config');
var utils = require('./utils');
var stToMarkdown = require('./to-markdown');
var BlockMixins = require('./block_mixins');

var SimpleBlock = require('./simple-block');
var BlockReorder = require('./block-reorder');
var BlockDeletion = require('./block-deletion');
var BlockPositioner = require('./block-positioner');
var Formatters = require('./formatters');
var EventBus = require('./event-bus');

var Spinner = require('spin.js');

var Block = function(data, instance_id, mediator, options) {
  SimpleBlock.apply(this, arguments);
};

Block.prototype = Object.create(SimpleBlock.prototype);
Block.prototype.constructor = Block;

var delete_template = [
  "<div class='st-block__ui-delete-controls'>",
  "<label class='st-block__delete-label'>",
  "<%= i18n.t('general:delete') %>",
  "</label>",
  "<a class='st-block-ui-btn st-block-ui-btn--confirm-delete st-icon' data-icon='tick'></a>",
  "<a class='st-block-ui-btn st-block-ui-btn--deny-delete st-icon' data-icon='close'></a>",
  "</div>"
].join("\n");

var drop_options = {
  html: ['<div class="st-block__dropzone">',
    '<span class="st-icon"><%= _.result(block, "icon_name") %></span>',
    '<p><%= i18n.t("general:drop", { block: "<span>" + _.result(block, "title") + "</span>" }) %>',
    '</p></div>'].join('\n'),
    re_render_on_reorder: false
};

var paste_options = {
  html: ['<input type="text" placeholder="<%= i18n.t("general:paste") %>"',
    ' class="st-block__paste-input st-paste-block">'].join('')
};

var upload_options = {
  html: [
    '<div class="st-block__upload-container">',
    '<input type="file" type="st-file-upload">',
    '<button class="st-upload-btn"><%= i18n.t("general:upload") %></button>',
    '</div>'
  ].join('\n')
};

config.defaults.Block = {
  drop_options: drop_options,
  paste_options: paste_options,
  upload_options: upload_options
};

Object.assign(Block.prototype, SimpleBlock.fn, require('./block-validations'), {

  bound: [
    "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
    "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender",
  ],

  className: 'st-block st-icon--add',

  attributes: function() {
    return Object.assign(SimpleBlock.fn.attributes.call(this), {
      'data-icon-after' : "add"
    });
  },

  icon_name: 'default',

  validationFailMsg: function() {
    return i18n.t('errors:validation_fail', { type: this.title() });
  },

  editorHTML: '<div class="st-block__editor"></div>',

  toolbarEnabled: true,

  availableMixins: ['droppable', 'pastable', 'uploadable', 'fetchable',
    'ajaxable', 'controllable'],

  droppable: false,
  pastable: false,
  uploadable: false,
  fetchable: false,
  ajaxable: false,

  drop_options: {},
  paste_options: {},
  upload_options: {},

  formattable: true,

  _previousSelection: '',

  initialize: function() {},

  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  withMixin: function(mixin) {
    if (!_.isObject(mixin)) { return; }

    var initializeMethod = "initialize" + mixin.mixinName;

    if (_.isUndefined(this[initializeMethod])) {
      Object.assign(this, mixin);
      this[initializeMethod]();
    }
  },

  render: function() {
    this.beforeBlockRender();
    this._setBlockInner();

    this.$editor = this.$inner.children().first();

    if(this.droppable || this.pastable || this.uploadable) {
      var input_html = $("<div>", { 'class': 'st-block__inputs' });
      this.$inner.append(input_html);
      this.$inputs = input_html;
    }

    if (this.hasTextBlock) { this._initTextBlocks(); }

    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        this.withMixin(BlockMixins[utils.classify(mixin)]);
      }
    }, this);

    if (this.formattable) { this._initFormatting(); }

    this._blockPrepare();

    return this;
  },

  remove: function() {
    if (this.ajaxable) {
      this.resolveAllInQueue();
    }

    this.$el.remove();
  },

  loading: function() {
    if(!_.isUndefined(this.spinner)) { this.ready(); }

    this.spinner = new Spinner(config.defaults.spinner);
    this.spinner.spin(this.$el[0]);

    this.$el.addClass('st--is-loading');
  },

  ready: function() {
    this.$el.removeClass('st--is-loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },

  /* Generic _serializeData implementation to serialize the block into a plain object.
   * Can be overwritten, although hopefully this will cover most situations.
   * If you want to get the data of your block use block.getBlockData()
   */
  _serializeData: function() {
    utils.log("toData for " + this.blockID);

    var data = {};

    /* Simple to start. Add conditions later */
    if (this.hasTextBlock()) {
      data.text = this.getTextBlockHTML();
      if (data.text.length > 0 && this.options.convertToMarkdown) {
        data.text = stToMarkdown(data.text, this.type);
      }
    }

    // Add any inputs to the data attr
    if (this.$(':input').not('.st-paste-block').length > 0) {
      this.$(':input').each(function(index,input){
        if (input.getAttribute('name')) {
          data[input.getAttribute('name')] = input.value;
        }
      });
    }

    return data;
  },

  /* Generic implementation to tell us when the block is active */
  focus: function() {
    this.getTextBlock().focus();
  },

  blur: function() {
    this.getTextBlock().blur();
  },

  onFocus: function() {
    this.getTextBlock().bind('focus', this._onFocus);
  },

  onBlur: function() {
    this.getTextBlock().bind('blur', this._onBlur);
  },

  /*
   * Event handlers
   */

  _onFocus: function() {
    this.trigger('blockFocus', this.$el);
  },

  _onBlur: function() {},

  onBlockRender: function() {
    this.focus();
  },

  onDrop: function(dataTransferObj) {},

  onDeleteClick: function(ev) {
    ev.preventDefault();

    var onDeleteConfirm = function(e) {
      e.preventDefault();
      this.mediator.trigger('block:remove', this.blockID);
      this.remove();
    };

    var onDeleteDeny = function(e) {
      e.preventDefault();
      this.$el.removeClass('st-block--delete-active');
      $delete_el.remove();
    };

    if (this.isEmpty()) {
      onDeleteConfirm.call(this, new Event('click'));
      return;
    }

    this.$inner.append(_.template(delete_template));
    this.$el.addClass('st-block--delete-active');

    var $delete_el = this.$inner.find('.st-block__ui-delete-controls');

    this.$inner.on('click', '.st-block-ui-btn--confirm-delete',
                   onDeleteConfirm.bind(this))
                   .on('click', '.st-block-ui-btn--deny-delete',
                       onDeleteDeny.bind(this));
  },

  beforeLoadingData: function() {
    this.loading();

    if(this.droppable || this.uploadable || this.pastable) {
      this.$editor.show();
      this.$inputs.hide();
    }

    SimpleBlock.fn.beforeLoadingData.call(this);

    this.ready();
  },

  _handleContentPaste: function(ev) {
    setTimeout(this.onContentPasted.bind(this, ev, $(ev.currentTarget)), 0);
  },

  _getBlockClass: function() {
    return 'st-block--' + this.className;
  },

  /*
   * Init functions for adding functionality
   */

  _initUIComponents: function() {

    var positioner = new BlockPositioner(this.$el, this.mediator);

    this._withUIComponent(positioner, '.st-block-ui-btn--reorder',
                          positioner.toggle);

    this._withUIComponent(new BlockReorder(this.$el, this.mediator));

    this._withUIComponent(new BlockDeletion(), '.st-block-ui-btn--delete',
                          this.onDeleteClick);

    this.onFocus();
    this.onBlur();
  },

  _initFormatting: function() {
    // Enable formatting keyboard input
    var formatter;
    for (var name in Formatters) {
      if (Formatters.hasOwnProperty(name)) {
        formatter = Formatters[name];
        if (!_.isUndefined(formatter.keyCode)) {
          formatter._bindToBlock(this.$el);
        }
      }
    }
  },

  _initTextBlocks: function() {
    this.getTextBlock()
        .bind('keyup', this.getSelectionForFormatter)
        .bind('mouseup', this.getSelectionForFormatter)
        .bind('DOMNodeInserted', this.clearInsertedStyles);

    if (_.isUndefined(this._scribe)) {
      this._scribe = new Scribe(this.getTextBlock().get(0), {
        debug: config.scribeDebug,
      });
      this._scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHTML());

      if (_.isFunction(this.options.configureScribe)) {
        this.options.configureScribe.call(this, this._scribe);
      }
    }
  },

  getSelectionForFormatter: function() {
    var block = this;
    setTimeout(function() {
      var selection = window.getSelection(),
          selectionStr = selection.toString().trim(),
          en = 'formatter:' + ((selectionStr === '') ? 'hide' : 'position');

      block.mediator.trigger(en, block);
      EventBus.trigger(en, block);
    }, 1);
  },

  clearInsertedStyles: function(e) {
    var target = e.target;
    target.removeAttribute('style'); // Hacky fix for Chrome.
  },

  hasTextBlock: function() {
    return this.getTextBlock().length > 0;
  },

  getTextBlock: function() {
    if (_.isUndefined(this.text_block)) {
      this.text_block = this.$('.st-text-block');
    }

    return this.text_block;
  },

  getTextBlockHTML: function() {
    return this._scribe.getHTML();
  },

  setTextBlockHTML: function(html) {
    return this._scribe.setContent(html);
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData());
  }

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;

},{"./block-deletion":136,"./block-positioner":138,"./block-reorder":139,"./block-validations":141,"./block_mixins":147,"./config":158,"./event-bus":161,"./formatters":170,"./helpers/extend":173,"./lodash":176,"./simple-block":179,"./to-markdown":181,"./utils":182,"scribe-editor":129,"scribe-plugin-formatter-plain-text-convert-new-lines-to-html":132,"spin.js":133}],143:[function(require,module,exports){
"use strict";

var utils = require('../utils');

module.exports = {

  mixinName: "Ajaxable",

  ajaxable: true,

  initializeAjaxable: function(){
    this._queued = [];
  },

  addQueuedItem: function(name, deferred) {
    utils.log("Adding queued item for " + this.blockID + " called " + name);

    this._queued.push({ name: name, deferred: deferred });
  },

  removeQueuedItem: function(name) {
    utils.log("Removing queued item for " + this.blockID + " called " + name);

    this._queued = this._queued.filter(function(queued) {
      return queued.name !== name;
    });
  },

  hasItemsInQueue: function() {
    return this._queued.length > 0;
  },

  resolveAllInQueue: function() {
    this._queued.forEach(function(item){
      utils.log("Aborting queued request: " + item.name);
      item.deferred.abort();
    }, this);
  }

};

},{"../utils":182}],144:[function(require,module,exports){
"use strict";

var utils = require('../utils');

module.exports = {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    this.$control_ui = $('<div>', {'class': 'st-block__control-ui'});
    Object.keys(this.controls).forEach(
      function(cmd) {
        // Bind configured handler to current block context
        this.addUiControl(cmd, this.controls[cmd].bind(this));
      },
      this
    );
    this.$inner.append(this.$control_ui);
  },

  getControlTemplate: function(cmd) {
    return $("<a>",
      { 'data-icon': cmd,
        'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + cmd
      });
  },

  addUiControl: function(cmd, handler) {
    this.$control_ui.append(this.getControlTemplate(cmd));
    this.$control_ui.on('click', '.st-block-control-ui-btn--' + cmd, handler);
  }
};

},{"../utils":182}],145:[function(require,module,exports){
"use strict";

/* Adds drop functionaltiy to this block */

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var EventBus = require('../event-bus');

module.exports = {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],

  initializeDroppable: function() {
    utils.log("Adding droppable to block " + this.blockID);

    this.drop_options = Object.assign({}, config.defaults.Block.drop_options, this.drop_options);

    var drop_html = $(_.template(this.drop_options.html,
                                 { block: this, _: _ }));

    this.$editor.hide();
    this.$inputs.append(drop_html);
    this.$dropzone = drop_html;

    // Bind our drop event
    this.$dropzone.dropArea()
                  .bind('drop', this._handleDrop.bind(this));

    this.$inner.addClass('st-block__inner--droppable');
  },

  _handleDrop: function(e) {
    e.preventDefault();

    e = e.originalEvent;

    var el = $(e.target),
        types = e.dataTransfer.types;

    el.removeClass('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (types &&
        types.some(function(type) {
                     return this.valid_drop_file_types.includes(type);
                   }, this)) {
      this.onDrop(e.dataTransfer);
    }

    EventBus.trigger('block:content:dropped', this.blockID);
  }

};

},{"../config":158,"../event-bus":161,"../lodash":176,"../utils":182}],146:[function(require,module,exports){
"use strict";

var _ = require('../lodash');

module.exports = {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(require('./ajaxable'));
  },

  fetch: function(options, success, failure){
    var uid = _.uniqueId(this.blockID + "_fetch"),
        xhr = $.ajax(options);

    this.resetMessages();
    this.addQueuedItem(uid, xhr);

    if(!_.isUndefined(success)) {
      xhr.done(success.bind(this));
    }

    if(!_.isUndefined(failure)) {
      xhr.fail(failure.bind(this));
    }

    xhr.always(this.removeQueuedItem.bind(this, uid));

    return xhr;
  }

};

},{"../lodash":176,"./ajaxable":143}],147:[function(require,module,exports){
"use strict";

module.exports = {
  Ajaxable: require('./ajaxable.js'),
  Controllable: require('./controllable.js'),
  Droppable: require('./droppable.js'),
  Fetchable: require('./fetchable.js'),
  Pastable: require('./pastable.js'),
  Uploadable: require('./uploadable.js'),
};

},{"./ajaxable.js":143,"./controllable.js":144,"./droppable.js":145,"./fetchable.js":146,"./pastable.js":148,"./uploadable.js":149}],148:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

module.exports = {

  mixinName: "Pastable",

  initializePastable: function() {
    utils.log("Adding pastable to block " + this.blockID);

    this.paste_options = Object.assign(
      {}, config.defaults.block.pasteOptions, this.paste_options);
    this.$inputs.append(_.template(this.paste_options.html, this));

    this.$('.st-paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  }

};

},{"../config":158,"../lodash":176,"../utils":182}],149:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var fileUploader = require('../extensions/file-uploader');

module.exports = {

  mixinName: "Uploadable",

  uploadsCount: 0,

  initializeUploadable: function() {
    utils.log("Adding uploadable to block " + this.blockID);
    this.withMixin(require('./ajaxable'));

    this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);
    this.$inputs.append(_.template(this.upload_options.html, this));
  },

  uploader: function(file, success, failure){
    return fileUploader(this, file, success, failure);
  }

};

},{"../config":158,"../extensions/file-uploader":164,"../lodash":176,"../utils":182,"./ajaxable":143}],150:[function(require,module,exports){
"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: 'Heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',

  icon_name: 'heading',

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
  }
});

},{"../block":142,"../to-html":180}],151:[function(require,module,exports){
"use strict";

var Block = require('../block');

module.exports = Block.extend({

  type: "image",
  title: function() { return i18n.t('blocks:image:title'); },

  droppable: true,
  uploadable: true,

  icon_name: 'image',

  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', { src: data.file.url }));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
    this.$inputs.find('input').on('change', (function(ev) {
      this.onDrop(ev.currentTarget);
    }).bind(this));
  },

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      this.loading();
      // Show this image on here
      this.$inputs.hide();
      this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();

      this.uploader(
        file,
        function(data) {
          this.setData(data);
          this.ready();
        },
        function(error) {
          this.addMessage(i18n.t('blocks:image:upload_error'));
          this.ready();
        }
      );
    }
  }
});

},{"../block":142}],152:[function(require,module,exports){
"use strict";

module.exports = {
  Text: require('./text'),
  Quote: require('./quote'),
  Image: require('./image'),
  Heading: require('./heading'),
  List: require('./list'),
  Tweet: require('./tweet'),
  Video: require('./video'),
};

},{"./heading":150,"./image":151,"./list":153,"./quote":154,"./text":155,"./tweet":156,"./video":157}],153:[function(require,module,exports){
"use strict";

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = '<div class="st-text-block st-required" contenteditable="true"><ul><li></li></ul></div>';

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  icon_name: 'list',

  editorHTML: function() {
    return _.template(template, this);
  },

  loadData: function(data){
    this.setTextBlockHTML("<ul>" + stToHTML(data.text, this.type) + "</ul>");
  },

  onBlockRender: function() {
    this.checkForList = this.checkForList.bind(this);
    this.getTextBlock().on('click keyup', this.checkForList);
    this.focus();
  },

  checkForList: function() {
    if (this.$('ul').length === 0) {
      document.execCommand("insertUnorderedList", false, false);
    }
  },

  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," - $1");
  },

  toHTML: function(html) {
    html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
               .replace(/\n/mg, "");

    return html;
  },

  onContentPasted: function(event, target) {
    this.$('ul').html(
      this.pastedMarkdownToHTML(target[0].innerHTML));
    this.getTextBlock().caretToEnd();
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData().text);
  }

});

},{"../block":142,"../lodash":176,"../to-html":180}],154:[function(require,module,exports){
"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = _.template([
  '<blockquote class="st-required st-text-block" contenteditable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string st-required js-cite-input" type="text" />'
].join("\n"));

module.exports = Block.extend({

  type: "quote",

  title: function() { return i18n.t('blocks:quote:title'); },

  icon_name: 'quote',

  editorHTML: function() {
    return template(this);
  },

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
    this.$('.js-cite-input').val(data.cite);
  },

  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }

});

},{"../block":142,"../lodash":176,"../to-html":180}],155:[function(require,module,exports){
"use strict";

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
  },
});

},{"../block":142,"../to-html":180}],156:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var utils = require('../utils');

var Block = require('../block');

var tweet_template = _.template([
  "<blockquote class='twitter-tweet' align='center'>",
  "<p><%= text %></p>",
  "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
  "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
  "</blockquote>",
  '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
].join("\n"));

module.exports = Block.extend({

  type: "tweet",
  droppable: true,
  pastable: true,
  fetchable: true,

  drop_options: {
    re_render_on_reorder: true
  },

  title: function(){ return i18n.t('blocks:tweet:title'); },

  fetchUrl: function(tweetID) {
    return "/tweets/?tweet_id=" + tweetID;
  },

  icon_name: 'twitter',

  loadData: function(data) {
    if (_.isUndefined(data.status_url)) { data.status_url = ''; }
    this.$inner.find('iframe').remove();
    this.$inner.prepend(tweet_template(data));
  },

  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
    val = input.val();

    // Pass this to the same handler as onDrop
    this.handleTwitterDropPaste(val);
  },

  handleTwitterDropPaste: function(url){
    if (!this.validTweetUrl(url)) {
      utils.log("Invalid Tweet URL");
      return;
    }

    // Twitter status
    var tweetID = url.match(/[^\/]+$/);
    if (!_.isEmpty(tweetID)) {
      this.loading();
      tweetID = tweetID[0];

      var ajaxOptions = {
        url: this.fetchUrl(tweetID),
        dataType: "json"
      };

      this.fetch(ajaxOptions, this.onTweetSuccess, this.onTweetFail);
    }
  },

  validTweetUrl: function(url) {
    return (utils.isURI(url) &&
            url.indexOf("twitter") !== -1 &&
            url.indexOf("status") !== -1);
  },

  onTweetSuccess: function(data) {
    // Parse the twitter object into something a bit slimmer..
    var obj = {
      user: {
        profile_image_url: data.user.profile_image_url,
        profile_image_url_https: data.user.profile_image_url_https,
        screen_name: data.user.screen_name,
        name: data.user.name
      },
      id: data.id_str,
      text: data.text,
      created_at: data.created_at,
      entities: data.entities,
      status_url: "https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str
    };

    this.setAndLoadData(obj);
    this.ready();
  },

  onTweetFail: function() {
    this.addMessage(i18n.t("blocks:tweet:fetch_error"));
    this.ready();
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleTwitterDropPaste(url);
  }
});

},{"../block":142,"../lodash":176,"../utils":182}],157:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var utils = require('../utils');

var Block = require('../block');

module.exports = Block.extend({

  // more providers at https://gist.github.com/jeffling/a9629ae28e076785a14f
  providers: {
    vimeo: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
      html: "<iframe src=\"{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>"
    },
    youtube: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?(?:(?:youtube.com\/watch\?(?:.*)(?:v=))|(?:youtu.be\/))([^&].+)/,
      html: "<iframe src=\"{{protocol}}//www.youtube.com/embed/{{remote_id}}\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>"
    }
  },

  type: 'video',
  title: function() { return i18n.t('blocks:video:title'); },

  droppable: true,
  pastable: true,

  icon_name: 'video',

  loadData: function(data){
    if (!this.providers.hasOwnProperty(data.source)) { return; }

    if (this.providers[data.source].square) {
      this.$editor.addClass('st-block__editor--with-square-media');
    } else {
      this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
    }

    var embed_string = this.providers[data.source].html
    .replace('{{protocol}}', window.location.protocol)
    .replace('{{remote_id}}', data.remote_id)
    .replace('{{width}}', this.$editor.width()); // for videos that can't resize automatically like vine

    this.$editor.html(embed_string);
  },

  onContentPasted: function(event){
    this.handleDropPaste($(event.target).val());
  },

  handleDropPaste: function(url){
    if(!utils.isURI(url)) {
      return;
    }

    var match, data;

    this.providers.forEach(function(provider, index) {
      match = provider.regex.exec(url);

      if(match !== null && !_.isUndefined(match[1])) {
        data = {
          source: index,
          remote_id: match[1]
        };

        this.setAndLoadData(data);
      }
    }, this);
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleDropPaste(url);
  }
});


},{"../block":142,"../lodash":176,"../utils":182}],158:[function(require,module,exports){
"use strict";

module.exports = {
  debug: false,
  scribeDebug: false,
  skipValidation: false,
  version: "0.4.0",
  language: "en",

  instances: [],

  defaults: {
    defaultType: false,
    spinner: {
      className: 'st-spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%'
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/',
    errorsContainer: undefined,
    convertToMarkdown: false,
    convertFromMarkdown: true,
  }
};

},{}],159:[function(require,module,exports){
"use strict";

/*
 * Sir Trevor Editor
 * --
 * Represents one Sir Trevor editor instance (with multiple blocks)
 * Each block references this instance.
 * BlockTypes are global however.
 */

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Events = require('./events');
var EventBus = require('./event-bus');
var FormEvents = require('./form-events');
var BlockControls = require('./block-controls');
var BlockManager = require('./block-manager');
var FloatingBlockControls = require('./floating-block-controls');
var FormatBar = require('./format-bar');
var EditorStore = require('./extensions/editor-store');
var ErrorHandler = require('./error-handler');

var Editor = function(options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, require('./function-bind'), require('./events'), {

  bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition',
    'removeBlockDragOver', 'renderBlock', 'resetBlockControls',
    'blockLimitReached'], 

  events: {
    'block:reorder:dragend': 'removeBlockDragOver',
    'block:content:dropped': 'removeBlockDragOver'
  },

  initialize: function(options) {
    utils.log("Init SirTrevor.Editor");

    this.options = Object.assign({}, config.defaults, options || {});
    this.ID = _.uniqueId('st-editor-');

    if (!this._ensureAndSetElements()) { return false; }

    if(!_.isUndefined(this.options.onEditorRender) &&
       _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }

    // Mediated events for *this* Editor instance
    this.mediator = Object.assign({}, Events);

    this._bindFunctions();

    config.instances.push(this);

    this.build();

    FormEvents.bindFormSubmit(this.$form);
  },

  /*
   * Build the Editor instance.
   * Check to see if we've been passed JSON already, and if not try and
   * create a default block.
   * If we have JSON then we need to build all of our blocks from this.
   */
  build: function() {
    this.$el.hide();

    this.errorHandler = new ErrorHandler(this.$outer, this.mediator, this.options.errorsContainer);
    this.store = new EditorStore(this.$el.val(), this.mediator);
    this.block_manager = new BlockManager(this.options, this.ID, this.mediator);
    this.block_controls = new BlockControls(this.block_manager.blockTypes, this.mediator);
    this.fl_block_controls = new FloatingBlockControls(this.$wrapper, this.ID, this.mediator);
    this.formatBar = new FormatBar(this.options.formatBar, this.mediator);

    this.mediator.on('block:changePosition', this.changeBlockPosition);
    this.mediator.on('block-controls:reset', this.resetBlockControls);
    this.mediator.on('block:limitReached', this.blockLimitReached);
    this.mediator.on('block:render', this.renderBlock);

    this.dataStore = "Please use store.retrieve();";

    this._setEvents();

    this.$wrapper.prepend(this.fl_block_controls.render().$el);
    $(document.body).append(this.formatBar.render().$el);
    this.$outer.append(this.block_controls.render().$el);

    $(window).bind('click', this.hideAllTheThings);

    this.createBlocks();
    this.$wrapper.addClass('st-ready');

    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  createBlocks: function() {
    var store = this.store.retrieve();

    if (store.data.length > 0) {
      store.data.forEach(function(block) {
        this.mediator.trigger('block:create', block.type, block.data);
      }, this);
    } else if (this.options.defaultType !== false) {
      this.mediator.trigger('block:create', this.options.defaultType, {});
    }
  },

  destroy: function() {
    // Destroy the rendered sub views
    this.formatBar.destroy();
    this.fl_block_controls.destroy();
    this.block_controls.destroy();

    // Destroy all blocks
    this.blocks.forEach(function(block) {
      this.mediator.trigger('block:remove', this.block.blockID);
    }, this);

    // Stop listening to events
    this.mediator.stopListening();
    this.stopListening();

    // Remove instance
    config.instances = config.instances.filter(function(instance) {
      return instance.ID !== this.ID;
    }, this);

    // Clear the store
    this.store.reset();
    this.$outer.replaceWith(this.$el.detach());
  },

  reinitialize: function(options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  resetBlockControls: function() {
    this.block_controls.renderInContainer(this.$wrapper);
    this.block_controls.hide();
  },

  blockLimitReached: function(toggle) {
    this.$wrapper.toggleClass('st--block-limit-reached', toggle);
  },

  _setEvents: function() {
    Object.keys(this.events).forEach(function(type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    this.block_controls.hide();
    this.formatBar.hide();
  },

  store: function(method, options){
    utils.log("The store method has been removed, please call store[methodName]");
    return this.store[method].call(this, options || {});
  },

  renderBlock: function(block) {
    this._renderInPosition(block.render().$el);
    this.hideAllTheThings();
    this.scrollTo(block.$el);

    block.trigger("onRender");
  },

  scrollTo: function(element) {
    $('html, body').animate({ scrollTop: element.position().top }, 300, "linear");
  },

  removeBlockDragOver: function() {
    this.$outer.find('.st-drag-over').removeClass('st-drag-over');
  },

  changeBlockPosition: function($block, selectedPosition) {
    selectedPosition = selectedPosition - 1;

    var blockPosition = this.getBlockPosition($block),
    $blockBy = this.$wrapper.find('.st-block').eq(selectedPosition);

    var where = (blockPosition > selectedPosition) ? "Before" : "After";

    if($blockBy && $blockBy.attr('id') !== $block.attr('id')) {
      this.hideAllTheThings();
      $block["insert" + where]($blockBy);
      this.scrollTo($block);
    }
  },

  _renderInPosition: function(block) {
    if (this.block_controls.currentContainer) {
      this.block_controls.currentContainer.after(block);
    } else {
      this.$wrapper.append(block);
    }
  },

  validateAndSaveBlock: function(block, shouldValidate) {
    if ((!config.skipValidation || shouldValidate) && !block.valid()) {
      this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
      utils.log("Block " + block.blockID + " failed validation");
      return;
    }

    var blockData = block.getData();
    utils.log("Adding data for block " + block.blockID + " to block store:",
              blockData);
    this.store.addData(blockData);
  },

  /*
   * Handle a form submission of this Editor instance.
   * Validate all of our blocks, and serialise all data onto the JSON objects
   */
  onFormSubmit: function(shouldValidate) {
    // if undefined or null or anything other than false - treat as true
    shouldValidate = (shouldValidate === false) ? false : true;

    utils.log("Handling form submission for Editor " + this.ID);

    this.mediator.trigger('errors:reset');
    this.store.reset();

    this.validateBlocks(shouldValidate);
    this.block_manager.validateBlockTypesExist(shouldValidate);

    this.mediator.trigger('errors:render');
    this.$el.val(this.store.toString());

    return this.errorHandler.errors.length;
  },

  validateBlocks: function(shouldValidate) {
    var self = this;
    this.$wrapper.find('.st-block').each(function(idx, block) {
      var _block = self.block_manager.findBlockById($(block).attr('id'));
      if (!_.isUndefined(_block)) {
        self.validateAndSaveBlock(_block, shouldValidate);
      }
    });
  },

  findBlockById: function(block_id) {
    return this.block_manager.findBlockById(block_id);
  },

  getBlocksByType: function(block_type) {
    return this.block_manager.getBlocksByType(block_type);
  },

  getBlocksByIDs: function(block_ids) {
    return this.block_manager.getBlocksByIDs(block_ids);
  },

  getBlockPosition: function($block) {
    return this.$wrapper.find('.st-block').index($block);
  },

  _ensureAndSetElements: function() {
    if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
      utils.log("You must provide an el");
      return false;
    }

    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');

    var $outer = $("<div>").attr({ 'id': this.ID, 'class': 'st-outer', 'dropzone': 'copy link move' });
    var $wrapper = $("<div>").attr({ 'class': 'st-blocks' });

    // Wrap our element in lots of containers *eww*
    this.$el.wrap($outer).wrap($wrapper);

    this.$outer = this.$form.find('#' + this.ID);
    this.$wrapper = this.$outer.find('.st-blocks');

    return true;
  }

});

module.exports = Editor;



},{"./block-controls":135,"./block-manager":137,"./config":158,"./error-handler":160,"./event-bus":161,"./events":162,"./extensions/editor-store":163,"./floating-block-controls":166,"./form-events":167,"./format-bar":168,"./function-bind":171,"./lodash":176,"./utils":182}],160:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var ErrorHandler = function($wrapper, mediator, container) {
  this.$wrapper = $wrapper;
  this.mediator = mediator;
  this.$el = container;

  if (_.isUndefined(this.$el)) {
    this._ensureElement();
    this.$wrapper.prepend(this.$el);
  }

  this.$el.hide();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(ErrorHandler.prototype, require('./function-bind'), require('./mediated-events'), require('./renderable'), {

  errors: [],
  className: "st-errors",
  eventNamespace: 'errors',

  mediatedEvents: {
    'reset': 'reset',
    'add': 'addMessage',
    'render': 'render'
  },

  initialize: function() {
    var $list = $("<ul>");
    this.$el.append("<p>" + i18n.t("errors:title") + "</p>")
    .append($list);
    this.$list = $list;
  },

  render: function() {
    if (this.errors.length === 0) { return false; }
    this.errors.forEach(this.createErrorItem, this);
    this.$el.show();
  },

  createErrorItem: function(error) {
    var $error = $("<li>", { class: "st-errors__msg", html: error.text });
    this.$list.append($error);
  },

  addMessage: function(error) {
    this.errors.push(error);
  },

  reset: function() {
    if (this.errors.length === 0) { return false; }
    this.errors = [];
    this.$list.html('');
    this.$el.hide();
  }

});

module.exports = ErrorHandler;


},{"./function-bind":171,"./lodash":176,"./mediated-events":177,"./renderable":178}],161:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./events'));

},{"./events":162}],162:[function(require,module,exports){
"use strict";

module.exports = require('eventablejs');

},{"eventablejs":3}],163:[function(require,module,exports){
"use strict";

/*
 * Sir Trevor Editor Store
 * By default we store the complete data on the instances $el
 * We can easily extend this and store it on some server or something
 */

var _ = require('../lodash');
var utils = require('../utils');


var EditorStore = function(data, mediator) {
  this.mediator = mediator;
  this.initialize(data ? data.trim() : '');
};

Object.assign(EditorStore.prototype, {

  initialize: function(data) {
    this.store = this._parseData(data) || { data: [] };
  },

  retrieve: function() {
    return this.store;
  },

  toString: function(space) {
    return JSON.stringify(this.store, undefined, space);
  },

  reset: function() {
    utils.log("Resetting the EditorStore");
    this.store = { data: [] };
  },

  addData: function(data) {
    this.store.data.push(data);
    return this.store;
  },

  _parseData: function(data) {
    var result;

    if (data.length === 0) { return result; }

    try {
      // Ensure the JSON string has a data element that's an array
      var jsonStr = JSON.parse(data);
      if (!_.isUndefined(jsonStr.data)) {
        result = jsonStr;
      }
    } catch(e) {
      this.mediator.trigger(
        'errors:add',
        { text: i18n.t("errors:load_fail") });

      this.mediator.trigger('errors:render');

      console.log('Sorry there has been a problem with parsing the JSON');
      console.log(e);
    }

    return result;
  }

});

module.exports = EditorStore;

},{"../lodash":176,"../utils":182}],164:[function(require,module,exports){
"use strict";

/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var EventBus = require('../event-bus');

module.exports = function(block, file, success, error) {

  EventBus.trigger('onUploadStart');

  var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();

  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);

  block.resetMessages();

  var callbackSuccess = function(data) {
    utils.log('Upload callback called');
    EventBus.trigger('onUploadStop');

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(block, arguments);
    }
  };

  var callbackError = function(jqXHR, status, errorThrown) {
    utils.log('Upload callback error called');
    EventBus.trigger('onUploadStop');

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.call(block, status);
    }
  };

  var xhr = $.ajax({
    url: config.defaults.uploadUrl,
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    dataType: 'json',
    type: 'POST'
  });

  block.addQueuedItem(uid, xhr);

  xhr.done(callbackSuccess)
     .fail(callbackError)
     .always(block.removeQueuedItem.bind(block, uid));

  return xhr;
};

},{"../config":158,"../event-bus":161,"../lodash":176,"../utils":182}],165:[function(require,module,exports){
"use strict";

/*
 * SirTrevor.Submittable
 * --
 * We need a global way of setting if the editor can and can't be submitted,
 * and a way to disable the submit button and add messages (when appropriate)
 * We also need this to be highly extensible so it can be overridden.
 * This will be triggered *by anything* so it needs to subscribe to events.
 */


var utils = require('../utils');

var EventBus = require('../event-bus');

var Submittable = function($form) {
  this.$form = $form;
  this.intialize();
};

Object.assign(Submittable.prototype, {

  intialize: function(){
    this.submitBtn = this.$form.find("input[type='submit']");

    var btnTitles = [];

    this.submitBtn.each(function(i, btn){
      btnTitles.push($(btn).attr('value'));
    });

    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },

  setSubmitButton: function(e, message) {
    this.submitBtn.attr('value', message);
  },

  resetSubmitButton: function(){
    var titles = this.submitBtnTitles;
    this.submitBtn.each(function(index, item) {
      $(item).attr('value', titles[index]);
    });
  },

  onUploadStart: function(e){
    this.globalUploadCount++;
    utils.log('onUploadStart called ' + this.globalUploadCount);

    if(this.globalUploadCount === 1) {
      this._disableSubmitButton();
    }
  },

  onUploadStop: function(e) {
    this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;

    utils.log('onUploadStop called ' + this.globalUploadCount);

    if(this.globalUploadCount === 0) {
      this._enableSubmitButton();
    }
  },

  onError: function(e){
    utils.log('onError called');
    this.canSubmit = false;
  },

  _disableSubmitButton: function(message){
    this.setSubmitButton(null, message || i18n.t("general:wait"));
    this.submitBtn
    .attr('disabled', 'disabled')
    .addClass('disabled');
  },

  _enableSubmitButton: function(){
    this.resetSubmitButton();
    this.submitBtn
    .removeAttr('disabled')
    .removeClass('disabled');
  },

  _events : {
    "disableSubmitButton" : "_disableSubmitButton",
    "enableSubmitButton"  : "_enableSubmitButton",
    "setSubmitButton"     : "setSubmitButton",
    "resetSubmitButton"   : "resetSubmitButton",
    "onError"             : "onError",
    "onUploadStart"       : "onUploadStart",
    "onUploadStop"        : "onUploadStop"
  },

  _bindEvents: function(){
    Object.keys(this._events).forEach(function(type) {
      EventBus.on(type, this[this._events[type]], this);
    }, this);
  }

});

module.exports = Submittable;


},{"../event-bus":161,"../utils":182}],166:[function(require,module,exports){
"use strict";

/*
   SirTrevor Floating Block Controls
   --
   Draws the 'plus' between blocks
   */

var _ = require('./lodash');

var EventBus = require('./event-bus');

var FloatingBlockControls = function(wrapper, instance_id, mediator) {
  this.$wrapper = wrapper;
  this.instance_id = instance_id;
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(FloatingBlockControls.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  className: "st-block-controls__top",

  attributes: function() {
    return {
      'data-icon': 'add'
    };
  },

  bound: ['handleBlockMouseOut', 'handleBlockMouseOver', 'handleBlockClick', 'onDrop'],

  initialize: function() {
    this.$el.on('click', this.handleBlockClick)
    .dropArea()
    .bind('drop', this.onDrop);

    this.$wrapper.on('mouseover', '.st-block', this.handleBlockMouseOver)
    .on('mouseout', '.st-block', this.handleBlockMouseOut)
    .on('click', '.st-block--with-plus', this.handleBlockClick);
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.$el,
    item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
    block = $('#' + item_id);

    if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
          dropped_on.attr('id') !== item_id &&
            this.instance_id === block.attr('data-instance')
       ) {
         dropped_on.after(block);
       }

       EventBus.trigger("block:reorder:dropped", item_id);
  },

  handleBlockMouseOver: function(e) {
    var block = $(e.currentTarget);

    if (!block.hasClass('st-block--with-plus')) {
      block.addClass('st-block--with-plus');
    }
  },

  handleBlockMouseOut: function(e) {
    var block = $(e.currentTarget);

    if (block.hasClass('st-block--with-plus')) {
      block.removeClass('st-block--with-plus');
    }
  },

  handleBlockClick: function(e) {
    e.stopPropagation();
    this.mediator.trigger('block-controls:render', $(e.currentTarget));
  }

});

module.exports = FloatingBlockControls;

},{"./event-bus":161,"./events":162,"./function-bind":171,"./lodash":176,"./renderable":178}],167:[function(require,module,exports){
"use strict";

var config = require('./config');
var utils = require('./utils');

var EventBus = require('./event-bus');
var Submittable = require('./extensions/submittable');

var formBound = false; // Flag to tell us once we've bound our submit event

var FormEvents = {
  bindFormSubmit: function(form) {
    if (!formBound) {
      // XXX: should we have a formBound and submittable per-editor?
      // telling JSHint to ignore as it'll complain we shouldn't be creating
      // a new object, but otherwise `this` won't be set in the Submittable
      // initialiser. Bit weird.
      new Submittable(form); // jshint ignore:line
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  },

  onBeforeSubmit: function(shouldValidate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    config.instances.forEach(function(inst, i) {
      errors += inst.onFormSubmit(shouldValidate);
    });
    utils.log("Total errors: " + errors);

    return errors;
  },

  onFormSubmit: function(ev) {
    var errors = FormEvents.onBeforeSubmit();

    if(errors > 0) {
      EventBus.trigger("onError");
      ev.preventDefault();
    }
  },
};

module.exports = FormEvents;

},{"./config":158,"./event-bus":161,"./extensions/submittable":165,"./utils":182}],168:[function(require,module,exports){
"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */

var _ = require('./lodash');

var config = require('./config');
var Formatters = require('./formatters');

var FormatBar = function(options, mediator) {
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize.apply(this, arguments);
};

Object.assign(FormatBar.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), require('./renderable'), {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick", "renderBySelection", "hide"],

  eventNamespace: 'formatter',

  mediatedEvents: {
    'position': 'renderBySelection',
    'show': 'show',
    'hide': 'hide'
  },

  initialize: function() {
    var formatName, format, btn;
    this.$btns = [];

    for (formatName in Formatters) {
      if (Formatters.hasOwnProperty(formatName)) {
        format = Formatters[formatName];
        btn = $("<button>", {
          'class': 'st-format-btn st-format-btn--' + formatName + ' ' + (format.iconName ? 'st-icon' : ''),
          'text': format.text,
          'data-type': formatName,
          'data-cmd': format.cmd
        });

        this.$btns.push(btn);
        btn.appendTo(this.$el);
      }
    }

    this.$b = $(document);
    this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
  },

  hide: function() {
    this.$el.removeClass('st-format-bar--is-ready');
  },

  show: function() {
    this.$el.addClass('st-format-bar--is-ready');
  },

  remove: function(){ this.$el.remove(); },

  renderBySelection: function() {

    var selection = window.getSelection(),
    range = selection.getRangeAt(0),
    boundary = range.getBoundingClientRect(),
    coords = {};

    coords.top = boundary.top + 20 + window.pageYOffset - this.$el.height() + 'px';
    coords.left = ((boundary.left + boundary.right) / 2) - (this.$el.width() / 2) + 'px';

    this.highlightSelectedButtons();
    this.show();

    this.$el.css(coords);
  },

  highlightSelectedButtons: function() {
    var formatter;
    this.$btns.forEach(function($btn) {
      formatter = Formatters[$btn.attr('data-type')];
      $btn.toggleClass("st-format-btn--is-active",
                       formatter.isActive());
    }, this);
  },

  onFormatButtonClick: function(ev){
    ev.stopPropagation();

    var btn = $(ev.target),
    format = Formatters[btn.attr('data-type')];

    if (_.isUndefined(format)) {
      return false;
    }

    // Do we have a click function defined on this formatter?
    if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
      format.onClick(); // Delegate
    } else {
      // Call default
      document.execCommand(btn.attr('data-cmd'), false, format.param);
    }

    this.highlightSelectedButtons();
    return false;
  }

});

module.exports = FormatBar;

},{"./config":158,"./events":162,"./formatters":170,"./function-bind":171,"./lodash":176,"./mediated-events":177,"./renderable":178}],169:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var Formatter = function(options){
  this.formatId = _.uniqueId('format-');
  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

var formatOptions = ["title", "className", "cmd", "keyCode", "param", "onClick", "toMarkdown", "toHTML"];

Object.assign(Formatter.prototype, {

  title: '',
  className: '',
  cmd: null,
  keyCode: null,
  param: null,

  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  initialize: function(){},

  _configure: function(options) {
    if (this.options) {
      options = Object.assign({}, this.options, options);
    }
    for (var i = 0, l = formatOptions.length; i < l; i++) {
      var attr = formatOptions[i];
      if (options[attr]) {
        this[attr] = options[attr];
      }
    }
    this.options = options;
  },

  isActive: function() {
    return document.queryCommandState(this.cmd);
  },

  _bindToBlock: function(block) {
    var formatter = this,
    ctrlDown = false;

    block
    .on('keyup','.st-text-block', function(ev) {
      if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
        ctrlDown = false;
      }
    })
    .on('keydown','.st-text-block', { formatter: formatter }, function(ev) {
      if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
        ctrlDown = true;
      }

      if(ev.which === ev.data.formatter.keyCode && ctrlDown === true) {
        document.execCommand(ev.data.formatter.cmd, false, true);
        ev.preventDefault();
        ctrlDown = false;
      }
    });
  }
});

// Allow our Formatters to be extended.
Formatter.extend = require('./helpers/extend');

module.exports = Formatter;

},{"./helpers/extend":173,"./lodash":176}],170:[function(require,module,exports){
"use strict";

/* Our base formatters */

var Formatter = require('./formatter');

var Bold = Formatter.extend({
  title: "bold",
  cmd: "bold",
  keyCode: 66,
  text : "B"
});

var Italic = Formatter.extend({
  title: "italic",
  cmd: "italic",
  keyCode: 73,
  text : "i"
});

var Link = Formatter.extend({

  title: "link",
  iconName: "link",
  cmd: "CreateLink",
  text : "link",

  onClick: function() {

    var link = window.prompt(i18n.t("general:link")),
    link_regex = /((ftp|http|https):\/\/.)|mailto(?=\:[-\.\w]+@)/;

    if(link && link.length > 0) {

      if (!link_regex.test(link)) {
        link = "http://" + link;
      }

      document.execCommand(this.cmd, false, link);
    }
  },

  isActive: function() {
    var selection = window.getSelection(),
    node;

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
      .startContainer
      .parentNode;
    }

    return (node && node.nodeName === "A");
  }
});

var UnLink = Formatter.extend({
  title: "unlink",
  iconName: "link",
  cmd: "unlink",
  text : "link"
});


exports.Bold = new Bold();
exports.Italic = new Italic();
exports.Link = new Link();
exports.Unlink = new UnLink();

},{"./formatter":169}],171:[function(require,module,exports){
"use strict";

/* Generic function binding utility, used by lots of our classes */

module.exports = {
  bound: [],
  _bindFunctions: function(){
    this.bound.forEach(function(f) {
      this[f] = this[f].bind(this);
    }, this);
  }
};


},{}],172:[function(require,module,exports){
"use strict";

/*
 * Drop Area Plugin from @maccman
 * http://blog.alexmaccaw.com/svbtle-image-uploading
 * --
 * Tweaked so we use the parent class of dropzone
 */


function dragEnter(e) {
  e.preventDefault();
}

function dragOver(e) {
  e.originalEvent.dataTransfer.dropEffect = "copy";
  $(e.currentTarget).addClass('st-drag-over');
  e.preventDefault();
}

function dragLeave(e) {
  $(e.currentTarget).removeClass('st-drag-over');
  e.preventDefault();
}

$.fn.dropArea = function(){
  this.bind("dragenter", dragEnter).
    bind("dragover",  dragOver).
    bind("dragleave", dragLeave);
  return this;
};

$.fn.noDropArea = function(){
  this.unbind("dragenter").
    unbind("dragover").
    unbind("dragleave");
  return this;
};

$.fn.caretToEnd = function(){
  var range,selection;

  range = document.createRange();
  range.selectNodeContents(this[0]);
  range.collapse(false);

  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return this;
};


},{}],173:[function(require,module,exports){
"use strict";

/*
  Backbone Inheritence 
  --
  From: https://github.com/documentcloud/backbone/blob/master/backbone.js
  Backbone.js 0.9.2
  (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
*/

module.exports = function(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  Object.assign(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate; // jshint ignore:line

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) {
    Object.assign(child.prototype, protoProps);
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

},{}],174:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

require('es6-shim'); // bundling in for the moment as support is very rare
require('./helpers/event'); // extends jQuery itself
require('./vendor/array-includes'); // shims ES7 Array.prototype.includes

var SirTrevor = {

  config: require('./config'),

  log: require('./utils').log,
  Locales: require('./locales'),

  Events: require('./events'),
  EventBus: require('./event-bus'),

  EditorStore: require('./extensions/editor-store'),
  Submittable: require('./extensions/submittable'),
  FileUploader: require('./extensions/file-uploader'),

  BlockMixins: require('./block_mixins'),
  BlockPositioner: require('./block-positioner'),
  BlockReorder: require('./block-reorder'),
  BlockDeletion: require('./block-deletion'),
  BlockValidations: require('./block-validations'),
  BlockStore: require('./block-store'),
  BlockManager: require('./block-manager'),

  SimpleBlock: require('./simple-block'),
  Block: require('./block'),
  Formatter: require('./formatter'),
  Formatters: require('./formatters'),

  Blocks: require('./blocks'),

  BlockControl: require('./block-control'),
  BlockControls: require('./block-controls'),
  FloatingBlockControls: require('./floating-block-controls'),

  FormatBar: require('./format-bar'),
  Editor: require('./editor'),

  toMarkdown: require('./to-markdown'),
  toHTML: require('./to-html'),

  setDefaults: function(options) {
    Object.assign(SirTrevor.config.defaults, options || {});
  },

  getInstance: function(identifier) {
    if (_.isUndefined(identifier)) {
      return this.config.instances[0];
    }

    if (_.isString(identifier)) {
      return this.config.instances.find(function(editor) {
        return editor.ID === identifier;
      });
    }

    return this.config.instances[identifier];
  },

  setBlockOptions: function(type, options) {
    var block = SirTrevor.Blocks[type];

    if (_.isUndefined(block)) {
      return;
    }

    Object.assign(block.prototype, options || {});
  },

  runOnAllInstances: function(method) {
    if (SirTrevor.Editor.prototype.hasOwnProperty(method)) {
      var methodArgs = Array.prototype.slice.call(arguments, 1);
      Array.prototype.forEach.call(SirTrevor.config.instances, function(i) {
        i[method].apply(null, methodArgs);
      });
    } else {
      SirTrevor.log("method doesn't exist");
    }
  },

};

Object.assign(SirTrevor, require('./form-events'));


module.exports = SirTrevor;

},{"./block":142,"./block-control":134,"./block-controls":135,"./block-deletion":136,"./block-manager":137,"./block-positioner":138,"./block-reorder":139,"./block-store":140,"./block-validations":141,"./block_mixins":147,"./blocks":152,"./config":158,"./editor":159,"./event-bus":161,"./events":162,"./extensions/editor-store":163,"./extensions/file-uploader":164,"./extensions/submittable":165,"./floating-block-controls":166,"./form-events":167,"./format-bar":168,"./formatter":169,"./formatters":170,"./helpers/event":172,"./locales":175,"./lodash":176,"./simple-block":179,"./to-html":180,"./to-markdown":181,"./utils":182,"./vendor/array-includes":183,"es6-shim":2}],175:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
  en: {
    general: {
      'delete':           'Delete?',
      'drop':             'Drag __block__ here',
      'paste':            'Or paste URL here',
      'upload':           '...or choose a file',
      'close':            'close',
      'position':         'Position',
      'wait':             'Please wait...',
      'link':             'Enter a link'
    },
    errors: {
      'title': "You have the following errors:",
      'validation_fail': "__type__ block is invalid",
      'block_empty': "__name__ must not be empty",
      'type_missing': "You must have a block of type __type__",
      'required_type_empty': "A required block type __type__ is empty",
      'load_fail': "There was a problem loading the contents of the document"
    },
    blocks: {
      text: {
        'title': "Text"
      },
      list: {
        'title': "List"
      },
      quote: {
        'title': "Quote",
        'credit_field': "Credit"
      },
      image: {
        'title': "Image",
        'upload_error': "There was a problem with your upload"
      },
      video: {
        'title': "Video"
      },
      tweet: {
        'title': "Tweet",
        'fetch_error': "There was a problem fetching your tweet"
      },
      embedly: {
        'title': "Embedly",
        'fetch_error': "There was a problem fetching your embed",
        'key_missing': "An Embedly API key must be present"
      },
      heading: {
        'title': "Heading"
      }
    }
  }
};

if (window.i18n === undefined) {
  // Minimal i18n stub that only reads the English strings
  utils.log("Using i18n stub");
  window.i18n = {
    t: function(key, options) {
      var parts = key.split(':'), str, obj, part, i;

      obj = Locales[config.language];

      for(i = 0; i < parts.length; i++) {
        part = parts[i];

        if(!_.isUndefined(obj[part])) {
          obj = obj[part];
        }
      }

      str = obj;

      if (!_.isString(str)) { return ""; }

      if (str.indexOf('__') >= 0) {
        Object.keys(options).forEach(function(opt) {
          str = str.replace('__' + opt + '__', options[opt]);
        });
      }

      return str;
    }
  };
} else {
  utils.log("Using i18next");
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({ resStore: Locales, fallbackLng: config.language,
            ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
  });
}

module.exports = Locales;

},{"./config":158,"./lodash":176,"./utils":182}],176:[function(require,module,exports){
"use strict";

exports.isEmpty = require('lodash.isempty');
exports.isFunction = require('lodash.isfunction');
exports.isObject = require('lodash.isobject');
exports.isString = require('lodash.isstring');
exports.isUndefined = require('lodash.isundefined');
exports.result = require('lodash.result');
exports.template = require('lodash.template');
exports.uniqueId = require('lodash.uniqueid');

},{"lodash.isempty":5,"lodash.isfunction":29,"lodash.isobject":30,"lodash.isstring":32,"lodash.isundefined":33,"lodash.result":34,"lodash.template":35,"lodash.uniqueid":51}],177:[function(require,module,exports){
"use strict";

module.exports = {
  mediatedEvents: {},
  eventNamespace: null,
  _bindMediatedEvents: function() {
    Object.keys(this.mediatedEvents).forEach(function(eventName){
      var cb = this.mediatedEvents[eventName];
      eventName = this.eventNamespace ?
        this.eventNamespace + ':' + eventName :
        eventName;
      this.mediator.on(eventName, this[cb].bind(this));
    }, this);
  }
};

},{}],178:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

module.exports = {
  tagName: 'div',
  className: 'sir-trevor__view',
  attributes: {},

  $: function(selector) {
    return this.$el.find(selector);
  },

  render: function() {
    return this;
  },

  destroy: function() {
    if (!_.isUndefined(this.stopListening)) { this.stopListening(); }
    this.$el.remove();
  },

  _ensureElement: function() {
    if (!this.el) {
      var attrs = Object.assign({}, _.result(this, 'attributes')),
      html;
      if (this.id) { attrs.id = this.id; }
      if (this.className) { attrs['class'] = this.className; }

      if (attrs.html) {
        html = attrs.html;
        delete attrs.html;
      }
      var $el = $('<' + this.tagName + '>').attr(attrs);
      if (html) { $el.html(html); }
      this._setElement($el);
    } else {
      this._setElement(this.el);
    }
  },

  _setElement: function(element) {
    this.$el = $(element);
    this.el = this.$el[0];
    return this;
  }
};


},{"./lodash":176}],179:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var BlockReorder = require('./block-reorder');

var SimpleBlock = function(data, instance_id, mediator, options) {
  this.createStore(data);
  this.blockID = _.uniqueId('st-block-');
  this.instanceID = instance_id;
  this.mediator = mediator;
  this.options = options;

  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

Object.assign(SimpleBlock.prototype, require('./function-bind'), require('./events'), require('./renderable'), require('./block-store'), {

  focus : function() {},

  valid : function() { return true; },

  className: 'st-block',

  block_template: _.template(
    "<div class='st-block__inner'><%= editor_html %></div>"
  ),

  attributes: function() {
    return {
      'id': this.blockID,
      'data-type': this.type,
      'data-instance': this.instanceID
    };
  },

  title: function() {
    return utils.titleize(this.type.replace(/[\W_]/g, ' '));
  },

  blockCSSClass: function() {
    this.blockCSSClass = utils.toSlug(this.type);
    return this.blockCSSClass;
  },

  type: '',

  class: function() {
    return utils.classify(this.type);
  },

  editorHTML: '',

  initialize: function() {},

  onBlockRender: function(){},
  beforeBlockRender: function(){},

  _setBlockInner : function() {
    var editor_html = _.result(this, 'editorHTML');

    this.$el.append(
      this.block_template({ editor_html: editor_html })
    );

    this.$inner = this.$el.find('.st-block__inner');
    this.$inner.bind('click mouseover', function(e){ e.stopPropagation(); });
  },

  render: function() {
    this.beforeBlockRender();

    this._setBlockInner();
    this._blockPrepare();

    return this;
  },

  _blockPrepare : function() {
    this._initUI();
    this._initMessages();

    this.checkAndLoadData();

    this.$el.addClass('st-item-ready');
    this.on("onRender", this.onBlockRender);
    this.save();
  },

  _withUIComponent: function(component, className, callback) {
    this.$ui.append(component.render().$el);
    if (className && callback) {
      this.$ui.on('click', className, callback);
    }
  },

  _initUI : function() {
    var ui_element = $("<div>", { 'class': 'st-block__ui' });
    this.$inner.append(ui_element);
    this.$ui = ui_element;
    this._initUIComponents();
  },

  _initMessages: function() {
    var msgs_element = $("<div>", { 'class': 'st-block__messages' });
    this.$inner.prepend(msgs_element);
    this.$messages = msgs_element;
  },

  addMessage: function(msg, additionalClass) {
    var $msg = $("<span>", { html: msg, class: "st-msg " + additionalClass });
    this.$messages.append($msg)
    .addClass('st-block__messages--is-visible');
    return $msg;
  },

  resetMessages: function() {
    this.$messages.html('')
    .removeClass('st-block__messages--is-visible');
  },

  _initUIComponents: function() {
    this._withUIComponent(new BlockReorder(this.$el));
  }

});

SimpleBlock.fn = SimpleBlock.prototype;

// Allow our Block to be extended.
SimpleBlock.extend = require('./helpers/extend');

module.exports = SimpleBlock;

},{"./block-reorder":139,"./block-store":140,"./events":162,"./function-bind":171,"./helpers/extend":173,"./lodash":176,"./renderable":178,"./utils":182}],180:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

module.exports = function(markdown, type) {

  // Deferring requiring these to sidestep a circular dependency:
  // Block -> this -> Blocks -> Block
  var Blocks = require('./blocks');
  var Formatters = require('./formatters');

  // MD -> HTML
  type = utils.classify(type);

  var html = markdown,
      shouldWrap = type === "Text";

  if(_.isUndefined(shouldWrap)) { shouldWrap = false; }

  if (shouldWrap) {
    html = "<div>" + html;
  }

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm,function(match, p1, p2){
    return "<a href='"+p2+"'>"+p1.replace(/\n/g, '')+"</a>";
  });

  // This may seem crazy, but because JS doesn't have a look behind,
  // we reverse the string to regex out the italic items (and bold)
  // and look for something that doesn't start (or end in the reversed strings case)
  // with a slash.
  html = utils.reverse(
           utils.reverse(html)
           .replace(/_(?!\\)((_\\|[^_])*)_(?=$|[^\\])/gm, function(match, p1) {
              return ">i/<"+ p1.replace(/\n/g, '').replace(/[\s]+$/,'') +">i<";
           })
           .replace(/\*\*(?!\\)((\*\*\\|[^\*\*])*)\*\*(?=$|[^\\])/gm, function(match, p1){
              return ">b/<"+ p1.replace(/\n/g, '').replace(/[\s]+$/,'') +">b<";
           })
          );

  html =  html.replace(/^\> (.+)$/mg,"$1");

  // Use custom formatters toHTML functions (if any exist)
  var formatName, format;
  for(formatName in Formatters) {
    if (Formatters.hasOwnProperty(formatName)) {
      format = Formatters[formatName];
      // Do we have a toHTML function?
      if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
        html = format.toHTML(html);
      }
    }
  }

  // Use custom block toHTML functions (if any exist)
  var block;
  if (Blocks.hasOwnProperty(type)) {
    block = Blocks[type];
    // Do we have a toHTML function?
    if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
      html = block.prototype.toHTML(html);
    }
  }

  if (shouldWrap) {
    html = html.replace(/\n\n/gm, "</div><div><br></div><div>");
    html = html.replace(/\n/gm, "</div><div>");
  }

  html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
             .replace(/\n/g, "<br>")
             .replace(/\*\*/, "")
             .replace(/__/, "");  // Cleanup any markdown characters left

  // Replace escaped
  html = html.replace(/\\\*/g, "*")
             .replace(/\\\[/g, "[")
             .replace(/\\\]/g, "]")
             .replace(/\\\_/g, "_")
             .replace(/\\\(/g, "(")
             .replace(/\\\)/g, ")")
             .replace(/\\\-/g, "-");

  if (shouldWrap) {
    html += "</div>";
  }

  return html;
};

},{"./blocks":152,"./formatters":170,"./lodash":176,"./utils":182}],181:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

module.exports = function(content, type) {

  // Deferring requiring these to sidestep a circular dependency:
  // Block -> this -> Blocks -> Block
  var Blocks = require('./blocks');
  var Formatters = require('./formatters');

  type = utils.classify(type);

  var markdown = content;

  //Normalise whitespace
  markdown = markdown.replace(/&nbsp;/g," ");

  // First of all, strip any additional formatting
  // MSWord, I'm looking at you, punk.
  markdown = markdown.replace(/( class=(")?Mso[a-zA-Z]+(")?)/g, '')
                     .replace(/<!--(.*?)-->/g, '')
                     .replace(/\/\*(.*?)\*\//g, '')
                     .replace(/<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, '');

  var badTags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'],
      tagStripper, i;

  for (i = 0; i< badTags.length; i++) {
    tagStripper = new RegExp('<'+badTags[i]+'.*?'+badTags[i]+'(.*?)>', 'gi');
    markdown = markdown.replace(tagStripper, '');
  }

  // Escape anything in here that *could* be considered as MD
  // Markdown chars we care about: * [] _ () -
  markdown = markdown.replace(/\*/g, "\\*")
                    .replace(/\[/g, "\\[")
                    .replace(/\]/g, "\\]")
                    .replace(/\_/g, "\\_")
                    .replace(/\(/g, "\\(")
                    .replace(/\)/g, "\\)")
                    .replace(/\-/g, "\\-");

  var inlineTags = ["em", "i", "strong", "b"];

  for (i = 0; i< inlineTags.length; i++) {
    tagStripper = new RegExp('<'+inlineTags[i]+'><br></'+inlineTags[i]+'>', 'gi');
    markdown = markdown.replace(tagStripper, '<br>');
  }

  function replaceBolds(match, p1, p2){
    if(_.isUndefined(p2)) { p2 = ''; }
    return "**" + p1.replace(/<(.)?br(.)?>/g, '') + "**" + p2;
  }

  function replaceItalics(match, p1, p2){
    if(_.isUndefined(p2)) { p2 = ''; }
    return "_" + p1.replace(/<(.)?br(.)?>/g, '') + "_" + p2;
  }

  markdown = markdown.replace(/<(\w+)(?:\s+\w+="[^"]+(?:"\$[^"]+"[^"]+)?")*>\s*<\/\1>/gim, '') //Empty elements
                      .replace(/\n/mg,"")
                      .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/gim, function(match, p1, p2){
                        return "[" + p2.trim().replace(/<(.)?br(.)?>/g, '') + "]("+ p1 +")";
                      }) // Hyperlinks
                      .replace(/<strong>(?:\s*)(.*?)(\s)*?<\/strong>/gim, replaceBolds)
                      .replace(/<b>(?:\s*)(.*?)(\s*)?<\/b>/gim, replaceBolds)
                      .replace(/<em>(?:\s*)(.*?)(\s*)?<\/em>/gim, replaceItalics)
                      .replace(/<i>(?:\s*)(.*?)(\s*)?<\/i>/gim, replaceItalics);


  // Use custom formatters toMarkdown functions (if any exist)
  var formatName, format;
  for(formatName in Formatters) {
    if (Formatters.hasOwnProperty(formatName)) {
      format = Formatters[formatName];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(format.toMarkdown) && _.isFunction(format.toMarkdown)) {
        markdown = format.toMarkdown(markdown);
      }
    }
  }

  // Do our generic stripping out
  markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n$2")                                 // Divitis style line breaks (handle the first line)
                 .replace(/<div><div>/g,'\n<div>')                                         // ^ (double opening divs with one close from Chrome)
                 .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n")                            // ^ (handle nested divs that start with content)
                 .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n")        // ^ (handle content inside divs)
                 .replace(/<\/p>/g,"\n\n")                                               // P tags as line breaks
                 .replace(/<(.)?br(.)?>/g,"\n")                                            // Convert normal line breaks
                 .replace(/&lt;/g,"<").replace(/&gt;/g,">");                                 // Encoding

  // Use custom block toMarkdown functions (if any exist)
  var block;
  if (Blocks.hasOwnProperty(type)) {
    block = Blocks[type];
    // Do we have a toMarkdown function?
    if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
      markdown = block.prototype.toMarkdown(markdown);
    }
  }

  // Strip remaining HTML
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");

  return markdown;
};

},{"./blocks":152,"./formatters":170,"./lodash":176,"./utils":182}],182:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var config = require('./config');

var urlRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

var utils = {
  log: function() {
    if (!_.isUndefined(console) && config.debug) {
      console.log.apply(console, arguments);
    }
  },

  isURI : function(string) {
    return (urlRegex.test(string));
  },

  titleize: function(str){
    if (str === null) {
      return '';
    }
    str  = String(str).toLowerCase();
    return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
  },

  classify: function(str){
    return utils.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
  },

  capitalize : function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },

  flatten: function(obj) {
    var x = {};
    (Array.isArray(obj) ? obj : Object.keys(obj)).forEach(function (i) {
      x[i] = true;
    });
    return x;
  },

  underscored: function(str){
    return str.trim().replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
    .replace(/[-\s]+/g, '_').toLowerCase();
  },

  reverse: function(str) {
    return str.split("").reverse().join("");
  },

  toSlug: function(str) {
    return str
    .toLowerCase()
    .replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-');
  }

};

module.exports = utils;

},{"./config":158,"./lodash":176}],183:[function(require,module,exports){
"use strict";

// jshint freeze: false

if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    if (this === undefined || this === null) {
      throw new TypeError('Cannot convert this value to object');
    }
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    while (k < len) {
      var currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczYtc2hpbS9lczYtc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGFibGVqcy9ldmVudGFibGUuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL25vZGVfbW9kdWxlcy9sb2Rhc2guX2lzbmF0aXZlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9ub2RlX21vZHVsZXMvbG9kYXNoLm5vb3AvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NsaWNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmlkZW50aXR5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLnN1cHBvcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fb2JqZWN0dHlwZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9ub2RlX21vZHVsZXMvbG9kYXNoLl9zaGlta2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNmdW5jdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNvYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzc3RyaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc3VuZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gucmVzdWx0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZXNjYXBlc3RyaW5nY2hhci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmVpbnRlcnBvbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5kZWZhdWx0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL25vZGVfbW9kdWxlcy9sb2Rhc2guX2VzY2FwZWh0bWxjaGFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9lc2NhcGVodG1sY2hhci9ub2RlX21vZHVsZXMvbG9kYXNoLl9odG1sZXNjYXBlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmV1bmVzY2FwZWRodG1sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlc2V0dGluZ3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2gudmFsdWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC51bmlxdWVpZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9hcnJheXMvZmxhdHRlbi5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9hcnJheXMvbGFzdC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9hcnJheXMvcHVsbC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9jb2xsZWN0aW9ucy9jb250YWlucy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9jb2xsZWN0aW9ucy9tYXAuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vY29sbGVjdGlvbnMvdG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9mdW5jdGlvbnMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9mdW5jdGlvbnMvY3JlYXRlQ2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2FycmF5UG9vbC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvYmFzZUJpbmQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2Jhc2VDcmVhdGUuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2Jhc2VDcmVhdGVDYWxsYmFjay5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvYmFzZUNyZWF0ZVdyYXBwZXIuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2Jhc2VGbGF0dGVuLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL2ludGVybmFscy9iYXNlSW5kZXhPZi5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvYmFzZUlzRXF1YWwuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2NyZWF0ZVdyYXBwZXIuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2VzY2FwZUh0bWxDaGFyLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL2ludGVybmFscy9nZXRBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvaHRtbEVzY2FwZXMuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL2lzTmF0aXZlLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL2ludGVybmFscy9tYXhQb29sU2l6ZS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvb2JqZWN0VHlwZXMuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL3JlVW5lc2NhcGVkSHRtbC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvcmVsZWFzZUFycmF5LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL2ludGVybmFscy9zZXRCaW5kRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9pbnRlcm5hbHMvc2hpbUtleXMuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vaW50ZXJuYWxzL3NsaWNlLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL29iamVjdHMvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL29iamVjdHMvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vb2JqZWN0cy9mb3JJbi5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9vYmplY3RzL2Zvck93bi5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9vYmplY3RzL2lzQXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL29iamVjdHMvaXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9vYmplY3RzL2lzRnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vb2JqZWN0cy9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9vYmplY3RzL2lzU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL29iamVjdHMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9vYmplY3RzL3ZhbHVlcy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL25vZGVfbW9kdWxlcy9sb2Rhc2gtYW1kL21vZGVybi9zdXBwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL3V0aWxpdGllcy9lc2NhcGUuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9ub2RlX21vZHVsZXMvbG9kYXNoLWFtZC9tb2Rlcm4vdXRpbGl0aWVzL2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL3V0aWxpdGllcy9ub29wLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivbm9kZV9tb2R1bGVzL2xvZGFzaC1hbWQvbW9kZXJuL3V0aWxpdGllcy9wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9hcGkuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvYXBpL2NvbW1hbmQtcGF0Y2guanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvYXBpL2NvbW1hbmQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvYXBpL25vZGUuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvYXBpL3NlbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9hcGkvc2ltcGxlLWNvbW1hbmQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvZG9tLW9ic2VydmVyLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL2VsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvZXZlbnQtZW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9ub2RlLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9jb21tYW5kcy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvY29tbWFuZHMvaW5kZW50LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9jb21tYW5kcy9pbnNlcnQtbGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvY29tbWFuZHMvb3V0ZGVudC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvY29tbWFuZHMvcmVkby5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvY29tbWFuZHMvc3Vic2NyaXB0LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9jb21tYW5kcy9zdXBlcnNjcmlwdC5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvY29tbWFuZHMvdW5kby5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9mb3JtYXR0ZXJzL2h0bWwvZW5mb3JjZS1wLWVsZW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9mb3JtYXR0ZXJzL2h0bWwvZW5zdXJlLXNlbGVjdGFibGUtY29udGFpbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvZm9ybWF0dGVycy9odG1sL3JlcGxhY2UtbmJzcC1jaGFycy5qcyIsIm5vZGVfbW9kdWxlcy9zY3JpYmUtZWRpdG9yL3NyYy9wbHVnaW5zL2NvcmUvZm9ybWF0dGVycy9wbGFpbi10ZXh0L2VzY2FwZS1odG1sLWNoYXJhY3RlcnMuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvcGx1Z2lucy9jb3JlL2lubGluZS1lbGVtZW50cy1tb2RlLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9wYXRjaGVzLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9wYXRjaGVzL2NvbW1hbmRzL2JvbGQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvcGx1Z2lucy9jb3JlL3BhdGNoZXMvY29tbWFuZHMvY3JlYXRlLWxpbmsuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvcGx1Z2lucy9jb3JlL3BhdGNoZXMvY29tbWFuZHMvaW5kZW50LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9wYXRjaGVzL2NvbW1hbmRzL2luc2VydC1odG1sLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9wYXRjaGVzL2NvbW1hbmRzL2luc2VydC1saXN0LmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9wYXRjaGVzL2NvbW1hbmRzL291dGRlbnQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvcGx1Z2lucy9jb3JlL3BhdGNoZXMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3BsdWdpbnMvY29yZS9zZXQtcm9vdC1wLWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvc2NyaWJlLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1lZGl0b3Ivc3JjL3RyYW5zYWN0aW9uLW1hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvc2NyaWJlLWVkaXRvci9zcmMvdW5kby1tYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL3NjcmliZS1wbHVnaW4tZm9ybWF0dGVyLXBsYWluLXRleHQtY29udmVydC1uZXctbGluZXMtdG8taHRtbC9zcmMvc2NyaWJlLXBsdWdpbi1mb3JtYXR0ZXItcGxhaW4tdGV4dC1jb252ZXJ0LW5ldy1saW5lcy10by1odG1sLmpzIiwibm9kZV9tb2R1bGVzL3NwaW4uanMvc3Bpbi5qcyIsInNyYy9ibG9jay1jb250cm9sLmpzIiwic3JjL2Jsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Jsb2NrLWRlbGV0aW9uLmpzIiwic3JjL2Jsb2NrLW1hbmFnZXIuanMiLCJzcmMvYmxvY2stcG9zaXRpb25lci5qcyIsInNyYy9ibG9jay1yZW9yZGVyLmpzIiwic3JjL2Jsb2NrLXN0b3JlLmpzIiwic3JjL2Jsb2NrLXZhbGlkYXRpb25zLmpzIiwic3JjL2Jsb2NrLmpzIiwic3JjL2Jsb2NrX21peGlucy9hamF4YWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvY29udHJvbGxhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy9kcm9wcGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2ZldGNoYWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvaW5kZXguanMiLCJzcmMvYmxvY2tfbWl4aW5zL3Bhc3RhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy91cGxvYWRhYmxlLmpzIiwic3JjL2Jsb2Nrcy9oZWFkaW5nLmpzIiwic3JjL2Jsb2Nrcy9pbWFnZS5qcyIsInNyYy9ibG9ja3MvaW5kZXguanMiLCJzcmMvYmxvY2tzL2xpc3QuanMiLCJzcmMvYmxvY2tzL3F1b3RlLmpzIiwic3JjL2Jsb2Nrcy90ZXh0LmpzIiwic3JjL2Jsb2Nrcy90d2VldC5qcyIsInNyYy9ibG9ja3MvdmlkZW8uanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2VkaXRvci5qcyIsInNyYy9lcnJvci1oYW5kbGVyLmpzIiwic3JjL2V2ZW50LWJ1cy5qcyIsInNyYy9ldmVudHMuanMiLCJzcmMvZXh0ZW5zaW9ucy9lZGl0b3Itc3RvcmUuanMiLCJzcmMvZXh0ZW5zaW9ucy9maWxlLXVwbG9hZGVyLmpzIiwic3JjL2V4dGVuc2lvbnMvc3VibWl0dGFibGUuanMiLCJzcmMvZmxvYXRpbmctYmxvY2stY29udHJvbHMuanMiLCJzcmMvZm9ybS1ldmVudHMuanMiLCJzcmMvZm9ybWF0LWJhci5qcyIsInNyYy9mb3JtYXR0ZXIuanMiLCJzcmMvZm9ybWF0dGVycy5qcyIsInNyYy9mdW5jdGlvbi1iaW5kLmpzIiwic3JjL2hlbHBlcnMvZXZlbnQuanMiLCJzcmMvaGVscGVycy9leHRlbmQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbG9jYWxlcy5qcyIsInNyYy9sb2Rhc2guanMiLCJzcmMvbWVkaWF0ZWQtZXZlbnRzLmpzIiwic3JjL3JlbmRlcmFibGUuanMiLCJzcmMvc2ltcGxlLWJsb2NrLmpzIiwic3JjL3RvLWh0bWwuanMiLCJzcmMvdG8tbWFya2Rvd24uanMiLCJzcmMvdXRpbHMuanMiLCJzcmMvdmVuZG9yL2FycmF5LWluY2x1ZGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5L0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjLycpO1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbiAvKiFcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltXG4gICogQGxpY2Vuc2UgZXM2LXNoaW0gQ29weXJpZ2h0IDIwMTMtMjAxNCBieSBQYXVsIE1pbGxlciAoaHR0cDovL3BhdWxtaWxsci5jb20pXG4gICogICBhbmQgY29udHJpYnV0b3JzLCAgTUlUIExpY2Vuc2VcbiAgKiBlczYtc2hpbTogdjAuMjEuMVxuICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAgKiBEZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvZXM2LXNoaW0vXG4gICovXG5cbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKVxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5yZXR1cm5FeHBvcnRzID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBpc0NhbGxhYmxlV2l0aG91dE5ldyA9IGZ1bmN0aW9uIChmdW5jKSB7XG4gICAgdHJ5IHsgZnVuYygpOyB9XG4gICAgY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgdmFyIHN1cHBvcnRzU3ViY2xhc3NpbmcgPSBmdW5jdGlvbiAoQywgZikge1xuICAgIC8qIGpzaGludCBwcm90bzp0cnVlICovXG4gICAgdHJ5IHtcbiAgICAgIHZhciBTdWIgPSBmdW5jdGlvbiAoKSB7IEMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICAgIGlmICghU3ViLl9fcHJvdG9fXykgeyByZXR1cm4gZmFsc2U7IC8qIHNraXAgdGVzdCBvbiBJRSA8IDExICovIH1cbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihTdWIsIEMpO1xuICAgICAgU3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQy5wcm90b3R5cGUsIHtcbiAgICAgICAgY29uc3RydWN0b3I6IHsgdmFsdWU6IEMgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZihTdWIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGFyZVByb3BlcnR5RGVzY3JpcHRvcnNTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3gnLCB7fSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7IC8qIHRoaXMgaXMgSUUgOC4gKi9cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHN0YXJ0c1dpdGhSZWplY3RzUmVnZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlamVjdHNSZWdleCA9IGZhbHNlO1xuICAgIGlmIChTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgICcvYS8nLnN0YXJ0c1dpdGgoL2EvKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogdGhpcyBpcyBzcGVjIGNvbXBsaWFudCAqL1xuICAgICAgICByZWplY3RzUmVnZXggPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVqZWN0c1JlZ2V4O1xuICB9O1xuXG4gIC8qanNoaW50IGV2aWw6IHRydWUgKi9cbiAgdmFyIGdldEdsb2JhbCA9IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXM7Jyk7XG4gIC8qanNoaW50IGV2aWw6IGZhbHNlICovXG5cbiAgdmFyIGdsb2JhbHMgPSBnZXRHbG9iYWwoKTtcbiAgdmFyIGdsb2JhbF9pc0Zpbml0ZSA9IGdsb2JhbHMuaXNGaW5pdGU7XG4gIHZhciBzdXBwb3J0c0Rlc2NyaXB0b3JzID0gISFPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgYXJlUHJvcGVydHlEZXNjcmlwdG9yc1N1cHBvcnRlZCgpO1xuICB2YXIgc3RhcnRzV2l0aElzQ29tcGxpYW50ID0gc3RhcnRzV2l0aFJlamVjdHNSZWdleCgpO1xuICB2YXIgX3NsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICB2YXIgX2luZGV4T2YgPSBGdW5jdGlvbi5jYWxsLmJpbmQoU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mKTtcbiAgdmFyIF90b1N0cmluZyA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcbiAgdmFyIF9oYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcbiAgdmFyIEFycmF5SXRlcmF0b3I7IC8vIG1ha2Ugb3VyIGltcGxlbWVudGF0aW9uIHByaXZhdGVcblxuICB2YXIgU3ltYm9sID0gZ2xvYmFscy5TeW1ib2wgfHwge307XG4gIHZhciBUeXBlID0ge1xuICAgIHN0cmluZzogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIF90b1N0cmluZyh4KSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7IH0sXG4gICAgcmVnZXg6IGZ1bmN0aW9uICh4KSB7IHJldHVybiBfdG9TdHJpbmcoeCkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nOyB9LFxuICAgIHN5bWJvbDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIC8qanNoaW50IG5vdHlwZW9mOiB0cnVlICovXG4gICAgICByZXR1cm4gdHlwZW9mIGdsb2JhbHMuU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB4ID09PSAnc3ltYm9sJztcbiAgICAgIC8qanNoaW50IG5vdHlwZW9mOiBmYWxzZSAqL1xuICAgIH1cbiAgfTtcblxuICB2YXIgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCB2YWx1ZSwgZm9yY2UpIHtcbiAgICBpZiAoIWZvcmNlICYmIG5hbWUgaW4gb2JqZWN0KSB7IHJldHVybjsgfVxuICAgIGlmIChzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3RbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRGVmaW5lIGNvbmZpZ3VyYWJsZSwgd3JpdGFibGUgYW5kIG5vbi1lbnVtZXJhYmxlIHByb3BzXG4gIC8vIGlmIHRoZXkgZG9u4oCZdCBleGlzdC5cbiAgdmFyIGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqZWN0LCBtYXApIHtcbiAgICBPYmplY3Qua2V5cyhtYXApLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBtZXRob2QgPSBtYXBbbmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIG1ldGhvZCwgZmFsc2UpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNpbXBsZSBzaGltIGZvciBPYmplY3QuY3JlYXRlIG9uIEVTMyBicm93c2Vyc1xuICAvLyAodW5saWtlIHJlYWwgc2hpbSwgbm8gYXR0ZW1wdCB0byBzdXBwb3J0IGBwcm90b3R5cGUgPT09IG51bGxgKVxuICB2YXIgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgZnVuY3Rpb24gVHlwZSgpIHt9XG4gICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZGVmaW5lUHJvcGVydGllcyhvYmplY3QsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xuXG4gIC8vIFRoaXMgaXMgYSBwcml2YXRlIG5hbWUgaW4gdGhlIGVzNiBzcGVjLCBlcXVhbCB0byAnW1N5bWJvbC5pdGVyYXRvcl0nXG4gIC8vIHdlJ3JlIGdvaW5nIHRvIHVzZSBhbiBhcmJpdHJhcnkgXy1wcmVmaXhlZCBuYW1lIHRvIG1ha2Ugb3VyIHNoaW1zXG4gIC8vIHdvcmsgcHJvcGVybHkgd2l0aCBlYWNoIG90aGVyLCBldmVuIHRob3VnaCB3ZSBkb24ndCBoYXZlIGZ1bGwgSXRlcmF0b3JcbiAgLy8gc3VwcG9ydC4gIFRoYXQgaXMsIGBBcnJheS5mcm9tKG1hcC5rZXlzKCkpYCB3aWxsIHdvcmssIGJ1dCB3ZSBkb24ndFxuICAvLyBwcmV0ZW5kIHRvIGV4cG9ydCBhIFwicmVhbFwiIEl0ZXJhdG9yIGludGVyZmFjZS5cbiAgdmFyICRpdGVyYXRvciQgPSBUeXBlLnN5bWJvbChTeW1ib2wuaXRlcmF0b3IpID8gU3ltYm9sLml0ZXJhdG9yIDogJ19lczYtc2hpbSBpdGVyYXRvcl8nO1xuICAvLyBGaXJlZm94IHNoaXBzIGEgcGFydGlhbCBpbXBsZW1lbnRhdGlvbiB1c2luZyB0aGUgbmFtZSBAQGl0ZXJhdG9yLlxuICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05MDcwNzcjYzE0XG4gIC8vIFNvIHVzZSB0aGF0IG5hbWUgaWYgd2UgZGV0ZWN0IGl0LlxuICBpZiAoZ2xvYmFscy5TZXQgJiYgdHlwZW9mIG5ldyBnbG9iYWxzLlNldCgpWydAQGl0ZXJhdG9yJ10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAkaXRlcmF0b3IkID0gJ0BAaXRlcmF0b3InO1xuICB9XG4gIHZhciBhZGRJdGVyYXRvciA9IGZ1bmN0aW9uIChwcm90b3R5cGUsIGltcGwpIHtcbiAgICBpZiAoIWltcGwpIHsgaW1wbCA9IGZ1bmN0aW9uIGl0ZXJhdG9yKCkgeyByZXR1cm4gdGhpczsgfTsgfVxuICAgIHZhciBvID0ge307XG4gICAgb1skaXRlcmF0b3IkXSA9IGltcGw7XG4gICAgZGVmaW5lUHJvcGVydGllcyhwcm90b3R5cGUsIG8pO1xuICAgIGlmICghcHJvdG90eXBlWyRpdGVyYXRvciRdICYmIFR5cGUuc3ltYm9sKCRpdGVyYXRvciQpKSB7XG4gICAgICAvLyBpbXBsZW1lbnRhdGlvbnMgYXJlIGJ1Z2d5IHdoZW4gJGl0ZXJhdG9yJCBpcyBhIFN5bWJvbFxuICAgICAgcHJvdG90eXBlWyRpdGVyYXRvciRdID0gaW1wbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gdGFrZW4gZGlyZWN0bHkgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbGpoYXJiL2lzLWFyZ3VtZW50cy9ibG9iL21hc3Rlci9pbmRleC5qc1xuICAvLyBjYW4gYmUgcmVwbGFjZWQgd2l0aCByZXF1aXJlKCdpcy1hcmd1bWVudHMnKSBpZiB3ZSBldmVyIHVzZSBhIGJ1aWxkIHByb2Nlc3MgaW5zdGVhZFxuICB2YXIgaXNBcmd1bWVudHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuICAgIHZhciBzdHIgPSBfdG9TdHJpbmcodmFsdWUpO1xuICAgIHZhciByZXN1bHQgPSBzdHIgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSBzdHIgIT09ICdbb2JqZWN0IEFycmF5XScgJiZcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICB0eXBlb2YgdmFsdWUubGVuZ3RoID09PSAnbnVtYmVyJyAmJlxuICAgICAgICB2YWx1ZS5sZW5ndGggPj0gMCAmJlxuICAgICAgICBfdG9TdHJpbmcodmFsdWUuY2FsbGVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgZW11bGF0ZUVTNmNvbnN0cnVjdCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgaWYgKCFFUy5UeXBlSXNPYmplY3QobykpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIG9iamVjdCcpOyB9XG4gICAgLy8gZXM1IGFwcHJveGltYXRpb24gdG8gZXM2IHN1YmNsYXNzIHNlbWFudGljczogaW4gZXM2LCAnbmV3IEZvbydcbiAgICAvLyB3b3VsZCBpbnZva2UgRm9vLkBAY3JlYXRlIHRvIGFsbG9jYXRpb24vaW5pdGlhbGl6ZSB0aGUgbmV3IG9iamVjdC5cbiAgICAvLyBJbiBlczUgd2UganVzdCBnZXQgdGhlIHBsYWluIG9iamVjdC4gIFNvIGlmIHdlIGRldGVjdCBhblxuICAgIC8vIHVuaW5pdGlhbGl6ZWQgb2JqZWN0LCBpbnZva2Ugby5jb25zdHJ1Y3Rvci5AQGNyZWF0ZVxuICAgIGlmICghby5fZXM2Y29uc3RydWN0KSB7XG4gICAgICBpZiAoby5jb25zdHJ1Y3RvciAmJiBFUy5Jc0NhbGxhYmxlKG8uY29uc3RydWN0b3JbJ0BAY3JlYXRlJ10pKSB7XG4gICAgICAgIG8gPSBvLmNvbnN0cnVjdG9yWydAQGNyZWF0ZSddKG8pO1xuICAgICAgfVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhvLCB7IF9lczZjb25zdHJ1Y3Q6IHRydWUgfSk7XG4gICAgfVxuICAgIHJldHVybiBvO1xuICB9O1xuXG4gIHZhciBFUyA9IHtcbiAgICBDaGVja09iamVjdENvZXJjaWJsZTogZnVuY3Rpb24gKHgsIG9wdE1lc3NhZ2UpIHtcbiAgICAgIC8qIGpzaGludCBlcW51bGw6dHJ1ZSAqL1xuICAgICAgaWYgKHggPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG9wdE1lc3NhZ2UgfHwgJ0Nhbm5vdCBjYWxsIG1ldGhvZCBvbiAnICsgeCk7XG4gICAgICB9XG4gICAgICByZXR1cm4geDtcbiAgICB9LFxuXG4gICAgVHlwZUlzT2JqZWN0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgLyoganNoaW50IGVxbnVsbDp0cnVlICovXG4gICAgICAvLyB0aGlzIGlzIGV4cGVuc2l2ZSB3aGVuIGl0IHJldHVybnMgZmFsc2U7IHVzZSB0aGlzIGZ1bmN0aW9uXG4gICAgICAvLyB3aGVuIHlvdSBleHBlY3QgaXQgdG8gcmV0dXJuIHRydWUgaW4gdGhlIGNvbW1vbiBjYXNlLlxuICAgICAgcmV0dXJuIHggIT0gbnVsbCAmJiBPYmplY3QoeCkgPT09IHg7XG4gICAgfSxcblxuICAgIFRvT2JqZWN0OiBmdW5jdGlvbiAobywgb3B0TWVzc2FnZSkge1xuICAgICAgcmV0dXJuIE9iamVjdChFUy5DaGVja09iamVjdENvZXJjaWJsZShvLCBvcHRNZXNzYWdlKSk7XG4gICAgfSxcblxuICAgIElzQ2FsbGFibGU6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gc29tZSB2ZXJzaW9ucyBvZiBJRSBzYXkgdGhhdCB0eXBlb2YgL2FiYy8gPT09ICdmdW5jdGlvbidcbiAgICAgICAgX3RvU3RyaW5nKHgpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH0sXG5cbiAgICBUb0ludDMyOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIHggPj4gMDtcbiAgICB9LFxuXG4gICAgVG9VaW50MzI6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4geCA+Pj4gMDtcbiAgICB9LFxuXG4gICAgVG9JbnRlZ2VyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIU51bWJlci5pc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH0sXG5cbiAgICBUb0xlbmd0aDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgbGVuID0gRVMuVG9JbnRlZ2VyKHZhbHVlKTtcbiAgICAgIGlmIChsZW4gPD0gMCkgeyByZXR1cm4gMDsgfSAvLyBpbmNsdWRlcyBjb252ZXJ0aW5nIC0wIHRvICswXG4gICAgICBpZiAobGVuID4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHsgcmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSOyB9XG4gICAgICByZXR1cm4gbGVuO1xuICAgIH0sXG5cbiAgICBTYW1lVmFsdWU6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICAvLyAwID09PSAtMCwgYnV0IHRoZXkgYXJlIG5vdCBpZGVudGljYWwuXG4gICAgICAgIGlmIChhID09PSAwKSB7IHJldHVybiAxIC8gYSA9PT0gMSAvIGI7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGEpICYmIE51bWJlci5pc05hTihiKTtcbiAgICB9LFxuXG4gICAgU2FtZVZhbHVlWmVybzogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIC8vIHNhbWUgYXMgU2FtZVZhbHVlIGV4Y2VwdCBmb3IgU2FtZVZhbHVlWmVybygrMCwgLTApID09IHRydWVcbiAgICAgIHJldHVybiAoYSA9PT0gYikgfHwgKE51bWJlci5pc05hTihhKSAmJiBOdW1iZXIuaXNOYU4oYikpO1xuICAgIH0sXG5cbiAgICBJc0l0ZXJhYmxlOiBmdW5jdGlvbiAobykge1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChvKSAmJlxuICAgICAgICAodHlwZW9mIG9bJGl0ZXJhdG9yJF0gIT09ICd1bmRlZmluZWQnIHx8IGlzQXJndW1lbnRzKG8pKTtcbiAgICB9LFxuXG4gICAgR2V0SXRlcmF0b3I6IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoaXNBcmd1bWVudHMobykpIHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHN1cHBvcnQgZm9yIGBhcmd1bWVudHNgXG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihvLCAndmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdEZuID0gb1skaXRlcmF0b3IkXTtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShpdEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWx1ZSBpcyBub3QgYW4gaXRlcmFibGUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdCA9IGl0Rm4uY2FsbChvKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KGl0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgaXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdDtcbiAgICB9LFxuXG4gICAgSXRlcmF0b3JOZXh0OiBmdW5jdGlvbiAoaXQpIHtcbiAgICAgIHZhciByZXN1bHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGl0Lm5leHQoYXJndW1lbnRzWzFdKSA6IGl0Lm5leHQoKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIGl0ZXJhdG9yJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBDb25zdHJ1Y3Q6IGZ1bmN0aW9uIChDLCBhcmdzKSB7XG4gICAgICAvLyBDcmVhdGVGcm9tQ29uc3RydWN0b3JcbiAgICAgIHZhciBvYmo7XG4gICAgICBpZiAoRVMuSXNDYWxsYWJsZShDWydAQGNyZWF0ZSddKSkge1xuICAgICAgICBvYmogPSBDWydAQGNyZWF0ZSddKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPcmRpbmFyeUNyZWF0ZUZyb21Db25zdHJ1Y3RvclxuICAgICAgICBvYmogPSBjcmVhdGUoQy5wcm90b3R5cGUgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBNYXJrIHRoYXQgd2UndmUgdXNlZCB0aGUgZXM2IGNvbnN0cnVjdCBwYXRoXG4gICAgICAvLyAoc2VlIGVtdWxhdGVFUzZjb25zdHJ1Y3QpXG4gICAgICBkZWZpbmVQcm9wZXJ0aWVzKG9iaiwgeyBfZXM2Y29uc3RydWN0OiB0cnVlIH0pO1xuICAgICAgLy8gQ2FsbCB0aGUgY29uc3RydWN0b3IuXG4gICAgICB2YXIgcmVzdWx0ID0gQy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogb2JqO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbnVtYmVyQ29udmVyc2lvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vaW5leG9yYWJsZXRhc2gvcG9seWZpbGwvYmxvYi9tYXN0ZXIvdHlwZWRhcnJheS5qcyNMMTc2LUwyNjZcbiAgICAvLyB3aXRoIHBlcm1pc3Npb24gYW5kIGxpY2Vuc2UsIHBlciBodHRwczovL3R3aXR0ZXIuY29tL2luZXhvcmFibGV0YXNoL3N0YXR1cy8zNzIyMDY1MDk1NDA2NTkyMDBcblxuICAgIGZ1bmN0aW9uIHJvdW5kVG9FdmVuKG4pIHtcbiAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihuKSwgZiA9IG4gLSB3O1xuICAgICAgaWYgKGYgPCAwLjUpIHtcbiAgICAgICAgcmV0dXJuIHc7XG4gICAgICB9XG4gICAgICBpZiAoZiA+IDAuNSkge1xuICAgICAgICByZXR1cm4gdyArIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdyAlIDIgPyB3ICsgMSA6IHc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFja0lFRUU3NTQodiwgZWJpdHMsIGZiaXRzKSB7XG4gICAgICB2YXIgYmlhcyA9ICgxIDw8IChlYml0cyAtIDEpKSAtIDEsXG4gICAgICAgIHMsIGUsIGYsXG4gICAgICAgIGksIGJpdHMsIHN0ciwgYnl0ZXM7XG5cbiAgICAgIC8vIENvbXB1dGUgc2lnbiwgZXhwb25lbnQsIGZyYWN0aW9uXG4gICAgICBpZiAodiAhPT0gdikge1xuICAgICAgICAvLyBOYU5cbiAgICAgICAgLy8gaHR0cDovL2Rldi53My5vcmcvMjAwNi93ZWJhcGkvV2ViSURMLyNlcy10eXBlLW1hcHBpbmdcbiAgICAgICAgZSA9ICgxIDw8IGViaXRzKSAtIDE7XG4gICAgICAgIGYgPSBNYXRoLnBvdygyLCBmYml0cyAtIDEpO1xuICAgICAgICBzID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodiA9PT0gSW5maW5pdHkgfHwgdiA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxO1xuICAgICAgICBmID0gMDtcbiAgICAgICAgcyA9ICh2IDwgMCkgPyAxIDogMDtcbiAgICAgIH0gZWxzZSBpZiAodiA9PT0gMCkge1xuICAgICAgICBlID0gMDtcbiAgICAgICAgZiA9IDA7XG4gICAgICAgIHMgPSAoMSAvIHYgPT09IC1JbmZpbml0eSkgPyAxIDogMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSB2IDwgMDtcbiAgICAgICAgdiA9IE1hdGguYWJzKHYpO1xuXG4gICAgICAgIGlmICh2ID49IE1hdGgucG93KDIsIDEgLSBiaWFzKSkge1xuICAgICAgICAgIGUgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKHYpIC8gTWF0aC5MTjIpLCAxMDIzKTtcbiAgICAgICAgICBmID0gcm91bmRUb0V2ZW4odiAvIE1hdGgucG93KDIsIGUpICogTWF0aC5wb3coMiwgZmJpdHMpKTtcbiAgICAgICAgICBpZiAoZiAvIE1hdGgucG93KDIsIGZiaXRzKSA+PSAyKSB7XG4gICAgICAgICAgICBlID0gZSArIDE7XG4gICAgICAgICAgICBmID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGUgPiBiaWFzKSB7XG4gICAgICAgICAgICAvLyBPdmVyZmxvd1xuICAgICAgICAgICAgZSA9ICgxIDw8IGViaXRzKSAtIDE7XG4gICAgICAgICAgICBmID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm9ybWFsXG4gICAgICAgICAgICBlID0gZSArIGJpYXM7XG4gICAgICAgICAgICBmID0gZiAtIE1hdGgucG93KDIsIGZiaXRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gU3Vibm9ybWFsXG4gICAgICAgICAgZSA9IDA7XG4gICAgICAgICAgZiA9IHJvdW5kVG9FdmVuKHYgLyBNYXRoLnBvdygyLCAxIC0gYmlhcyAtIGZiaXRzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUGFjayBzaWduLCBleHBvbmVudCwgZnJhY3Rpb25cbiAgICAgIGJpdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IGZiaXRzOyBpOyBpIC09IDEpIHtcbiAgICAgICAgYml0cy5wdXNoKGYgJSAyID8gMSA6IDApO1xuICAgICAgICBmID0gTWF0aC5mbG9vcihmIC8gMik7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSBlYml0czsgaTsgaSAtPSAxKSB7XG4gICAgICAgIGJpdHMucHVzaChlICUgMiA/IDEgOiAwKTtcbiAgICAgICAgZSA9IE1hdGguZmxvb3IoZSAvIDIpO1xuICAgICAgfVxuICAgICAgYml0cy5wdXNoKHMgPyAxIDogMCk7XG4gICAgICBiaXRzLnJldmVyc2UoKTtcbiAgICAgIHN0ciA9IGJpdHMuam9pbignJyk7XG5cbiAgICAgIC8vIEJpdHMgdG8gYnl0ZXNcbiAgICAgIGJ5dGVzID0gW107XG4gICAgICB3aGlsZSAoc3RyLmxlbmd0aCkge1xuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KHN0ci5zbGljZSgwLCA4KSwgMikpO1xuICAgICAgICBzdHIgPSBzdHIuc2xpY2UoOCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5wYWNrSUVFRTc1NChieXRlcywgZWJpdHMsIGZiaXRzKSB7XG4gICAgICAvLyBCeXRlcyB0byBiaXRzXG4gICAgICB2YXIgYml0cyA9IFtdLCBpLCBqLCBiLCBzdHIsXG4gICAgICAgICAgYmlhcywgcywgZSwgZjtcblxuICAgICAgZm9yIChpID0gYnl0ZXMubGVuZ3RoOyBpOyBpIC09IDEpIHtcbiAgICAgICAgYiA9IGJ5dGVzW2kgLSAxXTtcbiAgICAgICAgZm9yIChqID0gODsgajsgaiAtPSAxKSB7XG4gICAgICAgICAgYml0cy5wdXNoKGIgJSAyID8gMSA6IDApO1xuICAgICAgICAgIGIgPSBiID4+IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJpdHMucmV2ZXJzZSgpO1xuICAgICAgc3RyID0gYml0cy5qb2luKCcnKTtcblxuICAgICAgLy8gVW5wYWNrIHNpZ24sIGV4cG9uZW50LCBmcmFjdGlvblxuICAgICAgYmlhcyA9ICgxIDw8IChlYml0cyAtIDEpKSAtIDE7XG4gICAgICBzID0gcGFyc2VJbnQoc3RyLnNsaWNlKDAsIDEpLCAyKSA/IC0xIDogMTtcbiAgICAgIGUgPSBwYXJzZUludChzdHIuc2xpY2UoMSwgMSArIGViaXRzKSwgMik7XG4gICAgICBmID0gcGFyc2VJbnQoc3RyLnNsaWNlKDEgKyBlYml0cyksIDIpO1xuXG4gICAgICAvLyBQcm9kdWNlIG51bWJlclxuICAgICAgaWYgKGUgPT09ICgxIDw8IGViaXRzKSAtIDEpIHtcbiAgICAgICAgcmV0dXJuIGYgIT09IDAgPyBOYU4gOiBzICogSW5maW5pdHk7XG4gICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XG4gICAgICAgIC8vIE5vcm1hbGl6ZWRcbiAgICAgICAgcmV0dXJuIHMgKiBNYXRoLnBvdygyLCBlIC0gYmlhcykgKiAoMSArIGYgLyBNYXRoLnBvdygyLCBmYml0cykpO1xuICAgICAgfSBlbHNlIGlmIChmICE9PSAwKSB7XG4gICAgICAgIC8vIERlbm9ybWFsaXplZFxuICAgICAgICByZXR1cm4gcyAqIE1hdGgucG93KDIsIC0oYmlhcyAtIDEpKSAqIChmIC8gTWF0aC5wb3coMiwgZmJpdHMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzIDwgMCA/IC0wIDogMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bnBhY2tGbG9hdDY0KGIpIHsgcmV0dXJuIHVucGFja0lFRUU3NTQoYiwgMTEsIDUyKTsgfVxuICAgIGZ1bmN0aW9uIHBhY2tGbG9hdDY0KHYpIHsgcmV0dXJuIHBhY2tJRUVFNzU0KHYsIDExLCA1Mik7IH1cbiAgICBmdW5jdGlvbiB1bnBhY2tGbG9hdDMyKGIpIHsgcmV0dXJuIHVucGFja0lFRUU3NTQoYiwgOCwgMjMpOyB9XG4gICAgZnVuY3Rpb24gcGFja0Zsb2F0MzIodikgeyByZXR1cm4gcGFja0lFRUU3NTQodiwgOCwgMjMpOyB9XG5cbiAgICB2YXIgY29udmVyc2lvbnMgPSB7XG4gICAgICB0b0Zsb2F0MzI6IGZ1bmN0aW9uIChudW0pIHsgcmV0dXJuIHVucGFja0Zsb2F0MzIocGFja0Zsb2F0MzIobnVtKSk7IH1cbiAgICB9O1xuICAgIGlmICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIGZsb2F0MzJhcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoMSk7XG4gICAgICBjb252ZXJzaW9ucy50b0Zsb2F0MzIgPSBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGZsb2F0MzJhcnJheVswXSA9IG51bTtcbiAgICAgICAgcmV0dXJuIGZsb2F0MzJhcnJheVswXTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJzaW9ucztcbiAgfSgpKTtcblxuICBkZWZpbmVQcm9wZXJ0aWVzKFN0cmluZywge1xuICAgIGZyb21Db2RlUG9pbnQ6IGZ1bmN0aW9uIGZyb21Db2RlUG9pbnQoXykgeyAvLyBsZW5ndGggPSAxXG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IE51bWJlcihhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoIUVTLlNhbWVWYWx1ZShuZXh0LCBFUy5Ub0ludGVnZXIobmV4dCkpIHx8IG5leHQgPCAwIHx8IG5leHQgPiAweDEwRkZGRikge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQgJyArIG5leHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQgPCAweDEwMDAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCAtPSAweDEwMDAwO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoKG5leHQgPj4gMTApICsgMHhEODAwKSk7XG4gICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSgobmV4dCAlIDB4NDAwKSArIDB4REMwMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICByYXc6IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZSkgeyAvLyByYXcubGVuZ3RoPT09MVxuICAgICAgdmFyIGNvb2tlZCA9IEVTLlRvT2JqZWN0KGNhbGxTaXRlLCAnYmFkIGNhbGxTaXRlJyk7XG4gICAgICB2YXIgcmF3VmFsdWUgPSBjb29rZWQucmF3O1xuICAgICAgdmFyIHJhd1N0cmluZyA9IEVTLlRvT2JqZWN0KHJhd1ZhbHVlLCAnYmFkIHJhdyB2YWx1ZScpO1xuICAgICAgdmFyIGxlbiA9IHJhd1N0cmluZy5sZW5ndGg7XG4gICAgICB2YXIgbGl0ZXJhbHNlZ21lbnRzID0gRVMuVG9MZW5ndGgobGVuKTtcbiAgICAgIGlmIChsaXRlcmFsc2VnbWVudHMgPD0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdHJpbmdFbGVtZW50cyA9IFtdO1xuICAgICAgdmFyIG5leHRJbmRleCA9IDA7XG4gICAgICB2YXIgbmV4dEtleSwgbmV4dCwgbmV4dFNlZywgbmV4dFN1YjtcbiAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsaXRlcmFsc2VnbWVudHMpIHtcbiAgICAgICAgbmV4dEtleSA9IFN0cmluZyhuZXh0SW5kZXgpO1xuICAgICAgICBuZXh0ID0gcmF3U3RyaW5nW25leHRLZXldO1xuICAgICAgICBuZXh0U2VnID0gU3RyaW5nKG5leHQpO1xuICAgICAgICBzdHJpbmdFbGVtZW50cy5wdXNoKG5leHRTZWcpO1xuICAgICAgICBpZiAobmV4dEluZGV4ICsgMSA+PSBsaXRlcmFsc2VnbWVudHMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBuZXh0ID0gbmV4dEluZGV4ICsgMSA8IGFyZ3VtZW50cy5sZW5ndGggPyBhcmd1bWVudHNbbmV4dEluZGV4ICsgMV0gOiAnJztcbiAgICAgICAgbmV4dFN1YiA9IFN0cmluZyhuZXh0KTtcbiAgICAgICAgc3RyaW5nRWxlbWVudHMucHVzaChuZXh0U3ViKTtcbiAgICAgICAgbmV4dEluZGV4Kys7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyaW5nRWxlbWVudHMuam9pbignJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBGaXJlZm94IDMxIHJlcG9ydHMgdGhpcyBmdW5jdGlvbidzIGxlbmd0aCBhcyAwXG4gIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjI0ODRcbiAgaWYgKFN0cmluZy5mcm9tQ29kZVBvaW50Lmxlbmd0aCAhPT0gMSkge1xuICAgIHZhciBvcmlnaW5hbEZyb21Db2RlUG9pbnQgPSBGdW5jdGlvbi5hcHBseS5iaW5kKFN0cmluZy5mcm9tQ29kZVBvaW50KTtcbiAgICBkZWZpbmVQcm9wZXJ0eShTdHJpbmcsICdmcm9tQ29kZVBvaW50JywgZnVuY3Rpb24gKF8pIHsgcmV0dXJuIG9yaWdpbmFsRnJvbUNvZGVQb2ludCh0aGlzLCBhcmd1bWVudHMpOyB9LCB0cnVlKTtcbiAgfVxuXG4gIHZhciBTdHJpbmdTaGltcyA9IHtcbiAgICAvLyBGYXN0IHJlcGVhdCwgdXNlcyB0aGUgYEV4cG9uZW50aWF0aW9uIGJ5IHNxdWFyaW5nYCBhbGdvcml0aG0uXG4gICAgLy8gUGVyZjogaHR0cDovL2pzcGVyZi5jb20vc3RyaW5nLXJlcGVhdDIvMlxuICAgIHJlcGVhdDogKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXBlYXQgPSBmdW5jdGlvbiAocywgdGltZXMpIHtcbiAgICAgICAgaWYgKHRpbWVzIDwgMSkgeyByZXR1cm4gJyc7IH1cbiAgICAgICAgaWYgKHRpbWVzICUgMikgeyByZXR1cm4gcmVwZWF0KHMsIHRpbWVzIC0gMSkgKyBzOyB9XG4gICAgICAgIHZhciBoYWxmID0gcmVwZWF0KHMsIHRpbWVzIC8gMik7XG4gICAgICAgIHJldHVybiBoYWxmICsgaGFsZjtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAodGltZXMpIHtcbiAgICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgICB0aW1lcyA9IEVTLlRvSW50ZWdlcih0aW1lcyk7XG4gICAgICAgIGlmICh0aW1lcyA8IDAgfHwgdGltZXMgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgU3RyaW5nI3JlcGVhdCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXBlYXQodGhpc1N0ciwgdGltZXMpO1xuICAgICAgfTtcbiAgICB9KSgpLFxuXG4gICAgc3RhcnRzV2l0aDogZnVuY3Rpb24gKHNlYXJjaFN0cikge1xuICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgaWYgKFR5cGUucmVnZXgoc2VhcmNoU3RyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBtZXRob2QgXCJzdGFydHNXaXRoXCIgd2l0aCBhIHJlZ2V4Jyk7XG4gICAgICB9XG4gICAgICBzZWFyY2hTdHIgPSBTdHJpbmcoc2VhcmNoU3RyKTtcbiAgICAgIHZhciBzdGFydEFyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuICAgICAgdmFyIHN0YXJ0ID0gTWF0aC5tYXgoRVMuVG9JbnRlZ2VyKHN0YXJ0QXJnKSwgMCk7XG4gICAgICByZXR1cm4gdGhpc1N0ci5zbGljZShzdGFydCwgc3RhcnQgKyBzZWFyY2hTdHIubGVuZ3RoKSA9PT0gc2VhcmNoU3RyO1xuICAgIH0sXG5cbiAgICBlbmRzV2l0aDogZnVuY3Rpb24gKHNlYXJjaFN0cikge1xuICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgaWYgKFR5cGUucmVnZXgoc2VhcmNoU3RyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBtZXRob2QgXCJlbmRzV2l0aFwiIHdpdGggYSByZWdleCcpO1xuICAgICAgfVxuICAgICAgc2VhcmNoU3RyID0gU3RyaW5nKHNlYXJjaFN0cik7XG4gICAgICB2YXIgdGhpc0xlbiA9IHRoaXNTdHIubGVuZ3RoO1xuICAgICAgdmFyIHBvc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuICAgICAgdmFyIHBvcyA9IHR5cGVvZiBwb3NBcmcgPT09ICd1bmRlZmluZWQnID8gdGhpc0xlbiA6IEVTLlRvSW50ZWdlcihwb3NBcmcpO1xuICAgICAgdmFyIGVuZCA9IE1hdGgubWluKE1hdGgubWF4KHBvcywgMCksIHRoaXNMZW4pO1xuICAgICAgcmV0dXJuIHRoaXNTdHIuc2xpY2UoZW5kIC0gc2VhcmNoU3RyLmxlbmd0aCwgZW5kKSA9PT0gc2VhcmNoU3RyO1xuICAgIH0sXG5cbiAgICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoU3RyaW5nKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgIC8vIFNvbWVob3cgdGhpcyB0cmljayBtYWtlcyBtZXRob2QgMTAwJSBjb21wYXQgd2l0aCB0aGUgc3BlYy5cbiAgICAgIHJldHVybiBfaW5kZXhPZih0aGlzLCBzZWFyY2hTdHJpbmcsIHBvc2l0aW9uKSAhPT0gLTE7XG4gICAgfSxcblxuICAgIGNvZGVQb2ludEF0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICB2YXIgdGhpc1N0ciA9IFN0cmluZyhFUy5DaGVja09iamVjdENvZXJjaWJsZSh0aGlzKSk7XG4gICAgICB2YXIgcG9zaXRpb24gPSBFUy5Ub0ludGVnZXIocG9zKTtcbiAgICAgIHZhciBsZW5ndGggPSB0aGlzU3RyLmxlbmd0aDtcbiAgICAgIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbGVuZ3RoKSB7IHJldHVybjsgfVxuICAgICAgdmFyIGZpcnN0ID0gdGhpc1N0ci5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgIHZhciBpc0VuZCA9IChwb3NpdGlvbiArIDEgPT09IGxlbmd0aCk7XG4gICAgICBpZiAoZmlyc3QgPCAweEQ4MDAgfHwgZmlyc3QgPiAweERCRkYgfHwgaXNFbmQpIHsgcmV0dXJuIGZpcnN0OyB9XG4gICAgICB2YXIgc2Vjb25kID0gdGhpc1N0ci5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSk7XG4gICAgICBpZiAoc2Vjb25kIDwgMHhEQzAwIHx8IHNlY29uZCA+IDB4REZGRikgeyByZXR1cm4gZmlyc3Q7IH1cbiAgICAgIHJldHVybiAoKGZpcnN0IC0gMHhEODAwKSAqIDEwMjQpICsgKHNlY29uZCAtIDB4REMwMCkgKyAweDEwMDAwO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCBTdHJpbmdTaGltcyk7XG5cbiAgdmFyIGhhc1N0cmluZ1RyaW1CdWcgPSAnXFx1MDA4NScudHJpbSgpLmxlbmd0aCAhPT0gMTtcbiAgaWYgKGhhc1N0cmluZ1RyaW1CdWcpIHtcbiAgICB2YXIgb3JpZ2luYWxTdHJpbmdUcmltID0gU3RyaW5nLnByb3RvdHlwZS50cmltO1xuICAgIGRlbGV0ZSBTdHJpbmcucHJvdG90eXBlLnRyaW07XG4gICAgLy8gd2hpdGVzcGFjZSBmcm9tOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjUuNC4yMFxuICAgIC8vIGltcGxlbWVudGF0aW9uIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltL2Jsb2IvdjMuNC4wL2VzNS1zaGltLmpzI0wxMzA0LUwxMzI0XG4gICAgdmFyIHdzID0gW1xuICAgICAgJ1xceDA5XFx4MEFcXHgwQlxceDBDXFx4MERcXHgyMFxceEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzJyxcbiAgICAgICdcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBBXFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1MjAyOCcsXG4gICAgICAnXFx1MjAyOVxcdUZFRkYnXG4gICAgXS5qb2luKCcnKTtcbiAgICB2YXIgdHJpbVJlZ2V4cCA9IG5ldyBSZWdFeHAoJyheWycgKyB3cyArICddKyl8KFsnICsgd3MgKyAnXSskKScsICdnJyk7XG4gICAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCB7XG4gICAgICB0cmltOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcyA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcyA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYW4ndCBjb252ZXJ0IFwiICsgdGhpcyArICcgdG8gb2JqZWN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKHRyaW1SZWdleHAsICcnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIHNlZSBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtc3RyaW5nLnByb3RvdHlwZS1AQGl0ZXJhdG9yXG4gIHZhciBTdHJpbmdJdGVyYXRvciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgdGhpcy5fcyA9IFN0cmluZyhFUy5DaGVja09iamVjdENvZXJjaWJsZShzKSk7XG4gICAgdGhpcy5faSA9IDA7XG4gIH07XG4gIFN0cmluZ0l0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzID0gdGhpcy5fcywgaSA9IHRoaXMuX2k7XG4gICAgaWYgKHR5cGVvZiBzID09PSAndW5kZWZpbmVkJyB8fCBpID49IHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9zID0gdm9pZCAwO1xuICAgICAgcmV0dXJuIHsgdmFsdWU6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbiAgICB2YXIgZmlyc3QgPSBzLmNoYXJDb2RlQXQoaSksIHNlY29uZCwgbGVuO1xuICAgIGlmIChmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCAoaSArIDEpID09IHMubGVuZ3RoKSB7XG4gICAgICBsZW4gPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWNvbmQgPSBzLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgbGVuID0gKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpID8gMSA6IDI7XG4gICAgfVxuICAgIHRoaXMuX2kgPSBpICsgbGVuO1xuICAgIHJldHVybiB7IHZhbHVlOiBzLnN1YnN0cihpLCBsZW4pLCBkb25lOiBmYWxzZSB9O1xuICB9O1xuICBhZGRJdGVyYXRvcihTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUpO1xuICBhZGRJdGVyYXRvcihTdHJpbmcucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdJdGVyYXRvcih0aGlzKTtcbiAgfSk7XG5cbiAgaWYgKCFzdGFydHNXaXRoSXNDb21wbGlhbnQpIHtcbiAgICAvLyBGaXJlZm94IGhhcyBhIG5vbmNvbXBsaWFudCBzdGFydHNXaXRoIGltcGxlbWVudGF0aW9uXG4gICAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCB7XG4gICAgICBzdGFydHNXaXRoOiBTdHJpbmdTaGltcy5zdGFydHNXaXRoLFxuICAgICAgZW5kc1dpdGg6IFN0cmluZ1NoaW1zLmVuZHNXaXRoXG4gICAgfSk7XG4gIH1cblxuICB2YXIgQXJyYXlTaGltcyA9IHtcbiAgICBmcm9tOiBmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgICB2YXIgbGlzdCA9IEVTLlRvT2JqZWN0KGl0ZXJhYmxlLCAnYmFkIGl0ZXJhYmxlJyk7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJyAmJiAhRVMuSXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGhhc1RoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICAgIHZhciB0aGlzQXJnID0gaGFzVGhpc0FyZyA/IGFyZ3VtZW50c1syXSA6IHZvaWQgMDtcblxuICAgICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBFUy5Jc0l0ZXJhYmxlKGxpc3QpO1xuICAgICAgLy8gZG9lcyB0aGUgc3BlYyByZWFsbHkgbWVhbiB0aGF0IEFycmF5cyBzaG91bGQgdXNlIEFycmF5SXRlcmF0b3I/XG4gICAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTI0MTZcbiAgICAgIC8vaWYgKEFycmF5LmlzQXJyYXkobGlzdCkpIHsgdXNpbmdJdGVyYXRvcj1mYWxzZTsgfVxuXG4gICAgICB2YXIgbGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdCwgaSwgdmFsdWU7XG4gICAgICBpZiAodXNpbmdJdGVyYXRvcikge1xuICAgICAgICBpID0gMDtcbiAgICAgICAgcmVzdWx0ID0gRVMuSXNDYWxsYWJsZSh0aGlzKSA/IE9iamVjdChuZXcgdGhpcygpKSA6IFtdO1xuICAgICAgICB2YXIgaXQgPSB1c2luZ0l0ZXJhdG9yID8gRVMuR2V0SXRlcmF0b3IobGlzdCkgOiBudWxsO1xuICAgICAgICB2YXIgaXRlcmF0aW9uVmFsdWU7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgIGl0ZXJhdGlvblZhbHVlID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICBpZiAoIWl0ZXJhdGlvblZhbHVlLmRvbmUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gaXRlcmF0aW9uVmFsdWUudmFsdWU7XG4gICAgICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2ldID0gaGFzVGhpc0FyZyA/IG1hcEZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGkpIDogbWFwRm4odmFsdWUsIGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlICghaXRlcmF0aW9uVmFsdWUuZG9uZSk7XG4gICAgICAgIGxlbmd0aCA9IGk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW5ndGggPSBFUy5Ub0xlbmd0aChsaXN0Lmxlbmd0aCk7XG4gICAgICAgIHJlc3VsdCA9IEVTLklzQ2FsbGFibGUodGhpcykgPyBPYmplY3QobmV3IHRoaXMobGVuZ3RoKSkgOiBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gaGFzVGhpc0FyZyA/IG1hcEZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGkpIDogbWFwRm4odmFsdWUsIGkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIG9mOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lUHJvcGVydGllcyhBcnJheSwgQXJyYXlTaGltcyk7XG5cbiAgdmFyIGFycmF5RnJvbVN3YWxsb3dzTmVnYXRpdmVMZW5ndGhzID0gZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogLTEgfSkubGVuZ3RoID09PSAwO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIC8vIEZpeGVzIGEgRmlyZWZveCBidWcgaW4gdjMyXG4gIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjM5OTNcbiAgaWYgKCFhcnJheUZyb21Td2FsbG93c05lZ2F0aXZlTGVuZ3RocygpKSB7XG4gICAgZGVmaW5lUHJvcGVydHkoQXJyYXksICdmcm9tJywgQXJyYXlTaGltcy5mcm9tLCB0cnVlKTtcbiAgfVxuXG4gIC8vIE91ciBBcnJheUl0ZXJhdG9yIGlzIHByaXZhdGU7IHNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL2lzc3Vlcy8yNTJcbiAgQXJyYXlJdGVyYXRvciA9IGZ1bmN0aW9uIChhcnJheSwga2luZCkge1xuICAgICAgdGhpcy5pID0gMDtcbiAgICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbiAgICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gIH07XG5cbiAgZGVmaW5lUHJvcGVydGllcyhBcnJheUl0ZXJhdG9yLnByb3RvdHlwZSwge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpID0gdGhpcy5pLCBhcnJheSA9IHRoaXMuYXJyYXk7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQXJyYXlJdGVyYXRvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTm90IGFuIEFycmF5SXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgYXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBsZW4gPSBFUy5Ub0xlbmd0aChhcnJheS5sZW5ndGgpO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtpbmQgPSB0aGlzLmtpbmQ7XG4gICAgICAgICAgdmFyIHJldHZhbDtcbiAgICAgICAgICBpZiAoa2luZCA9PT0gJ2tleScpIHtcbiAgICAgICAgICAgIHJldHZhbCA9IGk7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmFsdWUnKSB7XG4gICAgICAgICAgICByZXR2YWwgPSBhcnJheVtpXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICdlbnRyeScpIHtcbiAgICAgICAgICAgIHJldHZhbCA9IFtpLCBhcnJheVtpXV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaSA9IGkgKyAxO1xuICAgICAgICAgIHJldHVybiB7IHZhbHVlOiByZXR2YWwsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuYXJyYXkgPSB2b2lkIDA7XG4gICAgICByZXR1cm4geyB2YWx1ZTogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxuICB9KTtcbiAgYWRkSXRlcmF0b3IoQXJyYXlJdGVyYXRvci5wcm90b3R5cGUpO1xuXG4gIHZhciBBcnJheVByb3RvdHlwZVNoaW1zID0ge1xuICAgIGNvcHlXaXRoaW46IGZ1bmN0aW9uICh0YXJnZXQsIHN0YXJ0KSB7XG4gICAgICB2YXIgZW5kID0gYXJndW1lbnRzWzJdOyAvLyBjb3B5V2l0aGluLmxlbmd0aCBtdXN0IGJlIDJcbiAgICAgIHZhciBvID0gRVMuVG9PYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuID0gRVMuVG9MZW5ndGgoby5sZW5ndGgpO1xuICAgICAgdGFyZ2V0ID0gRVMuVG9JbnRlZ2VyKHRhcmdldCk7XG4gICAgICBzdGFydCA9IEVTLlRvSW50ZWdlcihzdGFydCk7XG4gICAgICB2YXIgdG8gPSB0YXJnZXQgPCAwID8gTWF0aC5tYXgobGVuICsgdGFyZ2V0LCAwKSA6IE1hdGgubWluKHRhcmdldCwgbGVuKTtcbiAgICAgIHZhciBmcm9tID0gc3RhcnQgPCAwID8gTWF0aC5tYXgobGVuICsgc3RhcnQsIDApIDogTWF0aC5taW4oc3RhcnQsIGxlbik7XG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAndW5kZWZpbmVkJyA/IGxlbiA6IEVTLlRvSW50ZWdlcihlbmQpO1xuICAgICAgdmFyIGZpbiA9IGVuZCA8IDAgPyBNYXRoLm1heChsZW4gKyBlbmQsIDApIDogTWF0aC5taW4oZW5kLCBsZW4pO1xuICAgICAgdmFyIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pO1xuICAgICAgdmFyIGRpcmVjdGlvbiA9IDE7XG4gICAgICBpZiAoZnJvbSA8IHRvICYmIHRvIDwgKGZyb20gKyBjb3VudCkpIHtcbiAgICAgICAgZGlyZWN0aW9uID0gLTE7XG4gICAgICAgIGZyb20gKz0gY291bnQgLSAxO1xuICAgICAgICB0byArPSBjb3VudCAtIDE7XG4gICAgICB9XG4gICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgIGlmIChfaGFzT3duUHJvcGVydHkobywgZnJvbSkpIHtcbiAgICAgICAgICBvW3RvXSA9IG9bZnJvbV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9bZnJvbV07XG4gICAgICAgIH1cbiAgICAgICAgZnJvbSArPSBkaXJlY3Rpb247XG4gICAgICAgIHRvICs9IGRpcmVjdGlvbjtcbiAgICAgICAgY291bnQgLT0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvO1xuICAgIH0sXG5cbiAgICBmaWxsOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBzdGFydCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuICAgICAgdmFyIGVuZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDogdm9pZCAwO1xuICAgICAgdmFyIE8gPSBFUy5Ub09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBFUy5Ub0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBzdGFydCA9IEVTLlRvSW50ZWdlcih0eXBlb2Ygc3RhcnQgPT09ICd1bmRlZmluZWQnID8gMCA6IHN0YXJ0KTtcbiAgICAgIGVuZCA9IEVTLlRvSW50ZWdlcih0eXBlb2YgZW5kID09PSAndW5kZWZpbmVkJyA/IGxlbiA6IGVuZCk7XG5cbiAgICAgIHZhciByZWxhdGl2ZVN0YXJ0ID0gc3RhcnQgPCAwID8gTWF0aC5tYXgobGVuICsgc3RhcnQsIDApIDogTWF0aC5taW4oc3RhcnQsIGxlbik7XG4gICAgICB2YXIgcmVsYXRpdmVFbmQgPSBlbmQgPCAwID8gbGVuICsgZW5kIDogZW5kO1xuXG4gICAgICBmb3IgKHZhciBpID0gcmVsYXRpdmVTdGFydDsgaSA8IGxlbiAmJiBpIDwgcmVsYXRpdmVFbmQ7ICsraSkge1xuICAgICAgICBPW2ldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTztcbiAgICB9LFxuXG4gICAgZmluZDogZnVuY3Rpb24gZmluZChwcmVkaWNhdGUpIHtcbiAgICAgIHZhciBsaXN0ID0gRVMuVG9PYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuZ3RoID0gRVMuVG9MZW5ndGgobGlzdC5sZW5ndGgpO1xuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHByZWRpY2F0ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkjZmluZDogcHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gICAgICBmb3IgKHZhciBpID0gMCwgdmFsdWU7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmICh0aGlzQXJnKSB7XG4gICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpLCBsaXN0KSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0sXG5cbiAgICBmaW5kSW5kZXg6IGZ1bmN0aW9uIGZpbmRJbmRleChwcmVkaWNhdGUpIHtcbiAgICAgIHZhciBsaXN0ID0gRVMuVG9PYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuZ3RoID0gRVMuVG9MZW5ndGgobGlzdC5sZW5ndGgpO1xuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHByZWRpY2F0ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkjZmluZEluZGV4OiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXNBcmcpIHtcbiAgICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgbGlzdFtpXSwgaSwgbGlzdCkpIHsgcmV0dXJuIGk7IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocHJlZGljYXRlKGxpc3RbaV0sIGksIGxpc3QpKSB7IHJldHVybiBpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9LFxuXG4gICAga2V5czogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUl0ZXJhdG9yKHRoaXMsICdrZXknKTtcbiAgICB9LFxuXG4gICAgdmFsdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IodGhpcywgJ3ZhbHVlJyk7XG4gICAgfSxcblxuICAgIGVudHJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcih0aGlzLCAnZW50cnknKTtcbiAgICB9XG4gIH07XG4gIC8vIFNhZmFyaSA3LjEgZGVmaW5lcyBBcnJheSNrZXlzIGFuZCBBcnJheSNlbnRyaWVzIG5hdGl2ZWx5LFxuICAvLyBidXQgdGhlIHJlc3VsdGluZyBBcnJheUl0ZXJhdG9yIG9iamVjdHMgZG9uJ3QgaGF2ZSBhIFwibmV4dFwiIG1ldGhvZC5cbiAgaWYgKEFycmF5LnByb3RvdHlwZS5rZXlzICYmICFFUy5Jc0NhbGxhYmxlKFsxXS5rZXlzKCkubmV4dCkpIHtcbiAgICBkZWxldGUgQXJyYXkucHJvdG90eXBlLmtleXM7XG4gIH1cbiAgaWYgKEFycmF5LnByb3RvdHlwZS5lbnRyaWVzICYmICFFUy5Jc0NhbGxhYmxlKFsxXS5lbnRyaWVzKCkubmV4dCkpIHtcbiAgICBkZWxldGUgQXJyYXkucHJvdG90eXBlLmVudHJpZXM7XG4gIH1cblxuICAvLyBDaHJvbWUgMzggZGVmaW5lcyBBcnJheSNrZXlzIGFuZCBBcnJheSNlbnRyaWVzLCBhbmQgQXJyYXkjQEBpdGVyYXRvciwgYnV0IG5vdCBBcnJheSN2YWx1ZXNcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5rZXlzICYmIEFycmF5LnByb3RvdHlwZS5lbnRyaWVzICYmICFBcnJheS5wcm90b3R5cGUudmFsdWVzICYmIEFycmF5LnByb3RvdHlwZVskaXRlcmF0b3IkXSkge1xuICAgIGRlZmluZVByb3BlcnRpZXMoQXJyYXkucHJvdG90eXBlLCB7XG4gICAgICB2YWx1ZXM6IEFycmF5LnByb3RvdHlwZVskaXRlcmF0b3IkXVxuICAgIH0pO1xuICAgIGlmIChUeXBlLnN5bWJvbChTeW1ib2wudW5zY29wYWJsZXMpKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGVbU3ltYm9sLnVuc2NvcGFibGVzXS52YWx1ZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBkZWZpbmVQcm9wZXJ0aWVzKEFycmF5LnByb3RvdHlwZSwgQXJyYXlQcm90b3R5cGVTaGltcyk7XG5cbiAgYWRkSXRlcmF0b3IoQXJyYXkucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnZhbHVlcygpOyB9KTtcbiAgLy8gQ2hyb21lIGRlZmluZXMga2V5cy92YWx1ZXMvZW50cmllcyBvbiBBcnJheSwgYnV0IGRvZXNuJ3QgZ2l2ZSB1c1xuICAvLyBhbnkgd2F5IHRvIGlkZW50aWZ5IGl0cyBpdGVyYXRvci4gIFNvIGFkZCBvdXIgb3duIHNoaW1tZWQgZmllbGQuXG4gIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcbiAgICBhZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YoW10udmFsdWVzKCkpKTtcbiAgfVxuXG4gIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIGRlZmluZVByb3BlcnRpZXMoTnVtYmVyLCB7XG4gICAgTUFYX1NBRkVfSU5URUdFUjogbWF4U2FmZUludGVnZXIsXG4gICAgTUlOX1NBRkVfSU5URUdFUjogLW1heFNhZmVJbnRlZ2VyLFxuICAgIEVQU0lMT046IDIuMjIwNDQ2MDQ5MjUwMzEzZS0xNixcblxuICAgIHBhcnNlSW50OiBnbG9iYWxzLnBhcnNlSW50LFxuICAgIHBhcnNlRmxvYXQ6IGdsb2JhbHMucGFyc2VGbG9hdCxcblxuICAgIGlzRmluaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGlzSW50ZWdlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSAmJlxuICAgICAgICBFUy5Ub0ludGVnZXIodmFsdWUpID09PSB2YWx1ZTtcbiAgICB9LFxuXG4gICAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiYgTWF0aC5hYnModmFsdWUpIDw9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgIH0sXG5cbiAgICBpc05hTjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAvLyBOYU4gIT09IE5hTiwgYnV0IHRoZXkgYXJlIGlkZW50aWNhbC5cbiAgICAgIC8vIE5hTnMgYXJlIHRoZSBvbmx5IG5vbi1yZWZsZXhpdmUgdmFsdWUsIGkuZS4sIGlmIHggIT09IHgsXG4gICAgICAvLyB0aGVuIHggaXMgTmFOLlxuICAgICAgLy8gaXNOYU4gaXMgYnJva2VuOiBpdCBjb252ZXJ0cyBpdHMgYXJndW1lbnQgdG8gbnVtYmVyLCBzb1xuICAgICAgLy8gaXNOYU4oJ2ZvbycpID0+IHRydWVcbiAgICAgIHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICAvLyBXb3JrIGFyb3VuZCBidWdzIGluIEFycmF5I2ZpbmQgYW5kIEFycmF5I2ZpbmRJbmRleCAtLSBlYXJseVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgc2tpcHBlZCBob2xlcyBpbiBzcGFyc2UgYXJyYXlzLiAoTm90ZSB0aGF0IHRoZVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgb2YgZmluZC9maW5kSW5kZXggaW5kaXJlY3RseSB1c2Ugc2hpbW1lZFxuICAvLyBtZXRob2RzIG9mIE51bWJlciwgc28gdGhpcyB0ZXN0IGhhcyB0byBoYXBwZW4gZG93biBoZXJlLilcbiAgaWYgKCFbLCAxXS5maW5kKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywgQXJyYXlQcm90b3R5cGVTaGltcy5maW5kLCB0cnVlKTtcbiAgfVxuICBpZiAoWywgMV0uZmluZEluZGV4KGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkgIT09IDApIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kSW5kZXgnLCBBcnJheVByb3RvdHlwZVNoaW1zLmZpbmRJbmRleCwgdHJ1ZSk7XG4gIH1cblxuICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuICAgIGRlZmluZVByb3BlcnRpZXMoT2JqZWN0LCB7XG4gICAgICBnZXRQcm9wZXJ0eURlc2NyaXB0b3I6IGZ1bmN0aW9uIChzdWJqZWN0LCBuYW1lKSB7XG4gICAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc3ViamVjdCwgbmFtZSk7XG4gICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcbiAgICAgICAgd2hpbGUgKHR5cGVvZiBwZCA9PT0gJ3VuZGVmaW5lZCcgJiYgcHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG5hbWUpO1xuICAgICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGQ7XG4gICAgICB9LFxuXG4gICAgICBnZXRQcm9wZXJ0eU5hbWVzOiBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc3ViamVjdCk7XG4gICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcblxuICAgICAgICB2YXIgYWRkUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YocHJvcGVydHkpID09PSAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gocHJvcGVydHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB3aGlsZSAocHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90bykuZm9yRWFjaChhZGRQcm9wZXJ0eSk7XG4gICAgICAgICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmVQcm9wZXJ0aWVzKE9iamVjdCwge1xuICAgICAgLy8gMTkuMS4zLjFcbiAgICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKE9iamVjdChzb3VyY2UpKS5yZWR1Y2UoZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICB9LCB0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIGlzOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gRVMuU2FtZVZhbHVlKGEsIGIpO1xuICAgICAgfSxcblxuICAgICAgLy8gMTkuMS4zLjlcbiAgICAgIC8vIHNoaW0gZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzU1OTM1NTRcbiAgICAgIHNldFByb3RvdHlwZU9mOiAoZnVuY3Rpb24gKE9iamVjdCwgbWFnaWMpIHtcbiAgICAgICAgdmFyIHNldDtcblxuICAgICAgICB2YXIgY2hlY2tBcmdzID0gZnVuY3Rpb24gKE8sIHByb3RvKSB7XG4gICAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3QoTykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgcHJvdG90eXBlIG9uIGEgbm9uLW9iamVjdCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShwcm90byA9PT0gbnVsbCB8fCBFUy5UeXBlSXNPYmplY3QocHJvdG8pKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FuIG9ubHkgc2V0IHByb3RvdHlwZSB0byBhbiBvYmplY3Qgb3IgbnVsbCcgKyBwcm90byk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChPLCBwcm90bykge1xuICAgICAgICAgIGNoZWNrQXJncyhPLCBwcm90byk7XG4gICAgICAgICAgc2V0LmNhbGwoTywgcHJvdG8pO1xuICAgICAgICAgIHJldHVybiBPO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gdGhpcyB3b3JrcyBhbHJlYWR5IGluIEZpcmVmb3ggYW5kIFNhZmFyaVxuICAgICAgICAgIHNldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoT2JqZWN0LnByb3RvdHlwZSwgbWFnaWMpLnNldDtcbiAgICAgICAgICBzZXQuY2FsbCh7fSwgbnVsbCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZSAhPT0ge31bbWFnaWNdKSB7XG4gICAgICAgICAgICAvLyBJRSA8IDExIGNhbm5vdCBiZSBzaGltbWVkXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHByb2JhYmx5IENocm9tZSBvciBzb21lIG9sZCBNb2JpbGUgc3RvY2sgYnJvd3NlclxuICAgICAgICAgIHNldCA9IGZ1bmN0aW9uIChwcm90bykge1xuICAgICAgICAgICAgdGhpc1ttYWdpY10gPSBwcm90bztcbiAgICAgICAgICB9O1xuICAgICAgICAgIC8vIHBsZWFzZSBub3RlIHRoYXQgdGhpcyB3aWxsICoqbm90Kiogd29ya1xuICAgICAgICAgIC8vIGluIHRob3NlIGJyb3dzZXJzIHRoYXQgZG8gbm90IGluaGVyaXRcbiAgICAgICAgICAvLyBfX3Byb3RvX18gYnkgbWlzdGFrZSBmcm9tIE9iamVjdC5wcm90b3R5cGVcbiAgICAgICAgICAvLyBpbiB0aGVzZSBjYXNlcyB3ZSBzaG91bGQgcHJvYmFibHkgdGhyb3cgYW4gZXJyb3JcbiAgICAgICAgICAvLyBvciBhdCBsZWFzdCBiZSBpbmZvcm1lZCBhYm91dCB0aGUgaXNzdWVcbiAgICAgICAgICBzZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9IHNldFByb3RvdHlwZU9mKFxuICAgICAgICAgICAgc2V0UHJvdG90eXBlT2Yoe30sIG51bGwpLFxuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZVxuICAgICAgICAgICkgaW5zdGFuY2VvZiBPYmplY3Q7XG4gICAgICAgICAgLy8gc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPT09IHRydWUgbWVhbnMgaXQgd29ya3MgYXMgbWVhbnRcbiAgICAgICAgICAvLyBzZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9PT0gZmFsc2UgbWVhbnMgaXQncyBub3QgMTAwJSByZWxpYWJsZVxuICAgICAgICAgIC8vIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID09PSB1bmRlZmluZWRcbiAgICAgICAgICAvLyBvclxuICAgICAgICAgIC8vIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID09ICBudWxsIG1lYW5zIGl0J3Mgbm90IGEgcG9seWZpbGxcbiAgICAgICAgICAvLyB3aGljaCBtZWFucyBpdCB3b3JrcyBhcyBleHBlY3RlZFxuICAgICAgICAgIC8vIHdlIGNhbiBldmVuIGRlbGV0ZSBPYmplY3QucHJvdG90eXBlLl9fcHJvdG9fXztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0UHJvdG90eXBlT2Y7XG4gICAgICB9KShPYmplY3QsICdfX3Byb3RvX18nKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBidWcgaW4gT3BlcmEgMTIgd2hlcmUgc2V0UHJvdG90eXBlT2YoeCwgbnVsbCkgZG9lc24ndCB3b3JrLFxuICAvLyBidXQgT2JqZWN0LmNyZWF0ZShudWxsKSBkb2VzLlxuICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJlxuICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5zZXRQcm90b3R5cGVPZih7fSwgbnVsbCkpICE9PSBudWxsICYmXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LmNyZWF0ZShudWxsKSkgPT09IG51bGwpIHtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIEZBS0VOVUxMID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHZhciBncG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsIHNwbyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZjtcbiAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBncG8obyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgPT09IEZBS0VOVUxMID8gbnVsbCA6IHJlc3VsdDtcbiAgICAgIH07XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiAobywgcCkge1xuICAgICAgICBpZiAocCA9PT0gbnVsbCkgeyBwID0gRkFLRU5VTEw7IH1cbiAgICAgICAgcmV0dXJuIHNwbyhvLCBwKTtcbiAgICAgIH07XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPSBmYWxzZTtcbiAgICB9KSgpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBPYmplY3Qua2V5cygnZm9vJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgb3JpZ2luYWxPYmplY3RLZXlzID0gT2JqZWN0LmtleXM7XG4gICAgT2JqZWN0LmtleXMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxPYmplY3RLZXlzKEVTLlRvT2JqZWN0KG9iaikpO1xuICAgIH07XG4gIH1cblxuICB2YXIgTWF0aFNoaW1zID0ge1xuICAgIGFjb3NoOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChOdW1iZXIuaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMSkgeyByZXR1cm4gTmFOOyB9XG4gICAgICBpZiAodmFsdWUgPT09IDEpIHsgcmV0dXJuIDA7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gSW5maW5pdHkpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gTWF0aC5sb2codmFsdWUgKyBNYXRoLnNxcnQodmFsdWUgKiB2YWx1ZSAtIDEpKTtcbiAgICB9LFxuXG4gICAgYXNpbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSAwIHx8ICFnbG9iYWxfaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAtTWF0aC5hc2luaCgtdmFsdWUpIDogTWF0aC5sb2codmFsdWUgKyBNYXRoLnNxcnQodmFsdWUgKiB2YWx1ZSArIDEpKTtcbiAgICB9LFxuXG4gICAgYXRhbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKE51bWJlci5pc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLTEpIHsgcmV0dXJuIC1JbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlID09PSAxKSB7IHJldHVybiBJbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlID09PSAwKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgcmV0dXJuIDAuNSAqIE1hdGgubG9nKCgxICsgdmFsdWUpIC8gKDEgLSB2YWx1ZSkpO1xuICAgIH0sXG5cbiAgICBjYnJ0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIHZhciBuZWdhdGUgPSB2YWx1ZSA8IDAsIHJlc3VsdDtcbiAgICAgIGlmIChuZWdhdGUpIHsgdmFsdWUgPSAtdmFsdWU7IH1cbiAgICAgIHJlc3VsdCA9IE1hdGgucG93KHZhbHVlLCAxIC8gMyk7XG4gICAgICByZXR1cm4gbmVnYXRlID8gLXJlc3VsdCA6IHJlc3VsdDtcbiAgICB9LFxuXG4gICAgY2x6MzI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gU2VlIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjQ2NVxuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgdmFyIG51bWJlciA9IEVTLlRvVWludDMyKHZhbHVlKTtcbiAgICAgIGlmIChudW1iZXIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDMyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDMyIC0gKG51bWJlcikudG9TdHJpbmcoMikubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBjb3NoOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gMCkgeyByZXR1cm4gMTsgfSAvLyArMCBvciAtMFxuICAgICAgaWYgKE51bWJlci5pc05hTih2YWx1ZSkpIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKCFnbG9iYWxfaXNGaW5pdGUodmFsdWUpKSB7IHJldHVybiBJbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlIDwgMCkgeyB2YWx1ZSA9IC12YWx1ZTsgfVxuICAgICAgaWYgKHZhbHVlID4gMjEpIHsgcmV0dXJuIE1hdGguZXhwKHZhbHVlKSAvIDI7IH1cbiAgICAgIHJldHVybiAoTWF0aC5leHAodmFsdWUpICsgTWF0aC5leHAoLXZhbHVlKSkgLyAyO1xuICAgIH0sXG5cbiAgICBleHBtMTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IC1JbmZpbml0eSkgeyByZXR1cm4gLTE7IH1cbiAgICAgIGlmICghZ2xvYmFsX2lzRmluaXRlKHZhbHVlKSB8fCB2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIHJldHVybiBNYXRoLmV4cCh2YWx1ZSkgLSAxO1xuICAgIH0sXG5cbiAgICBoeXBvdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgIHZhciBhbnlOYU4gPSBmYWxzZTtcbiAgICAgIHZhciBhbGxaZXJvID0gdHJ1ZTtcbiAgICAgIHZhciBhbnlJbmZpbml0eSA9IGZhbHNlO1xuICAgICAgdmFyIG51bWJlcnMgPSBbXTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5ldmVyeS5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgbnVtID0gTnVtYmVyKGFyZyk7XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4obnVtKSkge1xuICAgICAgICAgIGFueU5hTiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIGFueUluZmluaXR5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChudW0gIT09IDApIHtcbiAgICAgICAgICBhbGxaZXJvID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFueUluZmluaXR5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKCFhbnlOYU4pIHtcbiAgICAgICAgICBudW1iZXJzLnB1c2goTWF0aC5hYnMobnVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChhbnlJbmZpbml0eSkgeyByZXR1cm4gSW5maW5pdHk7IH1cbiAgICAgIGlmIChhbnlOYU4pIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKGFsbFplcm8pIHsgcmV0dXJuIDA7IH1cblxuICAgICAgbnVtYmVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiIC0gYTsgfSk7XG4gICAgICB2YXIgbGFyZ2VzdCA9IG51bWJlcnNbMF07XG4gICAgICB2YXIgZGl2aWRlZCA9IG51bWJlcnMubWFwKGZ1bmN0aW9uIChudW1iZXIpIHsgcmV0dXJuIG51bWJlciAvIGxhcmdlc3Q7IH0pO1xuICAgICAgdmFyIHN1bSA9IGRpdmlkZWQucmVkdWNlKGZ1bmN0aW9uIChzdW0sIG51bWJlcikgeyByZXR1cm4gc3VtICs9IG51bWJlciAqIG51bWJlcjsgfSwgMCk7XG4gICAgICByZXR1cm4gbGFyZ2VzdCAqIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBsb2cyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZyh2YWx1ZSkgKiBNYXRoLkxPRzJFO1xuICAgIH0sXG5cbiAgICBsb2cxMDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2codmFsdWUpICogTWF0aC5MT0cxMEU7XG4gICAgfSxcblxuICAgIGxvZzFwOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IE51bWJlci5pc05hTih2YWx1ZSkpIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlID09PSBJbmZpbml0eSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLTEpIHsgcmV0dXJuIC1JbmZpbml0eTsgfVxuICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICB2YXIgbiA9IDUwO1xuXG4gICAgICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMSkgeyByZXR1cm4gTWF0aC5sb2coMSArIHZhbHVlKTsgfVxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKChpICUgMikgPT09IDApIHtcbiAgICAgICAgICByZXN1bHQgLT0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgKz0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzaWduOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAobnVtYmVyID09PSAwKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIGlmIChOdW1iZXIuaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gbnVtYmVyOyB9XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC0xIDogMTtcbiAgICB9LFxuXG4gICAgc2luaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoIWdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSkgfHwgdmFsdWUgPT09IDApIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gKE1hdGguZXhwKHZhbHVlKSAtIE1hdGguZXhwKC12YWx1ZSkpIC8gMjtcbiAgICB9LFxuXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gSW5maW5pdHkpIHsgcmV0dXJuIDE7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLUluZmluaXR5KSB7IHJldHVybiAtMTsgfVxuICAgICAgcmV0dXJuIChNYXRoLmV4cCh2YWx1ZSkgLSBNYXRoLmV4cCgtdmFsdWUpKSAvIChNYXRoLmV4cCh2YWx1ZSkgKyBNYXRoLmV4cCgtdmFsdWUpKTtcbiAgICB9LFxuXG4gICAgdHJ1bmM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC1NYXRoLmZsb29yKC1udW1iZXIpIDogTWF0aC5mbG9vcihudW1iZXIpO1xuICAgIH0sXG5cbiAgICBpbXVsOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgLy8gdGFrZW4gZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL2ltdWxcbiAgICAgIHggPSBFUy5Ub1VpbnQzMih4KTtcbiAgICAgIHkgPSBFUy5Ub1VpbnQzMih5KTtcbiAgICAgIHZhciBhaCAgPSAoeCA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGFsID0geCAmIDB4ZmZmZjtcbiAgICAgIHZhciBiaCAgPSAoeSA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGJsID0geSAmIDB4ZmZmZjtcbiAgICAgIC8vIHRoZSBzaGlmdCBieSAwIGZpeGVzIHRoZSBzaWduIG9uIHRoZSBoaWdoIHBhcnRcbiAgICAgIC8vIHRoZSBmaW5hbCB8MCBjb252ZXJ0cyB0aGUgdW5zaWduZWQgdmFsdWUgaW50byBhIHNpZ25lZCB2YWx1ZVxuICAgICAgcmV0dXJuICgoYWwgKiBibCkgKyAoKChhaCAqIGJsICsgYWwgKiBiaCkgPDwgMTYpID4+PiAwKXwwKTtcbiAgICB9LFxuXG4gICAgZnJvdW5kOiBmdW5jdGlvbiAoeCkge1xuICAgICAgaWYgKHggPT09IDAgfHwgeCA9PT0gSW5maW5pdHkgfHwgeCA9PT0gLUluZmluaXR5IHx8IE51bWJlci5pc05hTih4KSkge1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH1cbiAgICAgIHZhciBudW0gPSBOdW1iZXIoeCk7XG4gICAgICByZXR1cm4gbnVtYmVyQ29udmVyc2lvbi50b0Zsb2F0MzIobnVtKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZVByb3BlcnRpZXMoTWF0aCwgTWF0aFNoaW1zKTtcblxuICBpZiAoTWF0aC5pbXVsKDB4ZmZmZmZmZmYsIDUpICE9PSAtNSkge1xuICAgIC8vIFNhZmFyaSA2LjEsIGF0IGxlYXN0LCByZXBvcnRzIFwiMFwiIGZvciB0aGlzIHZhbHVlXG4gICAgTWF0aC5pbXVsID0gTWF0aFNoaW1zLmltdWw7XG4gIH1cblxuICAvLyBQcm9taXNlc1xuICAvLyBTaW1wbGVzdCBwb3NzaWJsZSBpbXBsZW1lbnRhdGlvbjsgdXNlIGEgM3JkLXBhcnR5IGxpYnJhcnkgaWYgeW91XG4gIC8vIHdhbnQgdGhlIGJlc3QgcG9zc2libGUgc3BlZWQgYW5kL29yIGxvbmcgc3RhY2sgdHJhY2VzLlxuICB2YXIgUHJvbWlzZVNoaW0gPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFByb21pc2UsIFByb21pc2UkcHJvdG90eXBlO1xuXG4gICAgRVMuSXNQcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHByb21pc2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghcHJvbWlzZS5fcHJvbWlzZUNvbnN0cnVjdG9yKSB7XG4gICAgICAgIC8vIF9wcm9taXNlQ29uc3RydWN0b3IgaXMgYSBiaXQgbW9yZSB1bmlxdWUgdGhhbiBfc3RhdHVzLCBzbyB3ZSdsbFxuICAgICAgICAvLyBjaGVjayB0aGF0IGluc3RlYWQgb2YgdGhlIFtbUHJvbWlzZVN0YXR1c11dIGludGVybmFsIGZpZWxkLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByb21pc2UuX3N0YXR1cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyB1bmluaXRpYWxpemVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLy8gXCJQcm9taXNlQ2FwYWJpbGl0eVwiIGluIHRoZSBzcGVjIGlzIHdoYXQgbW9zdCBwcm9taXNlIGltcGxlbWVudGF0aW9uc1xuICAgIC8vIGNhbGwgYSBcImRlZmVycmVkXCIuXG4gICAgdmFyIFByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShDKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgICAgfVxuICAgICAgdmFyIGNhcGFiaWxpdHkgPSB0aGlzO1xuICAgICAgdmFyIHJlc29sdmVyID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBjYXBhYmlsaXR5LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBjYXBhYmlsaXR5LnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH07XG4gICAgICBjYXBhYmlsaXR5LnByb21pc2UgPSBFUy5Db25zdHJ1Y3QoQywgW3Jlc29sdmVyXSk7XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDc4XG4gICAgICBpZiAoIWNhcGFiaWxpdHkucHJvbWlzZS5fZXM2Y29uc3RydWN0KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgICB9XG4gICAgICBpZiAoIShFUy5Jc0NhbGxhYmxlKGNhcGFiaWxpdHkucmVzb2x2ZSkgJiZcbiAgICAgICAgICAgIEVTLklzQ2FsbGFibGUoY2FwYWJpbGl0eS5yZWplY3QpKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBmaW5kIGFuIGFwcHJvcHJpYXRlIHNldEltbWVkaWF0ZS1hbGlrZVxuICAgIHZhciBzZXRUaW1lb3V0ID0gZ2xvYmFscy5zZXRUaW1lb3V0O1xuICAgIHZhciBtYWtlWmVyb1RpbWVvdXQ7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIEVTLklzQ2FsbGFibGUod2luZG93LnBvc3RNZXNzYWdlKSkge1xuICAgICAgbWFrZVplcm9UaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBmcm9tIGh0dHA6Ly9kYmFyb24ub3JnL2xvZy8yMDEwMDMwOS1mYXN0ZXItdGltZW91dHNcbiAgICAgICAgdmFyIHRpbWVvdXRzID0gW107XG4gICAgICAgIHZhciBtZXNzYWdlTmFtZSA9ICd6ZXJvLXRpbWVvdXQtbWVzc2FnZSc7XG4gICAgICAgIHZhciBzZXRaZXJvVGltZW91dCA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgIHRpbWVvdXRzLnB1c2goZm4pO1xuICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZShtZXNzYWdlTmFtZSwgJyonKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGhhbmRsZU1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09IHdpbmRvdyAmJiBldmVudC5kYXRhID09IG1lc3NhZ2VOYW1lKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0cy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICB2YXIgZm4gPSB0aW1lb3V0cy5zaGlmdCgpO1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaGFuZGxlTWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBzZXRaZXJvVGltZW91dDtcbiAgICAgIH07XG4gICAgfVxuICAgIHZhciBtYWtlUHJvbWlzZUFzYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBBbiBlZmZpY2llbnQgdGFzay1zY2hlZHVsZXIgYmFzZWQgb24gYSBwcmUtZXhpc3RpbmcgUHJvbWlzZVxuICAgICAgLy8gaW1wbGVtZW50YXRpb24sIHdoaWNoIHdlIGNhbiB1c2UgZXZlbiBpZiB3ZSBvdmVycmlkZSB0aGVcbiAgICAgIC8vIGdsb2JhbCBQcm9taXNlIGJlbG93IChpbiBvcmRlciB0byB3b3JrYXJvdW5kIGJ1Z3MpXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vUmF5bm9zL29ic2Vydi1oYXNoL2lzc3Vlcy8yI2lzc3VlY29tbWVudC0zNTg1NzY3MVxuICAgICAgdmFyIFAgPSBnbG9iYWxzLlByb21pc2U7XG4gICAgICByZXR1cm4gUCAmJiBQLnJlc29sdmUgJiYgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFAucmVzb2x2ZSgpLnRoZW4odGFzayk7XG4gICAgICB9O1xuICAgIH07XG4gICAgdmFyIGVucXVldWUgPSBFUy5Jc0NhbGxhYmxlKGdsb2JhbHMuc2V0SW1tZWRpYXRlKSA/XG4gICAgICBnbG9iYWxzLnNldEltbWVkaWF0ZS5iaW5kKGdsb2JhbHMpIDpcbiAgICAgIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLm5leHRUaWNrID8gcHJvY2Vzcy5uZXh0VGljayA6XG4gICAgICBtYWtlUHJvbWlzZUFzYXAoKSB8fFxuICAgICAgKEVTLklzQ2FsbGFibGUobWFrZVplcm9UaW1lb3V0KSA/IG1ha2VaZXJvVGltZW91dCgpIDpcbiAgICAgIGZ1bmN0aW9uICh0YXNrKSB7IHNldFRpbWVvdXQodGFzaywgMCk7IH0pOyAvLyBmYWxsYmFja1xuXG4gICAgdmFyIHRyaWdnZXJQcm9taXNlUmVhY3Rpb25zID0gZnVuY3Rpb24gKHJlYWN0aW9ucywgeCkge1xuICAgICAgcmVhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKHJlYWN0aW9uKSB7XG4gICAgICAgIGVucXVldWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIFByb21pc2VSZWFjdGlvblRhc2tcbiAgICAgICAgICB2YXIgaGFuZGxlciA9IHJlYWN0aW9uLmhhbmRsZXI7XG4gICAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSByZWFjdGlvbi5jYXBhYmlsaXR5O1xuICAgICAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIoeCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBjYXBhYmlsaXR5LnByb21pc2UpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2VsZiByZXNvbHV0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdXBkYXRlUmVzdWx0ID1cbiAgICAgICAgICAgICAgdXBkYXRlUHJvbWlzZUZyb21Qb3RlbnRpYWxUaGVuYWJsZShyZXN1bHQsIGNhcGFiaWxpdHkpO1xuICAgICAgICAgICAgaWYgKCF1cGRhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGVQcm9taXNlRnJvbVBvdGVudGlhbFRoZW5hYmxlID0gZnVuY3Rpb24gKHgsIGNhcGFiaWxpdHkpIHtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHRoZW4gPSB4LnRoZW47IC8vIG9ubHkgb25lIGludm9jYXRpb24gb2YgYWNjZXNzb3JcbiAgICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHRoZW4pKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICB0aGVuLmNhbGwoeCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhciBwcm9taXNlUmVzb2x1dGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAoeCA9PT0gcHJvbWlzZSkge1xuICAgICAgICAgIHJldHVybiBvblJlamVjdGVkKG5ldyBUeXBlRXJyb3IoJ3NlbGYgcmVzb2x1dGlvbicpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgQyA9IHByb21pc2UuX3Byb21pc2VDb25zdHJ1Y3RvcjtcbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIHZhciB1cGRhdGVSZXN1bHQgPSB1cGRhdGVQcm9taXNlRnJvbVBvdGVudGlhbFRoZW5hYmxlKHgsIGNhcGFiaWxpdHkpO1xuICAgICAgICBpZiAodXBkYXRlUmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gb25GdWxmaWxsZWQoeCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIFByb21pc2UgPSBmdW5jdGlvbiAocmVzb2x2ZXIpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICAgIHByb21pc2UgPSBlbXVsYXRlRVM2Y29uc3RydWN0KHByb21pc2UpO1xuICAgICAgaWYgKCFwcm9taXNlLl9wcm9taXNlQ29uc3RydWN0b3IpIHtcbiAgICAgICAgLy8gd2UgdXNlIF9wcm9taXNlQ29uc3RydWN0b3IgYXMgYSBzdGFuZC1pbiBmb3IgdGhlIGludGVybmFsXG4gICAgICAgIC8vIFtbUHJvbWlzZVN0YXR1c11dIGZpZWxkOyBpdCdzIGEgbGl0dGxlIG1vcmUgdW5pcXVlLlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZScpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwcm9taXNlLl9zdGF0dXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Byb21pc2UgYWxyZWFkeSBpbml0aWFsaXplZCcpO1xuICAgICAgfVxuICAgICAgLy8gc2VlIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjQ4MlxuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHJlc29sdmVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSB2YWxpZCByZXNvbHZlcicpO1xuICAgICAgfVxuICAgICAgcHJvbWlzZS5fc3RhdHVzID0gJ3VucmVzb2x2ZWQnO1xuICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucyA9IFtdO1xuICAgICAgcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zID0gW107XG5cbiAgICAgIHZhciByZXNvbHZlID0gZnVuY3Rpb24gKHJlc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXR1cyAhPT0gJ3VucmVzb2x2ZWQnKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgcmVhY3Rpb25zID0gcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucztcbiAgICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVzb2x1dGlvbjtcbiAgICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucyA9IHZvaWQgMDtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zID0gdm9pZCAwO1xuICAgICAgICBwcm9taXNlLl9zdGF0dXMgPSAnaGFzLXJlc29sdXRpb24nO1xuICAgICAgICB0cmlnZ2VyUHJvbWlzZVJlYWN0aW9ucyhyZWFjdGlvbnMsIHJlc29sdXRpb24pO1xuICAgICAgfTtcbiAgICAgIHZhciByZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChwcm9taXNlLl9zdGF0dXMgIT09ICd1bnJlc29sdmVkJykgeyByZXR1cm47IH1cbiAgICAgICAgdmFyIHJlYWN0aW9ucyA9IHByb21pc2UuX3JlamVjdFJlYWN0aW9ucztcbiAgICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuICAgICAgICBwcm9taXNlLl9yZXNvbHZlUmVhY3Rpb25zID0gdm9pZCAwO1xuICAgICAgICBwcm9taXNlLl9yZWplY3RSZWFjdGlvbnMgPSB2b2lkIDA7XG4gICAgICAgIHByb21pc2UuX3N0YXR1cyA9ICdoYXMtcmVqZWN0aW9uJztcbiAgICAgICAgdHJpZ2dlclByb21pc2VSZWFjdGlvbnMocmVhY3Rpb25zLCByZWFzb24pO1xuICAgICAgfTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG4gICAgUHJvbWlzZSRwcm90b3R5cGUgPSBQcm9taXNlLnByb3RvdHlwZTtcbiAgICB2YXIgX3Byb21pc2VBbGxSZXNvbHZlciA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWVzLCBjYXBhYmlsaXR5LCByZW1haW5pbmcpIHtcbiAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKGRvbmUpIHsgcmV0dXJuOyB9IC8vIHByb3RlY3QgYWdhaW5zdCBiZWluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB4O1xuICAgICAgICBpZiAoKC0tcmVtYWluaW5nLmNvdW50KSA9PT0gMCkge1xuICAgICAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgICAgIHJlc29sdmUodmFsdWVzKTsgLy8gY2FsbCB3LyB0aGlzPT09dW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGRlZmluZVByb3BlcnRpZXMoUHJvbWlzZSwge1xuICAgICAgJ0BAY3JlYXRlJzogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgICAvLyBBbGxvY2F0ZVByb21pc2VcbiAgICAgICAgLy8gVGhlIGBvYmpgIHBhcmFtZXRlciBpcyBhIGhhY2sgd2UgdXNlIGZvciBlczVcbiAgICAgICAgLy8gY29tcGF0aWJpbGl0eS5cbiAgICAgICAgdmFyIHByb3RvdHlwZSA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZSB8fCBQcm9taXNlJHByb3RvdHlwZTtcbiAgICAgICAgb2JqID0gb2JqIHx8IGNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKG9iaiwge1xuICAgICAgICAgIF9zdGF0dXM6IHZvaWQgMCxcbiAgICAgICAgICBfcmVzdWx0OiB2b2lkIDAsXG4gICAgICAgICAgX3Jlc29sdmVSZWFjdGlvbnM6IHZvaWQgMCxcbiAgICAgICAgICBfcmVqZWN0UmVhY3Rpb25zOiB2b2lkIDAsXG4gICAgICAgICAgX3Byb21pc2VDb25zdHJ1Y3Rvcjogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICBvYmouX3Byb21pc2VDb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSxcblxuICAgICAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpIHtcbiAgICAgICAgdmFyIEMgPSB0aGlzO1xuICAgICAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIUVTLklzSXRlcmFibGUoaXRlcmFibGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgaXRlcmFibGUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGl0ID0gRVMuR2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXSwgcmVtYWluaW5nID0geyBjb3VudDogMSB9O1xuICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IEVTLkl0ZXJhdG9yTmV4dChpdCk7XG4gICAgICAgICAgICBpZiAobmV4dC5kb25lKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5leHRQcm9taXNlID0gQy5yZXNvbHZlKG5leHQudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHJlc29sdmVFbGVtZW50ID0gX3Byb21pc2VBbGxSZXNvbHZlcihcbiAgICAgICAgICAgICAgaW5kZXgsIHZhbHVlcywgY2FwYWJpbGl0eSwgcmVtYWluaW5nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmVtYWluaW5nLmNvdW50Kys7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKHJlc29sdmVFbGVtZW50LCBjYXBhYmlsaXR5LnJlamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoLS1yZW1haW5pbmcuY291bnQpID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7IC8vIGNhbGwgdy8gdGhpcz09PXVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICAgICAgfSxcblxuICAgICAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICAgICAgICB2YXIgQyA9IHRoaXM7XG4gICAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAgICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghRVMuSXNJdGVyYWJsZShpdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBpdGVyYWJsZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaXQgPSBFUy5HZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHtcbiAgICAgICAgICAgICAgLy8gSWYgaXRlcmFibGUgaGFzIG5vIGl0ZW1zLCByZXN1bHRpbmcgcHJvbWlzZSB3aWxsIG5ldmVyXG4gICAgICAgICAgICAgIC8vIHJlc29sdmU7IHNlZTpcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvcHJvbWlzZXMtdW53cmFwcGluZy9pc3N1ZXMvNzVcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNTE1XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5leHRQcm9taXNlID0gQy5yZXNvbHZlKG5leHQudmFsdWUpO1xuICAgICAgICAgICAgbmV4dFByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICAgICAgfSxcblxuICAgICAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gICAgICAgIHZhciBDID0gdGhpcztcbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIHZhciByZWplY3RQcm9taXNlID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgICAgIHJlamVjdFByb21pc2UocmVhc29uKTsgLy8gY2FsbCB3aXRoIHRoaXM9PT11bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICAgIH0sXG5cbiAgICAgIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUodikge1xuICAgICAgICB2YXIgQyA9IHRoaXM7XG4gICAgICAgIGlmIChFUy5Jc1Byb21pc2UodikpIHtcbiAgICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB2Ll9wcm9taXNlQ29uc3RydWN0b3I7XG4gICAgICAgICAgaWYgKGNvbnN0cnVjdG9yID09PSBDKSB7IHJldHVybiB2OyB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIHZhciByZXNvbHZlUHJvbWlzZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAgICAgcmVzb2x2ZVByb21pc2Uodik7IC8vIGNhbGwgd2l0aCB0aGlzPT09dW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmVQcm9wZXJ0aWVzKFByb21pc2UkcHJvdG90eXBlLCB7XG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgb25SZWplY3RlZCk7XG4gICAgICB9LFxuXG4gICAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICAgICAgaWYgKCFFUy5Jc1Byb21pc2UocHJvbWlzZSkpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgcHJvbWlzZScpOyB9XG4gICAgICAgIC8vIHRoaXMuY29uc3RydWN0b3Igbm90IHRoaXMuX3Byb21pc2VDb25zdHJ1Y3Rvcjsgc2VlXG4gICAgICAgIC8vIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjUxM1xuICAgICAgICB2YXIgQyA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgICBpZiAoIUVTLklzQ2FsbGFibGUob25SZWplY3RlZCkpIHtcbiAgICAgICAgICBvblJlamVjdGVkID0gZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIUVTLklzQ2FsbGFibGUob25GdWxmaWxsZWQpKSB7XG4gICAgICAgICAgb25GdWxmaWxsZWQgPSBmdW5jdGlvbiAoeCkgeyByZXR1cm4geDsgfTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzb2x1dGlvbkhhbmRsZXIgPSBwcm9taXNlUmVzb2x1dGlvbkhhbmRsZXIocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpO1xuICAgICAgICB2YXIgcmVzb2x2ZVJlYWN0aW9uID0geyBjYXBhYmlsaXR5OiBjYXBhYmlsaXR5LCBoYW5kbGVyOiByZXNvbHV0aW9uSGFuZGxlciB9O1xuICAgICAgICB2YXIgcmVqZWN0UmVhY3Rpb24gPSB7IGNhcGFiaWxpdHk6IGNhcGFiaWxpdHksIGhhbmRsZXI6IG9uUmVqZWN0ZWQgfTtcbiAgICAgICAgc3dpdGNoIChwcm9taXNlLl9zdGF0dXMpIHtcbiAgICAgICAgICBjYXNlICd1bnJlc29sdmVkJzpcbiAgICAgICAgICAgIHByb21pc2UuX3Jlc29sdmVSZWFjdGlvbnMucHVzaChyZXNvbHZlUmVhY3Rpb24pO1xuICAgICAgICAgICAgcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zLnB1c2gocmVqZWN0UmVhY3Rpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaGFzLXJlc29sdXRpb24nOlxuICAgICAgICAgICAgdHJpZ2dlclByb21pc2VSZWFjdGlvbnMoW3Jlc29sdmVSZWFjdGlvbl0sIHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdoYXMtcmVqZWN0aW9uJzpcbiAgICAgICAgICAgIHRyaWdnZXJQcm9taXNlUmVhY3Rpb25zKFtyZWplY3RSZWFjdGlvbl0sIHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5leHBlY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZTtcbiAgfSgpKTtcblxuICAvLyBDaHJvbWUncyBuYXRpdmUgUHJvbWlzZSBoYXMgZXh0cmEgbWV0aG9kcyB0aGF0IGl0IHNob3VsZG4ndCBoYXZlLiBMZXQncyByZW1vdmUgdGhlbS5cbiAgaWYgKGdsb2JhbHMuUHJvbWlzZSkge1xuICAgIGRlbGV0ZSBnbG9iYWxzLlByb21pc2UuYWNjZXB0O1xuICAgIGRlbGV0ZSBnbG9iYWxzLlByb21pc2UuZGVmZXI7XG4gICAgZGVsZXRlIGdsb2JhbHMuUHJvbWlzZS5wcm90b3R5cGUuY2hhaW47XG4gIH1cblxuICAvLyBleHBvcnQgdGhlIFByb21pc2UgY29uc3RydWN0b3IuXG4gIGRlZmluZVByb3BlcnRpZXMoZ2xvYmFscywgeyBQcm9taXNlOiBQcm9taXNlU2hpbSB9KTtcbiAgLy8gSW4gQ2hyb21lIDMzIChhbmQgdGhlcmVhYm91dHMpIFByb21pc2UgaXMgZGVmaW5lZCwgYnV0IHRoZVxuICAvLyBpbXBsZW1lbnRhdGlvbiBpcyBidWdneSBpbiBhIG51bWJlciBvZiB3YXlzLiAgTGV0J3MgY2hlY2sgc3ViY2xhc3NpbmdcbiAgLy8gc3VwcG9ydCB0byBzZWUgaWYgd2UgaGF2ZSBhIGJ1Z2d5IGltcGxlbWVudGF0aW9uLlxuICB2YXIgcHJvbWlzZVN1cHBvcnRzU3ViY2xhc3NpbmcgPSBzdXBwb3J0c1N1YmNsYXNzaW5nKGdsb2JhbHMuUHJvbWlzZSwgZnVuY3Rpb24gKFMpIHtcbiAgICByZXR1cm4gUy5yZXNvbHZlKDQyKSBpbnN0YW5jZW9mIFM7XG4gIH0pO1xuICB2YXIgcHJvbWlzZUlnbm9yZXNOb25GdW5jdGlvblRoZW5DYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICBnbG9iYWxzLlByb21pc2UucmVqZWN0KDQyKS50aGVuKG51bGwsIDUpLnRoZW4obnVsbCwgZnVuY3Rpb24gKCkge30pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0oKSk7XG4gIHZhciBwcm9taXNlUmVxdWlyZXNPYmplY3RDb250ZXh0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkgeyBQcm9taXNlLmNhbGwoMywgZnVuY3Rpb24gKCkge30pOyB9IGNhdGNoIChlKSB7IHJldHVybiB0cnVlOyB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KCkpO1xuICBpZiAoIXByb21pc2VTdXBwb3J0c1N1YmNsYXNzaW5nIHx8ICFwcm9taXNlSWdub3Jlc05vbkZ1bmN0aW9uVGhlbkNhbGxiYWNrcyB8fCAhcHJvbWlzZVJlcXVpcmVzT2JqZWN0Q29udGV4dCkge1xuICAgIC8qZ2xvYmFscyBQcm9taXNlOiB0cnVlICovXG4gICAgUHJvbWlzZSA9IFByb21pc2VTaGltO1xuICAgIC8qZ2xvYmFscyBQcm9taXNlOiBmYWxzZSAqL1xuICAgIGRlZmluZVByb3BlcnR5KGdsb2JhbHMsICdQcm9taXNlJywgUHJvbWlzZVNoaW0sIHRydWUpO1xuICB9XG5cbiAgLy8gTWFwIGFuZCBTZXQgcmVxdWlyZSBhIHRydWUgRVM1IGVudmlyb25tZW50XG4gIC8vIFRoZWlyIGZhc3QgcGF0aCBhbHNvIHJlcXVpcmVzIHRoYXQgdGhlIGVudmlyb25tZW50IHByZXNlcnZlXG4gIC8vIHByb3BlcnR5IGluc2VydGlvbiBvcmRlciwgd2hpY2ggaXMgbm90IGd1YXJhbnRlZWQgYnkgdGhlIHNwZWMuXG4gIHZhciB0ZXN0T3JkZXIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBiID0gT2JqZWN0LmtleXMoYS5yZWR1Y2UoZnVuY3Rpb24gKG8sIGspIHtcbiAgICAgIG9ba10gPSB0cnVlO1xuICAgICAgcmV0dXJuIG87XG4gICAgfSwge30pKTtcbiAgICByZXR1cm4gYS5qb2luKCc6JykgPT09IGIuam9pbignOicpO1xuICB9O1xuICB2YXIgcHJlc2VydmVzSW5zZXJ0aW9uT3JkZXIgPSB0ZXN0T3JkZXIoWyd6JywgJ2EnLCAnYmInXSk7XG4gIC8vIHNvbWUgZW5naW5lcyAoZWcsIENocm9tZSkgb25seSBwcmVzZXJ2ZSBpbnNlcnRpb24gb3JkZXIgZm9yIHN0cmluZyBrZXlzXG4gIHZhciBwcmVzZXJ2ZXNOdW1lcmljSW5zZXJ0aW9uT3JkZXIgPSB0ZXN0T3JkZXIoWyd6JywgMSwgJ2EnLCAnMycsIDJdKTtcblxuICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuXG4gICAgdmFyIGZhc3RrZXkgPSBmdW5jdGlvbiBmYXN0a2V5KGtleSkge1xuICAgICAgaWYgKCFwcmVzZXJ2ZXNJbnNlcnRpb25PcmRlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIGtleTtcbiAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gJyQnICsga2V5O1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBub3RlIHRoYXQgLTAgd2lsbCBnZXQgY29lcmNlZCB0byBcIjBcIiB3aGVuIHVzZWQgYXMgYSBwcm9wZXJ0eSBrZXlcbiAgICAgICAgaWYgKCFwcmVzZXJ2ZXNOdW1lcmljSW5zZXJ0aW9uT3JkZXIpIHtcbiAgICAgICAgICByZXR1cm4gJ24nICsga2V5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdmFyIGVtcHR5T2JqZWN0ID0gZnVuY3Rpb24gZW1wdHlPYmplY3QoKSB7XG4gICAgICAvLyBhY2NvbW9kYXRlIHNvbWUgb2xkZXIgbm90LXF1aXRlLUVTNSBicm93c2Vyc1xuICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge307XG4gICAgfTtcblxuICAgIHZhciBjb2xsZWN0aW9uU2hpbXMgPSB7XG4gICAgICBNYXA6IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGVtcHR5ID0ge307XG5cbiAgICAgICAgZnVuY3Rpb24gTWFwRW50cnkoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIHRoaXMua2V5ID0ga2V5O1xuICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgICAgICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBNYXBFbnRyeS5wcm90b3R5cGUuaXNSZW1vdmVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmtleSA9PT0gZW1wdHk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gTWFwSXRlcmF0b3IobWFwLCBraW5kKSB7XG4gICAgICAgICAgdGhpcy5oZWFkID0gbWFwLl9oZWFkO1xuICAgICAgICAgIHRoaXMuaSA9IHRoaXMuaGVhZDtcbiAgICAgICAgICB0aGlzLmtpbmQgPSBraW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgTWFwSXRlcmF0b3IucHJvdG90eXBlID0ge1xuICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5pLCBraW5kID0gdGhpcy5raW5kLCBoZWFkID0gdGhpcy5oZWFkLCByZXN1bHQ7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuaSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGkuaXNSZW1vdmVkKCkgJiYgaSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICAvLyBiYWNrIHVwIG9mZiBvZiByZW1vdmVkIGVudHJpZXNcbiAgICAgICAgICAgICAgaSA9IGkucHJldjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkdmFuY2UgdG8gbmV4dCB1bnJldHVybmVkIGVsZW1lbnQuXG4gICAgICAgICAgICB3aGlsZSAoaS5uZXh0ICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIGkgPSBpLm5leHQ7XG4gICAgICAgICAgICAgIGlmICghaS5pc1JlbW92ZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAna2V5Jykge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaS5rZXk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmFsdWUnKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBpLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBbaS5rZXksIGkudmFsdWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmkgPSBpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiByZXN1bHQsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG9uY2UgdGhlIGl0ZXJhdG9yIGlzIGRvbmUsIGl0IGlzIGRvbmUgZm9yZXZlci5cbiAgICAgICAgICAgIHRoaXMuaSA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGFkZEl0ZXJhdG9yKE1hcEl0ZXJhdG9yLnByb3RvdHlwZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gTWFwKGl0ZXJhYmxlKSB7XG4gICAgICAgICAgdmFyIG1hcCA9IHRoaXM7XG4gICAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3QobWFwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGRvZXMgbm90IGFjY2VwdCBhcmd1bWVudHMgd2hlbiBjYWxsZWQgYXMgYSBmdW5jdGlvbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXAgPSBlbXVsYXRlRVM2Y29uc3RydWN0KG1hcCk7XG4gICAgICAgICAgaWYgKCFtYXAuX2VzNm1hcCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIG1hcCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBoZWFkID0gbmV3IE1hcEVudHJ5KG51bGwsIG51bGwpO1xuICAgICAgICAgIC8vIGNpcmN1bGFyIGRvdWJseS1saW5rZWQgbGlzdC5cbiAgICAgICAgICBoZWFkLm5leHQgPSBoZWFkLnByZXYgPSBoZWFkO1xuXG4gICAgICAgICAgZGVmaW5lUHJvcGVydGllcyhtYXAsIHtcbiAgICAgICAgICAgIF9oZWFkOiBoZWFkLFxuICAgICAgICAgICAgX3N0b3JhZ2U6IGVtcHR5T2JqZWN0KCksXG4gICAgICAgICAgICBfc2l6ZTogMFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gT3B0aW9uYWxseSBpbml0aWFsaXplIG1hcCBmcm9tIGl0ZXJhYmxlXG4gICAgICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgaXRlcmFibGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBpdCA9IEVTLkdldEl0ZXJhdG9yKGl0ZXJhYmxlKTtcbiAgICAgICAgICAgIHZhciBhZGRlciA9IG1hcC5zZXQ7XG4gICAgICAgICAgICBpZiAoIUVTLklzQ2FsbGFibGUoYWRkZXIpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBtYXAnKTsgfVxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgdmFyIG5leHQgPSBFUy5JdGVyYXRvck5leHQoaXQpO1xuICAgICAgICAgICAgICBpZiAobmV4dC5kb25lKSB7IGJyZWFrOyB9XG4gICAgICAgICAgICAgIHZhciBuZXh0SXRlbSA9IG5leHQudmFsdWU7XG4gICAgICAgICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KG5leHRJdGVtKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIGl0ZXJhYmxlIG9mIHBhaXJzJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWRkZXIuY2FsbChtYXAsIG5leHRJdGVtWzBdLCBuZXh0SXRlbVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIE1hcCRwcm90b3R5cGUgPSBNYXAucHJvdG90eXBlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKE1hcCwge1xuICAgICAgICAgICdAQGNyZWF0ZSc6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgcHJvdG90eXBlID0gY29uc3RydWN0b3IucHJvdG90eXBlIHx8IE1hcCRwcm90b3R5cGU7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgY3JlYXRlKHByb3RvdHlwZSk7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKG9iaiwgeyBfZXM2bWFwOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNYXAucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3NpemUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NpemUgbWV0aG9kIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgTWFwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmluZVByb3BlcnRpZXMoTWFwLnByb3RvdHlwZSwge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXkgPSBmYXN0a2V5KGtleSk7XG4gICAgICAgICAgICBpZiAoZmtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBmYXN0IE8oMSkgcGF0aFxuICAgICAgICAgICAgICB2YXIgZW50cnkgPSB0aGlzLl9zdG9yYWdlW2ZrZXldO1xuICAgICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50cnkudmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQsIGkgPSBoZWFkO1xuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpLnZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGhhczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXkgPSBmYXN0a2V5KGtleSk7XG4gICAgICAgICAgICBpZiAoZmtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBmYXN0IE8oMSkgcGF0aFxuICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX3N0b3JhZ2VbZmtleV0gIT09ICd1bmRlZmluZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkLCBpID0gaGVhZDtcbiAgICAgICAgICAgIHdoaWxlICgoaSA9IGkubmV4dCkgIT09IGhlYWQpIHtcbiAgICAgICAgICAgICAgaWYgKEVTLlNhbWVWYWx1ZVplcm8oaS5rZXksIGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQsIGkgPSBoZWFkLCBlbnRyeTtcbiAgICAgICAgICAgIHZhciBma2V5ID0gZmFzdGtleShrZXkpO1xuICAgICAgICAgICAgaWYgKGZrZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBPKDEpIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zdG9yYWdlW2ZrZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3JhZ2VbZmtleV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IHRoaXMuX3N0b3JhZ2VbZmtleV0gPSBuZXcgTWFwRW50cnkoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaSA9IGhlYWQucHJldjtcbiAgICAgICAgICAgICAgICAvLyBmYWxsIHRocm91Z2hcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIGkudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW50cnkgPSBlbnRyeSB8fCBuZXcgTWFwRW50cnkoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlKC0wLCBrZXkpKSB7XG4gICAgICAgICAgICAgIGVudHJ5LmtleSA9ICswOyAvLyBjb2VyY2UgLTAgdG8gKzAgaW4gZW50cnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVudHJ5Lm5leHQgPSB0aGlzLl9oZWFkO1xuICAgICAgICAgICAgZW50cnkucHJldiA9IHRoaXMuX2hlYWQucHJldjtcbiAgICAgICAgICAgIGVudHJ5LnByZXYubmV4dCA9IGVudHJ5O1xuICAgICAgICAgICAgZW50cnkubmV4dC5wcmV2ID0gZW50cnk7XG4gICAgICAgICAgICB0aGlzLl9zaXplICs9IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQ7XG4gICAgICAgICAgICB2YXIgZmtleSA9IGZhc3RrZXkoa2V5KTtcbiAgICAgICAgICAgIGlmIChma2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgTygxKSBwYXRoXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fc3RvcmFnZVtma2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaSA9IHRoaXMuX3N0b3JhZ2VbZmtleV0ucHJldjtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N0b3JhZ2VbZmtleV07XG4gICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIGkua2V5ID0gaS52YWx1ZSA9IGVtcHR5O1xuICAgICAgICAgICAgICAgIGkucHJldi5uZXh0ID0gaS5uZXh0O1xuICAgICAgICAgICAgICAgIGkubmV4dC5wcmV2ID0gaS5wcmV2O1xuICAgICAgICAgICAgICAgIHRoaXMuX3NpemUgLT0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9zdG9yYWdlID0gZW1wdHlPYmplY3QoKTtcbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQsIHAgPSBpLm5leHQ7XG4gICAgICAgICAgICB3aGlsZSAoKGkgPSBwKSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpLmtleSA9IGkudmFsdWUgPSBlbXB0eTtcbiAgICAgICAgICAgICAgcCA9IGkubmV4dDtcbiAgICAgICAgICAgICAgaS5uZXh0ID0gaS5wcmV2ID0gaGVhZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhlYWQubmV4dCA9IGhlYWQucHJldiA9IGhlYWQ7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGtleXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ2tleScpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB2YWx1ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ3ZhbHVlJyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGVudHJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgJ2tleSt2YWx1ZScpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmb3JFYWNoOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgICAgICAgdmFyIGl0ID0gdGhpcy5lbnRyaWVzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBlbnRyeSA9IGl0Lm5leHQoKTsgIWVudHJ5LmRvbmU7IGVudHJ5ID0gaXQubmV4dCgpKSB7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBlbnRyeS52YWx1ZVsxXSwgZW50cnkudmFsdWVbMF0sIHRoaXMpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVudHJ5LnZhbHVlWzFdLCBlbnRyeS52YWx1ZVswXSwgdGhpcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhZGRJdGVyYXRvcihNYXAucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmVudHJpZXMoKTsgfSk7XG5cbiAgICAgICAgcmV0dXJuIE1hcDtcbiAgICAgIH0pKCksXG5cbiAgICAgIFNldDogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ3JlYXRpbmcgYSBNYXAgaXMgZXhwZW5zaXZlLiAgVG8gc3BlZWQgdXAgdGhlIGNvbW1vbiBjYXNlIG9mXG4gICAgICAgIC8vIFNldHMgY29udGFpbmluZyBvbmx5IHN0cmluZyBvciBudW1lcmljIGtleXMsIHdlIHVzZSBhbiBvYmplY3RcbiAgICAgICAgLy8gYXMgYmFja2luZyBzdG9yYWdlIGFuZCBsYXppbHkgY3JlYXRlIGEgZnVsbCBNYXAgb25seSB3aGVuXG4gICAgICAgIC8vIHJlcXVpcmVkLlxuICAgICAgICB2YXIgU2V0U2hpbSA9IGZ1bmN0aW9uIFNldChpdGVyYWJsZSkge1xuICAgICAgICAgIHZhciBzZXQgPSB0aGlzO1xuICAgICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHNldCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBkb2VzIG5vdCBhY2NlcHQgYXJndW1lbnRzIHdoZW4gY2FsbGVkIGFzIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0ID0gZW11bGF0ZUVTNmNvbnN0cnVjdChzZXQpO1xuICAgICAgICAgIGlmICghc2V0Ll9lczZzZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBzZXQnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKHNldCwge1xuICAgICAgICAgICAgJ1tbU2V0RGF0YV1dJzogbnVsbCxcbiAgICAgICAgICAgIF9zdG9yYWdlOiBlbXB0eU9iamVjdCgpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPcHRpb25hbGx5IGluaXRpYWxpemUgbWFwIGZyb20gaXRlcmFibGVcbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlICE9PSAndW5kZWZpbmVkJyAmJiBpdGVyYWJsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGl0ID0gRVMuR2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgICAgICAgdmFyIGFkZGVyID0gc2V0LmFkZDtcbiAgICAgICAgICAgIGlmICghRVMuSXNDYWxsYWJsZShhZGRlcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIHNldCcpOyB9XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICB2YXIgbmV4dCA9IEVTLkl0ZXJhdG9yTmV4dChpdCk7XG4gICAgICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gbmV4dC52YWx1ZTtcbiAgICAgICAgICAgICAgYWRkZXIuY2FsbChzZXQsIG5leHRJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNldDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIFNldCRwcm90b3R5cGUgPSBTZXRTaGltLnByb3RvdHlwZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhTZXRTaGltLCB7XG4gICAgICAgICAgJ0BAY3JlYXRlJzogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgICAgICAgIHZhciBwcm90b3R5cGUgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgU2V0JHByb3RvdHlwZTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBjcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqLCB7IF9lczZzZXQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU3dpdGNoIGZyb20gdGhlIG9iamVjdCBiYWNraW5nIHN0b3JhZ2UgdG8gYSBmdWxsIE1hcC5cbiAgICAgICAgdmFyIGVuc3VyZU1hcCA9IGZ1bmN0aW9uIGVuc3VyZU1hcChzZXQpIHtcbiAgICAgICAgICBpZiAoIXNldFsnW1tTZXREYXRhXV0nXSkge1xuICAgICAgICAgICAgdmFyIG0gPSBzZXRbJ1tbU2V0RGF0YV1dJ10gPSBuZXcgY29sbGVjdGlvblNoaW1zLk1hcCgpO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoc2V0Ll9zdG9yYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgY2hlY2sgZm9yIGxlYWRpbmcgJyQnXG4gICAgICAgICAgICAgIGlmIChrLmNoYXJDb2RlQXQoMCkgPT09IDM2KSB7XG4gICAgICAgICAgICAgICAgayA9IGsuc2xpY2UoMSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoay5jaGFyQXQoMCkgPT09ICduJykge1xuICAgICAgICAgICAgICAgIGsgPSAray5zbGljZSgxKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrID0gK2s7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbS5zZXQoaywgayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldC5fc3RvcmFnZSA9IG51bGw7IC8vIGZyZWUgb2xkIGJhY2tpbmcgc3RvcmFnZVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2V0U2hpbS5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fc3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9lczYtc2hpbS9pc3N1ZXMvMTc2XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NpemUgbWV0aG9kIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgU2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS5zaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhTZXRTaGltLnByb3RvdHlwZSwge1xuICAgICAgICAgIGhhczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXk7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZSAmJiAoZmtleSA9IGZhc3RrZXkoa2V5KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fc3RvcmFnZVtma2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuc3VyZU1hcCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWydbW1NldERhdGFdXSddLmhhcyhrZXkpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBhZGQ6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBma2V5O1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b3JhZ2UgJiYgKGZrZXkgPSBmYXN0a2V5KGtleSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3N0b3JhZ2VbZmtleV0gPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuc3VyZU1hcCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXNbJ1tbU2V0RGF0YV1dJ10uc2V0KGtleSwga2V5KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAnZGVsZXRlJzogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXk7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZSAmJiAoZmtleSA9IGZhc3RrZXkoa2V5KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdmFyIGhhc0ZLZXkgPSBfaGFzT3duUHJvcGVydHkodGhpcy5fc3RvcmFnZSwgZmtleSk7XG4gICAgICAgICAgICAgIHJldHVybiAoZGVsZXRlIHRoaXMuX3N0b3JhZ2VbZmtleV0pICYmIGhhc0ZLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXVsnZGVsZXRlJ10oa2V5KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yYWdlKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3N0b3JhZ2UgPSBlbXB0eU9iamVjdCgpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS5jbGVhcigpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB2YWx1ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVuc3VyZU1hcCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWydbW1NldERhdGFdXSddLnZhbHVlcygpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBlbnRyaWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS5lbnRyaWVzKCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgZW50aXJlU2V0ID0gdGhpcztcbiAgICAgICAgICAgIGVuc3VyZU1hcChlbnRpcmVTZXQpO1xuICAgICAgICAgICAgdGhpc1snW1tTZXREYXRhXV0nXS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBrZXksIGtleSwgZW50aXJlU2V0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhrZXksIGtleSwgZW50aXJlU2V0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkoU2V0U2hpbSwgJ2tleXMnLCBTZXRTaGltLnZhbHVlcywgdHJ1ZSk7XG4gICAgICAgIGFkZEl0ZXJhdG9yKFNldFNoaW0ucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnZhbHVlcygpOyB9KTtcblxuICAgICAgICByZXR1cm4gU2V0U2hpbTtcbiAgICAgIH0pKClcbiAgICB9O1xuICAgIGRlZmluZVByb3BlcnRpZXMoZ2xvYmFscywgY29sbGVjdGlvblNoaW1zKTtcblxuICAgIGlmIChnbG9iYWxzLk1hcCB8fCBnbG9iYWxzLlNldCkge1xuICAgICAgLypcbiAgICAgICAgLSBJbiBGaXJlZm94IDwgMjMsIE1hcCNzaXplIGlzIGEgZnVuY3Rpb24uXG4gICAgICAgIC0gSW4gYWxsIGN1cnJlbnQgRmlyZWZveCwgU2V0I2VudHJpZXMva2V5cy92YWx1ZXMgJiBNYXAjY2xlYXIgZG8gbm90IGV4aXN0XG4gICAgICAgIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODY5OTk2XG4gICAgICAgIC0gSW4gRmlyZWZveCAyNCwgTWFwIGFuZCBTZXQgZG8gbm90IGltcGxlbWVudCBmb3JFYWNoXG4gICAgICAgIC0gSW4gRmlyZWZveCAyNSBhdCBsZWFzdCwgTWFwIGFuZCBTZXQgYXJlIGNhbGxhYmxlIHdpdGhvdXQgXCJuZXdcIlxuICAgICAgKi9cbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIGdsb2JhbHMuTWFwLnByb3RvdHlwZS5jbGVhciAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICBuZXcgZ2xvYmFscy5TZXQoKS5zaXplICE9PSAwIHx8XG4gICAgICAgIG5ldyBnbG9iYWxzLk1hcCgpLnNpemUgIT09IDAgfHxcbiAgICAgICAgdHlwZW9mIGdsb2JhbHMuTWFwLnByb3RvdHlwZS5rZXlzICE9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLlNldC5wcm90b3R5cGUua2V5cyAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICB0eXBlb2YgZ2xvYmFscy5NYXAucHJvdG90eXBlLmZvckVhY2ggIT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgdHlwZW9mIGdsb2JhbHMuU2V0LnByb3RvdHlwZS5mb3JFYWNoICE9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIGlzQ2FsbGFibGVXaXRob3V0TmV3KGdsb2JhbHMuTWFwKSB8fFxuICAgICAgICBpc0NhbGxhYmxlV2l0aG91dE5ldyhnbG9iYWxzLlNldCkgfHxcbiAgICAgICAgIXN1cHBvcnRzU3ViY2xhc3NpbmcoZ2xvYmFscy5NYXAsIGZ1bmN0aW9uIChNKSB7XG4gICAgICAgICAgdmFyIG0gPSBuZXcgTShbXSk7XG4gICAgICAgICAgLy8gRmlyZWZveCAzMiBpcyBvayB3aXRoIHRoZSBpbnN0YW50aWF0aW5nIHRoZSBzdWJjbGFzcyBidXQgd2lsbFxuICAgICAgICAgIC8vIHRocm93IHdoZW4gdGhlIG1hcCBpcyB1c2VkLlxuICAgICAgICAgIG0uc2V0KDQyLCA0Mik7XG4gICAgICAgICAgcmV0dXJuIG0gaW5zdGFuY2VvZiBNO1xuICAgICAgICB9KVxuICAgICAgKSB7XG4gICAgICAgIGdsb2JhbHMuTWFwID0gY29sbGVjdGlvblNoaW1zLk1hcDtcbiAgICAgICAgZ2xvYmFscy5TZXQgPSBjb2xsZWN0aW9uU2hpbXMuU2V0O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ2xvYmFscy5TZXQucHJvdG90eXBlLmtleXMgIT09IGdsb2JhbHMuU2V0LnByb3RvdHlwZS52YWx1ZXMpIHtcbiAgICAgIGRlZmluZVByb3BlcnR5KGdsb2JhbHMuU2V0LnByb3RvdHlwZSwgJ2tleXMnLCBnbG9iYWxzLlNldC5wcm90b3R5cGUudmFsdWVzLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gU2hpbSBpbmNvbXBsZXRlIGl0ZXJhdG9yIGltcGxlbWVudGF0aW9ucy5cbiAgICBhZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YoKG5ldyBnbG9iYWxzLk1hcCgpKS5rZXlzKCkpKTtcbiAgICBhZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YoKG5ldyBnbG9iYWxzLlNldCgpKS5rZXlzKCkpKTtcbiAgfVxuXG4gIHJldHVybiBnbG9iYWxzO1xufSkpO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhIG1vZHVsZS5cbiAgICBkZWZpbmUoJ2V2ZW50YWJsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChyb290LkV2ZW50YWJsZSA9IGZhY3RvcnkoKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0IG9ubHkgQ29tbW9uSlMtbGlrZVxuICAgIC8vIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cywgbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3QuRXZlbnRhYmxlID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuXG4gIC8vIENvcHkgYW5kIHBhc3RlZCBzdHJhaWdodCBvdXQgb2YgQmFja2JvbmUgMS4wLjBcbiAgLy8gV2UnbGwgdHJ5IGFuZCBrZWVwIHRoaXMgdXBkYXRlZCB0byB0aGUgbGF0ZXN0XG5cbiAgdmFyIGFycmF5ID0gW107XG4gIHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuXG4gIGZ1bmN0aW9uIG9uY2UoZnVuYykge1xuICAgIHZhciBtZW1vLCB0aW1lcyA9IDI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIGV4dGVuZChvYmplY3QsIEJhY2tib25lLkV2ZW50cyk7XG4gIC8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbiAgLy8gICAgIG9iamVjdC50cmlnZ2VyKCdleHBhbmQnKTtcbiAgLy9cbiAgdmFyIEV2ZW50YWJsZSA9IHtcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgKHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdKTtcbiAgICAgIGV2ZW50cy5wdXNoKHtjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbmNlJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBmdW5jID0gb25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5vZmYobmFtZSwgZnVuYyk7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIGZ1bmMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBmdW5jLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50LiBJZiBgbmFtZWAgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgYm91bmRcbiAgICAvLyBjYWxsYmFja3MgZm9yIGFsbCBldmVudHMuXG4gICAgb2ZmOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIHJldGFpbiwgZXYsIGV2ZW50cywgbmFtZXMsIGksIGwsIGosIGs7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhZXZlbnRzQXBpKHRoaXMsICdvZmYnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogT2JqZWN0LmtleXModGhpcy5fZXZlbnRzKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XG4gICAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xuICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuIENhbGxiYWNrcyBhcmVcbiAgICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAgIC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuICAgIC8vIHJlY2VpdmUgdGhlIHRydWUgbmFtZSBvZiB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50KS5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICd0cmlnZ2VyJywgbmFtZSwgYXJncykpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIHZhciBhbGxFdmVudHMgPSB0aGlzLl9ldmVudHMuYWxsO1xuICAgICAgaWYgKGV2ZW50cykgdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpO1xuICAgICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzIC4uLiBvclxuICAgIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5lcnMgPSB7fSlbb2JqLl9saXN0ZW5lcklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnNbaWRdLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChkZWxldGVMaXN0ZW5lcikgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tpZF07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBzcGxpdCBldmVudCBzdHJpbmdzLlxuICB2YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcblxuICAvLyBJbXBsZW1lbnQgZmFuY3kgZmVhdHVyZXMgb2YgdGhlIEV2ZW50cyBBUEkgc3VjaCBhcyBtdWx0aXBsZSBldmVudFxuICAvLyBuYW1lcyBgXCJjaGFuZ2UgYmx1clwiYCBhbmQgalF1ZXJ5LXN0eWxlIGV2ZW50IG1hcHMgYHtjaGFuZ2U6IGFjdGlvbn1gXG4gIC8vIGluIHRlcm1zIG9mIHRoZSBleGlzdGluZyBBUEkuXG4gIHZhciBldmVudHNBcGkgPSBmdW5jdGlvbihvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtrZXksIG5hbWVba2V5XV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxuICAgIGlmIChldmVudFNwbGl0dGVyLnRlc3QobmFtZSkpIHtcbiAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuICAvLyB0cmlnZ2VyaW5nIGV2ZW50cy4gVHJpZXMgdG8ga2VlcCB0aGUgdXN1YWwgY2FzZXMgc3BlZWR5IChtb3N0IGludGVybmFsXG4gIC8vIEJhY2tib25lIGV2ZW50cyBoYXZlIDMgYXJndW1lbnRzKS5cbiAgdmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsaXN0ZW5NZXRob2RzID0ge2xpc3RlblRvOiAnb24nLCBsaXN0ZW5Ub09uY2U6ICdvbmNlJ307XG5cbiAgLy8gSW52ZXJzaW9uLW9mLWNvbnRyb2wgdmVyc2lvbnMgb2YgYG9uYCBhbmQgYG9uY2VgLiBUZWxsICp0aGlzKiBvYmplY3QgdG9cbiAgLy8gbGlzdGVuIHRvIGFuIGV2ZW50IGluIGFub3RoZXIgb2JqZWN0IC4uLiBrZWVwaW5nIHRyYWNrIG9mIHdoYXQgaXQnc1xuICAvLyBsaXN0ZW5pbmcgdG8uXG4gIGZ1bmN0aW9uIGFkZExpc3Rlbk1ldGhvZChtZXRob2QsIGltcGxlbWVudGF0aW9uKSB7XG4gICAgRXZlbnRhYmxlW21ldGhvZF0gPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XG4gICAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpO1xuICAgICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0obmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG4gIGFkZExpc3Rlbk1ldGhvZCgnbGlzdGVuVG8nLCAnb24nKTtcbiAgYWRkTGlzdGVuTWV0aG9kKCdsaXN0ZW5Ub09uY2UnLCAnb25jZScpO1xuXG4gIC8vIEFsaWFzZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBFdmVudGFibGUuYmluZCAgID0gRXZlbnRhYmxlLm9uO1xuICBFdmVudGFibGUudW5iaW5kID0gRXZlbnRhYmxlLm9mZjtcblxuICByZXR1cm4gRXZlbnRhYmxlO1xuXG59KSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBmb3JPd24gPSByZXF1aXJlKCdsb2Rhc2guZm9yb3duJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgYXJnc0NsYXNzID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlDbGFzcyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgb2JqZWN0Q2xhc3MgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBzdHJpbmdDbGFzcyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBlbXB0eS4gQXJyYXlzLCBzdHJpbmdzLCBvciBgYXJndW1lbnRzYCBvYmplY3RzIHdpdGggYVxuICogbGVuZ3RoIG9mIGAwYCBhbmQgb2JqZWN0cyB3aXRoIG5vIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYXJlIGNvbnNpZGVyZWRcbiAqIFwiZW1wdHlcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZW1wdHksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0VtcHR5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNFbXB0eSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0VtcHR5KCcnKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwodmFsdWUpLFxuICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gIGlmICgoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MgfHwgY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBhcmdzQ2xhc3MgKSB8fFxuICAgICAgKGNsYXNzTmFtZSA9PSBvYmplY3RDbGFzcyAmJiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGlzRnVuY3Rpb24odmFsdWUuc3BsaWNlKSkpIHtcbiAgICByZXR1cm4gIWxlbmd0aDtcbiAgfVxuICBmb3JPd24odmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAocmVzdWx0ID0gZmFsc2UpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0VtcHR5O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjaycpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2tcbiAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAqIGFyZ3VtZW50czsgKHZhbHVlLCBrZXksIG9iamVjdCkuIENhbGxiYWNrcyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnlcbiAqIGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvck93bih7ICcwJzogJ3plcm8nLCAnMSc6ICdvbmUnLCAnbGVuZ3RoJzogMiB9LCBmdW5jdGlvbihudW0sIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBsb2dzICcwJywgJzEnLCBhbmQgJ2xlbmd0aCcgKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBmb3JPd24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JPd247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJpbmQgPSByZXF1aXJlKCdsb2Rhc2guYmluZCcpLFxuICAgIGlkZW50aXR5ID0gcmVxdWlyZSgnbG9kYXNoLmlkZW50aXR5JyksXG4gICAgc2V0QmluZERhdGEgPSByZXF1aXJlKCdsb2Rhc2guX3NldGJpbmRkYXRhJyksXG4gICAgc3VwcG9ydCA9IHJlcXVpcmUoJ2xvZGFzaC5zdXBwb3J0Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdGVkIG5hbWVkIGZ1bmN0aW9ucyAqL1xudmFyIHJlRnVuY05hbWUgPSAvXlxccypmdW5jdGlvblsgXFxuXFxyXFx0XStcXHcvO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgZnVuY3Rpb25zIGNvbnRhaW5pbmcgYSBgdGhpc2AgcmVmZXJlbmNlICovXG52YXIgcmVUaGlzID0gL1xcYnRoaXNcXGIvO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZUNhbGxiYWNrYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNyZWF0aW5nXG4gKiBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNyZWF0ZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0aGUgY2FsbGJhY2sgYWNjZXB0cy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQ3JlYXRlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgLy8gZXhpdCBlYXJseSBmb3Igbm8gYHRoaXNBcmdgIG9yIGFscmVhZHkgYm91bmQgYnkgYEZ1bmN0aW9uI2JpbmRgXG4gIGlmICh0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyB8fCAhKCdwcm90b3R5cGUnIGluIGZ1bmMpKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgdmFyIGJpbmREYXRhID0gZnVuYy5fX2JpbmREYXRhX187XG4gIGlmICh0eXBlb2YgYmluZERhdGEgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgIGJpbmREYXRhID0gIWZ1bmMubmFtZTtcbiAgICB9XG4gICAgYmluZERhdGEgPSBiaW5kRGF0YSB8fCAhc3VwcG9ydC5mdW5jRGVjb21wO1xuICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBmblRvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgICBpZiAoIXN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgIGJpbmREYXRhID0gIXJlRnVuY05hbWUudGVzdChzb3VyY2UpO1xuICAgICAgfVxuICAgICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgICAvLyBjaGVja3MgaWYgYGZ1bmNgIHJlZmVyZW5jZXMgdGhlIGB0aGlzYCBrZXl3b3JkIGFuZCBzdG9yZXMgdGhlIHJlc3VsdFxuICAgICAgICBiaW5kRGF0YSA9IHJlVGhpcy50ZXN0KHNvdXJjZSk7XG4gICAgICAgIHNldEJpbmREYXRhKGZ1bmMsIGJpbmREYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gZXhpdCBlYXJseSBpZiB0aGVyZSBhcmUgbm8gYHRoaXNgIHJlZmVyZW5jZXMgb3IgYGZ1bmNgIGlzIGJvdW5kXG4gIGlmIChiaW5kRGF0YSA9PT0gZmFsc2UgfHwgKGJpbmREYXRhICE9PSB0cnVlICYmIGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICByZXR1cm4gZnVuYztcbiAgfVxuICBzd2l0Y2ggKGFyZ0NvdW50KSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBiaW5kKGZ1bmMsIHRoaXNBcmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGVDYWxsYmFjaztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyksXG4gICAgbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaC5ub29wJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciBgX19iaW5kRGF0YV9fYCAqL1xudmFyIGRlc2NyaXB0b3IgPSB7XG4gICdjb25maWd1cmFibGUnOiBmYWxzZSxcbiAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgJ3ZhbHVlJzogbnVsbCxcbiAgJ3dyaXRhYmxlJzogZmFsc2Vcbn07XG5cbi8qKiBVc2VkIHRvIHNldCBtZXRhIGRhdGEgb24gZnVuY3Rpb25zICovXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIElFIDggb25seSBhY2NlcHRzIERPTSBlbGVtZW50c1xuICB0cnkge1xuICAgIHZhciBvID0ge30sXG4gICAgICAgIGZ1bmMgPSBpc05hdGl2ZShmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLFxuICAgICAgICByZXN1bHQgPSBmdW5jKG8sIG8sIG8pICYmIGZ1bmM7XG4gIH0gY2F0Y2goZSkgeyB9XG4gIHJldHVybiByZXN1bHQ7XG59KCkpO1xuXG4vKipcbiAqIFNldHMgYHRoaXNgIGJpbmRpbmcgZGF0YSBvbiBhIGdpdmVuIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBzZXQgZGF0YSBvbi5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIFRoZSBkYXRhIGFycmF5IHRvIHNldC5cbiAqL1xudmFyIHNldEJpbmREYXRhID0gIWRlZmluZVByb3BlcnR5ID8gbm9vcCA6IGZ1bmN0aW9uKGZ1bmMsIHZhbHVlKSB7XG4gIGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcbiAgZGVmaW5lUHJvcGVydHkoZnVuYywgJ19fYmluZERhdGFfXycsIGRlc2NyaXB0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRCaW5kRGF0YTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG52YXIgcmVOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgU3RyaW5nKHRvU3RyaW5nKVxuICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgLnJlcGxhY2UoL3RvU3RyaW5nfCBmb3IgW15cXF1dKy9nLCAnLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyAmJiByZU5hdGl2ZS50ZXN0KHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05hdGl2ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogQSBuby1vcGVyYXRpb24gZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAqIF8ubm9vcChvYmplY3QpID09PSB1bmRlZmluZWQ7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIG5vIG9wZXJhdGlvbiBwZXJmb3JtZWRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBub29wO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBjcmVhdGVXcmFwcGVyID0gcmVxdWlyZSgnbG9kYXNoLl9jcmVhdGV3cmFwcGVyJyksXG4gICAgc2xpY2UgPSByZXF1aXJlKCdsb2Rhc2guX3NsaWNlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBpbnZva2VzIGBmdW5jYCB3aXRoIHRoZSBgdGhpc2BcbiAqIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCBwcmVwZW5kcyBhbnkgYWRkaXRpb25hbCBgYmluZGAgYXJndW1lbnRzIHRvIHRob3NlXG4gKiBwcm92aWRlZCB0byB0aGUgYm91bmQgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGJpbmQuXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIGZ1bmMgPSBmdW5jdGlvbihncmVldGluZykge1xuICogICByZXR1cm4gZ3JlZXRpbmcgKyAnICcgKyB0aGlzLm5hbWU7XG4gKiB9O1xuICpcbiAqIGZ1bmMgPSBfLmJpbmQoZnVuYywgeyAnbmFtZSc6ICdmcmVkJyB9LCAnaGknKTtcbiAqIGZ1bmMoKTtcbiAqIC8vID0+ICdoaSBmcmVkJ1xuICovXG5mdW5jdGlvbiBiaW5kKGZ1bmMsIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyXG4gICAgPyBjcmVhdGVXcmFwcGVyKGZ1bmMsIDE3LCBzbGljZShhcmd1bWVudHMsIDIpLCBudWxsLCB0aGlzQXJnKVxuICAgIDogY3JlYXRlV3JhcHBlcihmdW5jLCAxLCBudWxsLCBudWxsLCB0aGlzQXJnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWJpbmQnKSxcbiAgICBiYXNlQ3JlYXRlV3JhcHBlciA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZXdyYXBwZXInKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoLFxuICAgIHVuc2hpZnQgPSBhcnJheVJlZi51bnNoaWZ0O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgZWl0aGVyIGN1cnJpZXMgb3IgaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggYW4gb3B0aW9uYWwgYHRoaXNgIGJpbmRpbmcgYW5kIHBhcnRpYWxseSBhcHBsaWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbnxzdHJpbmd9IGZ1bmMgVGhlIGZ1bmN0aW9uIG9yIG1ldGhvZCBuYW1lIHRvIHJlZmVyZW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIG1ldGhvZCBmbGFncyB0byBjb21wb3NlLlxuICogIFRoZSBiaXRtYXNrIG1heSBiZSBjb21wb3NlZCBvZiB0aGUgZm9sbG93aW5nIGZsYWdzOlxuICogIDEgLSBgXy5iaW5kYFxuICogIDIgLSBgXy5iaW5kS2V5YFxuICogIDQgLSBgXy5jdXJyeWBcbiAqICA4IC0gYF8uY3VycnlgIChib3VuZClcbiAqICAxNiAtIGBfLnBhcnRpYWxgXG4gKiAgMzIgLSBgXy5wYXJ0aWFsUmlnaHRgXG4gKiBAcGFyYW0ge0FycmF5fSBbcGFydGlhbEFyZ3NdIEFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBwcmVwZW5kIHRvIHRob3NlXG4gKiAgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsUmlnaHRBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYXBwZW5kIHRvIHRob3NlXG4gKiAgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5XSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5KSB7XG4gIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICBpc1BhcnRpYWwgPSBiaXRtYXNrICYgMTYsXG4gICAgICBpc1BhcnRpYWxSaWdodCA9IGJpdG1hc2sgJiAzMjtcblxuICBpZiAoIWlzQmluZEtleSAmJiAhaXNGdW5jdGlvbihmdW5jKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gIH1cbiAgaWYgKGlzUGFydGlhbCAmJiAhcGFydGlhbEFyZ3MubGVuZ3RoKSB7XG4gICAgYml0bWFzayAmPSB+MTY7XG4gICAgaXNQYXJ0aWFsID0gcGFydGlhbEFyZ3MgPSBmYWxzZTtcbiAgfVxuICBpZiAoaXNQYXJ0aWFsUmlnaHQgJiYgIXBhcnRpYWxSaWdodEFyZ3MubGVuZ3RoKSB7XG4gICAgYml0bWFzayAmPSB+MzI7XG4gICAgaXNQYXJ0aWFsUmlnaHQgPSBwYXJ0aWFsUmlnaHRBcmdzID0gZmFsc2U7XG4gIH1cbiAgdmFyIGJpbmREYXRhID0gZnVuYyAmJiBmdW5jLl9fYmluZERhdGFfXztcbiAgaWYgKGJpbmREYXRhICYmIGJpbmREYXRhICE9PSB0cnVlKSB7XG4gICAgLy8gY2xvbmUgYGJpbmREYXRhYFxuICAgIGJpbmREYXRhID0gc2xpY2UoYmluZERhdGEpO1xuICAgIGlmIChiaW5kRGF0YVsyXSkge1xuICAgICAgYmluZERhdGFbMl0gPSBzbGljZShiaW5kRGF0YVsyXSk7XG4gICAgfVxuICAgIGlmIChiaW5kRGF0YVszXSkge1xuICAgICAgYmluZERhdGFbM10gPSBzbGljZShiaW5kRGF0YVszXSk7XG4gICAgfVxuICAgIC8vIHNldCBgdGhpc0JpbmRpbmdgIGlzIG5vdCBwcmV2aW91c2x5IGJvdW5kXG4gICAgaWYgKGlzQmluZCAmJiAhKGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICAgIGJpbmREYXRhWzRdID0gdGhpc0FyZztcbiAgICB9XG4gICAgLy8gc2V0IGlmIHByZXZpb3VzbHkgYm91bmQgYnV0IG5vdCBjdXJyZW50bHkgKHN1YnNlcXVlbnQgY3VycmllZCBmdW5jdGlvbnMpXG4gICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICBiaXRtYXNrIHw9IDg7XG4gICAgfVxuICAgIC8vIHNldCBjdXJyaWVkIGFyaXR5IGlmIG5vdCB5ZXQgc2V0XG4gICAgaWYgKGlzQ3VycnkgJiYgIShiaW5kRGF0YVsxXSAmIDQpKSB7XG4gICAgICBiaW5kRGF0YVs1XSA9IGFyaXR5O1xuICAgIH1cbiAgICAvLyBhcHBlbmQgcGFydGlhbCBsZWZ0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWwpIHtcbiAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgfVxuICAgIC8vIGFwcGVuZCBwYXJ0aWFsIHJpZ2h0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWxSaWdodCkge1xuICAgICAgdW5zaGlmdC5hcHBseShiaW5kRGF0YVszXSB8fCAoYmluZERhdGFbM10gPSBbXSksIHBhcnRpYWxSaWdodEFyZ3MpO1xuICAgIH1cbiAgICAvLyBtZXJnZSBmbGFnc1xuICAgIGJpbmREYXRhWzFdIHw9IGJpdG1hc2s7XG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIuYXBwbHkobnVsbCwgYmluZERhdGEpO1xuICB9XG4gIC8vIGZhc3QgcGF0aCBmb3IgYF8uYmluZGBcbiAgdmFyIGNyZWF0ZXIgPSAoYml0bWFzayA9PSAxIHx8IGJpdG1hc2sgPT09IDE3KSA/IGJhc2VCaW5kIDogYmFzZUNyZWF0ZVdyYXBwZXI7XG4gIHJldHVybiBjcmVhdGVyKFtmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHldKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVXcmFwcGVyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmJpbmRgIHRoYXQgY3JlYXRlcyB0aGUgYm91bmQgZnVuY3Rpb24gYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUJpbmQoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF07XG5cbiAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgLy8gYEZ1bmN0aW9uI2JpbmRgIHNwZWNcbiAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC41XG4gICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAvLyBhdm9pZCBgYXJndW1lbnRzYCBvYmplY3QgZGVvcHRpbWl6YXRpb25zIGJ5IHVzaW5nIGBzbGljZWAgaW5zdGVhZFxuICAgICAgLy8gb2YgYEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsYCBhbmQgbm90IGFzc2lnbmluZyBgYXJndW1lbnRzYCB0byBhXG4gICAgICAvLyB2YXJpYWJsZSBhcyBhIHRlcm5hcnkgZXhwcmVzc2lvblxuICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIC8vIG1pbWljIHRoZSBjb25zdHJ1Y3RvcidzIGByZXR1cm5gIGJlaGF2aW9yXG4gICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxMy4yLjJcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAvLyBlbnN1cmUgYG5ldyBib3VuZGAgaXMgYW4gaW5zdGFuY2Ugb2YgYGZ1bmNgXG4gICAgICB2YXIgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKSxcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gIH1cbiAgc2V0QmluZERhdGEoYm91bmQsIGJpbmREYXRhKTtcbiAgcmV0dXJuIGJvdW5kO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VCaW5kO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIG5vb3AgPSByZXF1aXJlKCdsb2Rhc2gubm9vcCcpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGlzTmF0aXZlKG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGUpICYmIG5hdGl2ZUNyZWF0ZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXNzaWduaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZSBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGJhc2VDcmVhdGUocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gIHJldHVybiBpc09iamVjdChwcm90b3R5cGUpID8gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSkgOiB7fTtcbn1cbi8vIGZhbGxiYWNrIGZvciBicm93c2VycyB3aXRob3V0IGBPYmplY3QuY3JlYXRlYFxuaWYgKCFuYXRpdmVDcmVhdGUpIHtcbiAgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBPYmplY3QoKSB7fVxuICAgIHJldHVybiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgIGlmIChpc09iamVjdChwcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JqZWN0O1xuICAgICAgICBPYmplY3QucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQgfHwgZ2xvYmFsLk9iamVjdCgpO1xuICAgIH07XG4gIH0oKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBjcmVhdGVXcmFwcGVyYCB0aGF0IGNyZWF0ZXMgdGhlIHdyYXBwZXIgYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZVdyYXBwZXIoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIGJpdG1hc2sgPSBiaW5kRGF0YVsxXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF0sXG4gICAgICBhcml0eSA9IGJpbmREYXRhWzVdO1xuXG4gIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICBrZXkgPSBmdW5jO1xuXG4gIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgIHZhciB0aGlzQmluZGluZyA9IGlzQmluZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgIGlmIChwYXJ0aWFsQXJncykge1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIGlmIChwYXJ0aWFsUmlnaHRBcmdzIHx8IGlzQ3VycnkpIHtcbiAgICAgIGFyZ3MgfHwgKGFyZ3MgPSBzbGljZShhcmd1bWVudHMpKTtcbiAgICAgIGlmIChwYXJ0aWFsUmlnaHRBcmdzKSB7XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICB9XG4gICAgICBpZiAoaXNDdXJyeSAmJiBhcmdzLmxlbmd0aCA8IGFyaXR5KSB7XG4gICAgICAgIGJpdG1hc2sgfD0gMTYgJiB+MzI7XG4gICAgICAgIHJldHVybiBiYXNlQ3JlYXRlV3JhcHBlcihbZnVuYywgKGlzQ3VycnlCb3VuZCA/IGJpdG1hc2sgOiBiaXRtYXNrICYgfjMpLCBhcmdzLCBudWxsLCB0aGlzQXJnLCBhcml0eV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBhcmdzIHx8IChhcmdzID0gYXJndW1lbnRzKTtcbiAgICBpZiAoaXNCaW5kS2V5KSB7XG4gICAgICBmdW5jID0gdGhpc0JpbmRpbmdba2V5XTtcbiAgICB9XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkge1xuICAgICAgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKTtcbiAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogdGhpc0JpbmRpbmc7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgfVxuICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICByZXR1cm4gYm91bmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZVdyYXBwZXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFNsaWNlcyB0aGUgYGNvbGxlY3Rpb25gIGZyb20gdGhlIGBzdGFydGAgaW5kZXggdXAgdG8sIGJ1dCBub3QgaW5jbHVkaW5nLFxuICogdGhlIGBlbmRgIGluZGV4LlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpbnN0ZWFkIG9mIGBBcnJheSNzbGljZWAgdG8gc3VwcG9ydCBub2RlIGxpc3RzXG4gKiBpbiBJRSA8IDkgYW5kIHRvIGVuc3VyZSBkZW5zZSBhcnJheXMgYXJlIHJldHVybmVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gc2xpY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4LlxuICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIGluZGV4LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gIHN0YXJ0IHx8IChzdGFydCA9IDApO1xuICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykge1xuICAgIGVuZCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgfVxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVuZCAtIHN0YXJ0IHx8IDAsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGggPCAwID8gMCA6IGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbc3RhcnQgKyBpbmRleF07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzbGljZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgcHJvdmlkZWQgdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAqIF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0O1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgZnVuY3Rpb25zIGNvbnRhaW5pbmcgYSBgdGhpc2AgcmVmZXJlbmNlICovXG52YXIgcmVUaGlzID0gL1xcYnRoaXNcXGIvO1xuXG4vKipcbiAqIEFuIG9iamVjdCB1c2VkIHRvIGZsYWcgZW52aXJvbm1lbnRzIGZlYXR1cmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xudmFyIHN1cHBvcnQgPSB7fTtcblxuLyoqXG4gKiBEZXRlY3QgaWYgZnVuY3Rpb25zIGNhbiBiZSBkZWNvbXBpbGVkIGJ5IGBGdW5jdGlvbiN0b1N0cmluZ2BcbiAqIChhbGwgYnV0IFBTMyBhbmQgb2xkZXIgT3BlcmEgbW9iaWxlIGJyb3dzZXJzICYgYXZvaWRlZCBpbiBXaW5kb3dzIDggYXBwcykuXG4gKlxuICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICogQHR5cGUgYm9vbGVhblxuICovXG5zdXBwb3J0LmZ1bmNEZWNvbXAgPSAhaXNOYXRpdmUoZ2xvYmFsLldpblJURXJyb3IpICYmIHJlVGhpcy50ZXN0KGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSk7XG5cbi8qKlxuICogRGV0ZWN0IGlmIGBGdW5jdGlvbiNuYW1lYCBpcyBzdXBwb3J0ZWQgKGFsbCBidXQgSUUpLlxuICpcbiAqIEBtZW1iZXJPZiBfLnN1cHBvcnRcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xuc3VwcG9ydC5mdW5jTmFtZXMgPSB0eXBlb2YgRnVuY3Rpb24ubmFtZSA9PSAnc3RyaW5nJztcblxubW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QgKi9cbnZhciBvYmplY3RUeXBlcyA9IHtcbiAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgJ29iamVjdCc6IHRydWUsXG4gICdudW1iZXInOiBmYWxzZSxcbiAgJ3N0cmluZyc6IGZhbHNlLFxuICAndW5kZWZpbmVkJzogZmFsc2Vcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VHlwZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgc2hpbUtleXMgPSByZXF1aXJlKCdsb2Rhc2guX3NoaW1rZXlzJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG52YXIgbmF0aXZlS2V5cyA9IGlzTmF0aXZlKG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5rZXlzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICogLy8gPT4gWydvbmUnLCAndHdvJywgJ3RocmVlJ10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIHByb2R1Y2VzIGFuIGFycmF5IG9mIHRoZVxuICogZ2l2ZW4gb2JqZWN0J3Mgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xudmFyIHNoaW1LZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICBpZiAoIShvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0XSkpIHJldHVybiByZXN1bHQ7XG4gICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoaXRlcmFibGUsIGluZGV4KSkge1xuICAgICAgICByZXN1bHQucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoaW1LZXlzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIHRoZSBFQ01BU2NyaXB0IGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0XG4gIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MVxuICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBzdHJpbmcsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnZnJlZCcpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaW5nO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1VuZGVmaW5lZDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIHZhbHVlIG9mIHByb3BlcnR5IGBrZXlgIG9uIGBvYmplY3RgLiBJZiBga2V5YCBpcyBhIGZ1bmN0aW9uXG4gKiBpdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYG9iamVjdGAgYW5kIGl0cyByZXN1bHQgcmV0dXJuZWQsXG4gKiBlbHNlIHRoZSBwcm9wZXJ0eSB2YWx1ZSBpcyByZXR1cm5lZC4gSWYgYG9iamVjdGAgaXMgZmFsc2V5IHRoZW4gYHVuZGVmaW5lZGBcbiAqIGlzIHJldHVybmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHJlc29sdmUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7XG4gKiAgICdjaGVlc2UnOiAnY3J1bXBldHMnLFxuICogICAnc3R1ZmYnOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4gJ25vbnNlbnNlJztcbiAqICAgfVxuICogfTtcbiAqXG4gKiBfLnJlc3VsdChvYmplY3QsICdjaGVlc2UnKTtcbiAqIC8vID0+ICdjcnVtcGV0cydcbiAqXG4gKiBfLnJlc3VsdChvYmplY3QsICdzdHVmZicpO1xuICogLy8gPT4gJ25vbnNlbnNlJ1xuICovXG5mdW5jdGlvbiByZXN1bHQob2JqZWN0LCBrZXkpIHtcbiAgaWYgKG9iamVjdCkge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKHZhbHVlKSA/IG9iamVjdFtrZXldKCkgOiB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdsb2Rhc2guZGVmYXVsdHMnKSxcbiAgICBlc2NhcGUgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlJyksXG4gICAgZXNjYXBlU3RyaW5nQ2hhciA9IHJlcXVpcmUoJ2xvZGFzaC5fZXNjYXBlc3RyaW5nY2hhcicpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIHJlSW50ZXJwb2xhdGUgPSByZXF1aXJlKCdsb2Rhc2guX3JlaW50ZXJwb2xhdGUnKSxcbiAgICB0ZW1wbGF0ZVNldHRpbmdzID0gcmVxdWlyZSgnbG9kYXNoLnRlbXBsYXRlc2V0dGluZ3MnKSxcbiAgICB2YWx1ZXMgPSByZXF1aXJlKCdsb2Rhc2gudmFsdWVzJyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGVtcHR5IHN0cmluZyBsaXRlcmFscyBpbiBjb21waWxlZCB0ZW1wbGF0ZSBzb3VyY2UgKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIEVTNiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXG4gKiBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1saXRlcmFscy1zdHJpbmctbGl0ZXJhbHNcbiAqL1xudmFyIHJlRXNUZW1wbGF0ZSA9IC9cXCRcXHsoW15cXFxcfV0qKD86XFxcXC5bXlxcXFx9XSopKilcXH0vZztcblxuLyoqIFVzZWQgdG8gZW5zdXJlIGNhcHR1cmluZyBvcmRlciBvZiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbnZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdFxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuLyoqXG4gKiBBIG1pY3JvLXRlbXBsYXRpbmcgbWV0aG9kIHRoYXQgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzXG4gKiB3aGl0ZXNwYWNlLCBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAqXG4gKiBOb3RlOiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQsIGBfLnRlbXBsYXRlYCB1dGlsaXplcyBzb3VyY2VVUkxzIGZvciBlYXNpZXJcbiAqIGRlYnVnZ2luZy4gU2VlIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmxcbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZTpcbiAqIGh0dHA6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHNcbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBDaHJvbWUgZXh0ZW5zaW9uIHNhbmRib3hlcyBzZWU6XG4gKiBodHRwOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vc3RhYmxlL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwuaHRtbFxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGVtcGxhdGUgdGV4dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB1c2VkIHRvIHBvcHVsYXRlIHRoZSB0ZXh0LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlXSBUaGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGVdIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHNdIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgbG9jYWwgdmFyaWFibGVzLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmludGVycG9sYXRlXSBUaGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbc291cmNlVVJMXSBUaGUgc291cmNlVVJMIG9mIHRoZSB0ZW1wbGF0ZSdzIGNvbXBpbGVkIHNvdXJjZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbdmFyaWFibGVdIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHJldHVybnMge0Z1bmN0aW9ufHN0cmluZ30gUmV0dXJucyBhIGNvbXBpbGVkIGZ1bmN0aW9uIHdoZW4gbm8gYGRhdGFgIG9iamVjdFxuICogIGlzIGdpdmVuLCBlbHNlIGl0IHJldHVybnMgdGhlIGludGVycG9sYXRlZCB0ZXh0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyB1c2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ25hbWUnOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCdcbiAqXG4gKiAvLyB1c2luZyB0aGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIEhUTUwgaW4gZGF0YSBwcm9wZXJ0eSB2YWx1ZXNcbiAqIF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nLCB7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gKiAvLyA9PiAnPGI+Jmx0O3NjcmlwdCZndDs8L2I+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGdlbmVyYXRlIEhUTUxcbiAqIHZhciBsaXN0ID0gJzwlIF8uZm9yRWFjaChwZW9wbGUsIGZ1bmN0aW9uKG5hbWUpIHsgJT48bGk+PCUtIG5hbWUgJT48L2xpPjwlIH0pOyAlPic7XG4gKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBFUzYgZGVsaW1pdGVyIGFzIGFuIGFsdGVybmF0aXZlIHRvIHRoZSBkZWZhdWx0IFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXJcbiAqIF8udGVtcGxhdGUoJ2hlbGxvICR7IG5hbWUgfScsIHsgJ25hbWUnOiAncGViYmxlcycgfSk7XG4gKiAvLyA9PiAnaGVsbG8gcGViYmxlcydcbiAqXG4gKiAvLyB1c2luZyB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVyc1xuICogXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIG5hbWUpOyAlPiEnLCB7ICduYW1lJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyB1c2luZyBhIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXG4gKiBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gKiAgICdpbnRlcnBvbGF0ZSc6IC97eyhbXFxzXFxTXSs/KX19L2dcbiAqIH07XG4gKlxuICogXy50ZW1wbGF0ZSgnaGVsbG8ge3sgbmFtZSB9fSEnLCB7ICduYW1lJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gdXNpbmcgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGpRdWVyeVxuICogdmFyIGxpc3QgPSAnPCUganEuZWFjaChwZW9wbGUsIGZ1bmN0aW9uKG5hbWUpIHsgJT48bGk+PCUtIG5hbWUgJT48L2xpPjwlIH0pOyAlPic7XG4gKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9LCB7ICdpbXBvcnRzJzogeyAnanEnOiBqUXVlcnkgfSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBgc291cmNlVVJMYCBvcHRpb24gdG8gc3BlY2lmeSBhIGN1c3RvbSBzb3VyY2VVUkwgZm9yIHRoZSB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nLCBudWxsLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IGZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3JcbiAqXG4gKiAvLyB1c2luZyB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGVcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLm5hbWUgJT4hJywgbnVsbCwgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAgIHZhciBfX3QsIF9fcCA9ICcnLCBfX2UgPSBfLmVzY2FwZTtcbiAqICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEubmFtZSApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogICByZXR1cm4gX19wO1xuICogfVxuICpcbiAqIC8vIHVzaW5nIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIGEgc3RhY2sgdHJhY2VcbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKGN3ZCwgJ2pzdC5qcycpLCAnXFxcbiAqICAgdmFyIEpTVCA9IHtcXFxuICogICAgIFwibWFpblwiOiAnICsgXy50ZW1wbGF0ZShtYWluVGV4dCkuc291cmNlICsgJ1xcXG4gKiAgIH07XFxcbiAqICcpO1xuICovXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZXh0LCBkYXRhLCBvcHRpb25zKSB7XG4gIC8vIGJhc2VkIG9uIEpvaG4gUmVzaWcncyBgdG1wbGAgaW1wbGVtZW50YXRpb25cbiAgLy8gaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy9cbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qc1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vb2xhZG8vZG9UXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcbiAgdGV4dCA9IFN0cmluZyh0ZXh0IHx8ICcnKTtcblxuICAvLyBhdm9pZCBtaXNzaW5nIGRlcGVuZGVuY2llcyB3aGVuIGBpdGVyYXRvclRlbXBsYXRlYCBpcyBub3QgZGVmaW5lZFxuICBvcHRpb25zID0gZGVmYXVsdHMoe30sIG9wdGlvbnMsIHNldHRpbmdzKTtcblxuICB2YXIgaW1wb3J0cyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLmltcG9ydHMsIHNldHRpbmdzLmltcG9ydHMpLFxuICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgaW1wb3J0c1ZhbHVlcyA9IHZhbHVlcyhpbXBvcnRzKTtcblxuICB2YXIgaXNFdmFsdWF0aW5nLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgaW50ZXJwb2xhdGUgPSBvcHRpb25zLmludGVycG9sYXRlIHx8IHJlTm9NYXRjaCxcbiAgICAgIHNvdXJjZSA9IFwiX19wICs9ICdcIjtcblxuICAvLyBjb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXJcbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgdGV4dC5yZXBsYWNlKHJlRGVsaW1pdGVycywgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZVZhbHVlLCBpbnRlcnBvbGF0ZVZhbHVlLCBlc1RlbXBsYXRlVmFsdWUsIGV2YWx1YXRlVmFsdWUsIG9mZnNldCkge1xuICAgIGludGVycG9sYXRlVmFsdWUgfHwgKGludGVycG9sYXRlVmFsdWUgPSBlc1RlbXBsYXRlVmFsdWUpO1xuXG4gICAgLy8gZXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzXG4gICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyByZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0c1xuICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyB0aGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIHJlcXVpcmVzIHJldHVybmluZyB0aGUgYG1hdGNoYFxuICAgIC8vIHN0cmluZyBpbiBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9KTtcblxuICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gIC8vIGlmIGB2YXJpYWJsZWAgaXMgbm90IHNwZWNpZmllZCwgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpblxuICB2YXIgdmFyaWFibGUgPSBvcHRpb25zLnZhcmlhYmxlLFxuICAgICAgaGFzVmFyaWFibGUgPSB2YXJpYWJsZTtcblxuICBpZiAoIWhhc1ZhcmlhYmxlKSB7XG4gICAgdmFyaWFibGUgPSAnb2JqJztcbiAgICBzb3VyY2UgPSAnd2l0aCAoJyArIHZhcmlhYmxlICsgJykge1xcbicgKyBzb3VyY2UgKyAnXFxufVxcbic7XG4gIH1cbiAgLy8gY2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gZnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keVxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArIHZhcmlhYmxlICsgJykge1xcbicgK1xuICAgIChoYXNWYXJpYWJsZSA/ICcnIDogdmFyaWFibGUgKyAnIHx8ICgnICsgdmFyaWFibGUgKyAnID0ge30pO1xcbicpICtcbiAgICBcInZhciBfX3QsIF9fcCA9ICcnLCBfX2UgPSBfLmVzY2FwZVwiICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB0cnkge1xuICAgIHZhciByZXN1bHQgPSBGdW5jdGlvbihpbXBvcnRzS2V5cywgJ3JldHVybiAnICsgc291cmNlICkuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhyb3cgZTtcbiAgfVxuICBpZiAoZGF0YSkge1xuICAgIHJldHVybiByZXN1bHQoZGF0YSk7XG4gIH1cbiAgLy8gcHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24ncyBzb3VyY2UgYnkgaXRzIGB0b1N0cmluZ2AgbWV0aG9kLCBpblxuICAvLyBzdXBwb3J0ZWQgZW52aXJvbm1lbnRzLCBvciB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3JcbiAgLy8gaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzIGR1cmluZyB0aGUgYnVpbGQgcHJvY2Vzc1xuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbnZhciBzdHJpbmdFc2NhcGVzID0ge1xuICAnXFxcXCc6ICdcXFxcJyxcbiAgXCInXCI6IFwiJ1wiLFxuICAnXFxuJzogJ24nLFxuICAnXFxyJzogJ3InLFxuICAnXFx0JzogJ3QnLFxuICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICdcXHUyMDI5JzogJ3UyMDI5J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGB0ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZFxuICogc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKG1hdGNoKSB7XG4gIHJldHVybiAnXFxcXCcgKyBzdHJpbmdFc2NhcGVzW21hdGNoXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVTdHJpbmdDaGFyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gbWF0Y2ggXCJpbnRlcnBvbGF0ZVwiIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVJbnRlcnBvbGF0ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogQXNzaWducyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3QocykgdG8gdGhlIGRlc3RpbmF0aW9uXG4gKiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC4gT25jZSBhXG4gKiBwcm9wZXJ0eSBpcyBzZXQsIGFkZGl0aW9uYWwgZGVmYXVsdHMgb2YgdGhlIHNhbWUgcHJvcGVydHkgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gQWxsb3dzIHdvcmtpbmcgd2l0aCBgXy5yZWR1Y2VgIHdpdGhvdXQgdXNpbmcgaXRzXG4gKiAgYGtleWAgYW5kIGBvYmplY3RgIGFyZ3VtZW50cyBhcyBzb3VyY2VzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gKiBfLmRlZmF1bHRzKG9iamVjdCwgeyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9KTtcbiAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gKi9cbnZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gb2JqZWN0LCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICBhcmdzSW5kZXggPSAwLFxuICAgICAgYXJnc0xlbmd0aCA9IHR5cGVvZiBndWFyZCA9PSAnbnVtYmVyJyA/IDIgOiBhcmdzLmxlbmd0aDtcbiAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgIGl0ZXJhYmxlID0gYXJnc1thcmdzSW5kZXhdO1xuICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHRbaW5kZXhdID09ICd1bmRlZmluZWQnKSByZXN1bHRbaW5kZXhdID0gaXRlcmFibGVbaW5kZXhdO1xuICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSByZXF1aXJlKCdsb2Rhc2guX2VzY2FwZWh0bWxjaGFyJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgcmVVbmVzY2FwZWRIdG1sID0gcmVxdWlyZSgnbG9kYXNoLl9yZXVuZXNjYXBlZGh0bWwnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgY2hhcmFjdGVycyBgJmAsIGA8YCwgYD5gLCBgXCJgLCBhbmQgYCdgIGluIGBzdHJpbmdgIHRvIHRoZWlyXG4gKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ0ZyZWQsIFdpbG1hLCAmIFBlYmJsZXMnKTtcbiAqIC8vID0+ICdGcmVkLCBXaWxtYSwgJmFtcDsgUGViYmxlcydcbiAqL1xuZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nID09IG51bGwgPyAnJyA6IFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5faHRtbGVzY2FwZXMnKTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBlc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICByZXR1cm4gaHRtbEVzY2FwZXNbbWF0Y2hdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZUh0bWxDaGFyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBVc2VkIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzOlxuICpcbiAqIFRob3VnaCB0aGUgYD5gIGNoYXJhY3RlciBpcyBlc2NhcGVkIGZvciBzeW1tZXRyeSwgY2hhcmFjdGVycyBsaWtlIGA+YCBhbmQgYC9gXG4gKiBkb24ndCByZXF1aXJlIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nIHVubGVzcyB0aGV5J3JlIHBhcnRcbiAqIG9mIGEgdGFnIG9yIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKVxuICovXG52YXIgaHRtbEVzY2FwZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaHRtbEVzY2FwZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGh0bWxFc2NhcGVzID0gcmVxdWlyZSgnbG9kYXNoLl9odG1sZXNjYXBlcycpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMgKi9cbnZhciByZVVuZXNjYXBlZEh0bWwgPSBSZWdFeHAoJ1snICsga2V5cyhodG1sRXNjYXBlcykuam9pbignJykgKyAnXScsICdnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVVbmVzY2FwZWRIdG1sO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBlc2NhcGUgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlJyksXG4gICAgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpO1xuXG4vKipcbiAqIEJ5IGRlZmF1bHQsIHRoZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzIHVzZWQgYnkgTG8tRGFzaCBhcmUgc2ltaWxhciB0byB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKS4gQ2hhbmdlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlXG4gKiBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xudmFyIHRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gYmUgSFRNTC1lc2NhcGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2VzY2FwZSc6IC88JS0oW1xcc1xcU10rPyklPi9nLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBSZWdFeHBcbiAgICovXG4gICdldmFsdWF0ZSc6IC88JShbXFxzXFxTXSs/KSU+L2csXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byByZWZlcmVuY2UgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHN0cmluZ1xuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKi9cbiAgICAnXyc6IHsgJ2VzY2FwZSc6IGVzY2FwZSB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGVTZXR0aW5ncztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgdmFsdWVzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnZhbHVlcyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAqIC8vID0+IFsxLCAyLCAzXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xuZnVuY3Rpb24gdmFsdWVzKG9iamVjdCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHByb3BzID0ga2V5cyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBvYmplY3RbcHJvcHNbaW5kZXhdXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZhbHVlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgKi9cbnZhciBpZENvdW50ZXIgPSAwO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRC4gSWYgYHByZWZpeGAgaXMgcHJvdmlkZWQgdGhlIElEIHdpbGwgYmUgYXBwZW5kZWQgdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4XSBUaGUgdmFsdWUgdG8gcHJlZml4IHRoZSBJRCB3aXRoLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5pcXVlIElELlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnVuaXF1ZUlkKCdjb250YWN0XycpO1xuICogLy8gPT4gJ2NvbnRhY3RfMTA0J1xuICpcbiAqIF8udW5pcXVlSWQoKTtcbiAqIC8vID0+ICcxMDUnXG4gKi9cbmZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICB2YXIgaWQgPSArK2lkQ291bnRlcjtcbiAgcmV0dXJuIFN0cmluZyhwcmVmaXggPT0gbnVsbCA/ICcnIDogcHJlZml4KSArIGlkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVuaXF1ZUlkO1xuIiwidmFyIGJhc2VGbGF0dGVuID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Jhc2VGbGF0dGVuJyksIG1hcCA9IHJlcXVpcmUoJy4uL2NvbGxlY3Rpb25zL21hcCcpO1xuZnVuY3Rpb24gZmxhdHRlbihhcnJheSwgaXNTaGFsbG93LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGlmICh0eXBlb2YgaXNTaGFsbG93ICE9ICdib29sZWFuJyAmJiBpc1NoYWxsb3cgIT0gbnVsbCkge1xuICAgICAgICB0aGlzQXJnID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrID0gdHlwZW9mIGlzU2hhbGxvdyAhPSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgJiYgdGhpc0FyZ1tpc1NoYWxsb3ddID09PSBhcnJheSA/IG51bGwgOiBpc1NoYWxsb3c7XG4gICAgICAgIGlzU2hhbGxvdyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICBhcnJheSA9IG1hcChhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZUZsYXR0ZW4oYXJyYXksIGlzU2hhbGxvdyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZsYXR0ZW47IiwidmFyIGNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zL2NyZWF0ZUNhbGxiYWNrJyksIHNsaWNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NsaWNlJyk7XG52YXIgdW5kZWZpbmVkO1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuZnVuY3Rpb24gbGFzdChhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgbiA9IDAsIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoO1xuICAgICAgICBjYWxsYmFjayA9IGNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgd2hpbGUgKGluZGV4LS0gJiYgY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBuID0gY2FsbGJhY2s7XG4gICAgICAgIGlmIChuID09IG51bGwgfHwgdGhpc0FyZykge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5ID8gYXJyYXlbbGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNsaWNlKGFycmF5LCBuYXRpdmVNYXgoMCwgbGVuZ3RoIC0gbikpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBsYXN0OyIsInZhciBhcnJheVJlZiA9IFtdO1xudmFyIHNwbGljZSA9IGFycmF5UmVmLnNwbGljZTtcbmZ1bmN0aW9uIHB1bGwoYXJyYXkpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgYXJnc0luZGV4ID0gMCwgYXJnc0xlbmd0aCA9IGFyZ3MubGVuZ3RoLCBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSwgdmFsdWUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHNwbGljZS5jYWxsKGFycmF5LCBpbmRleC0tLCAxKTtcbiAgICAgICAgICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHB1bGw7IiwidmFyIGJhc2VJbmRleE9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Jhc2VJbmRleE9mJyksIGZvck93biA9IHJlcXVpcmUoJy4uL29iamVjdHMvZm9yT3duJyksIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzQXJyYXknKSwgaXNTdHJpbmcgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzU3RyaW5nJyk7XG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5mdW5jdGlvbiBjb250YWlucyhjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkge1xuICAgIHZhciBpbmRleCA9IC0xLCBpbmRleE9mID0gYmFzZUluZGV4T2YsIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDAsIHJlc3VsdCA9IGZhbHNlO1xuICAgIGZyb21JbmRleCA9IChmcm9tSW5kZXggPCAwID8gbmF0aXZlTWF4KDAsIGxlbmd0aCArIGZyb21JbmRleCkgOiBmcm9tSW5kZXgpIHx8IDA7XG4gICAgaWYgKGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkgPiAtMTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgcmVzdWx0ID0gKGlzU3RyaW5nKGNvbGxlY3Rpb24pID8gY29sbGVjdGlvbi5pbmRleE9mKHRhcmdldCwgZnJvbUluZGV4KSA6IGluZGV4T2YoY29sbGVjdGlvbiwgdGFyZ2V0LCBmcm9tSW5kZXgpKSA+IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGZyb21JbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhKHJlc3VsdCA9IHZhbHVlID09PSB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbm1vZHVsZS5leHBvcnRzID0gY29udGFpbnM7IiwidmFyIGNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zL2NyZWF0ZUNhbGxiYWNrJyksIGZvck93biA9IHJlcXVpcmUoJy4uL29iamVjdHMvZm9yT3duJyk7XG5mdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgaW5kZXggPSAtMSwgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcbiAgICBjYWxsYmFjayA9IGNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBjYWxsYmFjayhjb2xsZWN0aW9uW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbiAodmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0WysraW5kZXhdID0gY2FsbGJhY2sodmFsdWUsIGtleSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxubW9kdWxlLmV4cG9ydHMgPSBtYXA7IiwidmFyIGlzU3RyaW5nID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc1N0cmluZycpLCBzbGljZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zbGljZScpLCB2YWx1ZXMgPSByZXF1aXJlKCcuLi9vYmplY3RzL3ZhbHVlcycpO1xuZnVuY3Rpb24gdG9BcnJheShjb2xsZWN0aW9uKSB7XG4gICAgaWYgKGNvbGxlY3Rpb24gJiYgdHlwZW9mIGNvbGxlY3Rpb24ubGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBzbGljZShjb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcyhjb2xsZWN0aW9uKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gdG9BcnJheTsiLCJ2YXIgY3JlYXRlV3JhcHBlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGVXcmFwcGVyJyksIHNsaWNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NsaWNlJyk7XG5mdW5jdGlvbiBiaW5kKGZ1bmMsIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBjcmVhdGVXcmFwcGVyKGZ1bmMsIDE3LCBzbGljZShhcmd1bWVudHMsIDIpLCBudWxsLCB0aGlzQXJnKSA6IGNyZWF0ZVdyYXBwZXIoZnVuYywgMSwgbnVsbCwgbnVsbCwgdGhpc0FyZyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQ7IiwidmFyIGJhc2VDcmVhdGVDYWxsYmFjayA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9iYXNlQ3JlYXRlQ2FsbGJhY2snKSwgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmFzZUlzRXF1YWwnKSwgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzT2JqZWN0JyksIGtleXMgPSByZXF1aXJlKCcuLi9vYmplY3RzL2tleXMnKSwgcHJvcGVydHkgPSByZXF1aXJlKCcuLi91dGlsaXRpZXMvcHJvcGVydHknKTtcbmZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgZnVuYztcbiAgICBpZiAoZnVuYyA9PSBudWxsIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KTtcbiAgICB9XG4gICAgaWYgKHR5cGUgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5KGZ1bmMpO1xuICAgIH1cbiAgICB2YXIgcHJvcHMgPSBrZXlzKGZ1bmMpLCBrZXkgPSBwcm9wc1swXSwgYSA9IGZ1bmNba2V5XTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID09IDEgJiYgYSA9PT0gYSAmJiAhaXNPYmplY3QoYSkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIHZhciBiID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgICByZXR1cm4gYSA9PT0gYiAmJiAoYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBwcm9wcy5sZW5ndGgsIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICAgIGlmICghKHJlc3VsdCA9IGJhc2VJc0VxdWFsKG9iamVjdFtwcm9wc1tsZW5ndGhdXSwgZnVuY1twcm9wc1tsZW5ndGhdXSwgbnVsbCwgdHJ1ZSkpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDYWxsYmFjazsiLCJ2YXIgYXJyYXlQb29sID0gW107XG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5UG9vbDsiLCJ2YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJy4vYmFzZUNyZWF0ZScpLCBpc09iamVjdCA9IHJlcXVpcmUoJy4uL29iamVjdHMvaXNPYmplY3QnKSwgc2V0QmluZERhdGEgPSByZXF1aXJlKCcuL3NldEJpbmREYXRhJyksIHNsaWNlID0gcmVxdWlyZSgnLi9zbGljZScpO1xudmFyIGFycmF5UmVmID0gW107XG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2g7XG5mdW5jdGlvbiBiYXNlQmluZChiaW5kRGF0YSkge1xuICAgIHZhciBmdW5jID0gYmluZERhdGFbMF0sIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sIHRoaXNBcmcgPSBiaW5kRGF0YVs0XTtcbiAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgICB2YXIgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKSwgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyB8fCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgcmV0dXJuIGJvdW5kO1xufVxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQmluZDsiLCJ2YXIgaXNOYXRpdmUgPSByZXF1aXJlKCcuL2lzTmF0aXZlJyksIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc09iamVjdCcpLCBub29wID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL25vb3AnKTtcbnZhciBuYXRpdmVDcmVhdGUgPSBpc05hdGl2ZShuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlKSAmJiBuYXRpdmVDcmVhdGU7XG5mdW5jdGlvbiBiYXNlQ3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiBpc09iamVjdChwcm90b3R5cGUpID8gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSkgOiB7fTtcbn1cbmlmICghbmF0aXZlQ3JlYXRlKSB7XG4gICAgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gT2JqZWN0KCkge1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QocHJvdG90eXBlKSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBPYmplY3QoKTtcbiAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgfHwgd2luZG93Lk9iamVjdCgpO1xuICAgICAgICB9O1xuICAgIH0oKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTsiLCJ2YXIgYmluZCA9IHJlcXVpcmUoJy4uL2Z1bmN0aW9ucy9iaW5kJyksIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL2lkZW50aXR5JyksIHNldEJpbmREYXRhID0gcmVxdWlyZSgnLi9zZXRCaW5kRGF0YScpLCBzdXBwb3J0ID0gcmVxdWlyZSgnLi4vc3VwcG9ydCcpO1xudmFyIHJlRnVuY05hbWUgPSAvXlxccypmdW5jdGlvblsgXFxuXFxyXFx0XStcXHcvO1xudmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcbnZhciBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuZnVuY3Rpb24gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgfHwgISgncHJvdG90eXBlJyBpbiBmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gICAgdmFyIGJpbmREYXRhID0gZnVuYy5fX2JpbmREYXRhX187XG4gICAgaWYgKHR5cGVvZiBiaW5kRGF0YSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgICAgICAgIGJpbmREYXRhID0gIWZ1bmMubmFtZTtcbiAgICAgICAgfVxuICAgICAgICBiaW5kRGF0YSA9IGJpbmREYXRhIHx8ICFzdXBwb3J0LmZ1bmNEZWNvbXA7XG4gICAgICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBmblRvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgICAgICAgICBpZiAoIXN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgICAgICAgICAgYmluZERhdGEgPSAhcmVGdW5jTmFtZS50ZXN0KHNvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICAgICAgICAgICAgYmluZERhdGEgPSByZVRoaXMudGVzdChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIHNldEJpbmREYXRhKGZ1bmMsIGJpbmREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmluZERhdGEgPT09IGZhbHNlIHx8IGJpbmREYXRhICE9PSB0cnVlICYmIGJpbmREYXRhWzFdICYgMSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gICAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYSwgYik7XG4gICAgICAgIH07XG4gICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgICB9O1xuICAgIGNhc2UgNDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gYmluZChmdW5jLCB0aGlzQXJnKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZUNhbGxiYWNrOyIsInZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnLi9iYXNlQ3JlYXRlJyksIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc09iamVjdCcpLCBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJy4vc2V0QmluZERhdGEnKSwgc2xpY2UgPSByZXF1aXJlKCcuL3NsaWNlJyk7XG52YXIgYXJyYXlSZWYgPSBbXTtcbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaDtcbmZ1bmN0aW9uIGJhc2VDcmVhdGVXcmFwcGVyKGJpbmREYXRhKSB7XG4gICAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSwgYml0bWFzayA9IGJpbmREYXRhWzFdLCBwYXJ0aWFsQXJncyA9IGJpbmREYXRhWzJdLCBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sIHRoaXNBcmcgPSBiaW5kRGF0YVs0XSwgYXJpdHkgPSBiaW5kRGF0YVs1XTtcbiAgICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLCBpc0N1cnJ5ID0gYml0bWFzayAmIDQsIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LCBrZXkgPSBmdW5jO1xuICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICB2YXIgdGhpc0JpbmRpbmcgPSBpc0JpbmQgPyB0aGlzQXJnIDogdGhpcztcbiAgICAgICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydGlhbFJpZ2h0QXJncyB8fCBpc0N1cnJ5KSB7XG4gICAgICAgICAgICBhcmdzIHx8IChhcmdzID0gc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICBpZiAocGFydGlhbFJpZ2h0QXJncykge1xuICAgICAgICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNDdXJyeSAmJiBhcmdzLmxlbmd0aCA8IGFyaXR5KSB7XG4gICAgICAgICAgICAgICAgYml0bWFzayB8PSAxNiAmIH4zMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZVdyYXBwZXIoW1xuICAgICAgICAgICAgICAgICAgICBmdW5jLFxuICAgICAgICAgICAgICAgICAgICBpc0N1cnJ5Qm91bmQgPyBiaXRtYXNrIDogYml0bWFzayAmIH4zLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0aGlzQXJnLFxuICAgICAgICAgICAgICAgICAgICBhcml0eVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3MgfHwgKGFyZ3MgPSBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoaXNCaW5kS2V5KSB7XG4gICAgICAgICAgICBmdW5jID0gdGhpc0JpbmRpbmdba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgICB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gICAgfVxuICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgcmV0dXJuIGJvdW5kO1xufVxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlV3JhcHBlcjsiLCJ2YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzQXJndW1lbnRzJyksIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzQXJyYXknKTtcbmZ1bmN0aW9uIGJhc2VGbGF0dGVuKGFycmF5LCBpc1NoYWxsb3csIGlzU3RyaWN0LCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgaW5kZXggPSAoZnJvbUluZGV4IHx8IDApIC0gMSwgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLCByZXN1bHQgPSBbXTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJiAoaXNBcnJheSh2YWx1ZSkgfHwgaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAgICAgaWYgKCFpc1NoYWxsb3cpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJhc2VGbGF0dGVuKHZhbHVlLCBpc1NoYWxsb3csIGlzU3RyaWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2YWxJbmRleCA9IC0xLCB2YWxMZW5ndGggPSB2YWx1ZS5sZW5ndGgsIHJlc0luZGV4ID0gcmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgICAgIHJlc3VsdC5sZW5ndGggKz0gdmFsTGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKCsrdmFsSW5kZXggPCB2YWxMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZVt2YWxJbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzU3RyaWN0KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZsYXR0ZW47IiwiZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgaW5kZXggPSAoZnJvbUluZGV4IHx8IDApIC0gMSwgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGlmIChhcnJheVtpbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSW5kZXhPZjsiLCJ2YXIgZm9ySW4gPSByZXF1aXJlKCcuLi9vYmplY3RzL2ZvckluJyksIGdldEFycmF5ID0gcmVxdWlyZSgnLi9nZXRBcnJheScpLCBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc0Z1bmN0aW9uJyksIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi9vYmplY3RUeXBlcycpLCByZWxlYXNlQXJyYXkgPSByZXF1aXJlKCcuL3JlbGVhc2VBcnJheScpO1xudmFyIGFyZ3NDbGFzcyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLCBhcnJheUNsYXNzID0gJ1tvYmplY3QgQXJyYXldJywgYm9vbENsYXNzID0gJ1tvYmplY3QgQm9vbGVhbl0nLCBkYXRlQ2xhc3MgPSAnW29iamVjdCBEYXRlXScsIG51bWJlckNsYXNzID0gJ1tvYmplY3QgTnVtYmVyXScsIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XScsIHJlZ2V4cENsYXNzID0gJ1tvYmplY3QgUmVnRXhwXScsIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcbmZ1bmN0aW9uIGJhc2VJc0VxdWFsKGEsIGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2soYSwgYik7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gISFyZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT0gMSAvIGI7XG4gICAgfVxuICAgIHZhciB0eXBlID0gdHlwZW9mIGEsIG90aGVyVHlwZSA9IHR5cGVvZiBiO1xuICAgIGlmIChhID09PSBhICYmICEoYSAmJiBvYmplY3RUeXBlc1t0eXBlXSkgJiYgIShiICYmIG9iamVjdFR5cGVzW290aGVyVHlwZV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfVxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpLCBvdGhlckNsYXNzID0gdG9TdHJpbmcuY2FsbChiKTtcbiAgICBpZiAoY2xhc3NOYW1lID09IGFyZ3NDbGFzcykge1xuICAgICAgICBjbGFzc05hbWUgPSBvYmplY3RDbGFzcztcbiAgICB9XG4gICAgaWYgKG90aGVyQ2xhc3MgPT0gYXJnc0NsYXNzKSB7XG4gICAgICAgIG90aGVyQ2xhc3MgPSBvYmplY3RDbGFzcztcbiAgICB9XG4gICAgaWYgKGNsYXNzTmFtZSAhPSBvdGhlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICBjYXNlIGJvb2xDbGFzczpcbiAgICBjYXNlIGRhdGVDbGFzczpcbiAgICAgICAgcmV0dXJuICthID09ICtiO1xuICAgIGNhc2UgbnVtYmVyQ2xhc3M6XG4gICAgICAgIHJldHVybiBhICE9ICthID8gYiAhPSArYiA6IGEgPT0gMCA/IDEgLyBhID09IDEgLyBiIDogYSA9PSArYjtcbiAgICBjYXNlIHJlZ2V4cENsYXNzOlxuICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICB9XG4gICAgdmFyIGlzQXJyID0gY2xhc3NOYW1lID09IGFycmF5Q2xhc3M7XG4gICAgaWYgKCFpc0Fycikge1xuICAgICAgICB2YXIgYVdyYXBwZWQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsICdfX3dyYXBwZWRfXycpLCBiV3JhcHBlZCA9IGhhc093blByb3BlcnR5LmNhbGwoYiwgJ19fd3JhcHBlZF9fJyk7XG4gICAgICAgIGlmIChhV3JhcHBlZCB8fCBiV3JhcHBlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2VJc0VxdWFsKGFXcmFwcGVkID8gYS5fX3dyYXBwZWRfXyA6IGEsIGJXcmFwcGVkID8gYi5fX3dyYXBwZWRfXyA6IGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYXNzTmFtZSAhPSBvYmplY3RDbGFzcykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjdG9yQSA9IGEuY29uc3RydWN0b3IsIGN0b3JCID0gYi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgaWYgKGN0b3JBICE9IGN0b3JCICYmICEoaXNGdW5jdGlvbihjdG9yQSkgJiYgY3RvckEgaW5zdGFuY2VvZiBjdG9yQSAmJiBpc0Z1bmN0aW9uKGN0b3JCKSAmJiBjdG9yQiBpbnN0YW5jZW9mIGN0b3JCKSAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaW5pdGVkU3RhY2sgPSAhc3RhY2tBO1xuICAgIHN0YWNrQSB8fCAoc3RhY2tBID0gZ2V0QXJyYXkoKSk7XG4gICAgc3RhY2tCIHx8IChzdGFja0IgPSBnZXRBcnJheSgpKTtcbiAgICB2YXIgbGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IGEpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFja0JbbGVuZ3RoXSA9PSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBzaXplID0gMDtcbiAgICByZXN1bHQgPSB0cnVlO1xuICAgIHN0YWNrQS5wdXNoKGEpO1xuICAgIHN0YWNrQi5wdXNoKGIpO1xuICAgIGlmIChpc0Fycikge1xuICAgICAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgICAgc2l6ZSA9IGIubGVuZ3RoO1xuICAgICAgICByZXN1bHQgPSBzaXplID09IGxlbmd0aDtcbiAgICAgICAgaWYgKHJlc3VsdCB8fCBpc1doZXJlKSB7XG4gICAgICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoLCB2YWx1ZSA9IGJbc2l6ZV07XG4gICAgICAgICAgICAgICAgaWYgKGlzV2hlcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPSBiYXNlSXNFcXVhbChhW2luZGV4XSwgdmFsdWUsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIShyZXN1bHQgPSBiYXNlSXNFcXVhbChhW3NpemVdLCB2YWx1ZSwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9ySW4oYiwgZnVuY3Rpb24gKHZhbHVlLCBrZXksIGIpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCA9IGhhc093blByb3BlcnR5LmNhbGwoYSwga2V5KSAmJiBiYXNlSXNFcXVhbChhW2tleV0sIHZhbHVlLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiAhaXNXaGVyZSkge1xuICAgICAgICAgICAgZm9ySW4oYSwgZnVuY3Rpb24gKHZhbHVlLCBrZXksIGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChhLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgPSAtLXNpemUgPiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFja0EucG9wKCk7XG4gICAgc3RhY2tCLnBvcCgpO1xuICAgIGlmIChpbml0ZWRTdGFjaykge1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsOyIsInZhciBiYXNlQmluZCA9IHJlcXVpcmUoJy4vYmFzZUJpbmQnKSwgYmFzZUNyZWF0ZVdyYXBwZXIgPSByZXF1aXJlKCcuL2Jhc2VDcmVhdGVXcmFwcGVyJyksIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzRnVuY3Rpb24nKSwgc2xpY2UgPSByZXF1aXJlKCcuL3NsaWNlJyk7XG52YXIgYXJyYXlSZWYgPSBbXTtcbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaCwgdW5zaGlmdCA9IGFycmF5UmVmLnVuc2hpZnQ7XG5mdW5jdGlvbiBjcmVhdGVXcmFwcGVyKGZ1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eSkge1xuICAgIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSwgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsIGlzQ3VycnkgPSBiaXRtYXNrICYgNCwgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsIGlzUGFydGlhbCA9IGJpdG1hc2sgJiAxNiwgaXNQYXJ0aWFsUmlnaHQgPSBiaXRtYXNrICYgMzI7XG4gICAgaWYgKCFpc0JpbmRLZXkgJiYgIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICBpZiAoaXNQYXJ0aWFsICYmICFwYXJ0aWFsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgYml0bWFzayAmPSB+MTY7XG4gICAgICAgIGlzUGFydGlhbCA9IHBhcnRpYWxBcmdzID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpc1BhcnRpYWxSaWdodCAmJiAhcGFydGlhbFJpZ2h0QXJncy5sZW5ndGgpIHtcbiAgICAgICAgYml0bWFzayAmPSB+MzI7XG4gICAgICAgIGlzUGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0QXJncyA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgYmluZERhdGEgPSBmdW5jICYmIGZ1bmMuX19iaW5kRGF0YV9fO1xuICAgIGlmIChiaW5kRGF0YSAmJiBiaW5kRGF0YSAhPT0gdHJ1ZSkge1xuICAgICAgICBiaW5kRGF0YSA9IHNsaWNlKGJpbmREYXRhKTtcbiAgICAgICAgaWYgKGJpbmREYXRhWzJdKSB7XG4gICAgICAgICAgICBiaW5kRGF0YVsyXSA9IHNsaWNlKGJpbmREYXRhWzJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmluZERhdGFbM10pIHtcbiAgICAgICAgICAgIGJpbmREYXRhWzNdID0gc2xpY2UoYmluZERhdGFbM10pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0JpbmQgJiYgIShiaW5kRGF0YVsxXSAmIDEpKSB7XG4gICAgICAgICAgICBiaW5kRGF0YVs0XSA9IHRoaXNBcmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICAgICAgICBiaXRtYXNrIHw9IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ3VycnkgJiYgIShiaW5kRGF0YVsxXSAmIDQpKSB7XG4gICAgICAgICAgICBiaW5kRGF0YVs1XSA9IGFyaXR5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1BhcnRpYWwpIHtcbiAgICAgICAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUGFydGlhbFJpZ2h0KSB7XG4gICAgICAgICAgICB1bnNoaWZ0LmFwcGx5KGJpbmREYXRhWzNdIHx8IChiaW5kRGF0YVszXSA9IFtdKSwgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgYmluZERhdGFbMV0gfD0gYml0bWFzaztcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIuYXBwbHkobnVsbCwgYmluZERhdGEpO1xuICAgIH1cbiAgICB2YXIgY3JlYXRlciA9IGJpdG1hc2sgPT0gMSB8fCBiaXRtYXNrID09PSAxNyA/IGJhc2VCaW5kIDogYmFzZUNyZWF0ZVdyYXBwZXI7XG4gICAgcmV0dXJuIGNyZWF0ZXIoW1xuICAgICAgICBmdW5jLFxuICAgICAgICBiaXRtYXNrLFxuICAgICAgICBwYXJ0aWFsQXJncyxcbiAgICAgICAgcGFydGlhbFJpZ2h0QXJncyxcbiAgICAgICAgdGhpc0FyZyxcbiAgICAgICAgYXJpdHlcbiAgICBdKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlV3JhcHBlcjsiLCJ2YXIgaHRtbEVzY2FwZXMgPSByZXF1aXJlKCcuL2h0bWxFc2NhcGVzJyk7XG5mdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICAgIHJldHVybiBodG1sRXNjYXBlc1ttYXRjaF07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZUh0bWxDaGFyOyIsInZhciBhcnJheVBvb2wgPSByZXF1aXJlKCcuL2FycmF5UG9vbCcpO1xuZnVuY3Rpb24gZ2V0QXJyYXkoKSB7XG4gICAgcmV0dXJuIGFycmF5UG9vbC5wb3AoKSB8fCBbXTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZ2V0QXJyYXk7IiwidmFyIGh0bWxFc2NhcGVzID0ge1xuICAgICAgICAnJic6ICcmYW1wOycsXG4gICAgICAgICc8JzogJyZsdDsnLFxuICAgICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAgICdcXCcnOiAnJiMzOTsnXG4gICAgfTtcbm1vZHVsZS5leHBvcnRzID0gaHRtbEVzY2FwZXM7IiwidmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xudmFyIHJlTmF0aXZlID0gUmVnRXhwKCdeJyArIFN0cmluZyh0b1N0cmluZykucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKS5yZXBsYWNlKC90b1N0cmluZ3wgZm9yIFteXFxdXSsvZywgJy4qPycpICsgJyQnKTtcbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpc05hdGl2ZTsiLCJ2YXIgbWF4UG9vbFNpemUgPSA0MDtcbm1vZHVsZS5leHBvcnRzID0gbWF4UG9vbFNpemU7IiwidmFyIG9iamVjdFR5cGVzID0ge1xuICAgICAgICAnYm9vbGVhbic6IGZhbHNlLFxuICAgICAgICAnZnVuY3Rpb24nOiB0cnVlLFxuICAgICAgICAnb2JqZWN0JzogdHJ1ZSxcbiAgICAgICAgJ251bWJlcic6IGZhbHNlLFxuICAgICAgICAnc3RyaW5nJzogZmFsc2UsXG4gICAgICAgICd1bmRlZmluZWQnOiBmYWxzZVxuICAgIH07XG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFR5cGVzOyIsInZhciBodG1sRXNjYXBlcyA9IHJlcXVpcmUoJy4vaHRtbEVzY2FwZXMnKSwga2V5cyA9IHJlcXVpcmUoJy4uL29iamVjdHMva2V5cycpO1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cCgnWycgKyBrZXlzKGh0bWxFc2NhcGVzKS5qb2luKCcnKSArICddJywgJ2cnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVVbmVzY2FwZWRIdG1sOyIsInZhciBhcnJheVBvb2wgPSByZXF1aXJlKCcuL2FycmF5UG9vbCcpLCBtYXhQb29sU2l6ZSA9IHJlcXVpcmUoJy4vbWF4UG9vbFNpemUnKTtcbmZ1bmN0aW9uIHJlbGVhc2VBcnJheShhcnJheSkge1xuICAgIGFycmF5Lmxlbmd0aCA9IDA7XG4gICAgaWYgKGFycmF5UG9vbC5sZW5ndGggPCBtYXhQb29sU2l6ZSkge1xuICAgICAgICBhcnJheVBvb2wucHVzaChhcnJheSk7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSByZWxlYXNlQXJyYXk7IiwidmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnLi9pc05hdGl2ZScpLCBub29wID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL25vb3AnKTtcbnZhciBkZXNjcmlwdG9yID0ge1xuICAgICAgICAnY29uZmlndXJhYmxlJzogZmFsc2UsXG4gICAgICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgICAgICd2YWx1ZSc6IG51bGwsXG4gICAgICAgICd3cml0YWJsZSc6IGZhbHNlXG4gICAgfTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBvID0ge30sIGZ1bmMgPSBpc05hdGl2ZShmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLCByZXN1bHQgPSBmdW5jKG8sIG8sIG8pICYmIGZ1bmM7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0oKTtcbnZhciBzZXRCaW5kRGF0YSA9ICFkZWZpbmVQcm9wZXJ0eSA/IG5vb3AgOiBmdW5jdGlvbiAoZnVuYywgdmFsdWUpIHtcbiAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eShmdW5jLCAnX19iaW5kRGF0YV9fJywgZGVzY3JpcHRvcik7XG4gICAgfTtcbm1vZHVsZS5leHBvcnRzID0gc2V0QmluZERhdGE7IiwidmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi9vYmplY3RUeXBlcycpO1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xudmFyIHNoaW1LZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICAgIGlmICghaXRlcmFibGUpXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKCFvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0XSlcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICBmb3IgKGluZGV4IGluIGl0ZXJhYmxlKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0ZXJhYmxlLCBpbmRleCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gc2hpbUtleXM7IiwiZnVuY3Rpb24gc2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBlbmQgPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IC0xLCBsZW5ndGggPSBlbmQgLSBzdGFydCB8fCAwLCByZXN1bHQgPSBBcnJheShsZW5ndGggPCAwID8gMCA6IGxlbmd0aCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxubW9kdWxlLmV4cG9ydHMgPSBzbGljZTsiLCJ2YXIgYmFzZUNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Jhc2VDcmVhdGVDYWxsYmFjaycpLCBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyksIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdFR5cGVzJyk7XG52YXIgYXNzaWduID0gZnVuY3Rpb24gKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgIGlmICghaXRlcmFibGUpXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIGFyZ3NJbmRleCA9IDAsIGFyZ3NMZW5ndGggPSB0eXBlb2YgZ3VhcmQgPT0gJ251bWJlcicgPyAyIDogYXJncy5sZW5ndGg7XG4gICAgaWYgKGFyZ3NMZW5ndGggPiAzICYmIHR5cGVvZiBhcmdzW2FyZ3NMZW5ndGggLSAyXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhhcmdzWy0tYXJnc0xlbmd0aCAtIDFdLCBhcmdzW2FyZ3NMZW5ndGgtLV0sIDIpO1xuICAgIH0gZWxzZSBpZiAoYXJnc0xlbmd0aCA+IDIgJiYgdHlwZW9mIGFyZ3NbYXJnc0xlbmd0aCAtIDFdID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBhcmdzWy0tYXJnc0xlbmd0aF07XG4gICAgfVxuICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgICAgICAgICB2YXIgb3duSW5kZXggPSAtMSwgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLCBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBjYWxsYmFjayA/IGNhbGxiYWNrKHJlc3VsdFtpbmRleF0sIGl0ZXJhYmxlW2luZGV4XSkgOiBpdGVyYWJsZVtpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbjsiLCJ2YXIga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpLCBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3RUeXBlcycpO1xudmFyIGRlZmF1bHRzID0gZnVuY3Rpb24gKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgIGlmICghaXRlcmFibGUpXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIGFyZ3NJbmRleCA9IDAsIGFyZ3NMZW5ndGggPSB0eXBlb2YgZ3VhcmQgPT0gJ251bWJlcicgPyAyIDogYXJncy5sZW5ndGg7XG4gICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICBpdGVyYWJsZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICAgICAgaWYgKGl0ZXJhYmxlICYmIG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHtcbiAgICAgICAgICAgIHZhciBvd25JbmRleCA9IC0xLCBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRbaW5kZXhdID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmFibGVbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0czsiLCJ2YXIgYmFzZUNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Jhc2VDcmVhdGVDYWxsYmFjaycpLCBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3RUeXBlcycpO1xudmFyIGZvckluID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IGNvbGxlY3Rpb24sIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgIGlmICghaXRlcmFibGUpXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKCFvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGZvckluOyIsInZhciBiYXNlQ3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmFzZUNyZWF0ZUNhbGxiYWNrJyksIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKSwgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0VHlwZXMnKTtcbnZhciBmb3JPd24gPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gICAgaWYgKCFpdGVyYWJsZSlcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAoIW9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICB2YXIgb3duSW5kZXggPSAtMSwgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLCBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG4gICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gZm9yT3duOyIsInZhciBhcmdzQ2xhc3MgPSAnW29iamVjdCBBcmd1bWVudHNdJztcbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGFyZ3NDbGFzcyB8fCBmYWxzZTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7IiwidmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzTmF0aXZlJyk7XG52YXIgYXJyYXlDbGFzcyA9ICdbb2JqZWN0IEFycmF5XSc7XG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG52YXIgbmF0aXZlSXNBcnJheSA9IGlzTmF0aXZlKG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KSAmJiBuYXRpdmVJc0FycmF5O1xudmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT0gJ251bWJlcicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcyB8fCBmYWxzZTtcbiAgICB9O1xubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5OyIsImZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247IiwidmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdFR5cGVzJyk7XG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiAhISh2YWx1ZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgdmFsdWVdKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7IiwidmFyIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGZhbHNlO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpc1N0cmluZzsiLCJ2YXIgaXNOYXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXNOYXRpdmUnKSwgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksIHNoaW1LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoaW1LZXlzJyk7XG52YXIgbmF0aXZlS2V5cyA9IGlzTmF0aXZlKG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cztcbnZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgICB9O1xubW9kdWxlLmV4cG9ydHMgPSBrZXlzOyIsInZhciBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5mdW5jdGlvbiB2YWx1ZXMob2JqZWN0KSB7XG4gICAgdmFyIGluZGV4ID0gLTEsIHByb3BzID0ga2V5cyhvYmplY3QpLCBsZW5ndGggPSBwcm9wcy5sZW5ndGgsIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG9iamVjdFtwcm9wc1tpbmRleF1dO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxubW9kdWxlLmV4cG9ydHMgPSB2YWx1ZXM7IiwidmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnLi9pbnRlcm5hbHMvaXNOYXRpdmUnKTtcbnZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG52YXIgc3VwcG9ydCA9IHt9O1xuc3VwcG9ydC5mdW5jRGVjb21wID0gIWlzTmF0aXZlKHdpbmRvdy5XaW5SVEVycm9yKSAmJiByZVRoaXMudGVzdChmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG59KTtcbnN1cHBvcnQuZnVuY05hbWVzID0gdHlwZW9mIEZ1bmN0aW9uLm5hbWUgPT0gJ3N0cmluZyc7XG5tb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnQ7IiwidmFyIGVzY2FwZUh0bWxDaGFyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VzY2FwZUh0bWxDaGFyJyksIGtleXMgPSByZXF1aXJlKCcuLi9vYmplY3RzL2tleXMnKSwgcmVVbmVzY2FwZWRIdG1sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlVW5lc2NhcGVkSHRtbCcpO1xuZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcgPT0gbnVsbCA/ICcnIDogU3RyaW5nKHN0cmluZykucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlOyIsImZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTsiLCJmdW5jdGlvbiBub29wKCkge1xufVxubW9kdWxlLmV4cG9ydHMgPSBub29wOyIsImZ1bmN0aW9uIHByb3BlcnR5KGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBwcm9wZXJ0eTsiLCJ2YXIgYnVpbGRDb21tYW5kUGF0Y2ggPSByZXF1aXJlKCcuL2FwaS9jb21tYW5kLXBhdGNoJyksIGJ1aWxkQ29tbWFuZCA9IHJlcXVpcmUoJy4vYXBpL2NvbW1hbmQnKSwgTm9kZSA9IHJlcXVpcmUoJy4vYXBpL25vZGUnKSwgYnVpbGRTZWxlY3Rpb24gPSByZXF1aXJlKCcuL2FwaS9zZWxlY3Rpb24nKSwgYnVpbGRTaW1wbGVDb21tYW5kID0gcmVxdWlyZSgnLi9hcGkvc2ltcGxlLWNvbW1hbmQnKTtcbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQXBpKHNjcmliZSkge1xuICAgIHRoaXMuQ29tbWFuZFBhdGNoID0gYnVpbGRDb21tYW5kUGF0Y2goc2NyaWJlKTtcbiAgICB0aGlzLkNvbW1hbmQgPSBidWlsZENvbW1hbmQoc2NyaWJlKTtcbiAgICB0aGlzLk5vZGUgPSBOb2RlO1xuICAgIHRoaXMuU2VsZWN0aW9uID0gYnVpbGRTZWxlY3Rpb24oc2NyaWJlKTtcbiAgICB0aGlzLlNpbXBsZUNvbW1hbmQgPSBidWlsZFNpbXBsZUNvbW1hbmQodGhpcywgc2NyaWJlKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZFBhdGNoKGNvbW1hbmROYW1lKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZE5hbWUgPSBjb21tYW5kTmFtZTtcbiAgICB9XG4gICAgQ29tbWFuZFBhdGNoLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHNjcmliZS50cmFuc2FjdGlvbk1hbmFnZXIucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuY29tbWFuZE5hbWUsIGZhbHNlLCB2YWx1ZSB8fCBudWxsKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuICAgIENvbW1hbmRQYXRjaC5wcm90b3R5cGUucXVlcnlTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN0YXRlKHRoaXMuY29tbWFuZE5hbWUpO1xuICAgIH07XG4gICAgQ29tbWFuZFBhdGNoLnByb3RvdHlwZS5xdWVyeUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeUNvbW1hbmRFbmFibGVkKHRoaXMuY29tbWFuZE5hbWUpO1xuICAgIH07XG4gICAgcmV0dXJuIENvbW1hbmRQYXRjaDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgZnVuY3Rpb24gQ29tbWFuZChjb21tYW5kTmFtZSkge1xuICAgICAgICB0aGlzLmNvbW1hbmROYW1lID0gY29tbWFuZE5hbWU7XG4gICAgICAgIHRoaXMucGF0Y2ggPSBzY3JpYmUuY29tbWFuZFBhdGNoZXNbdGhpcy5jb21tYW5kTmFtZV07XG4gICAgfVxuICAgIENvbW1hbmQucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMucGF0Y2guZXhlY3V0ZSh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JpYmUudHJhbnNhY3Rpb25NYW5hZ2VyLnJ1bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQodGhpcy5jb21tYW5kTmFtZSwgZmFsc2UsIHZhbHVlIHx8IG51bGwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucXVlcnlTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhdGNoLnF1ZXJ5U3RhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZSh0aGlzLmNvbW1hbmROYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ29tbWFuZC5wcm90b3R5cGUucXVlcnlFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0Y2gucXVlcnlFbmFibGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlDb21tYW5kRW5hYmxlZCh0aGlzLmNvbW1hbmROYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIENvbW1hbmQ7XG59OyIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIE5vZGUobm9kZSkge1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG59XG5Ob2RlLnByb3RvdHlwZS5nZXRBbmNlc3RvciA9IGZ1bmN0aW9uIChub2RlRmlsdGVyKSB7XG4gICAgdmFyIGlzVG9wQ29udGFpbmVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50ICYmIGVsZW1lbnQuYXR0cmlidXRlcyAmJiBlbGVtZW50LmF0dHJpYnV0ZXMuZ2V0TmFtZWRJdGVtKCdjb250ZW50ZWRpdGFibGUnKTtcbiAgICB9O1xuICAgIGlmIChpc1RvcENvbnRhaW5lckVsZW1lbnQodGhpcy5ub2RlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMubm9kZS5wYXJlbnROb2RlO1xuICAgIHdoaWxlIChjdXJyZW50Tm9kZSAmJiAhaXNUb3BDb250YWluZXJFbGVtZW50KGN1cnJlbnROb2RlKSkge1xuICAgICAgICBpZiAobm9kZUZpbHRlcihjdXJyZW50Tm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgfVxufTtcbk5vZGUucHJvdG90eXBlLm5leHRBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbCA9IFtdO1xuICAgIHZhciBlbCA9IHRoaXMubm9kZS5uZXh0U2libGluZztcbiAgICB3aGlsZSAoZWwpIHtcbiAgICAgICAgYWxsLnB1c2goZWwpO1xuICAgICAgICBlbCA9IGVsLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICByZXR1cm4gYWxsO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTm9kZTsiLCJ2YXIgZWxlbWVudEhlbHBlciA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgIGZ1bmN0aW9uIFNlbGVjdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbi5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5zZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBTZWxlY3Rpb24ucHJvdG90eXBlLmdldENvbnRhaW5pbmcgPSBmdW5jdGlvbiAobm9kZUZpbHRlcikge1xuICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmdlO1xuICAgICAgICBpZiAoIXJhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgc2NyaWJlLmFwaS5Ob2RlKHRoaXMucmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIpO1xuICAgICAgICB2YXIgaXNUb3BDb250YWluZXJFbGVtZW50ID0gbm9kZS5ub2RlICYmIG5vZGUubm9kZS5hdHRyaWJ1dGVzICYmIG5vZGUubm9kZS5hdHRyaWJ1dGVzLmdldE5hbWVkSXRlbSgnY29udGVudGVkaXRhYmxlJyk7XG4gICAgICAgIHJldHVybiAhaXNUb3BDb250YWluZXJFbGVtZW50ICYmIG5vZGVGaWx0ZXIobm9kZS5ub2RlKSA/IG5vZGUubm9kZSA6IG5vZGUuZ2V0QW5jZXN0b3Iobm9kZUZpbHRlcik7XG4gICAgfTtcbiAgICBTZWxlY3Rpb24ucHJvdG90eXBlLnBsYWNlTWFya2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gdGhpcy5yYW5nZTtcbiAgICAgICAgaWYgKCFyYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdGFydE1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtJyk7XG4gICAgICAgIHN0YXJ0TWFya2VyLmNsYXNzTGlzdC5hZGQoJ3NjcmliZS1tYXJrZXInKTtcbiAgICAgICAgdmFyIGVuZE1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtJyk7XG4gICAgICAgIGVuZE1hcmtlci5jbGFzc0xpc3QuYWRkKCdzY3JpYmUtbWFya2VyJyk7XG4gICAgICAgIHZhciByYW5nZUVuZCA9IHRoaXMucmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICByYW5nZUVuZC5jb2xsYXBzZShmYWxzZSk7XG4gICAgICAgIHJhbmdlRW5kLmluc2VydE5vZGUoZW5kTWFya2VyKTtcbiAgICAgICAgaWYgKGVuZE1hcmtlci5uZXh0U2libGluZyAmJiBlbmRNYXJrZXIubmV4dFNpYmxpbmcubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmIGVuZE1hcmtlci5uZXh0U2libGluZy5kYXRhID09PSAnJykge1xuICAgICAgICAgICAgZW5kTWFya2VyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZW5kTWFya2VyLm5leHRTaWJsaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kTWFya2VyLnByZXZpb3VzU2libGluZyAmJiBlbmRNYXJrZXIucHJldmlvdXNTaWJsaW5nLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSAmJiBlbmRNYXJrZXIucHJldmlvdXNTaWJsaW5nLmRhdGEgPT09ICcnKSB7XG4gICAgICAgICAgICBlbmRNYXJrZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbmRNYXJrZXIucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0aW9uLmlzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2VTdGFydCA9IHRoaXMucmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICAgICAgcmFuZ2VTdGFydC5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgIHJhbmdlU3RhcnQuaW5zZXJ0Tm9kZShzdGFydE1hcmtlcik7XG4gICAgICAgICAgICBpZiAoc3RhcnRNYXJrZXIubmV4dFNpYmxpbmcgJiYgc3RhcnRNYXJrZXIubmV4dFNpYmxpbmcubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmIHN0YXJ0TWFya2VyLm5leHRTaWJsaW5nLmRhdGEgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRNYXJrZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdGFydE1hcmtlci5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhcnRNYXJrZXIucHJldmlvdXNTaWJsaW5nICYmIHN0YXJ0TWFya2VyLnByZXZpb3VzU2libGluZy5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgJiYgc3RhcnRNYXJrZXIucHJldmlvdXNTaWJsaW5nLmRhdGEgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRNYXJrZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdGFydE1hcmtlci5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICB0aGlzLnNlbGVjdGlvbi5hZGRSYW5nZSh0aGlzLnJhbmdlKTtcbiAgICB9O1xuICAgIFNlbGVjdGlvbi5wcm90b3R5cGUuZ2V0TWFya2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNjcmliZS5lbC5xdWVyeVNlbGVjdG9yQWxsKCdlbS5zY3JpYmUtbWFya2VyJyk7XG4gICAgfTtcbiAgICBTZWxlY3Rpb24ucHJvdG90eXBlLnJlbW92ZU1hcmtlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtYXJrZXJzID0gdGhpcy5nZXRNYXJrZXJzKCk7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFya2VycywgZnVuY3Rpb24gKG1hcmtlcikge1xuICAgICAgICAgICAgbWFya2VyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWFya2VyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTZWxlY3Rpb24ucHJvdG90eXBlLnNlbGVjdE1hcmtlcnMgPSBmdW5jdGlvbiAoa2VlcE1hcmtlcnMpIHtcbiAgICAgICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldE1hcmtlcnMoKTtcbiAgICAgICAgaWYgKCFtYXJrZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdSYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIG5ld1JhbmdlLnNldFN0YXJ0QmVmb3JlKG1hcmtlcnNbMF0pO1xuICAgICAgICBpZiAobWFya2Vycy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgbmV3UmFuZ2Uuc2V0RW5kQWZ0ZXIobWFya2Vyc1sxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdSYW5nZS5zZXRFbmRBZnRlcihtYXJrZXJzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBNYXJrZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb24uYWRkUmFuZ2UobmV3UmFuZ2UpO1xuICAgIH07XG4gICAgU2VsZWN0aW9uLnByb3RvdHlwZS5pc0NhcmV0T25OZXdMaW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBpc0VtcHR5SW5saW5lRWxlbWVudChub2RlKSB7XG4gICAgICAgICAgICB2YXIgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIobm9kZSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdHJlZVdhbGtlci5yb290O1xuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bWJlck9mQ2hpbGRyZW4gPSBjdXJyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBpZiAobnVtYmVyT2ZDaGlsZHJlbiA+IDEgfHwgbnVtYmVyT2ZDaGlsZHJlbiA9PT0gMSAmJiBjdXJyZW50Tm9kZS50ZXh0Q29udGVudC50cmltKCkgIT09ICcnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKG51bWJlck9mQ2hpbGRyZW4gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnROb2RlLnRleHRDb250ZW50LnRyaW0oKSA9PT0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlID0gdHJlZVdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgO1xuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgdmFyIGNvbnRhaW5lclBFbGVtZW50ID0gdGhpcy5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdQJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoY29udGFpbmVyUEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0VtcHR5SW5saW5lRWxlbWVudChjb250YWluZXJQRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBTZWxlY3Rpb247XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFwaSwgc2NyaWJlKSB7XG4gICAgZnVuY3Rpb24gU2ltcGxlQ29tbWFuZChjb21tYW5kTmFtZSwgbm9kZU5hbWUpIHtcbiAgICAgICAgc2NyaWJlLmFwaS5Db21tYW5kLmNhbGwodGhpcywgY29tbWFuZE5hbWUpO1xuICAgICAgICB0aGlzLm5vZGVOYW1lID0gbm9kZU5hbWU7XG4gICAgfVxuICAgIFNpbXBsZUNvbW1hbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShhcGkuQ29tbWFuZC5wcm90b3R5cGUpO1xuICAgIFNpbXBsZUNvbW1hbmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlQ29tbWFuZDtcbiAgICBTaW1wbGVDb21tYW5kLnByb3RvdHlwZS5xdWVyeVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gbmV3IHNjcmliZS5hcGkuU2VsZWN0aW9uKCk7XG4gICAgICAgIHJldHVybiBzY3JpYmUuYXBpLkNvbW1hbmQucHJvdG90eXBlLnF1ZXJ5U3RhdGUuY2FsbCh0aGlzKSAmJiAhIXNlbGVjdGlvbi5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gdGhpcy5ub2RlTmFtZTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuICAgIHJldHVybiBTaW1wbGVDb21tYW5kO1xufTsiLCJ2YXIgZmxhdHRlbiA9IHJlcXVpcmUoJ2xvZGFzaC1hbWQvbW9kZXJuL2FycmF5cy9mbGF0dGVuJyksIHRvQXJyYXkgPSByZXF1aXJlKCdsb2Rhc2gtYW1kL21vZGVybi9jb2xsZWN0aW9ucy90b0FycmF5JyksIGVsZW1lbnRIZWxwZXJzID0gcmVxdWlyZSgnLi9lbGVtZW50JyksIG5vZGVIZWxwZXJzID0gcmVxdWlyZSgnLi9ub2RlJyk7XG5mdW5jdGlvbiBvYnNlcnZlRG9tQ2hhbmdlcyhlbCwgY2FsbGJhY2spIHtcbiAgICBmdW5jdGlvbiBpbmNsdWRlUmVhbE11dGF0aW9ucyhtdXRhdGlvbnMpIHtcbiAgICAgICAgdmFyIGFsbENoYW5nZWROb2RlcyA9IGZsYXR0ZW4obXV0YXRpb25zLm1hcChmdW5jdGlvbiAobXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgYWRkZWQgPSB0b0FycmF5KG11dGF0aW9uLmFkZGVkTm9kZXMpO1xuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gdG9BcnJheShtdXRhdGlvbi5yZW1vdmVkTm9kZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRlZC5jb25jYXQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIHZhciByZWFsQ2hhbmdlZE5vZGVzID0gYWxsQ2hhbmdlZE5vZGVzLmZpbHRlcihmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgIHJldHVybiAhbm9kZUhlbHBlcnMuaXNFbXB0eVRleHROb2RlKG4pO1xuICAgICAgICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFlbGVtZW50SGVscGVycy5pc1NlbGVjdGlvbk1hcmtlck5vZGUobik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlYWxDaGFuZ2VkTm9kZXMubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgcnVubmluZ1Bvc3RNdXRhdGlvbiA9IGZhbHNlO1xuICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICghcnVubmluZ1Bvc3RNdXRhdGlvbiAmJiBpbmNsdWRlUmVhbE11dGF0aW9ucyhtdXRhdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Bvc3RNdXRhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nUG9zdE11dGF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShlbCwge1xuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IG9ic2VydmVEb21DaGFuZ2VzOyIsInZhciBjb250YWlucyA9IHJlcXVpcmUoJ2xvZGFzaC1hbWQvbW9kZXJuL2NvbGxlY3Rpb25zL2NvbnRhaW5zJyk7XG4ndXNlIHN0cmljdCc7XG52YXIgYmxvY2tFbGVtZW50TmFtZXMgPSBbXG4gICAgICAgICdQJyxcbiAgICAgICAgJ0xJJyxcbiAgICAgICAgJ0RJVicsXG4gICAgICAgICdCTE9DS1FVT1RFJyxcbiAgICAgICAgJ1VMJyxcbiAgICAgICAgJ09MJyxcbiAgICAgICAgJ0gxJyxcbiAgICAgICAgJ0gyJyxcbiAgICAgICAgJ0gzJyxcbiAgICAgICAgJ0g0JyxcbiAgICAgICAgJ0g1JyxcbiAgICAgICAgJ0g2JyxcbiAgICAgICAgJ1RBQkxFJyxcbiAgICAgICAgJ1RIJyxcbiAgICAgICAgJ1REJ1xuICAgIF07XG5mdW5jdGlvbiBpc0Jsb2NrRWxlbWVudChub2RlKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5zKGJsb2NrRWxlbWVudE5hbWVzLCBub2RlLm5vZGVOYW1lKTtcbn1cbmZ1bmN0aW9uIGlzU2VsZWN0aW9uTWFya2VyTm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmIG5vZGUuY2xhc3NOYW1lID09PSAnc2NyaWJlLW1hcmtlcic7XG59XG5mdW5jdGlvbiBpc0NhcmV0UG9zaXRpb25Ob2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgJiYgbm9kZS5jbGFzc05hbWUgPT09ICdjYXJldC1wb3NpdGlvbic7XG59XG5mdW5jdGlvbiB1bndyYXAobm9kZSwgY2hpbGROb2RlKSB7XG4gICAgd2hpbGUgKGNoaWxkTm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUoY2hpbGROb2RlLmNoaWxkTm9kZXNbMF0sIGNoaWxkTm9kZSk7XG4gICAgfVxuICAgIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGROb2RlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzQmxvY2tFbGVtZW50OiBpc0Jsb2NrRWxlbWVudCxcbiAgICBpc1NlbGVjdGlvbk1hcmtlck5vZGU6IGlzU2VsZWN0aW9uTWFya2VyTm9kZSxcbiAgICBpc0NhcmV0UG9zaXRpb25Ob2RlOiBpc0NhcmV0UG9zaXRpb25Ob2RlLFxuICAgIHVud3JhcDogdW53cmFwXG59OyIsInZhciBwdWxsID0gcmVxdWlyZSgnbG9kYXNoLWFtZC9tb2Rlcm4vYXJyYXlzL3B1bGwnKTtcbid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcbn1cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBmbikge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICBsaXN0ZW5lcnMucHVzaChmbik7XG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBsaXN0ZW5lcnM7XG59O1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBmbikge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICBpZiAoZm4pIHtcbiAgICAgICAgcHVsbChsaXN0ZW5lcnMsIGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2ZW50TmFtZV07XG4gICAgfVxufTtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW107XG4gICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyOyIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIGlzRW1wdHlUZXh0Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmIG5vZGUudGV4dENvbnRlbnQgPT09ICcnO1xufVxuZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIobmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHJldHVybiByZWZlcmVuY2VOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUubmV4dFNpYmxpbmcpO1xufVxuZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzRW1wdHlUZXh0Tm9kZTogaXNFbXB0eVRleHROb2RlLFxuICAgIGluc2VydEFmdGVyOiBpbnNlcnRBZnRlcixcbiAgICByZW1vdmVOb2RlOiByZW1vdmVOb2RlXG59OyIsInZhciBpbmRlbnQgPSByZXF1aXJlKCcuL2NvbW1hbmRzL2luZGVudCcpLCBpbnNlcnRMaXN0ID0gcmVxdWlyZSgnLi9jb21tYW5kcy9pbnNlcnQtbGlzdCcpLCBvdXRkZW50ID0gcmVxdWlyZSgnLi9jb21tYW5kcy9vdXRkZW50JyksIHJlZG8gPSByZXF1aXJlKCcuL2NvbW1hbmRzL3JlZG8nKSwgc3Vic2NyaXB0ID0gcmVxdWlyZSgnLi9jb21tYW5kcy9zdWJzY3JpcHQnKSwgc3VwZXJzY3JpcHQgPSByZXF1aXJlKCcuL2NvbW1hbmRzL3N1cGVyc2NyaXB0JyksIHVuZG8gPSByZXF1aXJlKCcuL2NvbW1hbmRzL3VuZG8nKTtcbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluZGVudDogaW5kZW50LFxuICAgIGluc2VydExpc3Q6IGluc2VydExpc3QsXG4gICAgb3V0ZGVudDogb3V0ZGVudCxcbiAgICByZWRvOiByZWRvLFxuICAgIHN1YnNjcmlwdDogc3Vic2NyaXB0LFxuICAgIHN1cGVyc2NyaXB0OiBzdXBlcnNjcmlwdCxcbiAgICB1bmRvOiB1bmRvXG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBpbmRlbnRDb21tYW5kID0gbmV3IHNjcmliZS5hcGkuQ29tbWFuZCgnaW5kZW50Jyk7XG4gICAgICAgIGluZGVudENvbW1hbmQucXVlcnlFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgdmFyIGxpc3RFbGVtZW50ID0gc2VsZWN0aW9uLmdldENvbnRhaW5pbmcoZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQubm9kZU5hbWUgPT09ICdVTCcgfHwgZWxlbWVudC5ub2RlTmFtZSA9PT0gJ09MJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzY3JpYmUuYXBpLkNvbW1hbmQucHJvdG90eXBlLnF1ZXJ5RW5hYmxlZC5jYWxsKHRoaXMpICYmIHNjcmliZS5hbGxvd3NCbG9ja0VsZW1lbnRzKCkgJiYgIWxpc3RFbGVtZW50O1xuICAgICAgICB9O1xuICAgICAgICBzY3JpYmUuY29tbWFuZHMuaW5kZW50ID0gaW5kZW50Q29tbWFuZDtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgSW5zZXJ0TGlzdENvbW1hbmQgPSBmdW5jdGlvbiAoY29tbWFuZE5hbWUpIHtcbiAgICAgICAgICAgIHNjcmliZS5hcGkuQ29tbWFuZC5jYWxsKHRoaXMsIGNvbW1hbmROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgSW5zZXJ0TGlzdENvbW1hbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzY3JpYmUuYXBpLkNvbW1hbmQucHJvdG90eXBlKTtcbiAgICAgICAgSW5zZXJ0TGlzdENvbW1hbmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW5zZXJ0TGlzdENvbW1hbmQ7XG4gICAgICAgIEluc2VydExpc3RDb21tYW5kLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBzcGxpdExpc3QobGlzdEl0ZW1FbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChsaXN0SXRlbUVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0xpc3ROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChsaXN0Tm9kZS5ub2RlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAobGlzdEl0ZW1FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdMaXN0Tm9kZS5hcHBlbmRDaGlsZChsaXN0SXRlbUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3TGlzdE5vZGUsIGxpc3ROb2RlLm5leHRFbGVtZW50U2libGluZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucXVlcnlTdGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIHZhciByYW5nZSA9IHNlbGVjdGlvbi5yYW5nZTtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdE5vZGUgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdPTCcgfHwgbm9kZS5ub2RlTmFtZSA9PT0gJ1VMJztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtRWxlbWVudCA9IHNlbGVjdGlvbi5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gJ0xJJztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW1FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dExpc3RJdGVtRWxlbWVudHMgPSBuZXcgc2NyaWJlLmFwaS5Ob2RlKGxpc3RJdGVtRWxlbWVudCkubmV4dEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRMaXN0KG5leHRMaXN0SXRlbUVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBOb2RlLmlubmVySFRNTCA9IGxpc3RJdGVtRWxlbWVudC5pbm5lckhUTUw7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwTm9kZSwgbGlzdE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpc3RJdGVtRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRMaXN0SXRlbUVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGxpc3ROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJyksIGZ1bmN0aW9uIChsaXN0SXRlbUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlLmludGVyc2VjdHNOb2RlKGxpc3RJdGVtRWxlbWVudCkgJiYgbGlzdEl0ZW1FbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbHRlcihmdW5jdGlvbiAobGlzdEl0ZW1FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsaXN0SXRlbUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNlbGVjdGVkTGlzdEl0ZW1FbGVtZW50ID0gc2VsZWN0ZWRMaXN0SXRlbUVsZW1lbnRzLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbUVsZW1lbnRzQWZ0ZXJTZWxlY3Rpb24gPSBuZXcgc2NyaWJlLmFwaS5Ob2RlKGxhc3RTZWxlY3RlZExpc3RJdGVtRWxlbWVudCkubmV4dEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRMaXN0KGxpc3RJdGVtRWxlbWVudHNBZnRlclNlbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24ucGxhY2VNYXJrZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZG9jdW1lbnRGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTGlzdEl0ZW1FbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0SXRlbUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnQuaW5uZXJIVE1MID0gbGlzdEl0ZW1FbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKHBFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZG9jdW1lbnRGcmFnbWVudCwgbGlzdE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTGlzdEl0ZW1FbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0SXRlbUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsaXN0SXRlbUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3ROb2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpc3ROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TWFya2VycygpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcmliZS5hcGkuQ29tbWFuZC5wcm90b3R5cGUuZXhlY3V0ZS5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgSW5zZXJ0TGlzdENvbW1hbmQucHJvdG90eXBlLnF1ZXJ5RW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzY3JpYmUuYXBpLkNvbW1hbmQucHJvdG90eXBlLnF1ZXJ5RW5hYmxlZC5jYWxsKHRoaXMpICYmIHNjcmliZS5hbGxvd3NCbG9ja0VsZW1lbnRzKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNjcmliZS5jb21tYW5kcy5pbnNlcnRPcmRlcmVkTGlzdCA9IG5ldyBJbnNlcnRMaXN0Q29tbWFuZCgnaW5zZXJ0T3JkZXJlZExpc3QnKTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRzLmluc2VydFVub3JkZXJlZExpc3QgPSBuZXcgSW5zZXJ0TGlzdENvbW1hbmQoJ2luc2VydFVub3JkZXJlZExpc3QnKTtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgb3V0ZGVudENvbW1hbmQgPSBuZXcgc2NyaWJlLmFwaS5Db21tYW5kKCdvdXRkZW50Jyk7XG4gICAgICAgIG91dGRlbnRDb21tYW5kLnF1ZXJ5RW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBuZXcgc2NyaWJlLmFwaS5TZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIHZhciBsaXN0RWxlbWVudCA9IHNlbGVjdGlvbi5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm5vZGVOYW1lID09PSAnVUwnIHx8IGVsZW1lbnQubm9kZU5hbWUgPT09ICdPTCc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc2NyaWJlLmFwaS5Db21tYW5kLnByb3RvdHlwZS5xdWVyeUVuYWJsZWQuY2FsbCh0aGlzKSAmJiBzY3JpYmUuYWxsb3dzQmxvY2tFbGVtZW50cygpICYmICFsaXN0RWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRzLm91dGRlbnQgPSBvdXRkZW50Q29tbWFuZDtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgcmVkb0NvbW1hbmQgPSBuZXcgc2NyaWJlLmFwaS5Db21tYW5kKCdyZWRvJyk7XG4gICAgICAgIHJlZG9Db21tYW5kLmV4ZWN1dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaGlzdG9yeUl0ZW0gPSBzY3JpYmUudW5kb01hbmFnZXIucmVkbygpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBoaXN0b3J5SXRlbSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzY3JpYmUucmVzdG9yZUZyb21IaXN0b3J5KGhpc3RvcnlJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVkb0NvbW1hbmQucXVlcnlFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjcmliZS51bmRvTWFuYWdlci5wb3NpdGlvbiA8IHNjcmliZS51bmRvTWFuYWdlci5zdGFjay5sZW5ndGggLSAxO1xuICAgICAgICB9O1xuICAgICAgICBzY3JpYmUuY29tbWFuZHMucmVkbyA9IHJlZG9Db21tYW5kO1xuICAgICAgICBzY3JpYmUuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpICYmIGV2ZW50LmtleUNvZGUgPT09IDkwKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICByZWRvQ29tbWFuZC5leGVjdXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRDb21tYW5kID0gbmV3IHNjcmliZS5hcGkuQ29tbWFuZCgnc3Vic2NyaXB0Jyk7XG4gICAgICAgIHNjcmliZS5jb21tYW5kcy5zdWJzY3JpcHQgPSBzdWJzY3JpcHRDb21tYW5kO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBzdXBlcnNjcmlwdENvbW1hbmQgPSBuZXcgc2NyaWJlLmFwaS5Db21tYW5kKCdzdXBlcnNjcmlwdCcpO1xuICAgICAgICBzY3JpYmUuY29tbWFuZHMuc3VwZXJzY3JpcHQgPSBzdXBlcnNjcmlwdENvbW1hbmQ7XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpYmUpIHtcbiAgICAgICAgdmFyIHVuZG9Db21tYW5kID0gbmV3IHNjcmliZS5hcGkuQ29tbWFuZCgndW5kbycpO1xuICAgICAgICB1bmRvQ29tbWFuZC5leGVjdXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGhpc3RvcnlJdGVtID0gc2NyaWJlLnVuZG9NYW5hZ2VyLnVuZG8oKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaGlzdG9yeUl0ZW0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc2NyaWJlLnJlc3RvcmVGcm9tSGlzdG9yeShoaXN0b3J5SXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHVuZG9Db21tYW5kLnF1ZXJ5RW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzY3JpYmUudW5kb01hbmFnZXIucG9zaXRpb24gPiAxO1xuICAgICAgICB9O1xuICAgICAgICBzY3JpYmUuY29tbWFuZHMudW5kbyA9IHVuZG9Db21tYW5kO1xuICAgICAgICBzY3JpYmUuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudC5zaGlmdEtleSAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSAmJiBldmVudC5rZXlDb2RlID09PSA5MCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdW5kb0NvbW1hbmQuZXhlY3V0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufTsiLCJ2YXIgY29udGFpbnMgPSByZXF1aXJlKCdsb2Rhc2gtYW1kL21vZGVybi9jb2xsZWN0aW9ucy9jb250YWlucycpLCBvYnNlcnZlRG9tQ2hhbmdlcyA9IHJlcXVpcmUoJy4uLy4uL2RvbS1vYnNlcnZlcicpO1xuJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpYmUpIHtcbiAgICAgICAgdmFyIHB1c2hIaXN0b3J5T25Gb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NyaWJlLnB1c2hIaXN0b3J5KCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHNjcmliZSksIDApO1xuICAgICAgICAgICAgICAgIHNjcmliZS5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHB1c2hIaXN0b3J5T25Gb2N1cyk7XG4gICAgICAgICAgICB9LmJpbmQoc2NyaWJlKTtcbiAgICAgICAgc2NyaWJlLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgcHVzaEhpc3RvcnlPbkZvY3VzKTtcbiAgICAgICAgc2NyaWJlLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24gcGxhY2VDYXJldE9uRm9jdXMoKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gbmV3IHNjcmliZS5hcGkuU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzRmlyZWZveEJ1ZyA9IHNjcmliZS5hbGxvd3NCbG9ja0VsZW1lbnRzKCkgJiYgc2VsZWN0aW9uLnJhbmdlLnN0YXJ0Q29udGFpbmVyID09PSBzY3JpYmUuZWw7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmlyZWZveEJ1Zykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm9jdXNFbGVtZW50ID0gZ2V0Rmlyc3REZWVwZXN0Q2hpbGQoc2NyaWJlLmVsLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSBzZWxlY3Rpb24ucmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0KGZvY3VzRWxlbWVudCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldEVuZChmb2N1c0VsZW1lbnQsIDApO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRGaXJzdERlZXBlc3RDaGlsZChub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyZWVXYWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKG5vZGUpO1xuICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c05vZGUgPSB0cmVlV2Fsa2VyLmN1cnJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmICh0cmVlV2Fsa2VyLmZpcnN0Q2hpbGQoKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJlZVdhbGtlci5jdXJyZW50Tm9kZS5ub2RlTmFtZSA9PT0gJ0JSJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRGaXJzdERlZXBlc3RDaGlsZCh0cmVlV2Fsa2VyLmN1cnJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVlV2Fsa2VyLmN1cnJlbnROb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHNjcmliZSkpO1xuICAgICAgICB2YXIgYXBwbHlGb3JtYXR0ZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghc2NyaWJlLl9za2lwRm9ybWF0dGVycykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gbmV3IHNjcmliZS5hcGkuU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0VkaXRvckFjdGl2ZSA9IHNlbGVjdGlvbi5yYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bkZvcm1hdHRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdG9yQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaWJlLnNldEhUTUwoc2NyaWJlLl9odG1sRm9ybWF0dGVyRmFjdG9yeS5mb3JtYXQoc2NyaWJlLmdldEhUTUwoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RNYXJrZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQoc2NyaWJlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdG9yQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpYmUudW5kb01hbmFnZXIudW5kbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4ocnVuRm9ybWF0dGVycyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5Gb3JtYXR0ZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNjcmliZS5fc2tpcEZvcm1hdHRlcnM7XG4gICAgICAgICAgICB9LmJpbmQoc2NyaWJlKTtcbiAgICAgICAgb2JzZXJ2ZURvbUNoYW5nZXMoc2NyaWJlLmVsLCBhcHBseUZvcm1hdHRlcnMpO1xuICAgICAgICBpZiAoc2NyaWJlLmFsbG93c0Jsb2NrRWxlbWVudHMoKSkge1xuICAgICAgICAgICAgc2NyaWJlLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSBzZWxlY3Rpb24ucmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWFkaW5nTm9kZSA9IHNlbGVjdGlvbi5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC9eKEhbMS02XSkkLy50ZXN0KG5vZGUubm9kZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoZWFkaW5nTm9kZSAmJiByYW5nZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250ZW50VG9FbmRSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUb0VuZFJhbmdlLnNldEVuZEFmdGVyKGhlYWRpbmdOb2RlLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250ZW50VG9FbmRGcmFnbWVudCA9IGNvbnRlbnRUb0VuZFJhbmdlLmNsb25lQ29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZW50VG9FbmRGcmFnbWVudC5maXJzdENoaWxkLnRleHRDb250ZW50ID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcE5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBick5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwTm9kZS5hcHBlbmRDaGlsZChick5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkaW5nTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwTm9kZSwgaGVhZGluZ05vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnQocE5vZGUsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYW5nZS5zZXRFbmQocE5vZGUsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY3JpYmUuYWxsb3dzQmxvY2tFbGVtZW50cygpKSB7XG4gICAgICAgICAgICBzY3JpYmUuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMyB8fCBldmVudC5rZXlDb2RlID09PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBuZXcgc2NyaWJlLmFwaS5TZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gc2VsZWN0aW9uLnJhbmdlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyTElFbGVtZW50ID0gc2VsZWN0aW9uLmdldENvbnRhaW5pbmcoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdMSSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyTElFbGVtZW50ICYmIGNvbnRhaW5lckxJRWxlbWVudC50ZXh0Q29udGVudC50cmltKCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdE5vZGUgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdVTCcgfHwgbm9kZS5ub2RlTmFtZSA9PT0gJ09MJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSBzY3JpYmUuZ2V0Q29tbWFuZChsaXN0Tm9kZS5ub2RlTmFtZSA9PT0gJ09MJyA/ICdpbnNlcnRPcmRlcmVkTGlzdCcgOiAnaW5zZXJ0VW5vcmRlcmVkTGlzdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQuZXhlY3V0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2NyaWJlLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3RlJywgZnVuY3Rpb24gaGFuZGxlUGFzdGUoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5jbGlwYm9hcmREYXRhKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnMoZXZlbnQuY2xpcGJvYXJkRGF0YS50eXBlcywgJ3RleHQvaHRtbCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcmliZS5pbnNlcnRIVE1MKGV2ZW50LmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9odG1sJykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcmliZS5pbnNlcnRQbGFpblRleHQoZXZlbnQuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICB2YXIgYmluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiaW4pO1xuICAgICAgICAgICAgICAgIGJpbi5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIGJpbi5mb2N1cygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGJpbi5pbm5lckhUTUw7XG4gICAgICAgICAgICAgICAgICAgIGJpbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJpbik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RNYXJrZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNjcmliZS5lbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICBzY3JpYmUuaW5zZXJ0SFRNTChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn07IiwidmFyIGxhc3QgPSByZXF1aXJlKCdsb2Rhc2gtYW1kL21vZGVybi9hcnJheXMvbGFzdCcpO1xuJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gd3JhcENoaWxkTm9kZXMoc2NyaWJlLCBwYXJlbnROb2RlKSB7XG4gICAgdmFyIGdyb3VwcyA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChwYXJlbnROb2RlLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChhY2N1bXVsYXRvciwgYmluQ2hpbGROb2RlKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBsYXN0KGFjY3VtdWxhdG9yKTtcbiAgICAgICAgICAgIGlmICghZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBzdGFydE5ld0dyb3VwKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBpc0Jsb2NrR3JvdXAgPSBzY3JpYmUuZWxlbWVudC5pc0Jsb2NrRWxlbWVudChncm91cFswXSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQmxvY2tHcm91cCA9PT0gc2NyaWJlLmVsZW1lbnQuaXNCbG9ja0VsZW1lbnQoYmluQ2hpbGROb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBncm91cC5wdXNoKGJpbkNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnROZXdHcm91cCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0YXJ0TmV3R3JvdXAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0dyb3VwID0gW2JpbkNoaWxkTm9kZV07XG4gICAgICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChuZXdHcm91cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIFtdKTtcbiAgICB2YXIgY29uc2VjdXRpdmVJbmxpbmVFbGVtZW50c0FuZFRleHROb2RlcyA9IGdyb3Vwcy5maWx0ZXIoZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICB2YXIgaXNCbG9ja0dyb3VwID0gc2NyaWJlLmVsZW1lbnQuaXNCbG9ja0VsZW1lbnQoZ3JvdXBbMF0pO1xuICAgICAgICAgICAgcmV0dXJuICFpc0Jsb2NrR3JvdXA7XG4gICAgICAgIH0pO1xuICAgIGNvbnNlY3V0aXZlSW5saW5lRWxlbWVudHNBbmRUZXh0Tm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZXMpIHtcbiAgICAgICAgdmFyIHBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBub2Rlc1swXS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwRWxlbWVudCwgbm9kZXNbMF0pO1xuICAgICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBwRWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcGFyZW50Tm9kZS5faXNXcmFwcGVkID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHRyYXZlcnNlKHNjcmliZSwgcGFyZW50Tm9kZSkge1xuICAgIHZhciB0cmVlV2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihwYXJlbnROb2RlLCBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCk7XG4gICAgdmFyIG5vZGUgPSB0cmVlV2Fsa2VyLmZpcnN0Q2hpbGQoKTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ0JMT0NLUVVPVEUnICYmICFub2RlLl9pc1dyYXBwZWQpIHtcbiAgICAgICAgICAgIHdyYXBDaGlsZE5vZGVzKHNjcmliZSwgbm9kZSk7XG4gICAgICAgICAgICB0cmF2ZXJzZShzY3JpYmUsIHBhcmVudE5vZGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IHRyZWVXYWxrZXIubmV4dFNpYmxpbmcoKTtcbiAgICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICBzY3JpYmUucmVnaXN0ZXJIVE1MRm9ybWF0dGVyKCdub3JtYWxpemUnLCBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICAgICAgdmFyIGJpbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgYmluLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICB3cmFwQ2hpbGROb2RlcyhzY3JpYmUsIGJpbik7XG4gICAgICAgICAgICB0cmF2ZXJzZShzY3JpYmUsIGJpbik7XG4gICAgICAgICAgICByZXR1cm4gYmluLmlubmVySFRNTDtcbiAgICAgICAgfSk7XG4gICAgfTtcbn07IiwidmFyIGVsZW1lbnQgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbGVtZW50JyksIGNvbnRhaW5zID0gcmVxdWlyZSgnbG9kYXNoLWFtZC9tb2Rlcm4vY29sbGVjdGlvbnMvY29udGFpbnMnKTtcbid1c2Ugc3RyaWN0JztcbnZhciBodG1sNVZvaWRFbGVtZW50cyA9IFtcbiAgICAgICAgJ0FSRUEnLFxuICAgICAgICAnQkFTRScsXG4gICAgICAgICdCUicsXG4gICAgICAgICdDT0wnLFxuICAgICAgICAnQ09NTUFORCcsXG4gICAgICAgICdFTUJFRCcsXG4gICAgICAgICdIUicsXG4gICAgICAgICdJTUcnLFxuICAgICAgICAnSU5QVVQnLFxuICAgICAgICAnS0VZR0VOJyxcbiAgICAgICAgJ0xJTksnLFxuICAgICAgICAnTUVUQScsXG4gICAgICAgICdQQVJBTScsXG4gICAgICAgICdTT1VSQ0UnLFxuICAgICAgICAnVFJBQ0snLFxuICAgICAgICAnV0JSJ1xuICAgIF07XG5mdW5jdGlvbiBwYXJlbnRIYXNOb1RleHRDb250ZW50KGVsZW1lbnQsIG5vZGUpIHtcbiAgICBpZiAoZWxlbWVudC5pc0NhcmV0UG9zaXRpb25Ob2RlKG5vZGUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub2RlLnBhcmVudE5vZGUudGV4dENvbnRlbnQudHJpbSgpID09PSAnJztcbiAgICB9XG59XG5mdW5jdGlvbiB0cmF2ZXJzZShlbGVtZW50LCBwYXJlbnROb2RlKSB7XG4gICAgdmFyIG5vZGUgPSBwYXJlbnROb2RlLmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGZ1bmN0aW9uIGlzRW1wdHkobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDAgJiYgZWxlbWVudC5pc0Jsb2NrRWxlbWVudChub2RlKSB8fCBub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBlbGVtZW50LmlzU2VsZWN0aW9uTWFya2VyTm9kZShub2RlLmNoaWxkcmVuWzBdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbGVtZW50LmlzQmxvY2tFbGVtZW50KG5vZGUpICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50SGFzTm9UZXh0Q29udGVudChlbGVtZW50LCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghZWxlbWVudC5pc1NlbGVjdGlvbk1hcmtlck5vZGUobm9kZSkpIHtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5KG5vZGUpICYmIG5vZGUudGV4dENvbnRlbnQudHJpbSgpID09PSAnJyAmJiAhY29udGFpbnMoaHRtbDVWb2lkRWxlbWVudHMsIG5vZGUubm9kZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdHJhdmVyc2UoZWxlbWVudCwgbm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHNjcmliZS5yZWdpc3RlckhUTUxGb3JtYXR0ZXIoJ25vcm1hbGl6ZScsIGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgICAgICB2YXIgYmluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBiaW4uaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIHRyYXZlcnNlKHNjcmliZS5lbGVtZW50LCBiaW4pO1xuICAgICAgICAgICAgcmV0dXJuIGJpbi5pbm5lckhUTUw7XG4gICAgICAgIH0pO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBuYnNwQ2hhclJlZ0V4cCA9IC8oXFxzfCZuYnNwOykrL2c7XG4gICAgICAgIHNjcmliZS5yZWdpc3RlckhUTUxGb3JtYXR0ZXIoJ2V4cG9ydCcsIGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKG5ic3BDaGFyUmVnRXhwLCAnICcpO1xuICAgICAgICB9KTtcbiAgICB9O1xufTsiLCJ2YXIgZXNjYXBlID0gcmVxdWlyZSgnbG9kYXNoLWFtZC9tb2Rlcm4vdXRpbGl0aWVzL2VzY2FwZScpO1xuJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpYmUpIHtcbiAgICAgICAgc2NyaWJlLnJlZ2lzdGVyUGxhaW5UZXh0Rm9ybWF0dGVyKGVzY2FwZSk7XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gaGFzQ29udGVudChyb290Tm9kZSkge1xuICAgIHZhciB0cmVlV2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihyb290Tm9kZSk7XG4gICAgd2hpbGUgKHRyZWVXYWxrZXIubmV4dE5vZGUoKSkge1xuICAgICAgICBpZiAodHJlZVdhbGtlci5jdXJyZW50Tm9kZSkge1xuICAgICAgICAgICAgaWYgKH5bJ2JyJ10uaW5kZXhPZih0cmVlV2Fsa2VyLmN1cnJlbnROb2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHx8IHRyZWVXYWxrZXIuY3VycmVudE5vZGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHNjcmliZS5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gbmV3IHNjcmliZS5hcGkuU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gc2VsZWN0aW9uLnJhbmdlO1xuICAgICAgICAgICAgICAgIHZhciBibG9ja05vZGUgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09ICdMSScgfHwgL14oSFsxLTZdKSQvLnRlc3Qobm9kZS5ub2RlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghYmxvY2tOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHNjcmliZS50cmFuc2FjdGlvbk1hbmFnZXIucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY3JpYmUuZWwubGFzdENoaWxkLm5vZGVOYW1lID09PSAnQlInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaWJlLmVsLnJlbW92ZUNoaWxkKHNjcmliZS5lbC5sYXN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJyTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByYW5nZS5pbnNlcnROb2RlKGJyTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29udGVudFRvRW5kUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50VG9FbmRSYW5nZS5zZXRFbmRBZnRlcihzY3JpYmUuZWwubGFzdENoaWxkLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250ZW50VG9FbmRGcmFnbWVudCA9IGNvbnRlbnRUb0VuZFJhbmdlLmNsb25lQ29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFzQ29udGVudChjb250ZW50VG9FbmRGcmFnbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYm9ndXNCck5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUoYm9ndXNCck5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1JhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmFuZ2Uuc2V0U3RhcnRBZnRlcihick5vZGUsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmFuZ2Uuc2V0RW5kQWZ0ZXIoYnJOb2RlLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLmFkZFJhbmdlKG5ld1JhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICBpZiAoc2NyaWJlLmdldEhUTUwoKS50cmltKCkgPT09ICcnKSB7XG4gICAgICAgICAgICBzY3JpYmUuc2V0Q29udGVudCgnJyk7XG4gICAgICAgIH1cbiAgICB9O1xufTsiLCJ2YXIgYm9sZENvbW1hbmQgPSByZXF1aXJlKCcuL3BhdGNoZXMvY29tbWFuZHMvYm9sZCcpLCBpbmRlbnRDb21tYW5kID0gcmVxdWlyZSgnLi9wYXRjaGVzL2NvbW1hbmRzL2luZGVudCcpLCBpbnNlcnRIVE1MQ29tbWFuZCA9IHJlcXVpcmUoJy4vcGF0Y2hlcy9jb21tYW5kcy9pbnNlcnQtaHRtbCcpLCBpbnNlcnRMaXN0Q29tbWFuZHMgPSByZXF1aXJlKCcuL3BhdGNoZXMvY29tbWFuZHMvaW5zZXJ0LWxpc3QnKSwgb3V0ZGVudENvbW1hbmQgPSByZXF1aXJlKCcuL3BhdGNoZXMvY29tbWFuZHMvb3V0ZGVudCcpLCBjcmVhdGVMaW5rQ29tbWFuZCA9IHJlcXVpcmUoJy4vcGF0Y2hlcy9jb21tYW5kcy9jcmVhdGUtbGluaycpLCBldmVudHMgPSByZXF1aXJlKCcuL3BhdGNoZXMvZXZlbnRzJyk7XG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb21tYW5kczoge1xuICAgICAgICBib2xkOiBib2xkQ29tbWFuZCxcbiAgICAgICAgaW5kZW50OiBpbmRlbnRDb21tYW5kLFxuICAgICAgICBpbnNlcnRIVE1MOiBpbnNlcnRIVE1MQ29tbWFuZCxcbiAgICAgICAgaW5zZXJ0TGlzdDogaW5zZXJ0TGlzdENvbW1hbmRzLFxuICAgICAgICBvdXRkZW50OiBvdXRkZW50Q29tbWFuZCxcbiAgICAgICAgY3JlYXRlTGluazogY3JlYXRlTGlua0NvbW1hbmRcbiAgICB9LFxuICAgIGV2ZW50czogZXZlbnRzXG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBib2xkQ29tbWFuZCA9IG5ldyBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaCgnYm9sZCcpO1xuICAgICAgICBib2xkQ29tbWFuZC5xdWVyeUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gbmV3IHNjcmliZS5hcGkuU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICB2YXIgaGVhZGluZ05vZGUgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gL14oSFsxLTZdKSQvLnRlc3Qobm9kZS5ub2RlTmFtZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc2NyaWJlLmFwaS5Db21tYW5kUGF0Y2gucHJvdG90eXBlLnF1ZXJ5RW5hYmxlZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpICYmICFoZWFkaW5nTm9kZTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRQYXRjaGVzLmJvbGQgPSBib2xkQ29tbWFuZDtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgY3JlYXRlTGlua0NvbW1hbmQgPSBuZXcgc2NyaWJlLmFwaS5Db21tYW5kUGF0Y2goJ2NyZWF0ZUxpbmsnKTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRQYXRjaGVzLmNyZWF0ZUxpbmsgPSBjcmVhdGVMaW5rQ29tbWFuZDtcbiAgICAgICAgY3JlYXRlTGlua0NvbW1hbmQuZXhlY3V0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbi5zZWxlY3Rpb24uaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgYUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgYUVsZW1lbnQuc2V0QXR0cmlidXRlKCdocmVmJywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGFFbGVtZW50LnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uLnJhbmdlLmluc2VydE5vZGUoYUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdSYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgbmV3UmFuZ2Uuc2V0U3RhcnRCZWZvcmUoYUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIG5ld1JhbmdlLnNldEVuZEFmdGVyKGFFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3Rpb24uYWRkUmFuZ2UobmV3UmFuZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaC5wcm90b3R5cGUuZXhlY3V0ZS5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgSU5WSVNJQkxFX0NIQVIgPSAnXFx1ZmVmZic7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgaW5kZW50Q29tbWFuZCA9IG5ldyBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaCgnaW5kZW50Jyk7XG4gICAgICAgIGluZGVudENvbW1hbmQuZXhlY3V0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBuZXcgc2NyaWJlLmFwaS5TZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSBzZWxlY3Rpb24ucmFuZ2U7XG4gICAgICAgICAgICAgICAgdmFyIGlzQ2FyZXRPbk5ld0xpbmUgPSByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lci5ub2RlTmFtZSA9PT0gJ1AnICYmIHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLmlubmVySFRNTCA9PT0gJzxicj4nO1xuICAgICAgICAgICAgICAgIGlmIChpc0NhcmV0T25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKElOVklTSUJMRV9DSEFSKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0KHRleHROb2RlLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2V0RW5kKHRleHROb2RlLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNjcmliZS5hcGkuQ29tbWFuZFBhdGNoLnByb3RvdHlwZS5leGVjdXRlLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIHZhciBibG9ja3F1b3RlTm9kZSA9IHNlbGVjdGlvbi5nZXRDb250YWluaW5nKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gJ0JMT0NLUVVPVEUnO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoYmxvY2txdW90ZU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2txdW90ZU5vZGUucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG4gICAgICAgIHNjcmliZS5jb21tYW5kUGF0Y2hlcy5pbmRlbnQgPSBpbmRlbnRDb21tYW5kO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBpbnNlcnRIVE1MQ29tbWFuZFBhdGNoID0gbmV3IHNjcmliZS5hcGkuQ29tbWFuZFBhdGNoKCdpbnNlcnRIVE1MJyk7XG4gICAgICAgIHZhciBlbGVtZW50ID0gc2NyaWJlLmVsZW1lbnQ7XG4gICAgICAgIGluc2VydEhUTUxDb21tYW5kUGF0Y2guZXhlY3V0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjcmliZS5hcGkuQ29tbWFuZFBhdGNoLnByb3RvdHlwZS5leGVjdXRlLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNhbml0aXplKHNjcmliZS5lbCk7XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2FuaXRpemUocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIocGFyZW50Tm9kZSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRyZWVXYWxrZXIuZmlyc3RDaGlsZCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1NQQU4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC51bndyYXAocGFyZW50Tm9kZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGUubGluZUhlaWdodCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKCdzdHlsZScpID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW5pdGl6ZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAobm9kZSA9IHRyZWVXYWxrZXIubmV4dFNpYmxpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRQYXRjaGVzLmluc2VydEhUTUwgPSBpbnNlcnRIVE1MQ29tbWFuZFBhdGNoO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gc2NyaWJlLmVsZW1lbnQ7XG4gICAgICAgIHZhciBub2RlSGVscGVycyA9IHNjcmliZS5ub2RlO1xuICAgICAgICB2YXIgSW5zZXJ0TGlzdENvbW1hbmRQYXRjaCA9IGZ1bmN0aW9uIChjb21tYW5kTmFtZSkge1xuICAgICAgICAgICAgc2NyaWJlLmFwaS5Db21tYW5kUGF0Y2guY2FsbCh0aGlzLCBjb21tYW5kTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIEluc2VydExpc3RDb21tYW5kUGF0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaC5wcm90b3R5cGUpO1xuICAgICAgICBJbnNlcnRMaXN0Q29tbWFuZFBhdGNoLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEluc2VydExpc3RDb21tYW5kUGF0Y2g7XG4gICAgICAgIEluc2VydExpc3RDb21tYW5kUGF0Y2gucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjcmliZS50cmFuc2FjdGlvbk1hbmFnZXIucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaC5wcm90b3R5cGUuZXhlY3V0ZS5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5xdWVyeVN0YXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnT0wnIHx8IG5vZGUubm9kZU5hbWUgPT09ICdVTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RFbGVtZW50Lm5leHRFbGVtZW50U2libGluZyAmJiBsaXN0RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVIZWxwZXJzLnJlbW92ZU5vZGUobGlzdEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0UGFyZW50Tm9kZSA9IGxpc3RFbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGlzdFBhcmVudE5vZGUgJiYgL14oSFsxLTZdfFApJC8udGVzdChsaXN0UGFyZW50Tm9kZS5ub2RlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24ucGxhY2VNYXJrZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUhlbHBlcnMuaW5zZXJ0QWZ0ZXIobGlzdEVsZW1lbnQsIGxpc3RQYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TWFya2VycygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaXN0UGFyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMiAmJiBub2RlSGVscGVycy5pc0VtcHR5VGV4dE5vZGUobGlzdFBhcmVudE5vZGUuZmlyc3RDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUhlbHBlcnMucmVtb3ZlTm9kZShsaXN0UGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaXN0UGFyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlSGVscGVycy5yZW1vdmVOb2RlKGxpc3RQYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtRWxlbWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0RWxlbWVudC5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW1FbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0SXRlbUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbUVsZW1lbnRDaGlsZE5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobGlzdEl0ZW1FbGVtZW50LmNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW1FbGVtZW50Q2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0RWxlbWVudENoaWxkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaXN0RWxlbWVudENoaWxkTm9kZS5ub2RlTmFtZSA9PT0gJ1NQQU4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGFuRWxlbWVudCA9IGxpc3RFbGVtZW50Q2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnVud3JhcChsaXN0SXRlbUVsZW1lbnQsIHNwYW5FbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RFbGVtZW50Q2hpbGROb2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0RWxlbWVudENoaWxkTm9kZS5zdHlsZS5saW5lSGVpZ2h0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RFbGVtZW50Q2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnc3R5bGUnKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RFbGVtZW50Q2hpbGROb2RlLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgICBzY3JpYmUuY29tbWFuZFBhdGNoZXMuaW5zZXJ0T3JkZXJlZExpc3QgPSBuZXcgSW5zZXJ0TGlzdENvbW1hbmRQYXRjaCgnaW5zZXJ0T3JkZXJlZExpc3QnKTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRQYXRjaGVzLmluc2VydFVub3JkZXJlZExpc3QgPSBuZXcgSW5zZXJ0TGlzdENvbW1hbmRQYXRjaCgnaW5zZXJ0VW5vcmRlcmVkTGlzdCcpO1xuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgICAgIHZhciBvdXRkZW50Q29tbWFuZCA9IG5ldyBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaCgnb3V0ZGVudCcpO1xuICAgICAgICBvdXRkZW50Q29tbWFuZC5leGVjdXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBuZXcgc2NyaWJlLmFwaS5TZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSBzZWxlY3Rpb24ucmFuZ2U7XG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrcXVvdGVOb2RlID0gc2VsZWN0aW9uLmdldENvbnRhaW5pbmcoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnQkxPQ0tRVU9URSc7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lci5ub2RlTmFtZSA9PT0gJ0JMT0NLUVVPVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdE1hcmtlcnModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZE5vZGVzID0gcmFuZ2UuY2xvbmVDb250ZW50cygpO1xuICAgICAgICAgICAgICAgICAgICBibG9ja3F1b3RlTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzZWxlY3RlZE5vZGVzLCBibG9ja3F1b3RlTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RNYXJrZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChibG9ja3F1b3RlTm9kZS50ZXh0Q29udGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrcXVvdGVOb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYmxvY2txdW90ZU5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBOb2RlID0gc2VsZWN0aW9uLmdldENvbnRhaW5pbmcoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gJ1AnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRTaWJsaW5nTm9kZXMgPSBuZXcgc2NyaWJlLmFwaS5Ob2RlKHBOb2RlKS5uZXh0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFNpYmxpbmdOb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3Q29udGFpbmVyTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYmxvY2txdW90ZU5vZGUubm9kZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTaWJsaW5nTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZ05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZChzaWJsaW5nTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2txdW90ZU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Q29udGFpbmVyTm9kZSwgYmxvY2txdW90ZU5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrcXVvdGVOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBOb2RlLCBibG9ja3F1b3RlTm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdE1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9ja3F1b3RlTm9kZS5pbm5lckhUTUwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2txdW90ZU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChibG9ja3F1b3RlTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpYmUuYXBpLkNvbW1hbmRQYXRjaC5wcm90b3R5cGUuZXhlY3V0ZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaWJlLmNvbW1hbmRQYXRjaGVzLm91dGRlbnQgPSBvdXRkZW50Q29tbWFuZDtcbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHNjcmliZS5lbGVtZW50O1xuICAgICAgICBpZiAoc2NyaWJlLmFsbG93c0Jsb2NrRWxlbWVudHMoKSkge1xuICAgICAgICAgICAgc2NyaWJlLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDggfHwgZXZlbnQua2V5Q29kZSA9PT0gNDYpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyBzY3JpYmUuYXBpLlNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyUEVsZW1lbnQgPSBzZWxlY3Rpb24uZ2V0Q29udGFpbmluZyhmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnUCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpYmUudW5kb01hbmFnZXIudW5kbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaWJlLnRyYW5zYWN0aW9uTWFuYWdlci5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5wbGFjZU1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW1lbnRDaGlsZE5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGFpbmVyUEVsZW1lbnQuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnRDaGlsZE5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHBFbGVtZW50Q2hpbGROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwRWxlbWVudENoaWxkTm9kZS5ub2RlTmFtZSA9PT0gJ1NQQU4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BhbkVsZW1lbnQgPSBwRWxlbWVudENoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudW53cmFwKGNvbnRhaW5lclBFbGVtZW50LCBzcGFuRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocEVsZW1lbnRDaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwRWxlbWVudENoaWxkTm9kZS5zdHlsZS5saW5lSGVpZ2h0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwRWxlbWVudENoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ3N0eWxlJykgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnRDaGlsZE5vZGUucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdE1hcmtlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICBpZiAoc2NyaWJlLmdldEhUTUwoKS50cmltKCkgPT09ICcnKSB7XG4gICAgICAgICAgICBzY3JpYmUuc2V0Q29udGVudCgnPHA+PGJyPjwvcD4nKTtcbiAgICAgICAgfVxuICAgIH07XG59OyIsInZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2xvZGFzaC1hbWQvbW9kZXJuL29iamVjdHMvZGVmYXVsdHMnKSwgZmxhdHRlbiA9IHJlcXVpcmUoJ2xvZGFzaC1hbWQvbW9kZXJuL2FycmF5cy9mbGF0dGVuJyksIGNvbW1hbmRzID0gcmVxdWlyZSgnLi9wbHVnaW5zL2NvcmUvY29tbWFuZHMnKSwgZXZlbnRzID0gcmVxdWlyZSgnLi9wbHVnaW5zL2NvcmUvZXZlbnRzJyksIHJlcGxhY2VOYnNwQ2hhcnNGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3BsdWdpbnMvY29yZS9mb3JtYXR0ZXJzL2h0bWwvcmVwbGFjZS1uYnNwLWNoYXJzJyksIGVuZm9yY2VQRWxlbWVudHMgPSByZXF1aXJlKCcuL3BsdWdpbnMvY29yZS9mb3JtYXR0ZXJzL2h0bWwvZW5mb3JjZS1wLWVsZW1lbnRzJyksIGVuc3VyZVNlbGVjdGFibGVDb250YWluZXJzID0gcmVxdWlyZSgnLi9wbHVnaW5zL2NvcmUvZm9ybWF0dGVycy9odG1sL2Vuc3VyZS1zZWxlY3RhYmxlLWNvbnRhaW5lcnMnKSwgZXNjYXBlSHRtbENoYXJhY3RlcnNGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3BsdWdpbnMvY29yZS9mb3JtYXR0ZXJzL3BsYWluLXRleHQvZXNjYXBlLWh0bWwtY2hhcmFjdGVycycpLCBpbmxpbmVFbGVtZW50c01vZGUgPSByZXF1aXJlKCcuL3BsdWdpbnMvY29yZS9pbmxpbmUtZWxlbWVudHMtbW9kZScpLCBwYXRjaGVzID0gcmVxdWlyZSgnLi9wbHVnaW5zL2NvcmUvcGF0Y2hlcycpLCBzZXRSb290UEVsZW1lbnQgPSByZXF1aXJlKCcuL3BsdWdpbnMvY29yZS9zZXQtcm9vdC1wLWVsZW1lbnQnKSwgQXBpID0gcmVxdWlyZSgnLi9hcGknKSwgYnVpbGRUcmFuc2FjdGlvbk1hbmFnZXIgPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9uLW1hbmFnZXInKSwgYnVpbGRVbmRvTWFuYWdlciA9IHJlcXVpcmUoJy4vdW5kby1tYW5hZ2VyJyksIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJy4vZXZlbnQtZW1pdHRlcicpLCBlbGVtZW50SGVscGVycyA9IHJlcXVpcmUoJy4vZWxlbWVudCcpLCBub2RlSGVscGVycyA9IHJlcXVpcmUoJy4vbm9kZScpO1xuJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gU2NyaWJlKGVsLCBvcHRpb25zKSB7XG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY29tbWFuZHMgPSB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSBkZWZhdWx0cyhvcHRpb25zIHx8IHt9LCB7XG4gICAgICAgIGFsbG93QmxvY2tFbGVtZW50czogdHJ1ZSxcbiAgICAgICAgZGVidWc6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy5jb21tYW5kUGF0Y2hlcyA9IHt9O1xuICAgIHRoaXMuX3BsYWluVGV4dEZvcm1hdHRlckZhY3RvcnkgPSBuZXcgRm9ybWF0dGVyRmFjdG9yeSgpO1xuICAgIHRoaXMuX2h0bWxGb3JtYXR0ZXJGYWN0b3J5ID0gbmV3IEhUTUxGb3JtYXR0ZXJGYWN0b3J5KCk7XG4gICAgdGhpcy5hcGkgPSBuZXcgQXBpKHRoaXMpO1xuICAgIHRoaXMubm9kZSA9IG5vZGVIZWxwZXJzO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRIZWxwZXJzO1xuICAgIHZhciBUcmFuc2FjdGlvbk1hbmFnZXIgPSBidWlsZFRyYW5zYWN0aW9uTWFuYWdlcih0aGlzKTtcbiAgICB0aGlzLnRyYW5zYWN0aW9uTWFuYWdlciA9IG5ldyBUcmFuc2FjdGlvbk1hbmFnZXIoKTtcbiAgICB2YXIgVW5kb01hbmFnZXIgPSBidWlsZFVuZG9NYW5hZ2VyKHRoaXMpO1xuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJywgdHJ1ZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50cmFuc2FjdGlvbk1hbmFnZXIucnVuKCk7XG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgaWYgKHRoaXMuYWxsb3dzQmxvY2tFbGVtZW50cygpKSB7XG4gICAgICAgIHRoaXMudXNlKHNldFJvb3RQRWxlbWVudCgpKTtcbiAgICAgICAgdGhpcy51c2UoZW5mb3JjZVBFbGVtZW50cygpKTtcbiAgICAgICAgdGhpcy51c2UoZW5zdXJlU2VsZWN0YWJsZUNvbnRhaW5lcnMoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2UoaW5saW5lRWxlbWVudHNNb2RlKCkpO1xuICAgIH1cbiAgICB0aGlzLnVzZShlc2NhcGVIdG1sQ2hhcmFjdGVyc0Zvcm1hdHRlcigpKTtcbiAgICB0aGlzLnVzZShyZXBsYWNlTmJzcENoYXJzRm9ybWF0dGVyKCkpO1xuICAgIHZhciBtYW5kYXRvcnlQYXRjaGVzID0gW1xuICAgICAgICAgICAgcGF0Y2hlcy5jb21tYW5kcy5ib2xkLFxuICAgICAgICAgICAgcGF0Y2hlcy5jb21tYW5kcy5pbmRlbnQsXG4gICAgICAgICAgICBwYXRjaGVzLmNvbW1hbmRzLmluc2VydEhUTUwsXG4gICAgICAgICAgICBwYXRjaGVzLmNvbW1hbmRzLmluc2VydExpc3QsXG4gICAgICAgICAgICBwYXRjaGVzLmNvbW1hbmRzLm91dGRlbnQsXG4gICAgICAgICAgICBwYXRjaGVzLmNvbW1hbmRzLmNyZWF0ZUxpbmssXG4gICAgICAgICAgICBwYXRjaGVzLmV2ZW50c1xuICAgICAgICBdO1xuICAgIHZhciBtYW5kYXRvcnlDb21tYW5kcyA9IFtcbiAgICAgICAgICAgIGNvbW1hbmRzLmluZGVudCxcbiAgICAgICAgICAgIGNvbW1hbmRzLmluc2VydExpc3QsXG4gICAgICAgICAgICBjb21tYW5kcy5vdXRkZW50LFxuICAgICAgICAgICAgY29tbWFuZHMucmVkbyxcbiAgICAgICAgICAgIGNvbW1hbmRzLnN1YnNjcmlwdCxcbiAgICAgICAgICAgIGNvbW1hbmRzLnN1cGVyc2NyaXB0LFxuICAgICAgICAgICAgY29tbWFuZHMudW5kb1xuICAgICAgICBdO1xuICAgIHZhciBhbGxQbHVnaW5zID0gW10uY29uY2F0KG1hbmRhdG9yeVBhdGNoZXMsIG1hbmRhdG9yeUNvbW1hbmRzKTtcbiAgICBhbGxQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgICB0aGlzLnVzZShwbHVnaW4oKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnVzZShldmVudHMoKSk7XG59XG5TY3JpYmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblNjcmliZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKGNvbmZpZ3VyZVBsdWdpbikge1xuICAgIGNvbmZpZ3VyZVBsdWdpbih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JpYmUucHJvdG90eXBlLnNldEhUTUwgPSBmdW5jdGlvbiAoaHRtbCwgc2tpcEZvcm1hdHRlcnMpIHtcbiAgICBpZiAoc2tpcEZvcm1hdHRlcnMpIHtcbiAgICAgICAgdGhpcy5fc2tpcEZvcm1hdHRlcnMgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IGh0bWw7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5nZXRIVE1MID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmVsLmlubmVySFRNTDtcbn07XG5TY3JpYmUucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2h0bWxGb3JtYXR0ZXJGYWN0b3J5LmZvcm1hdEZvckV4cG9ydCh0aGlzLmdldEhUTUwoKS5yZXBsYWNlKC88YnI+JC8sICcnKSk7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5nZXRUZXh0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbC50ZXh0Q29udGVudDtcbn07XG5TY3JpYmUucHJvdG90eXBlLnB1c2hIaXN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwcmV2aW91c1VuZG9JdGVtID0gdGhpcy51bmRvTWFuYWdlci5zdGFja1t0aGlzLnVuZG9NYW5hZ2VyLnBvc2l0aW9uXTtcbiAgICB2YXIgcHJldmlvdXNDb250ZW50ID0gcHJldmlvdXNVbmRvSXRlbSAmJiBwcmV2aW91c1VuZG9JdGVtLnJlcGxhY2UoLzxlbSBjbGFzcz1cInNjcmliZS1tYXJrZXJcIj4vZywgJycpLnJlcGxhY2UoLzxcXC9lbT4vZywgJycpO1xuICAgIGlmICghcHJldmlvdXNVbmRvSXRlbSB8fCBwcmV2aW91c1VuZG9JdGVtICYmIHRoaXMuZ2V0SFRNTCgpICE9PSBwcmV2aW91c0NvbnRlbnQpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IG5ldyB0aGlzLmFwaS5TZWxlY3Rpb24oKTtcbiAgICAgICAgc2VsZWN0aW9uLnBsYWNlTWFya2VycygpO1xuICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0SFRNTCgpO1xuICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlTWFya2VycygpO1xuICAgICAgICB0aGlzLnVuZG9NYW5hZ2VyLnB1c2goaHRtbCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuU2NyaWJlLnByb3RvdHlwZS5nZXRDb21tYW5kID0gZnVuY3Rpb24gKGNvbW1hbmROYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZHNbY29tbWFuZE5hbWVdIHx8IHRoaXMuY29tbWFuZFBhdGNoZXNbY29tbWFuZE5hbWVdIHx8IG5ldyB0aGlzLmFwaS5Db21tYW5kKGNvbW1hbmROYW1lKTtcbn07XG5TY3JpYmUucHJvdG90eXBlLnJlc3RvcmVGcm9tSGlzdG9yeSA9IGZ1bmN0aW9uIChoaXN0b3J5SXRlbSkge1xuICAgIHRoaXMuc2V0SFRNTChoaXN0b3J5SXRlbSwgdHJ1ZSk7XG4gICAgdmFyIHNlbGVjdGlvbiA9IG5ldyB0aGlzLmFwaS5TZWxlY3Rpb24oKTtcbiAgICBzZWxlY3Rpb24uc2VsZWN0TWFya2VycygpO1xuICAgIHRoaXMudHJpZ2dlcignY29udGVudC1jaGFuZ2VkJyk7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5hbGxvd3NCbG9ja0VsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dCbG9ja0VsZW1lbnRzO1xufTtcblNjcmliZS5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgaWYgKCF0aGlzLmFsbG93c0Jsb2NrRWxlbWVudHMoKSkge1xuICAgICAgICBjb250ZW50ID0gY29udGVudCArICc8YnI+JztcbiAgICB9XG4gICAgdGhpcy5zZXRIVE1MKGNvbnRlbnQpO1xuICAgIHRoaXMudHJpZ2dlcignY29udGVudC1jaGFuZ2VkJyk7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5pbnNlcnRQbGFpblRleHQgPSBmdW5jdGlvbiAocGxhaW5UZXh0KSB7XG4gICAgdGhpcy5pbnNlcnRIVE1MKCc8cD4nICsgdGhpcy5fcGxhaW5UZXh0Rm9ybWF0dGVyRmFjdG9yeS5mb3JtYXQocGxhaW5UZXh0KSArICc8L3A+Jyk7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5pbnNlcnRIVE1MID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICB0aGlzLmdldENvbW1hbmQoJ2luc2VydEhUTUwnKS5leGVjdXRlKHRoaXMuX2h0bWxGb3JtYXR0ZXJGYWN0b3J5LmZvcm1hdChodG1sKSk7XG59O1xuU2NyaWJlLnByb3RvdHlwZS5pc0RlYnVnTW9kZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5kZWJ1Zztcbn07XG5TY3JpYmUucHJvdG90eXBlLnJlZ2lzdGVySFRNTEZvcm1hdHRlciA9IGZ1bmN0aW9uIChwaGFzZSwgZm4pIHtcbiAgICB0aGlzLl9odG1sRm9ybWF0dGVyRmFjdG9yeS5mb3JtYXR0ZXJzW3BoYXNlXS5wdXNoKGZuKTtcbn07XG5TY3JpYmUucHJvdG90eXBlLnJlZ2lzdGVyUGxhaW5UZXh0Rm9ybWF0dGVyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdGhpcy5fcGxhaW5UZXh0Rm9ybWF0dGVyRmFjdG9yeS5mb3JtYXR0ZXJzLnB1c2goZm4pO1xufTtcbmZ1bmN0aW9uIEZvcm1hdHRlckZhY3RvcnkoKSB7XG4gICAgdGhpcy5mb3JtYXR0ZXJzID0gW107XG59XG5Gb3JtYXR0ZXJGYWN0b3J5LnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgIHZhciBmb3JtYXR0ZWQgPSB0aGlzLmZvcm1hdHRlcnMucmVkdWNlKGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRhLCBmb3JtYXR0ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXR0ZXIoZm9ybWF0dGVkRGF0YSk7XG4gICAgICAgIH0sIGh0bWwpO1xuICAgIHJldHVybiBmb3JtYXR0ZWQ7XG59O1xuZnVuY3Rpb24gSFRNTEZvcm1hdHRlckZhY3RvcnkoKSB7XG4gICAgdGhpcy5mb3JtYXR0ZXJzID0ge1xuICAgICAgICBzYW5pdGl6ZTogW10sXG4gICAgICAgIG5vcm1hbGl6ZTogW10sXG4gICAgICAgICdleHBvcnQnOiBbXVxuICAgIH07XG59XG5IVE1MRm9ybWF0dGVyRmFjdG9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcm1hdHRlckZhY3RvcnkucHJvdG90eXBlKTtcbkhUTUxGb3JtYXR0ZXJGYWN0b3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhUTUxGb3JtYXR0ZXJGYWN0b3J5O1xuSFRNTEZvcm1hdHRlckZhY3RvcnkucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgdmFyIGZvcm1hdHRlcnMgPSBmbGF0dGVuKFtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0dGVycy5zYW5pdGl6ZSxcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0dGVycy5ub3JtYWxpemVcbiAgICAgICAgXSk7XG4gICAgdmFyIGZvcm1hdHRlZCA9IGZvcm1hdHRlcnMucmVkdWNlKGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRhLCBmb3JtYXR0ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXR0ZXIoZm9ybWF0dGVkRGF0YSk7XG4gICAgICAgIH0sIGh0bWwpO1xuICAgIHJldHVybiBmb3JtYXR0ZWQ7XG59O1xuSFRNTEZvcm1hdHRlckZhY3RvcnkucHJvdG90eXBlLmZvcm1hdEZvckV4cG9ydCA9IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0dGVyc1snZXhwb3J0J10ucmVkdWNlKGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRhLCBmb3JtYXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlcihmb3JtYXR0ZWREYXRhKTtcbiAgICB9LCBodG1sKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFNjcmliZTsiLCJ2YXIgYXNzaWduID0gcmVxdWlyZSgnbG9kYXNoLWFtZC9tb2Rlcm4vb2JqZWN0cy9hc3NpZ24nKTtcbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgIGZ1bmN0aW9uIFRyYW5zYWN0aW9uTWFuYWdlcigpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgfVxuICAgIGFzc2lnbihUcmFuc2FjdGlvbk1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkucHVzaCgxKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkucG9wKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHNjcmliZS5wdXNoSGlzdG9yeSgpO1xuICAgICAgICAgICAgICAgIHNjcmliZS50cmlnZ2VyKCdjb250ZW50LWNoYW5nZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcnVuOiBmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIFRyYW5zYWN0aW9uTWFuYWdlcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2NyaWJlKSB7XG4gICAgZnVuY3Rpb24gVW5kb01hbmFnZXIoKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAtMTtcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICB0aGlzLmRlYnVnID0gc2NyaWJlLmlzRGVidWdNb2RlRW5hYmxlZCgpO1xuICAgIH1cbiAgICBVbmRvTWFuYWdlci5wcm90b3R5cGUubWF4U3RhY2tTaXplID0gMTAwO1xuICAgIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVbmRvTWFuYWdlci5wdXNoOiAlcycsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhY2subGVuZ3RoID0gKyt0aGlzLnBvc2l0aW9uO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2goaXRlbSk7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IHRoaXMubWF4U3RhY2tTaXplKSB7XG4gICAgICAgICAgICB0aGlzLnN0YWNrLnNoaWZ0KCk7XG4gICAgICAgICAgICAtLXRoaXMucG9zaXRpb247XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS51bmRvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YWNrWy0tdGhpcy5wb3NpdGlvbl07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5yZWRvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA8IHRoaXMuc3RhY2subGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2tbKyt0aGlzLnBvc2l0aW9uXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFVuZG9NYW5hZ2VyO1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmliZSkge1xuICAgICAgICBzY3JpYmUucmVnaXN0ZXJQbGFpblRleHRGb3JtYXR0ZXIoZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoL1xcbihbIFxcdF0qXFxuKSsvZywgJzwvcD48cD4nKS5yZXBsYWNlKC9cXG4vZywgJzxicj4nKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn07IiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCBGZWxpeCBHbmFzc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG5cbiAgLyogQ29tbW9uSlMgKi9cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnKSAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcblxuICAvKiBBTUQgbW9kdWxlICovXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZmFjdG9yeSlcblxuICAvKiBCcm93c2VyIGdsb2JhbCAqL1xuICBlbHNlIHJvb3QuU3Bpbm5lciA9IGZhY3RvcnkoKVxufVxuKHRoaXMsIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdNb3onLCAnbXMnLCAnTyddIC8qIFZlbmRvciBwcmVmaXhlcyAqL1xuICAgICwgYW5pbWF0aW9ucyA9IHt9IC8qIEFuaW1hdGlvbiBydWxlcyBrZXllZCBieSB0aGVpciBuYW1lICovXG4gICAgLCB1c2VDc3NBbmltYXRpb25zIC8qIFdoZXRoZXIgdG8gdXNlIENTUyBhbmltYXRpb25zIG9yIHNldFRpbWVvdXQgKi9cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgZWxlbWVudHMuIElmIG5vIHRhZyBuYW1lIGlzIGdpdmVuLFxuICAgKiBhIERJViBpcyBjcmVhdGVkLiBPcHRpb25hbGx5IHByb3BlcnRpZXMgY2FuIGJlIHBhc3NlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsKHRhZywgcHJvcCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKVxuICAgICAgLCBuXG5cbiAgICBmb3IobiBpbiBwcm9wKSBlbFtuXSA9IHByb3Bbbl1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGNoaWxkcmVuIGFuZCByZXR1cm5zIHRoZSBwYXJlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBpbnMocGFyZW50IC8qIGNoaWxkMSwgY2hpbGQyLCAuLi4qLykge1xuICAgIGZvciAodmFyIGk9MSwgbj1hcmd1bWVudHMubGVuZ3RoOyBpPG47IGkrKylcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChhcmd1bWVudHNbaV0pXG5cbiAgICByZXR1cm4gcGFyZW50XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IHN0eWxlc2hlZXQgdG8gaG9sZCB0aGUgQGtleWZyYW1lIG9yIFZNTCBydWxlcy5cbiAgICovXG4gIHZhciBzaGVldCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBjcmVhdGVFbCgnc3R5bGUnLCB7dHlwZSA6ICd0ZXh0L2Nzcyd9KVxuICAgIGlucyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLCBlbClcbiAgICByZXR1cm4gZWwuc2hlZXQgfHwgZWwuc3R5bGVTaGVldFxuICB9KCkpXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3BhY2l0eSBrZXlmcmFtZSBhbmltYXRpb24gcnVsZSBhbmQgcmV0dXJucyBpdHMgbmFtZS5cbiAgICogU2luY2UgbW9zdCBtb2JpbGUgV2Via2l0cyBoYXZlIHRpbWluZyBpc3N1ZXMgd2l0aCBhbmltYXRpb24tZGVsYXksXG4gICAqIHdlIGNyZWF0ZSBzZXBhcmF0ZSBydWxlcyBmb3IgZWFjaCBsaW5lL3NlZ21lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRBbmltYXRpb24oYWxwaGEsIHRyYWlsLCBpLCBsaW5lcykge1xuICAgIHZhciBuYW1lID0gWydvcGFjaXR5JywgdHJhaWwsIH5+KGFscGhhKjEwMCksIGksIGxpbmVzXS5qb2luKCctJylcbiAgICAgICwgc3RhcnQgPSAwLjAxICsgaS9saW5lcyAqIDEwMFxuICAgICAgLCB6ID0gTWF0aC5tYXgoMSAtICgxLWFscGhhKSAvIHRyYWlsICogKDEwMC1zdGFydCksIGFscGhhKVxuICAgICAgLCBwcmVmaXggPSB1c2VDc3NBbmltYXRpb25zLnN1YnN0cmluZygwLCB1c2VDc3NBbmltYXRpb25zLmluZGV4T2YoJ0FuaW1hdGlvbicpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIHByZSA9IHByZWZpeCAmJiAnLScgKyBwcmVmaXggKyAnLScgfHwgJydcblxuICAgIGlmICghYW5pbWF0aW9uc1tuYW1lXSkge1xuICAgICAgc2hlZXQuaW5zZXJ0UnVsZShcbiAgICAgICAgJ0AnICsgcHJlICsgJ2tleWZyYW1lcyAnICsgbmFtZSArICd7JyArXG4gICAgICAgICcwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgc3RhcnQgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgIChzdGFydCswLjAxKSArICcle29wYWNpdHk6MX0nICtcbiAgICAgICAgKHN0YXJ0K3RyYWlsKSAlIDEwMCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgJzEwMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgICd9Jywgc2hlZXQuY3NzUnVsZXMubGVuZ3RoKVxuXG4gICAgICBhbmltYXRpb25zW25hbWVdID0gMVxuICAgIH1cblxuICAgIHJldHVybiBuYW1lXG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdmFyaW91cyB2ZW5kb3IgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHN1cHBvcnRlZCBwcm9wZXJ0eS5cbiAgICovXG4gIGZ1bmN0aW9uIHZlbmRvcihlbCwgcHJvcCkge1xuICAgIHZhciBzID0gZWwuc3R5bGVcbiAgICAgICwgcHBcbiAgICAgICwgaVxuXG4gICAgcHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpXG4gICAgZm9yKGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHAgPSBwcmVmaXhlc1tpXStwcm9wXG4gICAgICBpZihzW3BwXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHBcbiAgICB9XG4gICAgaWYoc1twcm9wXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbXVsdGlwbGUgc3R5bGUgcHJvcGVydGllcyBhdCBvbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gY3NzKGVsLCBwcm9wKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wKVxuICAgICAgZWwuc3R5bGVbdmVuZG9yKGVsLCBuKXx8bl0gPSBwcm9wW25dXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyBpbiBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICAgIGZvciAodmFyIGk9MTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlZiA9IGFyZ3VtZW50c1tpXVxuICAgICAgZm9yICh2YXIgbiBpbiBkZWYpXG4gICAgICAgIGlmIChvYmpbbl0gPT09IHVuZGVmaW5lZCkgb2JqW25dID0gZGVmW25dXG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwYWdlLW9mZnNldCBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIHBvcyhlbCkge1xuICAgIHZhciBvID0geyB4OmVsLm9mZnNldExlZnQsIHk6ZWwub2Zmc2V0VG9wIH1cbiAgICB3aGlsZSgoZWwgPSBlbC5vZmZzZXRQYXJlbnQpKVxuICAgICAgby54Kz1lbC5vZmZzZXRMZWZ0LCBvLnkrPWVsLm9mZnNldFRvcFxuXG4gICAgcmV0dXJuIG9cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNvbG9yIGZyb20gdGhlIGdpdmVuIHN0cmluZyBvciBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbG9yKGNvbG9yLCBpZHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGNvbG9yID09ICdzdHJpbmcnID8gY29sb3IgOiBjb2xvcltpZHggJSBjb2xvci5sZW5ndGhdXG4gIH1cblxuICAvLyBCdWlsdC1pbiBkZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBsaW5lczogMTIsICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgbGVuZ3RoOiA3LCAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgd2lkdGg6IDUsICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgIHJhZGl1czogMTAsICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICByb3RhdGU6IDAsICAgICAgICAgICAgLy8gUm90YXRpb24gb2Zmc2V0XG4gICAgY29ybmVyczogMSwgICAgICAgICAgIC8vIFJvdW5kbmVzcyAoMC4uMSlcbiAgICBjb2xvcjogJyMwMDAnLCAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiXG4gICAgZGlyZWN0aW9uOiAxLCAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICBzcGVlZDogMSwgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICB0cmFpbDogMTAwLCAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICBvcGFjaXR5OiAxLzQsICAgICAgICAgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcbiAgICBmcHM6IDIwLCAgICAgICAgICAgICAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KClcbiAgICB6SW5kZXg6IDJlOSwgICAgICAgICAgLy8gVXNlIGEgaGlnaCB6LWluZGV4IGJ5IGRlZmF1bHRcbiAgICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAgIHRvcDogJzUwJScsICAgICAgICAgICAvLyBjZW50ZXIgdmVydGljYWxseVxuICAgIGxlZnQ6ICc1MCUnLCAgICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScgIC8vIGVsZW1lbnQgcG9zaXRpb25cbiAgfVxuXG4gIC8qKiBUaGUgY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gU3Bpbm5lcihvKSB7XG4gICAgdGhpcy5vcHRzID0gbWVyZ2UobyB8fCB7fSwgU3Bpbm5lci5kZWZhdWx0cywgZGVmYXVsdHMpXG4gIH1cblxuICAvLyBHbG9iYWwgZGVmYXVsdHMgdGhhdCBvdmVycmlkZSB0aGUgYnVpbHQtaW5zOlxuICBTcGlubmVyLmRlZmF1bHRzID0ge31cblxuICBtZXJnZShTcGlubmVyLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgc3Bpbm5lciB0byB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQuIElmIHRoaXMgaW5zdGFuY2UgaXMgYWxyZWFkeVxuICAgICAqIHNwaW5uaW5nLCBpdCBpcyBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBpdHMgcHJldmlvdXMgdGFyZ2V0IGIgY2FsbGluZ1xuICAgICAqIHN0b3AoKSBpbnRlcm5hbGx5LlxuICAgICAqL1xuICAgIHNwaW46IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy5zdG9wKClcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICwgbyA9IHNlbGYub3B0c1xuICAgICAgICAsIGVsID0gc2VsZi5lbCA9IGNzcyhjcmVhdGVFbCgwLCB7Y2xhc3NOYW1lOiBvLmNsYXNzTmFtZX0pLCB7cG9zaXRpb246IG8ucG9zaXRpb24sIHdpZHRoOiAwLCB6SW5kZXg6IG8uekluZGV4fSlcbiAgICAgICAgLCBtaWQgPSBvLnJhZGl1cytvLmxlbmd0aCtvLndpZHRoXG5cbiAgICAgIGNzcyhlbCwge1xuICAgICAgICBsZWZ0OiBvLmxlZnQsXG4gICAgICAgIHRvcDogby50b3BcbiAgICAgIH0pXG4gICAgICAgIFxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuZmlyc3RDaGlsZHx8bnVsbClcbiAgICAgIH1cblxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Byb2dyZXNzYmFyJylcbiAgICAgIHNlbGYubGluZXMoZWwsIHNlbGYub3B0cylcblxuICAgICAgaWYgKCF1c2VDc3NBbmltYXRpb25zKSB7XG4gICAgICAgIC8vIE5vIENTUyBhbmltYXRpb24gc3VwcG9ydCwgdXNlIHNldFRpbWVvdXQoKSBpbnN0ZWFkXG4gICAgICAgIHZhciBpID0gMFxuICAgICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICAgLCBhbHBoYVxuICAgICAgICAgICwgZnBzID0gby5mcHNcbiAgICAgICAgICAsIGYgPSBmcHMvby5zcGVlZFxuICAgICAgICAgICwgb3N0ZXAgPSAoMS1vLm9wYWNpdHkpIC8gKGYqby50cmFpbCAvIDEwMClcbiAgICAgICAgICAsIGFzdGVwID0gZi9vLmxpbmVzXG5cbiAgICAgICAgOyhmdW5jdGlvbiBhbmltKCkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG8ubGluZXM7IGorKykge1xuICAgICAgICAgICAgYWxwaGEgPSBNYXRoLm1heCgxIC0gKGkgKyAoby5saW5lcyAtIGopICogYXN0ZXApICUgZiAqIG9zdGVwLCBvLm9wYWNpdHkpXG5cbiAgICAgICAgICAgIHNlbGYub3BhY2l0eShlbCwgaiAqIG8uZGlyZWN0aW9uICsgc3RhcnQsIGFscGhhLCBvKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZWxmLmVsICYmIHNldFRpbWVvdXQoYW5pbSwgfn4oMTAwMC9mcHMpKVxuICAgICAgICB9KSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZlxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhbmQgcmVtb3ZlcyB0aGUgU3Bpbm5lci5cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSkgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcbiAgICAgICAgdGhpcy5lbCA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgZHJhd3MgdGhlIGluZGl2aWR1YWwgbGluZXMuIFdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBsaW5lczogZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciBpID0gMFxuICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAsIHNlZ1xuXG4gICAgICBmdW5jdGlvbiBmaWxsKGNvbG9yLCBzaGFkb3cpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgd2lkdGg6IChvLmxlbmd0aCtvLndpZHRoKSArICdweCcsXG4gICAgICAgICAgaGVpZ2h0OiBvLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBjb2xvcixcbiAgICAgICAgICBib3hTaGFkb3c6IHNoYWRvdyxcbiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdsZWZ0JyxcbiAgICAgICAgICB0cmFuc2Zvcm06ICdyb3RhdGUoJyArIH5+KDM2MC9vLmxpbmVzKmkrby5yb3RhdGUpICsgJ2RlZykgdHJhbnNsYXRlKCcgKyBvLnJhZGl1cysncHgnICsnLDApJyxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IChvLmNvcm5lcnMgKiBvLndpZHRoPj4xKSArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGkgPCBvLmxpbmVzOyBpKyspIHtcbiAgICAgICAgc2VnID0gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB0b3A6IDErfihvLndpZHRoLzIpICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IG8uaHdhY2NlbCA/ICd0cmFuc2xhdGUzZCgwLDAsMCknIDogJycsXG4gICAgICAgICAgb3BhY2l0eTogby5vcGFjaXR5LFxuICAgICAgICAgIGFuaW1hdGlvbjogdXNlQ3NzQW5pbWF0aW9ucyAmJiBhZGRBbmltYXRpb24oby5vcGFjaXR5LCBvLnRyYWlsLCBzdGFydCArIGkgKiBvLmRpcmVjdGlvbiwgby5saW5lcykgKyAnICcgKyAxL28uc3BlZWQgKyAncyBsaW5lYXIgaW5maW5pdGUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG8uc2hhZG93KSBpbnMoc2VnLCBjc3MoZmlsbCgnIzAwMCcsICcwIDAgNHB4ICcgKyAnIzAwMCcpLCB7dG9wOiAyKydweCd9KSlcbiAgICAgICAgaW5zKGVsLCBpbnMoc2VnLCBmaWxsKGdldENvbG9yKG8uY29sb3IsIGkpLCAnMCAwIDFweCByZ2JhKDAsMCwwLC4xKScpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBhZGp1c3RzIHRoZSBvcGFjaXR5IG9mIGEgc2luZ2xlIGxpbmUuXG4gICAgICogV2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBvcGFjaXR5OiBmdW5jdGlvbihlbCwgaSwgdmFsKSB7XG4gICAgICBpZiAoaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoKSBlbC5jaGlsZE5vZGVzW2ldLnN0eWxlLm9wYWNpdHkgPSB2YWxcbiAgICB9XG5cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRWTUwoKSB7XG5cbiAgICAvKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFZNTCB0YWcgKi9cbiAgICBmdW5jdGlvbiB2bWwodGFnLCBhdHRyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRWwoJzwnICsgdGFnICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJzcGluLXZtbFwiPicsIGF0dHIpXG4gICAgfVxuXG4gICAgLy8gTm8gQ1NTIHRyYW5zZm9ybXMgYnV0IFZNTCBzdXBwb3J0LCBhZGQgYSBDU1MgcnVsZSBmb3IgVk1MIGVsZW1lbnRzOlxuICAgIHNoZWV0LmFkZFJ1bGUoJy5zcGluLXZtbCcsICdiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKScpXG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5saW5lcyA9IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgciA9IG8ubGVuZ3RoK28ud2lkdGhcbiAgICAgICAgLCBzID0gMipyXG5cbiAgICAgIGZ1bmN0aW9uIGdycCgpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhcbiAgICAgICAgICB2bWwoJ2dyb3VwJywge1xuICAgICAgICAgICAgY29vcmRzaXplOiBzICsgJyAnICsgcyxcbiAgICAgICAgICAgIGNvb3Jkb3JpZ2luOiAtciArICcgJyArIC1yXG4gICAgICAgICAgfSksXG4gICAgICAgICAgeyB3aWR0aDogcywgaGVpZ2h0OiBzIH1cbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICB2YXIgbWFyZ2luID0gLShvLndpZHRoK28ubGVuZ3RoKSoyICsgJ3B4J1xuICAgICAgICAsIGcgPSBjc3MoZ3JwKCksIHtwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiBtYXJnaW4sIGxlZnQ6IG1hcmdpbn0pXG4gICAgICAgICwgaVxuXG4gICAgICBmdW5jdGlvbiBzZWcoaSwgZHgsIGZpbHRlcikge1xuICAgICAgICBpbnMoZyxcbiAgICAgICAgICBpbnMoY3NzKGdycCgpLCB7cm90YXRpb246IDM2MCAvIG8ubGluZXMgKiBpICsgJ2RlZycsIGxlZnQ6IH5+ZHh9KSxcbiAgICAgICAgICAgIGlucyhjc3Modm1sKCdyb3VuZHJlY3QnLCB7YXJjc2l6ZTogby5jb3JuZXJzfSksIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogby5yYWRpdXMsXG4gICAgICAgICAgICAgICAgdG9wOiAtby53aWR0aD4+MSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgdm1sKCdmaWxsJywge2NvbG9yOiBnZXRDb2xvcihvLmNvbG9yLCBpKSwgb3BhY2l0eTogby5vcGFjaXR5fSksXG4gICAgICAgICAgICAgIHZtbCgnc3Ryb2tlJywge29wYWNpdHk6IDB9KSAvLyB0cmFuc3BhcmVudCBzdHJva2UgdG8gZml4IGNvbG9yIGJsZWVkaW5nIHVwb24gb3BhY2l0eSBjaGFuZ2VcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKG8uc2hhZG93KVxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKylcbiAgICAgICAgICBzZWcoaSwgLTIsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQmx1cihwaXhlbHJhZGl1cz0yLG1ha2VzaGFkb3c9MSxzaGFkb3dvcGFjaXR5PS4zKScpXG5cbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKSBzZWcoaSlcbiAgICAgIHJldHVybiBpbnMoZWwsIGcpXG4gICAgfVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUub3BhY2l0eSA9IGZ1bmN0aW9uKGVsLCBpLCB2YWwsIG8pIHtcbiAgICAgIHZhciBjID0gZWwuZmlyc3RDaGlsZFxuICAgICAgbyA9IG8uc2hhZG93ICYmIG8ubGluZXMgfHwgMFxuICAgICAgaWYgKGMgJiYgaStvIDwgYy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBjID0gYy5jaGlsZE5vZGVzW2krb107IGMgPSBjICYmIGMuZmlyc3RDaGlsZDsgYyA9IGMgJiYgYy5maXJzdENoaWxkXG4gICAgICAgIGlmIChjKSBjLm9wYWNpdHkgPSB2YWxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgcHJvYmUgPSBjc3MoY3JlYXRlRWwoJ2dyb3VwJyksIHtiZWhhdmlvcjogJ3VybCgjZGVmYXVsdCNWTUwpJ30pXG5cbiAgaWYgKCF2ZW5kb3IocHJvYmUsICd0cmFuc2Zvcm0nKSAmJiBwcm9iZS5hZGopIGluaXRWTUwoKVxuICBlbHNlIHVzZUNzc0FuaW1hdGlvbnMgPSB2ZW5kb3IocHJvYmUsICdhbmltYXRpb24nKVxuXG4gIHJldHVybiBTcGlubmVyXG5cbn0pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcblxudmFyIEJsb2NrQ29udHJvbCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5ibG9ja190eXBlID0gQmxvY2tzW3RoaXMudHlwZV0ucHJvdG90eXBlO1xuICB0aGlzLmNhbl9iZV9yZW5kZXJlZCA9IHRoaXMuYmxvY2tfdHlwZS50b29sYmFyRW5hYmxlZDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrQ29udHJvbC5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIHRhZ05hbWU6ICdhJyxcbiAgY2xhc3NOYW1lOiBcInN0LWJsb2NrLWNvbnRyb2xcIixcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2RhdGEtdHlwZSc6IHRoaXMuYmxvY2tfdHlwZS50eXBlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmh0bWwoJzxzcGFuIGNsYXNzPVwic3QtaWNvblwiPicrIF8ucmVzdWx0KHRoaXMuYmxvY2tfdHlwZSwgJ2ljb25fbmFtZScpICsnPC9zcGFuPicgKyBfLnJlc3VsdCh0aGlzLmJsb2NrX3R5cGUsICd0aXRsZScpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tDb250cm9sO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXJUcmV2b3IgQmxvY2sgQ29udHJvbHNcbiAqIC0tXG4gKiBHaXZlcyBhbiBpbnRlcmZhY2UgZm9yIGFkZGluZyBuZXcgU2lyIFRyZXZvciBibG9ja3MuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBCbG9ja0NvbnRyb2wgPSByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2wnKTtcbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBCbG9ja0NvbnRyb2xzID0gZnVuY3Rpb24oYXZhaWxhYmxlX3R5cGVzLCBtZWRpYXRvcikge1xuICB0aGlzLmF2YWlsYWJsZV90eXBlcyA9IGF2YWlsYWJsZV90eXBlcyB8fCBbXTtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuICB0aGlzLl9iaW5kTWVkaWF0ZWRFdmVudHMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tDb250cm9scy5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL21lZGlhdGVkLWV2ZW50cycpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGJvdW5kOiBbJ2hhbmRsZUNvbnRyb2xCdXR0b25DbGljayddLFxuICBibG9ja19jb250cm9sczogbnVsbCxcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNcIixcbiAgZXZlbnROYW1lc3BhY2U6ICdibG9jay1jb250cm9scycsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAncmVuZGVyJzogJ3JlbmRlckluQ29udGFpbmVyJyxcbiAgICAnc2hvdyc6ICdzaG93JyxcbiAgICAnaGlkZSc6ICdoaWRlJ1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIGZvcih2YXIgYmxvY2tfdHlwZSBpbiB0aGlzLmF2YWlsYWJsZV90eXBlcykge1xuICAgICAgaWYgKEJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShibG9ja190eXBlKSkge1xuICAgICAgICB2YXIgYmxvY2tfY29udHJvbCA9IG5ldyBCbG9ja0NvbnRyb2woYmxvY2tfdHlwZSk7XG4gICAgICAgIGlmIChibG9ja19jb250cm9sLmNhbl9iZV9yZW5kZXJlZCkge1xuICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZChibG9ja19jb250cm9sLnJlbmRlcigpLiRlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiRlbC5kZWxlZ2F0ZSgnLnN0LWJsb2NrLWNvbnRyb2wnLCAnY2xpY2snLCB0aGlzLmhhbmRsZUNvbnRyb2xCdXR0b25DbGljayk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2stY29udHJvbHM6c2hvdycsIHRoaXMucmVuZGVySW5Db250YWluZXIpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpzaG93bicpO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQ3VycmVudENvbnRhaW5lcigpO1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpoaWRkZW4nKTtcbiAgfSxcblxuICBoYW5kbGVDb250cm9sQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpjcmVhdGUnLCAkKGUuY3VycmVudFRhcmdldCkuYXR0cignZGF0YS10eXBlJykpO1xuICB9LFxuXG4gIHJlbmRlckluQ29udGFpbmVyOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICB0aGlzLnJlbW92ZUN1cnJlbnRDb250YWluZXIoKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmQodGhpcy4kZWwuZGV0YWNoKCkpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnd2l0aC1zdC1jb250cm9scycpO1xuXG4gICAgdGhpcy5jdXJyZW50Q29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuc2hvdygpO1xuICB9LFxuXG4gIHJlbW92ZUN1cnJlbnRDb250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLmN1cnJlbnRDb250YWluZXIpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3aXRoLXN0LWNvbnRyb2xzXCIpO1xuICAgICAgdGhpcy5jdXJyZW50Q29udGFpbmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2tEZWxldGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tEZWxldGlvbi5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIHRhZ05hbWU6ICdhJyxcbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tZGVsZXRlIHN0LWljb24nLFxuXG4gIGF0dHJpYnV0ZXM6IHtcbiAgICBodG1sOiAnZGVsZXRlJyxcbiAgICAnZGF0YS1pY29uJzogJ2JpbidcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0RlbGV0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG5cbnZhciBCTE9DS19PUFRJT05fS0VZUyA9IFsnY29udmVydFRvTWFya2Rvd24nLCAnY29udmVydEZyb21NYXJrZG93biddO1xuXG52YXIgQmxvY2tNYW5hZ2VyID0gZnVuY3Rpb24ob3B0aW9ucywgZWRpdG9ySW5zdGFuY2UsIG1lZGlhdG9yKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMuYmxvY2tPcHRpb25zID0gQkxPQ0tfT1BUSU9OX0tFWVMucmVkdWNlKGZ1bmN0aW9uKGFjYywga2V5KSB7XG4gICAgYWNjW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICB0aGlzLmluc3RhbmNlX3Njb3BlID0gZWRpdG9ySW5zdGFuY2U7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLmJsb2NrcyA9IFtdO1xuICB0aGlzLmJsb2NrQ291bnRzID0ge307XG4gIHRoaXMuYmxvY2tUeXBlcyA9IHt9O1xuXG4gIHRoaXMuX3NldEJsb2Nrc1R5cGVzKCk7XG4gIHRoaXMuX3NldFJlcXVpcmVkKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja01hbmFnZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGV2ZW50TmFtZXNwYWNlOiAnYmxvY2snLFxuXG4gIG1lZGlhdGVkRXZlbnRzOiB7XG4gICAgJ2NyZWF0ZSc6ICdjcmVhdGVCbG9jaycsXG4gICAgJ3JlbW92ZSc6ICdyZW1vdmVCbG9jaycsXG4gICAgJ3JlcmVuZGVyJzogJ3JlcmVuZGVyQmxvY2snXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICBjcmVhdGVCbG9jazogZnVuY3Rpb24odHlwZSwgZGF0YSkge1xuICAgIHR5cGUgPSB1dGlscy5jbGFzc2lmeSh0eXBlKTtcblxuICAgIC8vIFJ1biB2YWxpZGF0aW9uc1xuICAgIGlmICghdGhpcy5jYW5DcmVhdGVCbG9jayh0eXBlKSkgeyByZXR1cm47IH1cblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9ja3NbdHlwZV0oZGF0YSwgdGhpcy5pbnN0YW5jZV9zY29wZSwgdGhpcy5tZWRpYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tPcHRpb25zKTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHRoaXMuX2luY3JlbWVudEJsb2NrVHlwZUNvdW50KHR5cGUpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6cmVuZGVyJywgYmxvY2spO1xuXG4gICAgdGhpcy50cmlnZ2VyQmxvY2tDb3VudFVwZGF0ZSgpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCgpKTtcblxuICAgIHV0aWxzLmxvZyhcIkJsb2NrIGNyZWF0ZWQgb2YgdHlwZSBcIiArIHR5cGUpO1xuICB9LFxuXG4gIHJlbW92ZUJsb2NrOiBmdW5jdGlvbihibG9ja0lEKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5maW5kQmxvY2tCeUlkKGJsb2NrSUQpLFxuICAgIHR5cGUgPSB1dGlscy5jbGFzc2lmeShibG9jay50eXBlKTtcblxuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2stY29udHJvbHM6cmVzZXQnKTtcbiAgICB0aGlzLmJsb2NrcyA9IHRoaXMuYmxvY2tzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gKGl0ZW0uYmxvY2tJRCAhPT0gYmxvY2suYmxvY2tJRCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9kZWNyZW1lbnRCbG9ja1R5cGVDb3VudCh0eXBlKTtcbiAgICB0aGlzLnRyaWdnZXJCbG9ja0NvdW50VXBkYXRlKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpsaW1pdFJlYWNoZWQnLCB0aGlzLmJsb2NrTGltaXRSZWFjaGVkKCkpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlbW92ZVwiKTtcbiAgfSxcblxuICByZXJlbmRlckJsb2NrOiBmdW5jdGlvbihibG9ja0lEKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5maW5kQmxvY2tCeUlkKGJsb2NrSUQpO1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChibG9jaykgJiYgIWJsb2NrLmlzRW1wdHkoKSAmJlxuICAgICAgICBibG9jay5kcm9wX29wdGlvbnMucmVfcmVuZGVyX29uX3Jlb3JkZXIpIHtcbiAgICAgIGJsb2NrLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gICAgfVxuICB9LFxuXG4gIHRyaWdnZXJCbG9ja0NvdW50VXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNvdW50VXBkYXRlJywgdGhpcy5ibG9ja3MubGVuZ3RoKTtcbiAgfSxcblxuICBjYW5DcmVhdGVCbG9jazogZnVuY3Rpb24odHlwZSkge1xuICAgIGlmKHRoaXMuYmxvY2tMaW1pdFJlYWNoZWQoKSkge1xuICAgICAgdXRpbHMubG9nKFwiQ2Fubm90IGFkZCBhbnkgbW9yZSBibG9ja3MuIExpbWl0IHJlYWNoZWQuXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0Jsb2NrVHlwZUF2YWlsYWJsZSh0eXBlKSkge1xuICAgICAgdXRpbHMubG9nKFwiQmxvY2sgdHlwZSBub3QgYXZhaWxhYmxlIFwiICsgdHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2FuIHdlIGhhdmUgYW5vdGhlciBvbmUgb2YgdGhlc2UgYmxvY2tzP1xuICAgIGlmICghdGhpcy5jYW5BZGRCbG9ja1R5cGUodHlwZSkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkJsb2NrIExpbWl0IHJlYWNoZWQgZm9yIHR5cGUgXCIgKyB0eXBlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICB2YWxpZGF0ZUJsb2NrVHlwZXNFeGlzdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICBpZiAoY29uZmlnLnNraXBWYWxpZGF0aW9uIHx8ICFzaG91bGRWYWxpZGF0ZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICh0aGlzLnJlcXVpcmVkIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG4gICAgICBpZiAoIXRoaXMuaXNCbG9ja1R5cGVBdmFpbGFibGUodHlwZSkpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmICh0aGlzLl9nZXRCbG9ja1R5cGVDb3VudCh0eXBlKSA9PT0gMCkge1xuICAgICAgICB1dGlscy5sb2coXCJGYWlsZWQgdmFsaWRhdGlvbiBvbiByZXF1aXJlZCBibG9jayB0eXBlIFwiICsgdHlwZSk7XG4gICAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignZXJyb3JzOmFkZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRleHQ6IGkxOG4udChcImVycm9yczp0eXBlX21pc3NpbmdcIiwgeyB0eXBlOiB0eXBlIH0pIH0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NCeVR5cGUodHlwZSkuZmlsdGVyKGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgICByZXR1cm4gIWIuaXNFbXB0eSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJywge1xuICAgICAgICAgIHRleHQ6IGkxOG4udChcImVycm9yczpyZXF1aXJlZF90eXBlX2VtcHR5XCIsIHt0eXBlOiB0eXBlfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbHMubG9nKFwiQSByZXF1aXJlZCBibG9jayB0eXBlIFwiICsgdHlwZSArIFwiIGlzIGVtcHR5XCIpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIGZpbmRCbG9ja0J5SWQ6IGZ1bmN0aW9uKGJsb2NrSUQpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuZmluZChmdW5jdGlvbihiKSB7XG4gICAgICByZXR1cm4gYi5ibG9ja0lEID09PSBibG9ja0lEO1xuICAgIH0pO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5VHlwZTogZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KGIudHlwZSkgPT09IHR5cGU7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIGJsb2NrX2lkcy5pbmNsdWRlcyhiLmJsb2NrSUQpO1xuICAgIH0pO1xuICB9LFxuXG4gIGJsb2NrTGltaXRSZWFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0ICE9PSAwICYmIHRoaXMuYmxvY2tzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCk7XG4gIH0sXG5cbiAgaXNCbG9ja1R5cGVBdmFpbGFibGU6IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQodGhpcy5ibG9ja1R5cGVzW3RdKTtcbiAgfSxcblxuICBjYW5BZGRCbG9ja1R5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgYmxvY2tfdHlwZV9saW1pdCA9IHRoaXMuX2dldEJsb2NrVHlwZUxpbWl0KHR5cGUpO1xuICAgIHJldHVybiAhKGJsb2NrX3R5cGVfbGltaXQgIT09IDAgJiYgdGhpcy5fZ2V0QmxvY2tUeXBlQ291bnQodHlwZSkgPj0gYmxvY2tfdHlwZV9saW1pdCk7XG4gIH0sXG5cbiAgX3NldEJsb2Nrc1R5cGVzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJsb2NrVHlwZXMgPSB1dGlscy5mbGF0dGVuKFxuICAgICAgXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuYmxvY2tUeXBlcykgP1xuICAgICAgQmxvY2tzIDogdGhpcy5vcHRpb25zLmJsb2NrVHlwZXMpO1xuICB9LFxuXG4gIF9zZXRSZXF1aXJlZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXF1aXJlZCA9IGZhbHNlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnJlcXVpcmVkKSAmJiAhXy5pc0VtcHR5KHRoaXMub3B0aW9ucy5yZXF1aXJlZCkpIHtcbiAgICAgIHRoaXMucmVxdWlyZWQgPSB0aGlzLm9wdGlvbnMucmVxdWlyZWQ7XG4gICAgfVxuICB9LFxuXG4gIF9pbmNyZW1lbnRCbG9ja1R5cGVDb3VudDogZnVuY3Rpb24odHlwZSkge1xuICAgIHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gPSAoXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrQ291bnRzW3R5cGVdKSkgPyAxIDogdGhpcy5ibG9ja0NvdW50c1t0eXBlXSArIDE7XG4gIH0sXG5cbiAgX2RlY3JlbWVudEJsb2NrVHlwZUNvdW50OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdGhpcy5ibG9ja0NvdW50c1t0eXBlXSA9IChfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tDb3VudHNbdHlwZV0pKSA/IDEgOiB0aGlzLmJsb2NrQ291bnRzW3R5cGVdIC0gMTtcbiAgfSxcblxuICBfZ2V0QmxvY2tUeXBlQ291bnQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICByZXR1cm4gKF8uaXNVbmRlZmluZWQodGhpcy5ibG9ja0NvdW50c1t0eXBlXSkpID8gMCA6IHRoaXMuYmxvY2tDb3VudHNbdHlwZV07XG4gIH0sXG5cbiAgX2Jsb2NrTGltaXRSZWFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0ICE9PSAwICYmIHRoaXMuYmxvY2tzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCk7XG4gIH0sXG5cbiAgX2dldEJsb2NrVHlwZUxpbWl0OiBmdW5jdGlvbih0KSB7XG4gICAgaWYgKCF0aGlzLmlzQmxvY2tUeXBlQXZhaWxhYmxlKHQpKSB7IHJldHVybiAwOyB9XG4gICAgcmV0dXJuIHBhcnNlSW50KChfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5ibG9ja1R5cGVMaW1pdHNbdF0pKSA/IDAgOiB0aGlzLm9wdGlvbnMuYmxvY2tUeXBlTGltaXRzW3RdLCAxMCk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tNYW5hZ2VyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gW1xuICBcIjxkaXYgY2xhc3M9J3N0LWJsb2NrLXBvc2l0aW9uZXJfX2lubmVyJz5cIixcbiAgXCI8c3BhbiBjbGFzcz0nc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0ZWQtdmFsdWUnPjwvc3Bhbj5cIixcbiAgXCI8c2VsZWN0IGNsYXNzPSdzdC1ibG9jay1wb3NpdGlvbmVyX19zZWxlY3QnPjwvc2VsZWN0PlwiLFxuICBcIjwvZGl2PlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbnZhciBCbG9ja1Bvc2l0aW9uZXIgPSBmdW5jdGlvbihibG9ja19lbGVtZW50LCBtZWRpYXRvcikge1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG4gIHRoaXMuJGJsb2NrID0gYmxvY2tfZWxlbWVudDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tQb3NpdGlvbmVyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgdG90YWxfYmxvY2tzOiAwLFxuXG4gIGJvdW5kOiBbJ29uQmxvY2tDb3VudENoYW5nZScsICdvblNlbGVjdENoYW5nZScsICd0b2dnbGUnLCAnc2hvdycsICdoaWRlJ10sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stcG9zaXRpb25lcicsXG4gIHZpc2libGVDbGFzczogJ3N0LWJsb2NrLXBvc2l0aW9uZXItLWlzLXZpc2libGUnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwuYXBwZW5kKHRlbXBsYXRlKTtcbiAgICB0aGlzLiRzZWxlY3QgPSB0aGlzLiQoJy5zdC1ibG9jay1wb3NpdGlvbmVyX19zZWxlY3QnKTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignY2hhbmdlJywgdGhpcy5vblNlbGVjdENoYW5nZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLm9uKFwiYmxvY2tzOmNvdW50VXBkYXRlXCIsIHRoaXMub25CbG9ja0NvdW50Q2hhbmdlKTtcbiAgfSxcblxuICBvbkJsb2NrQ291bnRDaGFuZ2U6IGZ1bmN0aW9uKG5ld19jb3VudCkge1xuICAgIGlmIChuZXdfY291bnQgIT09IHRoaXMudG90YWxfYmxvY2tzKSB7XG4gICAgICB0aGlzLnRvdGFsX2Jsb2NrcyA9IG5ld19jb3VudDtcbiAgICAgIHRoaXMucmVuZGVyUG9zaXRpb25MaXN0KCk7XG4gICAgfVxuICB9LFxuXG4gIG9uU2VsZWN0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsID0gdGhpcy4kc2VsZWN0LnZhbCgpO1xuICAgIGlmICh2YWwgIT09IDApIHtcbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcbiAgICAgICAgXCJibG9ja3M6Y2hhbmdlUG9zaXRpb25cIiwgdGhpcy4kYmxvY2ssIHZhbCxcbiAgICAgICAgKHZhbCA9PT0gMSA/ICdiZWZvcmUnIDogJ2FmdGVyJykpO1xuICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyUG9zaXRpb25MaXN0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5uZXIgPSBcIjxvcHRpb24gdmFsdWU9JzAnPlwiICsgaTE4bi50KFwiZ2VuZXJhbDpwb3NpdGlvblwiKSArIFwiPC9vcHRpb24+XCI7XG4gICAgZm9yKHZhciBpID0gMTsgaSA8PSB0aGlzLnRvdGFsX2Jsb2NrczsgaSsrKSB7XG4gICAgICBpbm5lciArPSBcIjxvcHRpb24gdmFsdWU9XCIraStcIj5cIitpK1wiPC9vcHRpb24+XCI7XG4gICAgfVxuICAgIHRoaXMuJHNlbGVjdC5odG1sKGlubmVyKTtcbiAgfSxcblxuICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJHNlbGVjdC52YWwoMCk7XG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrUG9zaXRpb25lcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBCbG9ja1Jlb3JkZXIgPSBmdW5jdGlvbihibG9ja19lbGVtZW50LCBtZWRpYXRvcikge1xuICB0aGlzLiRibG9jayA9IGJsb2NrX2VsZW1lbnQ7XG4gIHRoaXMuYmxvY2tJRCA9IHRoaXMuJGJsb2NrLmF0dHIoJ2lkJyk7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tSZW9yZGVyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgYm91bmQ6IFsnb25Nb3VzZURvd24nLCAnb25EcmFnU3RhcnQnLCAnb25EcmFnRW5kJywgJ29uRHJvcCddLFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLXJlb3JkZXIgc3QtaWNvbicsXG4gIHRhZ05hbWU6ICdhJyxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2h0bWwnOiAncmVvcmRlcicsXG4gICAgICAnZHJhZ2dhYmxlJzogJ3RydWUnLFxuICAgICAgJ2RhdGEtaWNvbic6ICdtb3ZlJ1xuICAgIH07XG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuYmluZCgnbW91c2Vkb3duIHRvdWNoc3RhcnQnLCB0aGlzLm9uTW91c2VEb3duKVxuICAgICAgLmJpbmQoJ2RyYWdzdGFydCcsIHRoaXMub25EcmFnU3RhcnQpXG4gICAgICAuYmluZCgnZHJhZ2VuZCB0b3VjaGVuZCcsIHRoaXMub25EcmFnRW5kKTtcblxuICAgIHRoaXMuJGJsb2NrLmRyb3BBcmVhKClcbiAgICAgIC5iaW5kKCdkcm9wJywgdGhpcy5vbkRyb3ApO1xuICB9LFxuXG4gIGJsb2NrSWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRibG9jay5hdHRyKCdpZCcpO1xuICB9LFxuXG4gIG9uTW91c2VEb3duOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoXCJibG9jay1jb250cm9sczpoaWRlXCIpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRvd25cIik7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbihldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZHJvcHBlZF9vbiA9IHRoaXMuJGJsb2NrLFxuICAgIGl0ZW1faWQgPSBldi5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSxcbiAgICBibG9jayA9ICQoJyMnICsgaXRlbV9pZCk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoaXRlbV9pZCkgJiYgIV8uaXNFbXB0eShibG9jaykgJiZcbiAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdpZCcpICE9PSBpdGVtX2lkICYmXG4gICAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdkYXRhLWluc3RhbmNlJykgPT09IGJsb2NrLmF0dHIoJ2RhdGEtaW5zdGFuY2UnKVxuICAgICAgICkge1xuICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICB9XG4gICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcImJsb2NrOnJlcmVuZGVyXCIsIGl0ZW1faWQpO1xuICAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcm9wcGVkXCIsIGl0ZW1faWQpO1xuICB9LFxuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldikge1xuICAgIHZhciBidG4gPSAkKGV2LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpO1xuXG4gICAgZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKHRoaXMuJGJsb2NrWzBdLCBidG4ucG9zaXRpb24oKS5sZWZ0LCBidG4ucG9zaXRpb24oKS50b3ApO1xuICAgIGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ1RleHQnLCB0aGlzLmJsb2NrSWQoKSk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcmFnc3RhcnRcIik7XG4gICAgdGhpcy4kYmxvY2suYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kcmFnZ2luZycpO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXYpIHtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcmFnZW5kXCIpO1xuICAgIHRoaXMuJGJsb2NrLnJlbW92ZUNsYXNzKCdzdC1ibG9jay0tZHJhZ2dpbmcnKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrUmVvcmRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBzdG9yYWdlIG9iamVjdCBmb3IgdGhlIGJsb2NrXG4gICAqL1xuICBibG9ja1N0b3JhZ2U6IHt9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBzdG9yZSwgaW5jbHVkaW5nIHRoZSBibG9jayB0eXBlXG4gICAqL1xuICBjcmVhdGVTdG9yZTogZnVuY3Rpb24oYmxvY2tEYXRhKSB7XG4gICAgdGhpcy5ibG9ja1N0b3JhZ2UgPSB7XG4gICAgICB0eXBlOiB1dGlscy51bmRlcnNjb3JlZCh0aGlzLnR5cGUpLFxuICAgICAgZGF0YTogYmxvY2tEYXRhIHx8IHt9XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBibG9jayBhbmQgc2F2ZSB0aGUgZGF0YSBpbnRvIHRoZSBzdG9yZVxuICAgKi9cbiAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLl9zZXJpYWxpemVEYXRhKCk7XG5cbiAgICBpZiAoIV8uaXNFbXB0eShkYXRhKSkge1xuICAgICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgIH1cbiAgfSxcblxuICBnZXREYXRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2U7XG4gIH0sXG5cbiAgZ2V0QmxvY2tEYXRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2UuZGF0YTtcbiAgfSxcblxuICBfZ2V0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tTdG9yYWdlLmRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYmxvY2sgZGF0YS5cbiAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBzYXZlKCkgbWV0aG9kLlxuICAgKi9cbiAgc2V0RGF0YTogZnVuY3Rpb24oYmxvY2tEYXRhKSB7XG4gICAgdXRpbHMubG9nKFwiU2V0dGluZyBkYXRhIGZvciBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmJsb2NrU3RvcmFnZS5kYXRhLCBibG9ja0RhdGEgfHwge30pO1xuICB9LFxuXG4gIHNldEFuZExvYWREYXRhOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLnNldERhdGEoYmxvY2tEYXRhKTtcbiAgICB0aGlzLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gIH0sXG5cbiAgX3NlcmlhbGl6ZURhdGE6IGZ1bmN0aW9uKCkge30sXG4gIGxvYWREYXRhOiBmdW5jdGlvbigpIHt9LFxuXG4gIGJlZm9yZUxvYWRpbmdEYXRhOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJsb2FkRGF0YSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJlZGl0b3IvYmxvY2svbG9hZERhdGFcIik7XG4gICAgdGhpcy5sb2FkRGF0YSh0aGlzLl9nZXREYXRhKCkpO1xuICB9LFxuXG4gIF9sb2FkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiX2xvYWREYXRhIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBQbGVhc2UgdXNlIGJlZm9yZUxvYWRpbmdEYXRhIGluc3RlYWQuXCIpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICBjaGVja0FuZExvYWREYXRhOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLl9nZXREYXRhKCkpKSB7XG4gICAgICB0aGlzLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gICAgfVxuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgYmVzdE5hbWVGcm9tRmllbGQgPSBmdW5jdGlvbihmaWVsZCkge1xuICB2YXIgbXNnID0gZmllbGQuYXR0cihcImRhdGEtc3QtbmFtZVwiKSB8fCBmaWVsZC5hdHRyKFwibmFtZVwiKTtcblxuICBpZiAoIW1zZykge1xuICAgIG1zZyA9ICdGaWVsZCc7XG4gIH1cblxuICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShtc2cpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZXJyb3JzOiBbXSxcblxuICB2YWxpZDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnBlcmZvcm1WYWxpZGF0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLmVycm9ycy5sZW5ndGggPT09IDA7XG4gIH0sXG5cbiAgLy8gVGhpcyBtZXRob2QgYWN0dWFsbHkgZG9lcyB0aGUgbGVnIHdvcmtcbiAgLy8gb2YgcnVubmluZyBvdXIgdmFsaWRhdG9ycyBhbmQgY3VzdG9tIHZhbGlkYXRvcnNcbiAgcGVyZm9ybVZhbGlkYXRpb25zOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlc2V0RXJyb3JzKCk7XG5cbiAgICB2YXIgcmVxdWlyZWRfZmllbGRzID0gdGhpcy4kKCcuc3QtcmVxdWlyZWQnKTtcbiAgICByZXF1aXJlZF9maWVsZHMuZWFjaChmdW5jdGlvbiAoaSwgZikge1xuICAgICAgdGhpcy52YWxpZGF0ZUZpZWxkKGYpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy52YWxpZGF0aW9ucy5mb3JFYWNoKHRoaXMucnVuVmFsaWRhdG9yLCB0aGlzKTtcblxuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzdC1ibG9jay0td2l0aC1lcnJvcnMnLCB0aGlzLmVycm9ycy5sZW5ndGggPiAwKTtcbiAgfSxcblxuICAvLyBFdmVyeXRoaW5nIGluIGhlcmUgc2hvdWxkIGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgb3IgZmFsc2VcbiAgdmFsaWRhdGlvbnM6IFtdLFxuXG4gIHZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgZmllbGQgPSAkKGZpZWxkKTtcblxuICAgIHZhciBjb250ZW50ID0gZmllbGQuYXR0cignY29udGVudGVkaXRhYmxlJykgPyBmaWVsZC50ZXh0KCkgOiBmaWVsZC52YWwoKTtcblxuICAgIGlmIChjb250ZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRFcnJvcihmaWVsZCwgaTE4bi50KFwiZXJyb3JzOmJsb2NrX2VtcHR5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGJlc3ROYW1lRnJvbUZpZWxkKGZpZWxkKSB9KSk7XG4gICAgfVxuICB9LFxuXG4gIHJ1blZhbGlkYXRvcjogZnVuY3Rpb24odmFsaWRhdG9yKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXNbdmFsaWRhdG9yXSkpIHtcbiAgICAgIHRoaXNbdmFsaWRhdG9yXS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICBzZXRFcnJvcjogZnVuY3Rpb24oZmllbGQsIHJlYXNvbikge1xuICAgIHZhciAkbXNnID0gdGhpcy5hZGRNZXNzYWdlKHJlYXNvbiwgXCJzdC1tc2ctLWVycm9yXCIpO1xuICAgIGZpZWxkLmFkZENsYXNzKCdzdC1lcnJvcicpO1xuXG4gICAgdGhpcy5lcnJvcnMucHVzaCh7IGZpZWxkOiBmaWVsZCwgcmVhc29uOiByZWFzb24sIG1zZzogJG1zZyB9KTtcbiAgfSxcblxuICByZXNldEVycm9yczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBlcnJvci5maWVsZC5yZW1vdmVDbGFzcygnc3QtZXJyb3InKTtcbiAgICAgIGVycm9yLm1zZy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJG1lc3NhZ2VzLnJlbW92ZUNsYXNzKFwic3QtYmxvY2tfX21lc3NhZ2VzLS1pcy12aXNpYmxlXCIpO1xuICAgIHRoaXMuZXJyb3JzID0gW107XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBTY3JpYmUgPSByZXF1aXJlKCdzY3JpYmUtZWRpdG9yJyk7XG52YXIgc2NyaWJlUGx1Z2luRm9ybWF0dGVyUGxhaW5UZXh0Q29udmVydE5ld0xpbmVzVG9IVE1MID0gcmVxdWlyZSgnc2NyaWJlLXBsdWdpbi1mb3JtYXR0ZXItcGxhaW4tdGV4dC1jb252ZXJ0LW5ldy1saW5lcy10by1odG1sJyk7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIHN0VG9NYXJrZG93biA9IHJlcXVpcmUoJy4vdG8tbWFya2Rvd24nKTtcbnZhciBCbG9ja01peGlucyA9IHJlcXVpcmUoJy4vYmxvY2tfbWl4aW5zJyk7XG5cbnZhciBTaW1wbGVCbG9jayA9IHJlcXVpcmUoJy4vc2ltcGxlLWJsb2NrJyk7XG52YXIgQmxvY2tSZW9yZGVyID0gcmVxdWlyZSgnLi9ibG9jay1yZW9yZGVyJyk7XG52YXIgQmxvY2tEZWxldGlvbiA9IHJlcXVpcmUoJy4vYmxvY2stZGVsZXRpb24nKTtcbnZhciBCbG9ja1Bvc2l0aW9uZXIgPSByZXF1aXJlKCcuL2Jsb2NrLXBvc2l0aW9uZXInKTtcbnZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG52YXIgU3Bpbm5lciA9IHJlcXVpcmUoJ3NwaW4uanMnKTtcblxudmFyIEJsb2NrID0gZnVuY3Rpb24oZGF0YSwgaW5zdGFuY2VfaWQsIG1lZGlhdG9yLCBvcHRpb25zKSB7XG4gIFNpbXBsZUJsb2NrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5CbG9jay5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZUJsb2NrLnByb3RvdHlwZSk7XG5CbG9jay5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9jaztcblxudmFyIGRlbGV0ZV90ZW1wbGF0ZSA9IFtcbiAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9ja19fdWktZGVsZXRlLWNvbnRyb2xzJz5cIixcbiAgXCI8bGFiZWwgY2xhc3M9J3N0LWJsb2NrX19kZWxldGUtbGFiZWwnPlwiLFxuICBcIjwlPSBpMThuLnQoJ2dlbmVyYWw6ZGVsZXRlJykgJT5cIixcbiAgXCI8L2xhYmVsPlwiLFxuICBcIjxhIGNsYXNzPSdzdC1ibG9jay11aS1idG4gc3QtYmxvY2stdWktYnRuLS1jb25maXJtLWRlbGV0ZSBzdC1pY29uJyBkYXRhLWljb249J3RpY2snPjwvYT5cIixcbiAgXCI8YSBjbGFzcz0nc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tZGVueS1kZWxldGUgc3QtaWNvbicgZGF0YS1pY29uPSdjbG9zZSc+PC9hPlwiLFxuICBcIjwvZGl2PlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbnZhciBkcm9wX29wdGlvbnMgPSB7XG4gIGh0bWw6IFsnPGRpdiBjbGFzcz1cInN0LWJsb2NrX19kcm9wem9uZVwiPicsXG4gICAgJzxzcGFuIGNsYXNzPVwic3QtaWNvblwiPjwlPSBfLnJlc3VsdChibG9jaywgXCJpY29uX25hbWVcIikgJT48L3NwYW4+JyxcbiAgICAnPHA+PCU9IGkxOG4udChcImdlbmVyYWw6ZHJvcFwiLCB7IGJsb2NrOiBcIjxzcGFuPlwiICsgXy5yZXN1bHQoYmxvY2ssIFwidGl0bGVcIikgKyBcIjwvc3Bhbj5cIiB9KSAlPicsXG4gICAgJzwvcD48L2Rpdj4nXS5qb2luKCdcXG4nKSxcbiAgICByZV9yZW5kZXJfb25fcmVvcmRlcjogZmFsc2Vcbn07XG5cbnZhciBwYXN0ZV9vcHRpb25zID0ge1xuICBodG1sOiBbJzxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiPCU9IGkxOG4udChcImdlbmVyYWw6cGFzdGVcIikgJT5cIicsXG4gICAgJyBjbGFzcz1cInN0LWJsb2NrX19wYXN0ZS1pbnB1dCBzdC1wYXN0ZS1ibG9ja1wiPiddLmpvaW4oJycpXG59O1xuXG52YXIgdXBsb2FkX29wdGlvbnMgPSB7XG4gIGh0bWw6IFtcbiAgICAnPGRpdiBjbGFzcz1cInN0LWJsb2NrX191cGxvYWQtY29udGFpbmVyXCI+JyxcbiAgICAnPGlucHV0IHR5cGU9XCJmaWxlXCIgdHlwZT1cInN0LWZpbGUtdXBsb2FkXCI+JyxcbiAgICAnPGJ1dHRvbiBjbGFzcz1cInN0LXVwbG9hZC1idG5cIj48JT0gaTE4bi50KFwiZ2VuZXJhbDp1cGxvYWRcIikgJT48L2J1dHRvbj4nLFxuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbn07XG5cbmNvbmZpZy5kZWZhdWx0cy5CbG9jayA9IHtcbiAgZHJvcF9vcHRpb25zOiBkcm9wX29wdGlvbnMsXG4gIHBhc3RlX29wdGlvbnM6IHBhc3RlX29wdGlvbnMsXG4gIHVwbG9hZF9vcHRpb25zOiB1cGxvYWRfb3B0aW9uc1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9jay5wcm90b3R5cGUsIFNpbXBsZUJsb2NrLmZuLCByZXF1aXJlKCcuL2Jsb2NrLXZhbGlkYXRpb25zJyksIHtcblxuICBib3VuZDogW1xuICAgIFwiX2hhbmRsZUNvbnRlbnRQYXN0ZVwiLCBcIl9vbkZvY3VzXCIsIFwiX29uQmx1clwiLCBcIm9uRHJvcFwiLCBcIm9uRGVsZXRlQ2xpY2tcIixcbiAgICBcImNsZWFySW5zZXJ0ZWRTdHlsZXNcIiwgXCJnZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXJcIiwgXCJvbkJsb2NrUmVuZGVyXCIsXG4gIF0sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2sgc3QtaWNvbi0tYWRkJyxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihTaW1wbGVCbG9jay5mbi5hdHRyaWJ1dGVzLmNhbGwodGhpcyksIHtcbiAgICAgICdkYXRhLWljb24tYWZ0ZXInIDogXCJhZGRcIlxuICAgIH0pO1xuICB9LFxuXG4gIGljb25fbmFtZTogJ2RlZmF1bHQnLFxuXG4gIHZhbGlkYXRpb25GYWlsTXNnOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaTE4bi50KCdlcnJvcnM6dmFsaWRhdGlvbl9mYWlsJywgeyB0eXBlOiB0aGlzLnRpdGxlKCkgfSk7XG4gIH0sXG5cbiAgZWRpdG9ySFRNTDogJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fZWRpdG9yXCI+PC9kaXY+JyxcblxuICB0b29sYmFyRW5hYmxlZDogdHJ1ZSxcblxuICBhdmFpbGFibGVNaXhpbnM6IFsnZHJvcHBhYmxlJywgJ3Bhc3RhYmxlJywgJ3VwbG9hZGFibGUnLCAnZmV0Y2hhYmxlJyxcbiAgICAnYWpheGFibGUnLCAnY29udHJvbGxhYmxlJ10sXG5cbiAgZHJvcHBhYmxlOiBmYWxzZSxcbiAgcGFzdGFibGU6IGZhbHNlLFxuICB1cGxvYWRhYmxlOiBmYWxzZSxcbiAgZmV0Y2hhYmxlOiBmYWxzZSxcbiAgYWpheGFibGU6IGZhbHNlLFxuXG4gIGRyb3Bfb3B0aW9uczoge30sXG4gIHBhc3RlX29wdGlvbnM6IHt9LFxuICB1cGxvYWRfb3B0aW9uczoge30sXG5cbiAgZm9ybWF0dGFibGU6IHRydWUsXG5cbiAgX3ByZXZpb3VzU2VsZWN0aW9uOiAnJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHt9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKXsgcmV0dXJuIG1hcmtkb3duOyB9LFxuICB0b0hUTUw6IGZ1bmN0aW9uKGh0bWwpeyByZXR1cm4gaHRtbDsgfSxcblxuICB3aXRoTWl4aW46IGZ1bmN0aW9uKG1peGluKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG1peGluKSkgeyByZXR1cm47IH1cblxuICAgIHZhciBpbml0aWFsaXplTWV0aG9kID0gXCJpbml0aWFsaXplXCIgKyBtaXhpbi5taXhpbk5hbWU7XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZCh0aGlzW2luaXRpYWxpemVNZXRob2RdKSkge1xuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBtaXhpbik7XG4gICAgICB0aGlzW2luaXRpYWxpemVNZXRob2RdKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWZvcmVCbG9ja1JlbmRlcigpO1xuICAgIHRoaXMuX3NldEJsb2NrSW5uZXIoKTtcblxuICAgIHRoaXMuJGVkaXRvciA9IHRoaXMuJGlubmVyLmNoaWxkcmVuKCkuZmlyc3QoKTtcblxuICAgIGlmKHRoaXMuZHJvcHBhYmxlIHx8IHRoaXMucGFzdGFibGUgfHwgdGhpcy51cGxvYWRhYmxlKSB7XG4gICAgICB2YXIgaW5wdXRfaHRtbCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19faW5wdXRzJyB9KTtcbiAgICAgIHRoaXMuJGlubmVyLmFwcGVuZChpbnB1dF9odG1sKTtcbiAgICAgIHRoaXMuJGlucHV0cyA9IGlucHV0X2h0bWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzVGV4dEJsb2NrKSB7IHRoaXMuX2luaXRUZXh0QmxvY2tzKCk7IH1cblxuICAgIHRoaXMuYXZhaWxhYmxlTWl4aW5zLmZvckVhY2goZnVuY3Rpb24obWl4aW4pIHtcbiAgICAgIGlmICh0aGlzW21peGluXSkge1xuICAgICAgICB0aGlzLndpdGhNaXhpbihCbG9ja01peGluc1t1dGlscy5jbGFzc2lmeShtaXhpbildKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIGlmICh0aGlzLmZvcm1hdHRhYmxlKSB7IHRoaXMuX2luaXRGb3JtYXR0aW5nKCk7IH1cblxuICAgIHRoaXMuX2Jsb2NrUHJlcGFyZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5hamF4YWJsZSkge1xuICAgICAgdGhpcy5yZXNvbHZlQWxsSW5RdWV1ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICB9LFxuXG4gIGxvYWRpbmc6IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3Bpbm5lcikpIHsgdGhpcy5yZWFkeSgpOyB9XG5cbiAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihjb25maWcuZGVmYXVsdHMuc3Bpbm5lcik7XG4gICAgdGhpcy5zcGlubmVyLnNwaW4odGhpcy4kZWxbMF0pO1xuXG4gICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LS1pcy1sb2FkaW5nJyk7XG4gIH0sXG5cbiAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC0taXMtbG9hZGluZycpO1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnNwaW5uZXIpKSB7XG4gICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgZGVsZXRlIHRoaXMuc3Bpbm5lcjtcbiAgICB9XG4gIH0sXG5cbiAgLyogR2VuZXJpYyBfc2VyaWFsaXplRGF0YSBpbXBsZW1lbnRhdGlvbiB0byBzZXJpYWxpemUgdGhlIGJsb2NrIGludG8gYSBwbGFpbiBvYmplY3QuXG4gICAqIENhbiBiZSBvdmVyd3JpdHRlbiwgYWx0aG91Z2ggaG9wZWZ1bGx5IHRoaXMgd2lsbCBjb3ZlciBtb3N0IHNpdHVhdGlvbnMuXG4gICAqIElmIHlvdSB3YW50IHRvIGdldCB0aGUgZGF0YSBvZiB5b3VyIGJsb2NrIHVzZSBibG9jay5nZXRCbG9ja0RhdGEoKVxuICAgKi9cbiAgX3NlcmlhbGl6ZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcInRvRGF0YSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQpO1xuXG4gICAgdmFyIGRhdGEgPSB7fTtcblxuICAgIC8qIFNpbXBsZSB0byBzdGFydC4gQWRkIGNvbmRpdGlvbnMgbGF0ZXIgKi9cbiAgICBpZiAodGhpcy5oYXNUZXh0QmxvY2soKSkge1xuICAgICAgZGF0YS50ZXh0ID0gdGhpcy5nZXRUZXh0QmxvY2tIVE1MKCk7XG4gICAgICBpZiAoZGF0YS50ZXh0Lmxlbmd0aCA+IDAgJiYgdGhpcy5vcHRpb25zLmNvbnZlcnRUb01hcmtkb3duKSB7XG4gICAgICAgIGRhdGEudGV4dCA9IHN0VG9NYXJrZG93bihkYXRhLnRleHQsIHRoaXMudHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGFueSBpbnB1dHMgdG8gdGhlIGRhdGEgYXR0clxuICAgIGlmICh0aGlzLiQoJzppbnB1dCcpLm5vdCgnLnN0LXBhc3RlLWJsb2NrJykubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kKCc6aW5wdXQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LGlucHV0KXtcbiAgICAgICAgaWYgKGlucHV0LmdldEF0dHJpYnV0ZSgnbmFtZScpKSB7XG4gICAgICAgICAgZGF0YVtpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgLyogR2VuZXJpYyBpbXBsZW1lbnRhdGlvbiB0byB0ZWxsIHVzIHdoZW4gdGhlIGJsb2NrIGlzIGFjdGl2ZSAqL1xuICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5mb2N1cygpO1xuICB9LFxuXG4gIGJsdXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmx1cigpO1xuICB9LFxuXG4gIG9uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmluZCgnZm9jdXMnLCB0aGlzLl9vbkZvY3VzKTtcbiAgfSxcblxuICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmluZCgnYmx1cicsIHRoaXMuX29uQmx1cik7XG4gIH0sXG5cbiAgLypcbiAgICogRXZlbnQgaGFuZGxlcnNcbiAgICovXG5cbiAgX29uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJpZ2dlcignYmxvY2tGb2N1cycsIHRoaXMuJGVsKTtcbiAgfSxcblxuICBfb25CbHVyOiBmdW5jdGlvbigpIHt9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZm9jdXMoKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKGRhdGFUcmFuc2Zlck9iaikge30sXG5cbiAgb25EZWxldGVDbGljazogZnVuY3Rpb24oZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIG9uRGVsZXRlQ29uZmlybSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6cmVtb3ZlJywgdGhpcy5ibG9ja0lEKTtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIHZhciBvbkRlbGV0ZURlbnkgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtYmxvY2stLWRlbGV0ZS1hY3RpdmUnKTtcbiAgICAgICRkZWxldGVfZWwucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgb25EZWxldGVDb25maXJtLmNhbGwodGhpcywgbmV3IEV2ZW50KCdjbGljaycpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLiRpbm5lci5hcHBlbmQoXy50ZW1wbGF0ZShkZWxldGVfdGVtcGxhdGUpKTtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcygnc3QtYmxvY2stLWRlbGV0ZS1hY3RpdmUnKTtcblxuICAgIHZhciAkZGVsZXRlX2VsID0gdGhpcy4kaW5uZXIuZmluZCgnLnN0LWJsb2NrX191aS1kZWxldGUtY29udHJvbHMnKTtcblxuICAgIHRoaXMuJGlubmVyLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1jb25maXJtLWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgb25EZWxldGVDb25maXJtLmJpbmQodGhpcykpXG4gICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1kZW55LWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlRGVueS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBiZWZvcmVMb2FkaW5nRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkaW5nKCk7XG5cbiAgICBpZih0aGlzLmRyb3BwYWJsZSB8fCB0aGlzLnVwbG9hZGFibGUgfHwgdGhpcy5wYXN0YWJsZSkge1xuICAgICAgdGhpcy4kZWRpdG9yLnNob3coKTtcbiAgICAgIHRoaXMuJGlucHV0cy5oaWRlKCk7XG4gICAgfVxuXG4gICAgU2ltcGxlQmxvY2suZm4uYmVmb3JlTG9hZGluZ0RhdGEuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMucmVhZHkoKTtcbiAgfSxcblxuICBfaGFuZGxlQ29udGVudFBhc3RlOiBmdW5jdGlvbihldikge1xuICAgIHNldFRpbWVvdXQodGhpcy5vbkNvbnRlbnRQYXN0ZWQuYmluZCh0aGlzLCBldiwgJChldi5jdXJyZW50VGFyZ2V0KSksIDApO1xuICB9LFxuXG4gIF9nZXRCbG9ja0NsYXNzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3N0LWJsb2NrLS0nICsgdGhpcy5jbGFzc05hbWU7XG4gIH0sXG5cbiAgLypcbiAgICogSW5pdCBmdW5jdGlvbnMgZm9yIGFkZGluZyBmdW5jdGlvbmFsaXR5XG4gICAqL1xuXG4gIF9pbml0VUlDb21wb25lbnRzOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwb3NpdGlvbmVyID0gbmV3IEJsb2NrUG9zaXRpb25lcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICB0aGlzLl93aXRoVUlDb21wb25lbnQocG9zaXRpb25lciwgJy5zdC1ibG9jay11aS1idG4tLXJlb3JkZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbmVyLnRvZ2dsZSk7XG5cbiAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrUmVvcmRlcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcikpO1xuXG4gICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KG5ldyBCbG9ja0RlbGV0aW9uKCksICcuc3QtYmxvY2stdWktYnRuLS1kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRGVsZXRlQ2xpY2spO1xuXG4gICAgdGhpcy5vbkZvY3VzKCk7XG4gICAgdGhpcy5vbkJsdXIoKTtcbiAgfSxcblxuICBfaW5pdEZvcm1hdHRpbmc6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEVuYWJsZSBmb3JtYXR0aW5nIGtleWJvYXJkIGlucHV0XG4gICAgdmFyIGZvcm1hdHRlcjtcbiAgICBmb3IgKHZhciBuYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGZvcm1hdHRlciA9IEZvcm1hdHRlcnNbbmFtZV07XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXR0ZXIua2V5Q29kZSkpIHtcbiAgICAgICAgICBmb3JtYXR0ZXIuX2JpbmRUb0Jsb2NrKHRoaXMuJGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBfaW5pdFRleHRCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKClcbiAgICAgICAgLmJpbmQoJ2tleXVwJywgdGhpcy5nZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXIpXG4gICAgICAgIC5iaW5kKCdtb3VzZXVwJywgdGhpcy5nZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXIpXG4gICAgICAgIC5iaW5kKCdET01Ob2RlSW5zZXJ0ZWQnLCB0aGlzLmNsZWFySW5zZXJ0ZWRTdHlsZXMpO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQodGhpcy5fc2NyaWJlKSkge1xuICAgICAgdGhpcy5fc2NyaWJlID0gbmV3IFNjcmliZSh0aGlzLmdldFRleHRCbG9jaygpLmdldCgwKSwge1xuICAgICAgICBkZWJ1ZzogY29uZmlnLnNjcmliZURlYnVnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zY3JpYmUudXNlKHNjcmliZVBsdWdpbkZvcm1hdHRlclBsYWluVGV4dENvbnZlcnROZXdMaW5lc1RvSFRNTCgpKTtcblxuICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMuY29uZmlndXJlU2NyaWJlKSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMuY29uZmlndXJlU2NyaWJlLmNhbGwodGhpcywgdGhpcy5fc2NyaWJlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYmxvY2sgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgICAgICAgIHNlbGVjdGlvblN0ciA9IHNlbGVjdGlvbi50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgICAgICBlbiA9ICdmb3JtYXR0ZXI6JyArICgoc2VsZWN0aW9uU3RyID09PSAnJykgPyAnaGlkZScgOiAncG9zaXRpb24nKTtcblxuICAgICAgYmxvY2subWVkaWF0b3IudHJpZ2dlcihlbiwgYmxvY2spO1xuICAgICAgRXZlbnRCdXMudHJpZ2dlcihlbiwgYmxvY2spO1xuICAgIH0sIDEpO1xuICB9LFxuXG4gIGNsZWFySW5zZXJ0ZWRTdHlsZXM6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgLy8gSGFja3kgZml4IGZvciBDaHJvbWUuXG4gIH0sXG5cbiAgaGFzVGV4dEJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0QmxvY2soKS5sZW5ndGggPiAwO1xuICB9LFxuXG4gIGdldFRleHRCbG9jazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQodGhpcy50ZXh0X2Jsb2NrKSkge1xuICAgICAgdGhpcy50ZXh0X2Jsb2NrID0gdGhpcy4kKCcuc3QtdGV4dC1ibG9jaycpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRleHRfYmxvY2s7XG4gIH0sXG5cbiAgZ2V0VGV4dEJsb2NrSFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NjcmliZS5nZXRIVE1MKCk7XG4gIH0sXG5cbiAgc2V0VGV4dEJsb2NrSFRNTDogZnVuY3Rpb24oaHRtbCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JpYmUuc2V0Q29udGVudChodG1sKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5pc0VtcHR5KHRoaXMuZ2V0QmxvY2tEYXRhKCkpO1xuICB9XG5cbn0pO1xuXG5CbG9jay5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7IC8vIEFsbG93IG91ciBCbG9jayB0byBiZSBleHRlbmRlZC5cblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jaztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiQWpheGFibGVcIixcblxuICBhamF4YWJsZTogdHJ1ZSxcblxuICBpbml0aWFsaXplQWpheGFibGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5fcXVldWVkID0gW107XG4gIH0sXG5cbiAgYWRkUXVldWVkSXRlbTogZnVuY3Rpb24obmFtZSwgZGVmZXJyZWQpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgcXVldWVkIGl0ZW0gZm9yIFwiICsgdGhpcy5ibG9ja0lEICsgXCIgY2FsbGVkIFwiICsgbmFtZSk7XG5cbiAgICB0aGlzLl9xdWV1ZWQucHVzaCh7IG5hbWU6IG5hbWUsIGRlZmVycmVkOiBkZWZlcnJlZCB9KTtcbiAgfSxcblxuICByZW1vdmVRdWV1ZWRJdGVtOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdXRpbHMubG9nKFwiUmVtb3ZpbmcgcXVldWVkIGl0ZW0gZm9yIFwiICsgdGhpcy5ibG9ja0lEICsgXCIgY2FsbGVkIFwiICsgbmFtZSk7XG5cbiAgICB0aGlzLl9xdWV1ZWQgPSB0aGlzLl9xdWV1ZWQuZmlsdGVyKGZ1bmN0aW9uKHF1ZXVlZCkge1xuICAgICAgcmV0dXJuIHF1ZXVlZC5uYW1lICE9PSBuYW1lO1xuICAgIH0pO1xuICB9LFxuXG4gIGhhc0l0ZW1zSW5RdWV1ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlZC5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlc29sdmVBbGxJblF1ZXVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9xdWV1ZWQuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgIHV0aWxzLmxvZyhcIkFib3J0aW5nIHF1ZXVlZCByZXF1ZXN0OiBcIiArIGl0ZW0ubmFtZSk7XG4gICAgICBpdGVtLmRlZmVycmVkLmFib3J0KCk7XG4gICAgfSwgdGhpcyk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiQ29udHJvbGxhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZUNvbnRyb2xsYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIGNvbnRyb2xsYWJsZSB0byBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgdGhpcy4kY29udHJvbF91aSA9ICQoJzxkaXY+JywgeydjbGFzcyc6ICdzdC1ibG9ja19fY29udHJvbC11aSd9KTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmNvbnRyb2xzKS5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24oY21kKSB7XG4gICAgICAgIC8vIEJpbmQgY29uZmlndXJlZCBoYW5kbGVyIHRvIGN1cnJlbnQgYmxvY2sgY29udGV4dFxuICAgICAgICB0aGlzLmFkZFVpQ29udHJvbChjbWQsIHRoaXMuY29udHJvbHNbY21kXS5iaW5kKHRoaXMpKTtcbiAgICAgIH0sXG4gICAgICB0aGlzXG4gICAgKTtcbiAgICB0aGlzLiRpbm5lci5hcHBlbmQodGhpcy4kY29udHJvbF91aSk7XG4gIH0sXG5cbiAgZ2V0Q29udHJvbFRlbXBsYXRlOiBmdW5jdGlvbihjbWQpIHtcbiAgICByZXR1cm4gJChcIjxhPlwiLFxuICAgICAgeyAnZGF0YS1pY29uJzogY21kLFxuICAgICAgICAnY2xhc3MnOiAnc3QtaWNvbiBzdC1ibG9jay1jb250cm9sLXVpLWJ0biBzdC1ibG9jay1jb250cm9sLXVpLWJ0bi0tJyArIGNtZFxuICAgICAgfSk7XG4gIH0sXG5cbiAgYWRkVWlDb250cm9sOiBmdW5jdGlvbihjbWQsIGhhbmRsZXIpIHtcbiAgICB0aGlzLiRjb250cm9sX3VpLmFwcGVuZCh0aGlzLmdldENvbnRyb2xUZW1wbGF0ZShjbWQpKTtcbiAgICB0aGlzLiRjb250cm9sX3VpLm9uKCdjbGljaycsICcuc3QtYmxvY2stY29udHJvbC11aS1idG4tLScgKyBjbWQsIGhhbmRsZXIpO1xuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIEFkZHMgZHJvcCBmdW5jdGlvbmFsdGl5IHRvIHRoaXMgYmxvY2sgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4uL2V2ZW50LWJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiRHJvcHBhYmxlXCIsXG4gIHZhbGlkX2Ryb3BfZmlsZV90eXBlczogWydGaWxlJywgJ0ZpbGVzJywgJ3RleHQvcGxhaW4nLCAndGV4dC91cmktbGlzdCddLFxuXG4gIGluaXRpYWxpemVEcm9wcGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBkcm9wcGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuXG4gICAgdGhpcy5kcm9wX29wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBjb25maWcuZGVmYXVsdHMuQmxvY2suZHJvcF9vcHRpb25zLCB0aGlzLmRyb3Bfb3B0aW9ucyk7XG5cbiAgICB2YXIgZHJvcF9odG1sID0gJChfLnRlbXBsYXRlKHRoaXMuZHJvcF9vcHRpb25zLmh0bWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGJsb2NrOiB0aGlzLCBfOiBfIH0pKTtcblxuICAgIHRoaXMuJGVkaXRvci5oaWRlKCk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChkcm9wX2h0bWwpO1xuICAgIHRoaXMuJGRyb3B6b25lID0gZHJvcF9odG1sO1xuXG4gICAgLy8gQmluZCBvdXIgZHJvcCBldmVudFxuICAgIHRoaXMuJGRyb3B6b25lLmRyb3BBcmVhKClcbiAgICAgICAgICAgICAgICAgIC5iaW5kKCdkcm9wJywgdGhpcy5faGFuZGxlRHJvcC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuJGlubmVyLmFkZENsYXNzKCdzdC1ibG9ja19faW5uZXItLWRyb3BwYWJsZScpO1xuICB9LFxuXG4gIF9oYW5kbGVEcm9wOiBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgZSA9IGUub3JpZ2luYWxFdmVudDtcblxuICAgIHZhciBlbCA9ICQoZS50YXJnZXQpLFxuICAgICAgICB0eXBlcyA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzO1xuXG4gICAgZWwucmVtb3ZlQ2xhc3MoJ3N0LWRyb3B6b25lLS1kcmFnb3ZlcicpO1xuXG4gICAgLypcbiAgICAgIENoZWNrIHRoZSB0eXBlIHdlIGp1c3QgcmVjZWl2ZWQsXG4gICAgICBkZWxlZ2F0ZSBpdCBhd2F5IHRvIG91ciBibG9ja1R5cGVzIHRvIHByb2Nlc3NcbiAgICAqL1xuXG4gICAgaWYgKHR5cGVzICYmXG4gICAgICAgIHR5cGVzLnNvbWUoZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRfZHJvcF9maWxlX3R5cGVzLmluY2x1ZGVzKHR5cGUpO1xuICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKSB7XG4gICAgICB0aGlzLm9uRHJvcChlLmRhdGFUcmFuc2Zlcik7XG4gICAgfVxuXG4gICAgRXZlbnRCdXMudHJpZ2dlcignYmxvY2s6Y29udGVudDpkcm9wcGVkJywgdGhpcy5ibG9ja0lEKTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJGZXRjaGFibGVcIixcblxuICBpbml0aWFsaXplRmV0Y2hhYmxlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMud2l0aE1peGluKHJlcXVpcmUoJy4vYWpheGFibGUnKSk7XG4gIH0sXG5cbiAgZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMsIHN1Y2Nlc3MsIGZhaWx1cmUpe1xuICAgIHZhciB1aWQgPSBfLnVuaXF1ZUlkKHRoaXMuYmxvY2tJRCArIFwiX2ZldGNoXCIpLFxuICAgICAgICB4aHIgPSAkLmFqYXgob3B0aW9ucyk7XG5cbiAgICB0aGlzLnJlc2V0TWVzc2FnZXMoKTtcbiAgICB0aGlzLmFkZFF1ZXVlZEl0ZW0odWlkLCB4aHIpO1xuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQoc3VjY2VzcykpIHtcbiAgICAgIHhoci5kb25lKHN1Y2Nlc3MuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQoZmFpbHVyZSkpIHtcbiAgICAgIHhoci5mYWlsKGZhaWx1cmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgeGhyLmFsd2F5cyh0aGlzLnJlbW92ZVF1ZXVlZEl0ZW0uYmluZCh0aGlzLCB1aWQpKTtcblxuICAgIHJldHVybiB4aHI7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQWpheGFibGU6IHJlcXVpcmUoJy4vYWpheGFibGUuanMnKSxcbiAgQ29udHJvbGxhYmxlOiByZXF1aXJlKCcuL2NvbnRyb2xsYWJsZS5qcycpLFxuICBEcm9wcGFibGU6IHJlcXVpcmUoJy4vZHJvcHBhYmxlLmpzJyksXG4gIEZldGNoYWJsZTogcmVxdWlyZSgnLi9mZXRjaGFibGUuanMnKSxcbiAgUGFzdGFibGU6IHJlcXVpcmUoJy4vcGFzdGFibGUuanMnKSxcbiAgVXBsb2FkYWJsZTogcmVxdWlyZSgnLi91cGxvYWRhYmxlLmpzJyksXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiUGFzdGFibGVcIixcblxuICBpbml0aWFsaXplUGFzdGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBwYXN0YWJsZSB0byBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG5cbiAgICB0aGlzLnBhc3RlX29wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sIGNvbmZpZy5kZWZhdWx0cy5ibG9jay5wYXN0ZU9wdGlvbnMsIHRoaXMucGFzdGVfb3B0aW9ucyk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChfLnRlbXBsYXRlKHRoaXMucGFzdGVfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG5cbiAgICB0aGlzLiQoJy5zdC1wYXN0ZS1ibG9jaycpXG4gICAgICAuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpeyAkKHRoaXMpLnNlbGVjdCgpOyB9KVxuICAgICAgLmJpbmQoJ3Bhc3RlJywgdGhpcy5faGFuZGxlQ29udGVudFBhc3RlKVxuICAgICAgLmJpbmQoJ3N1Ym1pdCcsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGZpbGVVcGxvYWRlciA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiVXBsb2FkYWJsZVwiLFxuXG4gIHVwbG9hZHNDb3VudDogMCxcblxuICBpbml0aWFsaXplVXBsb2FkYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHVwbG9hZGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMud2l0aE1peGluKHJlcXVpcmUoJy4vYWpheGFibGUnKSk7XG5cbiAgICB0aGlzLnVwbG9hZF9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLnVwbG9hZF9vcHRpb25zLCB0aGlzLnVwbG9hZF9vcHRpb25zKTtcbiAgICB0aGlzLiRpbnB1dHMuYXBwZW5kKF8udGVtcGxhdGUodGhpcy51cGxvYWRfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG4gIH0sXG5cbiAgdXBsb2FkZXI6IGZ1bmN0aW9uKGZpbGUsIHN1Y2Nlc3MsIGZhaWx1cmUpe1xuICAgIHJldHVybiBmaWxlVXBsb2FkZXIodGhpcywgZmlsZSwgc3VjY2VzcywgZmFpbHVyZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBIZWFkaW5nIEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogJ0hlYWRpbmcnLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6aGVhZGluZzp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9jayBzdC10ZXh0LWJsb2NrLS1oZWFkaW5nXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiPjwvZGl2PicsXG5cbiAgaWNvbl9uYW1lOiAnaGVhZGluZycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuaHRtbChzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJpbWFnZVwiLFxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczppbWFnZTp0aXRsZScpOyB9LFxuXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgdXBsb2FkYWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICdpbWFnZScsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIC8vIENyZWF0ZSBvdXIgaW1hZ2UgdGFnXG4gICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogZGF0YS5maWxlLnVybCB9KSk7XG4gIH0sXG5cbiAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAvKiBTZXR1cCB0aGUgdXBsb2FkIGJ1dHRvbiAqL1xuICAgIHRoaXMuJGlucHV0cy5maW5kKCdidXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2KXsgZXYucHJldmVudERlZmF1bHQoKTsgfSk7XG4gICAgdGhpcy4kaW5wdXRzLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIChmdW5jdGlvbihldikge1xuICAgICAgdGhpcy5vbkRyb3AoZXYuY3VycmVudFRhcmdldCk7XG4gICAgfSkuYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciBmaWxlID0gdHJhbnNmZXJEYXRhLmZpbGVzWzBdLFxuICAgICAgICB1cmxBUEkgPSAodHlwZW9mIFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyBVUkwgOiAodHlwZW9mIHdlYmtpdFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyB3ZWJraXRVUkwgOiBudWxsO1xuXG4gICAgLy8gSGFuZGxlIG9uZSB1cGxvYWQgYXQgYSB0aW1lXG4gICAgaWYgKC9pbWFnZS8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIC8vIFNob3cgdGhpcyBpbWFnZSBvbiBoZXJlXG4gICAgICB0aGlzLiRpbnB1dHMuaGlkZSgpO1xuICAgICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogdXJsQVBJLmNyZWF0ZU9iamVjdFVSTChmaWxlKSB9KSkuc2hvdygpO1xuXG4gICAgICB0aGlzLnVwbG9hZGVyKFxuICAgICAgICBmaWxlLFxuICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KCdibG9ja3M6aW1hZ2U6dXBsb2FkX2Vycm9yJykpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXh0OiByZXF1aXJlKCcuL3RleHQnKSxcbiAgUXVvdGU6IHJlcXVpcmUoJy4vcXVvdGUnKSxcbiAgSW1hZ2U6IHJlcXVpcmUoJy4vaW1hZ2UnKSxcbiAgSGVhZGluZzogcmVxdWlyZSgnLi9oZWFkaW5nJyksXG4gIExpc3Q6IHJlcXVpcmUoJy4vbGlzdCcpLFxuICBUd2VldDogcmVxdWlyZSgnLi90d2VldCcpLFxuICBWaWRlbzogcmVxdWlyZSgnLi92aWRlbycpLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cInN0LXRleHQtYmxvY2sgc3QtcmVxdWlyZWRcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PHVsPjxsaT48L2xpPjwvdWw+PC9kaXY+JztcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6ICdsaXN0JyxcblxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczpsaXN0OnRpdGxlJyk7IH0sXG5cbiAgaWNvbl9uYW1lOiAnbGlzdCcsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udGVtcGxhdGUodGVtcGxhdGUsIHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLnNldFRleHRCbG9ja0hUTUwoXCI8dWw+XCIgKyBzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkgKyBcIjwvdWw+XCIpO1xuICB9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2hlY2tGb3JMaXN0ID0gdGhpcy5jaGVja0Zvckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLm9uKCdjbGljayBrZXl1cCcsIHRoaXMuY2hlY2tGb3JMaXN0KTtcbiAgICB0aGlzLmZvY3VzKCk7XG4gIH0sXG5cbiAgY2hlY2tGb3JMaXN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kKCd1bCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRVbm9yZGVyZWRMaXN0XCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duLnJlcGxhY2UoLzxcXC9saT4vbWcsXCJcXG5cIilcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14oLispJC9tZyxcIiAtICQxXCIpO1xuICB9LFxuXG4gIHRvSFRNTDogZnVuY3Rpb24oaHRtbCkge1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL14gLSAoLispJC9tZyxcIjxsaT4kMTwvbGk+XCIpXG4gICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL21nLCBcIlwiKTtcblxuICAgIHJldHVybiBodG1sO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQsIHRhcmdldCkge1xuICAgIHRoaXMuJCgndWwnKS5odG1sKFxuICAgICAgdGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5jYXJldFRvRW5kKCk7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uaXNFbXB0eSh0aGlzLmdldEJsb2NrRGF0YSgpLnRleHQpO1xuICB9XG5cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIEJsb2NrIFF1b3RlXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgJzxibG9ja3F1b3RlIGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Jsb2NrcXVvdGU+JyxcbiAgJzxsYWJlbCBjbGFzcz1cInN0LWlucHV0LWxhYmVsXCI+IDwlPSBpMThuLnQoXCJibG9ja3M6cXVvdGU6Y3JlZGl0X2ZpZWxkXCIpICU+PC9sYWJlbD4nLFxuICAnPGlucHV0IG1heGxlbmd0aD1cIjE0MFwiIG5hbWU9XCJjaXRlXCIgcGxhY2Vob2xkZXI9XCI8JT0gaTE4bi50KFwiYmxvY2tzOnF1b3RlOmNyZWRpdF9maWVsZFwiKSAlPlwiJyxcbiAgJyBjbGFzcz1cInN0LWlucHV0LXN0cmluZyBzdC1yZXF1aXJlZCBqcy1jaXRlLWlucHV0XCIgdHlwZT1cInRleHRcIiAvPidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInF1b3RlXCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6cXVvdGU6dGl0bGUnKTsgfSxcblxuICBpY29uX25hbWU6ICdxdW90ZScsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRlbXBsYXRlKHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgICB0aGlzLiQoJy5qcy1jaXRlLWlucHV0JykudmFsKGRhdGEuY2l0ZSk7XG4gIH0sXG5cbiAgdG9NYXJrZG93bjogZnVuY3Rpb24obWFya2Rvd24pIHtcbiAgICByZXR1cm4gbWFya2Rvd24ucmVwbGFjZSgvXiguKykkL21nLFwiPiAkMVwiKTtcbiAgfVxuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBUZXh0IEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJ0ZXh0XCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dGV4dDp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Rpdj4nLFxuXG4gIGljb25fbmFtZTogJ3RleHQnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgfSxcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG52YXIgdHdlZXRfdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgXCI8YmxvY2txdW90ZSBjbGFzcz0ndHdpdHRlci10d2VldCcgYWxpZ249J2NlbnRlcic+XCIsXG4gIFwiPHA+PCU9IHRleHQgJT48L3A+XCIsXG4gIFwiJm1kYXNoOyA8JT0gdXNlci5uYW1lICU+IChAPCU9IHVzZXIuc2NyZWVuX25hbWUgJT4pXCIsXG4gIFwiPGEgaHJlZj0nPCU9IHN0YXR1c191cmwgJT4nIGRhdGEtZGF0ZXRpbWU9JzwlPSBjcmVhdGVkX2F0ICU+Jz48JT0gY3JlYXRlZF9hdCAlPjwvYT5cIixcbiAgXCI8L2Jsb2NrcXVvdGU+XCIsXG4gICc8c2NyaXB0IHNyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy5qc1wiIGNoYXJzZXQ9XCJ1dGYtOFwiPjwvc2NyaXB0Pidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInR3ZWV0XCIsXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgcGFzdGFibGU6IHRydWUsXG4gIGZldGNoYWJsZTogdHJ1ZSxcblxuICBkcm9wX29wdGlvbnM6IHtcbiAgICByZV9yZW5kZXJfb25fcmVvcmRlcjogdHJ1ZVxuICB9LFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dHdlZXQ6dGl0bGUnKTsgfSxcblxuICBmZXRjaFVybDogZnVuY3Rpb24odHdlZXRJRCkge1xuICAgIHJldHVybiBcIi90d2VldHMvP3R3ZWV0X2lkPVwiICsgdHdlZXRJRDtcbiAgfSxcblxuICBpY29uX25hbWU6ICd0d2l0dGVyJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRhdGEuc3RhdHVzX3VybCkpIHsgZGF0YS5zdGF0dXNfdXJsID0gJyc7IH1cbiAgICB0aGlzLiRpbm5lci5maW5kKCdpZnJhbWUnKS5yZW1vdmUoKTtcbiAgICB0aGlzLiRpbm5lci5wcmVwZW5kKHR3ZWV0X3RlbXBsYXRlKGRhdGEpKTtcbiAgfSxcblxuICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBDb250ZW50IHBhc3RlZC4gRGVsZWdhdGUgdG8gdGhlIGRyb3AgcGFyc2UgbWV0aG9kXG4gICAgdmFyIGlucHV0ID0gJChldmVudC50YXJnZXQpLFxuICAgIHZhbCA9IGlucHV0LnZhbCgpO1xuXG4gICAgLy8gUGFzcyB0aGlzIHRvIHRoZSBzYW1lIGhhbmRsZXIgYXMgb25Ecm9wXG4gICAgdGhpcy5oYW5kbGVUd2l0dGVyRHJvcFBhc3RlKHZhbCk7XG4gIH0sXG5cbiAgaGFuZGxlVHdpdHRlckRyb3BQYXN0ZTogZnVuY3Rpb24odXJsKXtcbiAgICBpZiAoIXRoaXMudmFsaWRUd2VldFVybCh1cmwpKSB7XG4gICAgICB1dGlscy5sb2coXCJJbnZhbGlkIFR3ZWV0IFVSTFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUd2l0dGVyIHN0YXR1c1xuICAgIHZhciB0d2VldElEID0gdXJsLm1hdGNoKC9bXlxcL10rJC8pO1xuICAgIGlmICghXy5pc0VtcHR5KHR3ZWV0SUQpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIHR3ZWV0SUQgPSB0d2VldElEWzBdO1xuXG4gICAgICB2YXIgYWpheE9wdGlvbnMgPSB7XG4gICAgICAgIHVybDogdGhpcy5mZXRjaFVybCh0d2VldElEKSxcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZldGNoKGFqYXhPcHRpb25zLCB0aGlzLm9uVHdlZXRTdWNjZXNzLCB0aGlzLm9uVHdlZXRGYWlsKTtcbiAgICB9XG4gIH0sXG5cbiAgdmFsaWRUd2VldFVybDogZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuICh1dGlscy5pc1VSSSh1cmwpICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInR3aXR0ZXJcIikgIT09IC0xICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInN0YXR1c1wiKSAhPT0gLTEpO1xuICB9LFxuXG4gIG9uVHdlZXRTdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gUGFyc2UgdGhlIHR3aXR0ZXIgb2JqZWN0IGludG8gc29tZXRoaW5nIGEgYml0IHNsaW1tZXIuLlxuICAgIHZhciBvYmogPSB7XG4gICAgICB1c2VyOiB7XG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmwsXG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsX2h0dHBzOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmxfaHR0cHMsXG4gICAgICAgIHNjcmVlbl9uYW1lOiBkYXRhLnVzZXIuc2NyZWVuX25hbWUsXG4gICAgICAgIG5hbWU6IGRhdGEudXNlci5uYW1lXG4gICAgICB9LFxuICAgICAgaWQ6IGRhdGEuaWRfc3RyLFxuICAgICAgdGV4dDogZGF0YS50ZXh0LFxuICAgICAgY3JlYXRlZF9hdDogZGF0YS5jcmVhdGVkX2F0LFxuICAgICAgZW50aXRpZXM6IGRhdGEuZW50aXRpZXMsXG4gICAgICBzdGF0dXNfdXJsOiBcImh0dHBzOi8vdHdpdHRlci5jb20vXCIgKyBkYXRhLnVzZXIuc2NyZWVuX25hbWUgKyBcIi9zdGF0dXMvXCIgKyBkYXRhLmlkX3N0clxuICAgIH07XG5cbiAgICB0aGlzLnNldEFuZExvYWREYXRhKG9iaik7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9LFxuXG4gIG9uVHdlZXRGYWlsOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KFwiYmxvY2tzOnR3ZWV0OmZldGNoX2Vycm9yXCIpKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciB1cmwgPSB0cmFuc2ZlckRhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgIHRoaXMuaGFuZGxlVHdpdHRlckRyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIC8vIG1vcmUgcHJvdmlkZXJzIGF0IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZmZsaW5nL2E5NjI5YWUyOGUwNzY3ODVhMTRmXG4gIHByb3ZpZGVyczoge1xuICAgIHZpbWVvOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/dmltZW8uY29tXFwvKC4rKS8sXG4gICAgICBodG1sOiBcIjxpZnJhbWUgc3JjPVxcXCJ7e3Byb3RvY29sfX0vL3BsYXllci52aW1lby5jb20vdmlkZW8ve3tyZW1vdGVfaWR9fT90aXRsZT0wJmJ5bGluZT0wXFxcIiB3aWR0aD1cXFwiNTgwXFxcIiBoZWlnaHQ9XFxcIjMyMFxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiPjwvaWZyYW1lPlwiXG4gICAgfSxcbiAgICB5b3V0dWJlOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/KD86KD86eW91dHViZS5jb21cXC93YXRjaFxcPyg/Oi4qKSg/OnY9KSl8KD86eW91dHUuYmVcXC8pKShbXiZdLispLyxcbiAgICAgIGh0bWw6IFwiPGlmcmFtZSBzcmM9XFxcInt7cHJvdG9jb2x9fS8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3t7cmVtb3RlX2lkfX1cXFwiIHdpZHRoPVxcXCI1ODBcXFwiIGhlaWdodD1cXFwiMzIwXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlwiXG4gICAgfVxuICB9LFxuXG4gIHR5cGU6ICd2aWRlbycsXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnZpZGVvOnRpdGxlJyk7IH0sXG5cbiAgZHJvcHBhYmxlOiB0cnVlLFxuICBwYXN0YWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICd2aWRlbycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIGlmICghdGhpcy5wcm92aWRlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5zb3VyY2UpKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKHRoaXMucHJvdmlkZXJzW2RhdGEuc291cmNlXS5zcXVhcmUpIHtcbiAgICAgIHRoaXMuJGVkaXRvci5hZGRDbGFzcygnc3QtYmxvY2tfX2VkaXRvci0td2l0aC1zcXVhcmUtbWVkaWEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kZWRpdG9yLmFkZENsYXNzKCdzdC1ibG9ja19fZWRpdG9yLS13aXRoLXNpeHRlZW4tYnktbmluZS1tZWRpYScpO1xuICAgIH1cblxuICAgIHZhciBlbWJlZF9zdHJpbmcgPSB0aGlzLnByb3ZpZGVyc1tkYXRhLnNvdXJjZV0uaHRtbFxuICAgIC5yZXBsYWNlKCd7e3Byb3RvY29sfX0nLCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wpXG4gICAgLnJlcGxhY2UoJ3t7cmVtb3RlX2lkfX0nLCBkYXRhLnJlbW90ZV9pZClcbiAgICAucmVwbGFjZSgne3t3aWR0aH19JywgdGhpcy4kZWRpdG9yLndpZHRoKCkpOyAvLyBmb3IgdmlkZW9zIHRoYXQgY2FuJ3QgcmVzaXplIGF1dG9tYXRpY2FsbHkgbGlrZSB2aW5lXG5cbiAgICB0aGlzLiRlZGl0b3IuaHRtbChlbWJlZF9zdHJpbmcpO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgIHRoaXMuaGFuZGxlRHJvcFBhc3RlKCQoZXZlbnQudGFyZ2V0KS52YWwoKSk7XG4gIH0sXG5cbiAgaGFuZGxlRHJvcFBhc3RlOiBmdW5jdGlvbih1cmwpe1xuICAgIGlmKCF1dGlscy5pc1VSSSh1cmwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoLCBkYXRhO1xuXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlciwgaW5kZXgpIHtcbiAgICAgIG1hdGNoID0gcHJvdmlkZXIucmVnZXguZXhlYyh1cmwpO1xuXG4gICAgICBpZihtYXRjaCAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaFsxXSkpIHtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICBzb3VyY2U6IGluZGV4LFxuICAgICAgICAgIHJlbW90ZV9pZDogbWF0Y2hbMV1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldEFuZExvYWREYXRhKGRhdGEpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24odHJhbnNmZXJEYXRhKXtcbiAgICB2YXIgdXJsID0gdHJhbnNmZXJEYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICB0aGlzLmhhbmRsZURyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZmFsc2UsXG4gIHNjcmliZURlYnVnOiBmYWxzZSxcbiAgc2tpcFZhbGlkYXRpb246IGZhbHNlLFxuICB2ZXJzaW9uOiBcIjAuNC4wXCIsXG4gIGxhbmd1YWdlOiBcImVuXCIsXG5cbiAgaW5zdGFuY2VzOiBbXSxcblxuICBkZWZhdWx0czoge1xuICAgIGRlZmF1bHRUeXBlOiBmYWxzZSxcbiAgICBzcGlubmVyOiB7XG4gICAgICBjbGFzc05hbWU6ICdzdC1zcGlubmVyJyxcbiAgICAgIGxpbmVzOiA5LFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgd2lkdGg6IDMsXG4gICAgICByYWRpdXM6IDYsXG4gICAgICBjb2xvcjogJyMwMDAnLFxuICAgICAgc3BlZWQ6IDEuNCxcbiAgICAgIHRyYWlsOiA1NyxcbiAgICAgIHNoYWRvdzogZmFsc2UsXG4gICAgICBsZWZ0OiAnNTAlJyxcbiAgICAgIHRvcDogJzUwJSdcbiAgICB9LFxuICAgIGJsb2NrTGltaXQ6IDAsXG4gICAgYmxvY2tUeXBlTGltaXRzOiB7fSxcbiAgICByZXF1aXJlZDogW10sXG4gICAgdXBsb2FkVXJsOiAnL2F0dGFjaG1lbnRzJyxcbiAgICBiYXNlSW1hZ2VVcmw6ICcvc2lyLXRyZXZvci11cGxvYWRzLycsXG4gICAgZXJyb3JzQ29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgY29udmVydFRvTWFya2Rvd246IGZhbHNlLFxuICAgIGNvbnZlcnRGcm9tTWFya2Rvd246IHRydWUsXG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpciBUcmV2b3IgRWRpdG9yXG4gKiAtLVxuICogUmVwcmVzZW50cyBvbmUgU2lyIFRyZXZvciBlZGl0b3IgaW5zdGFuY2UgKHdpdGggbXVsdGlwbGUgYmxvY2tzKVxuICogRWFjaCBibG9jayByZWZlcmVuY2VzIHRoaXMgaW5zdGFuY2UuXG4gKiBCbG9ja1R5cGVzIGFyZSBnbG9iYWwgaG93ZXZlci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIEZvcm1FdmVudHMgPSByZXF1aXJlKCcuL2Zvcm0tZXZlbnRzJyk7XG52YXIgQmxvY2tDb250cm9scyA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbHMnKTtcbnZhciBCbG9ja01hbmFnZXIgPSByZXF1aXJlKCcuL2Jsb2NrLW1hbmFnZXInKTtcbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSByZXF1aXJlKCcuL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzJyk7XG52YXIgRm9ybWF0QmFyID0gcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyk7XG52YXIgRWRpdG9yU3RvcmUgPSByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlJyk7XG52YXIgRXJyb3JIYW5kbGVyID0gcmVxdWlyZSgnLi9lcnJvci1oYW5kbGVyJyk7XG5cbnZhciBFZGl0b3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMuaW5pdGlhbGl6ZShvcHRpb25zKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRWRpdG9yLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBib3VuZDogWydvbkZvcm1TdWJtaXQnLCAnaGlkZUFsbFRoZVRoaW5ncycsICdjaGFuZ2VCbG9ja1Bvc2l0aW9uJyxcbiAgICAncmVtb3ZlQmxvY2tEcmFnT3ZlcicsICdyZW5kZXJCbG9jaycsICdyZXNldEJsb2NrQ29udHJvbHMnLFxuICAgICdibG9ja0xpbWl0UmVhY2hlZCddLCBcblxuICBldmVudHM6IHtcbiAgICAnYmxvY2s6cmVvcmRlcjpkcmFnZW5kJzogJ3JlbW92ZUJsb2NrRHJhZ092ZXInLFxuICAgICdibG9jazpjb250ZW50OmRyb3BwZWQnOiAncmVtb3ZlQmxvY2tEcmFnT3ZlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdXRpbHMubG9nKFwiSW5pdCBTaXJUcmV2b3IuRWRpdG9yXCIpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLklEID0gXy51bmlxdWVJZCgnc3QtZWRpdG9yLScpO1xuXG4gICAgaWYgKCF0aGlzLl9lbnN1cmVBbmRTZXRFbGVtZW50cygpKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyKSAmJlxuICAgICAgIF8uaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMub25FZGl0b3JSZW5kZXIpKSB7XG4gICAgICB0aGlzLm9uRWRpdG9yUmVuZGVyID0gdGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyO1xuICAgIH1cblxuICAgIC8vIE1lZGlhdGVkIGV2ZW50cyBmb3IgKnRoaXMqIEVkaXRvciBpbnN0YW5jZVxuICAgIHRoaXMubWVkaWF0b3IgPSBPYmplY3QuYXNzaWduKHt9LCBFdmVudHMpO1xuXG4gICAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gICAgY29uZmlnLmluc3RhbmNlcy5wdXNoKHRoaXMpO1xuXG4gICAgdGhpcy5idWlsZCgpO1xuXG4gICAgRm9ybUV2ZW50cy5iaW5kRm9ybVN1Ym1pdCh0aGlzLiRmb3JtKTtcbiAgfSxcblxuICAvKlxuICAgKiBCdWlsZCB0aGUgRWRpdG9yIGluc3RhbmNlLlxuICAgKiBDaGVjayB0byBzZWUgaWYgd2UndmUgYmVlbiBwYXNzZWQgSlNPTiBhbHJlYWR5LCBhbmQgaWYgbm90IHRyeSBhbmRcbiAgICogY3JlYXRlIGEgZGVmYXVsdCBibG9jay5cbiAgICogSWYgd2UgaGF2ZSBKU09OIHRoZW4gd2UgbmVlZCB0byBidWlsZCBhbGwgb2Ygb3VyIGJsb2NrcyBmcm9tIHRoaXMuXG4gICAqL1xuICBidWlsZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuXG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKHRoaXMuJG91dGVyLCB0aGlzLm1lZGlhdG9yLCB0aGlzLm9wdGlvbnMuZXJyb3JzQ29udGFpbmVyKTtcbiAgICB0aGlzLnN0b3JlID0gbmV3IEVkaXRvclN0b3JlKHRoaXMuJGVsLnZhbCgpLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmJsb2NrX21hbmFnZXIgPSBuZXcgQmxvY2tNYW5hZ2VyKHRoaXMub3B0aW9ucywgdGhpcy5JRCwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5ibG9ja19jb250cm9scyA9IG5ldyBCbG9ja0NvbnRyb2xzKHRoaXMuYmxvY2tfbWFuYWdlci5ibG9ja1R5cGVzLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZsX2Jsb2NrX2NvbnRyb2xzID0gbmV3IEZsb2F0aW5nQmxvY2tDb250cm9scyh0aGlzLiR3cmFwcGVyLCB0aGlzLklELCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZvcm1hdEJhciA9IG5ldyBGb3JtYXRCYXIodGhpcy5vcHRpb25zLmZvcm1hdEJhciwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICB0aGlzLm1lZGlhdG9yLm9uKCdibG9jazpjaGFuZ2VQb3NpdGlvbicsIHRoaXMuY2hhbmdlQmxvY2tQb3NpdGlvbik7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2stY29udHJvbHM6cmVzZXQnLCB0aGlzLnJlc2V0QmxvY2tDb250cm9scyk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6cmVuZGVyJywgdGhpcy5yZW5kZXJCbG9jayk7XG5cbiAgICB0aGlzLmRhdGFTdG9yZSA9IFwiUGxlYXNlIHVzZSBzdG9yZS5yZXRyaWV2ZSgpO1wiO1xuXG4gICAgdGhpcy5fc2V0RXZlbnRzKCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy5mbF9ibG9ja19jb250cm9scy5yZW5kZXIoKS4kZWwpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuZm9ybWF0QmFyLnJlbmRlcigpLiRlbCk7XG4gICAgdGhpcy4kb3V0ZXIuYXBwZW5kKHRoaXMuYmxvY2tfY29udHJvbHMucmVuZGVyKCkuJGVsKTtcblxuICAgICQod2luZG93KS5iaW5kKCdjbGljaycsIHRoaXMuaGlkZUFsbFRoZVRoaW5ncyk7XG5cbiAgICB0aGlzLmNyZWF0ZUJsb2NrcygpO1xuICAgIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ3N0LXJlYWR5Jyk7XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLm9uRWRpdG9yUmVuZGVyKSkge1xuICAgICAgdGhpcy5vbkVkaXRvclJlbmRlcigpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmUucmV0cmlldmUoKTtcblxuICAgIGlmIChzdG9yZS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0b3JlLmRhdGEuZm9yRWFjaChmdW5jdGlvbihibG9jaykge1xuICAgICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIGJsb2NrLnR5cGUsIGJsb2NrLmRhdGEpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdFR5cGUgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIHRoaXMub3B0aW9ucy5kZWZhdWx0VHlwZSwge30pO1xuICAgIH1cbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAvLyBEZXN0cm95IHRoZSByZW5kZXJlZCBzdWIgdmlld3NcbiAgICB0aGlzLmZvcm1hdEJhci5kZXN0cm95KCk7XG4gICAgdGhpcy5mbF9ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG5cbiAgICAvLyBEZXN0cm95IGFsbCBibG9ja3NcbiAgICB0aGlzLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOnJlbW92ZScsIHRoaXMuYmxvY2suYmxvY2tJRCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBTdG9wIGxpc3RlbmluZyB0byBldmVudHNcbiAgICB0aGlzLm1lZGlhdG9yLnN0b3BMaXN0ZW5pbmcoKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblxuICAgIC8vIFJlbW92ZSBpbnN0YW5jZVxuICAgIGNvbmZpZy5pbnN0YW5jZXMgPSBjb25maWcuaW5zdGFuY2VzLmZpbHRlcihmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLklEICE9PSB0aGlzLklEO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIHN0b3JlXG4gICAgdGhpcy5zdG9yZS5yZXNldCgpO1xuICAgIHRoaXMuJG91dGVyLnJlcGxhY2VXaXRoKHRoaXMuJGVsLmRldGFjaCgpKTtcbiAgfSxcblxuICByZWluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB0aGlzLmluaXRpYWxpemUob3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICB9LFxuXG4gIHJlc2V0QmxvY2tDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5yZW5kZXJJbkNvbnRhaW5lcih0aGlzLiR3cmFwcGVyKTtcbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmhpZGUoKTtcbiAgfSxcblxuICBibG9ja0xpbWl0UmVhY2hlZDogZnVuY3Rpb24odG9nZ2xlKSB7XG4gICAgdGhpcy4kd3JhcHBlci50b2dnbGVDbGFzcygnc3QtLWJsb2NrLWxpbWl0LXJlYWNoZWQnLCB0b2dnbGUpO1xuICB9LFxuXG4gIF9zZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIEV2ZW50QnVzLm9uKHR5cGUsIHRoaXNbdGhpcy5ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBoaWRlQWxsVGhlVGhpbmdzOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5oaWRlKCk7XG4gICAgdGhpcy5mb3JtYXRCYXIuaGlkZSgpO1xuICB9LFxuXG4gIHN0b3JlOiBmdW5jdGlvbihtZXRob2QsIG9wdGlvbnMpe1xuICAgIHV0aWxzLmxvZyhcIlRoZSBzdG9yZSBtZXRob2QgaGFzIGJlZW4gcmVtb3ZlZCwgcGxlYXNlIGNhbGwgc3RvcmVbbWV0aG9kTmFtZV1cIik7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbbWV0aG9kXS5jYWxsKHRoaXMsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIHJlbmRlckJsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHRoaXMuX3JlbmRlckluUG9zaXRpb24oYmxvY2sucmVuZGVyKCkuJGVsKTtcbiAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICB0aGlzLnNjcm9sbFRvKGJsb2NrLiRlbCk7XG5cbiAgICBibG9jay50cmlnZ2VyKFwib25SZW5kZXJcIik7XG4gIH0sXG5cbiAgc2Nyb2xsVG86IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogZWxlbWVudC5wb3NpdGlvbigpLnRvcCB9LCAzMDAsIFwibGluZWFyXCIpO1xuICB9LFxuXG4gIHJlbW92ZUJsb2NrRHJhZ092ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJG91dGVyLmZpbmQoJy5zdC1kcmFnLW92ZXInKS5yZW1vdmVDbGFzcygnc3QtZHJhZy1vdmVyJyk7XG4gIH0sXG5cbiAgY2hhbmdlQmxvY2tQb3NpdGlvbjogZnVuY3Rpb24oJGJsb2NrLCBzZWxlY3RlZFBvc2l0aW9uKSB7XG4gICAgc2VsZWN0ZWRQb3NpdGlvbiA9IHNlbGVjdGVkUG9zaXRpb24gLSAxO1xuXG4gICAgdmFyIGJsb2NrUG9zaXRpb24gPSB0aGlzLmdldEJsb2NrUG9zaXRpb24oJGJsb2NrKSxcbiAgICAkYmxvY2tCeSA9IHRoaXMuJHdyYXBwZXIuZmluZCgnLnN0LWJsb2NrJykuZXEoc2VsZWN0ZWRQb3NpdGlvbik7XG5cbiAgICB2YXIgd2hlcmUgPSAoYmxvY2tQb3NpdGlvbiA+IHNlbGVjdGVkUG9zaXRpb24pID8gXCJCZWZvcmVcIiA6IFwiQWZ0ZXJcIjtcblxuICAgIGlmKCRibG9ja0J5ICYmICRibG9ja0J5LmF0dHIoJ2lkJykgIT09ICRibG9jay5hdHRyKCdpZCcpKSB7XG4gICAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICAgICRibG9ja1tcImluc2VydFwiICsgd2hlcmVdKCRibG9ja0J5KTtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oJGJsb2NrKTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbmRlckluUG9zaXRpb246IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgaWYgKHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudENvbnRhaW5lcikge1xuICAgICAgdGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50Q29udGFpbmVyLmFmdGVyKGJsb2NrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kd3JhcHBlci5hcHBlbmQoYmxvY2spO1xuICAgIH1cbiAgfSxcblxuICB2YWxpZGF0ZUFuZFNhdmVCbG9jazogZnVuY3Rpb24oYmxvY2ssIHNob3VsZFZhbGlkYXRlKSB7XG4gICAgaWYgKCghY29uZmlnLnNraXBWYWxpZGF0aW9uIHx8IHNob3VsZFZhbGlkYXRlKSAmJiAhYmxvY2sudmFsaWQoKSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJywgeyB0ZXh0OiBfLnJlc3VsdChibG9jaywgJ3ZhbGlkYXRpb25GYWlsTXNnJykgfSk7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiBmYWlsZWQgdmFsaWRhdGlvblwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYmxvY2tEYXRhID0gYmxvY2suZ2V0RGF0YSgpO1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBkYXRhIGZvciBibG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiB0byBibG9jayBzdG9yZTpcIixcbiAgICAgICAgICAgICAgYmxvY2tEYXRhKTtcbiAgICB0aGlzLnN0b3JlLmFkZERhdGEoYmxvY2tEYXRhKTtcbiAgfSxcblxuICAvKlxuICAgKiBIYW5kbGUgYSBmb3JtIHN1Ym1pc3Npb24gb2YgdGhpcyBFZGl0b3IgaW5zdGFuY2UuXG4gICAqIFZhbGlkYXRlIGFsbCBvZiBvdXIgYmxvY2tzLCBhbmQgc2VyaWFsaXNlIGFsbCBkYXRhIG9udG8gdGhlIEpTT04gb2JqZWN0c1xuICAgKi9cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIC8vIGlmIHVuZGVmaW5lZCBvciBudWxsIG9yIGFueXRoaW5nIG90aGVyIHRoYW4gZmFsc2UgLSB0cmVhdCBhcyB0cnVlXG4gICAgc2hvdWxkVmFsaWRhdGUgPSAoc2hvdWxkVmFsaWRhdGUgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIHV0aWxzLmxvZyhcIkhhbmRsaW5nIGZvcm0gc3VibWlzc2lvbiBmb3IgRWRpdG9yIFwiICsgdGhpcy5JRCk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZXNldCcpO1xuICAgIHRoaXMuc3RvcmUucmVzZXQoKTtcblxuICAgIHRoaXMudmFsaWRhdGVCbG9ja3Moc2hvdWxkVmFsaWRhdGUpO1xuICAgIHRoaXMuYmxvY2tfbWFuYWdlci52YWxpZGF0ZUJsb2NrVHlwZXNFeGlzdChzaG91bGRWYWxpZGF0ZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZW5kZXInKTtcbiAgICB0aGlzLiRlbC52YWwodGhpcy5zdG9yZS50b1N0cmluZygpKTtcblxuICAgIHJldHVybiB0aGlzLmVycm9ySGFuZGxlci5lcnJvcnMubGVuZ3RoO1xuICB9LFxuXG4gIHZhbGlkYXRlQmxvY2tzOiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVhY2goZnVuY3Rpb24oaWR4LCBibG9jaykge1xuICAgICAgdmFyIF9ibG9jayA9IHNlbGYuYmxvY2tfbWFuYWdlci5maW5kQmxvY2tCeUlkKCQoYmxvY2spLmF0dHIoJ2lkJykpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKF9ibG9jaykpIHtcbiAgICAgICAgc2VsZi52YWxpZGF0ZUFuZFNhdmVCbG9jayhfYmxvY2ssIHNob3VsZFZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBmaW5kQmxvY2tCeUlkOiBmdW5jdGlvbihibG9ja19pZCkge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZmluZEJsb2NrQnlJZChibG9ja19pZCk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlUeXBlOiBmdW5jdGlvbihibG9ja190eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tfbWFuYWdlci5nZXRCbG9ja3NCeVR5cGUoYmxvY2tfdHlwZSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZ2V0QmxvY2tzQnlJRHMoYmxvY2tfaWRzKTtcbiAgfSxcblxuICBnZXRCbG9ja1Bvc2l0aW9uOiBmdW5jdGlvbigkYmxvY2spIHtcbiAgICByZXR1cm4gdGhpcy4kd3JhcHBlci5maW5kKCcuc3QtYmxvY2snKS5pbmRleCgkYmxvY2spO1xuICB9LFxuXG4gIF9lbnN1cmVBbmRTZXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgaWYoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZWwpIHx8IF8uaXNFbXB0eSh0aGlzLm9wdGlvbnMuZWwpKSB7XG4gICAgICB1dGlscy5sb2coXCJZb3UgbXVzdCBwcm92aWRlIGFuIGVsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuJGVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWxbMF07XG4gICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnBhcmVudHMoJ2Zvcm0nKTtcblxuICAgIHZhciAkb3V0ZXIgPSAkKFwiPGRpdj5cIikuYXR0cih7ICdpZCc6IHRoaXMuSUQsICdjbGFzcyc6ICdzdC1vdXRlcicsICdkcm9wem9uZSc6ICdjb3B5IGxpbmsgbW92ZScgfSk7XG4gICAgdmFyICR3cmFwcGVyID0gJChcIjxkaXY+XCIpLmF0dHIoeyAnY2xhc3MnOiAnc3QtYmxvY2tzJyB9KTtcblxuICAgIC8vIFdyYXAgb3VyIGVsZW1lbnQgaW4gbG90cyBvZiBjb250YWluZXJzICpld3cqXG4gICAgdGhpcy4kZWwud3JhcCgkb3V0ZXIpLndyYXAoJHdyYXBwZXIpO1xuXG4gICAgdGhpcy4kb3V0ZXIgPSB0aGlzLiRmb3JtLmZpbmQoJyMnICsgdGhpcy5JRCk7XG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJG91dGVyLmZpbmQoJy5zdC1ibG9ja3MnKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvcjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oJHdyYXBwZXIsIG1lZGlhdG9yLCBjb250YWluZXIpIHtcbiAgdGhpcy4kd3JhcHBlciA9ICR3cmFwcGVyO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG4gIHRoaXMuJGVsID0gY29udGFpbmVyO1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMuJGVsKSkge1xuICAgIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy4kZWwpO1xuICB9XG5cbiAgdGhpcy4kZWwuaGlkZSgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFcnJvckhhbmRsZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBlcnJvcnM6IFtdLFxuICBjbGFzc05hbWU6IFwic3QtZXJyb3JzXCIsXG4gIGV2ZW50TmFtZXNwYWNlOiAnZXJyb3JzJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdyZXNldCc6ICdyZXNldCcsXG4gICAgJ2FkZCc6ICdhZGRNZXNzYWdlJyxcbiAgICAncmVuZGVyJzogJ3JlbmRlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGxpc3QgPSAkKFwiPHVsPlwiKTtcbiAgICB0aGlzLiRlbC5hcHBlbmQoXCI8cD5cIiArIGkxOG4udChcImVycm9yczp0aXRsZVwiKSArIFwiPC9wPlwiKVxuICAgIC5hcHBlbmQoJGxpc3QpO1xuICAgIHRoaXMuJGxpc3QgPSAkbGlzdDtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaCh0aGlzLmNyZWF0ZUVycm9ySXRlbSwgdGhpcyk7XG4gICAgdGhpcy4kZWwuc2hvdygpO1xuICB9LFxuXG4gIGNyZWF0ZUVycm9ySXRlbTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB2YXIgJGVycm9yID0gJChcIjxsaT5cIiwgeyBjbGFzczogXCJzdC1lcnJvcnNfX21zZ1wiLCBodG1sOiBlcnJvci50ZXh0IH0pO1xuICAgIHRoaXMuJGxpc3QuYXBwZW5kKCRlcnJvcik7XG4gIH0sXG5cbiAgYWRkTWVzc2FnZTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgIHRoaXMuJGxpc3QuaHRtbCgnJyk7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVycm9ySGFuZGxlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgcmVxdWlyZSgnLi9ldmVudHMnKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdldmVudGFibGVqcycpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXIgVHJldm9yIEVkaXRvciBTdG9yZVxuICogQnkgZGVmYXVsdCB3ZSBzdG9yZSB0aGUgY29tcGxldGUgZGF0YSBvbiB0aGUgaW5zdGFuY2VzICRlbFxuICogV2UgY2FuIGVhc2lseSBleHRlbmQgdGhpcyBhbmQgc3RvcmUgaXQgb24gc29tZSBzZXJ2ZXIgb3Igc29tZXRoaW5nXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cblxudmFyIEVkaXRvclN0b3JlID0gZnVuY3Rpb24oZGF0YSwgbWVkaWF0b3IpIHtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuICB0aGlzLmluaXRpYWxpemUoZGF0YSA/IGRhdGEudHJpbSgpIDogJycpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFZGl0b3JTdG9yZS5wcm90b3R5cGUsIHtcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zdG9yZSA9IHRoaXMuX3BhcnNlRGF0YShkYXRhKSB8fCB7IGRhdGE6IFtdIH07XG4gIH0sXG5cbiAgcmV0cmlldmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbihzcGFjZSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnN0b3JlLCB1bmRlZmluZWQsIHNwYWNlKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiUmVzZXR0aW5nIHRoZSBFZGl0b3JTdG9yZVwiKTtcbiAgICB0aGlzLnN0b3JlID0geyBkYXRhOiBbXSB9O1xuICB9LFxuXG4gIGFkZERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnN0b3JlLmRhdGEucHVzaChkYXRhKTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfSxcblxuICBfcGFyc2VEYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gRW5zdXJlIHRoZSBKU09OIHN0cmluZyBoYXMgYSBkYXRhIGVsZW1lbnQgdGhhdCdzIGFuIGFycmF5XG4gICAgICB2YXIganNvblN0ciA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoanNvblN0ci5kYXRhKSkge1xuICAgICAgICByZXN1bHQgPSBqc29uU3RyO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFxuICAgICAgICAnZXJyb3JzOmFkZCcsXG4gICAgICAgIHsgdGV4dDogaTE4bi50KFwiZXJyb3JzOmxvYWRfZmFpbFwiKSB9KTtcblxuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6cmVuZGVyJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdTb3JyeSB0aGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCBwYXJzaW5nIHRoZSBKU09OJyk7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclN0b3JlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4qICAgU2lyIFRyZXZvciBVcGxvYWRlclxuKiAgIEdlbmVyaWMgVXBsb2FkIGltcGxlbWVudGF0aW9uIHRoYXQgY2FuIGJlIGV4dGVuZGVkIGZvciBibG9ja3NcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihibG9jaywgZmlsZSwgc3VjY2VzcywgZXJyb3IpIHtcblxuICBFdmVudEJ1cy50cmlnZ2VyKCdvblVwbG9hZFN0YXJ0Jyk7XG5cbiAgdmFyIHVpZCAgPSBbYmxvY2suYmxvY2tJRCwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSwgJ3JhdyddLmpvaW4oJy0nKTtcbiAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFtuYW1lXScsIGZpbGUubmFtZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W2ZpbGVdJywgZmlsZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W3VpZF0nLCB1aWQpO1xuXG4gIGJsb2NrLnJlc2V0TWVzc2FnZXMoKTtcblxuICB2YXIgY2FsbGJhY2tTdWNjZXNzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpICYmIF8uaXNGdW5jdGlvbihzdWNjZXNzKSkge1xuICAgICAgc3VjY2Vzcy5hcHBseShibG9jaywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNhbGxiYWNrRXJyb3IgPSBmdW5jdGlvbihqcVhIUiwgc3RhdHVzLCBlcnJvclRocm93bikge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGVycm9yIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGVycm9yKSAmJiBfLmlzRnVuY3Rpb24oZXJyb3IpKSB7XG4gICAgICBlcnJvci5jYWxsKGJsb2NrLCBzdGF0dXMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgeGhyID0gJC5hamF4KHtcbiAgICB1cmw6IGNvbmZpZy5kZWZhdWx0cy51cGxvYWRVcmwsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjYWNoZTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdQT1NUJ1xuICB9KTtcblxuICBibG9jay5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICB4aHIuZG9uZShjYWxsYmFja1N1Y2Nlc3MpXG4gICAgIC5mYWlsKGNhbGxiYWNrRXJyb3IpXG4gICAgIC5hbHdheXMoYmxvY2sucmVtb3ZlUXVldWVkSXRlbS5iaW5kKGJsb2NrLCB1aWQpKTtcblxuICByZXR1cm4geGhyO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyVHJldm9yLlN1Ym1pdHRhYmxlXG4gKiAtLVxuICogV2UgbmVlZCBhIGdsb2JhbCB3YXkgb2Ygc2V0dGluZyBpZiB0aGUgZWRpdG9yIGNhbiBhbmQgY2FuJ3QgYmUgc3VibWl0dGVkLFxuICogYW5kIGEgd2F5IHRvIGRpc2FibGUgdGhlIHN1Ym1pdCBidXR0b24gYW5kIGFkZCBtZXNzYWdlcyAod2hlbiBhcHByb3ByaWF0ZSlcbiAqIFdlIGFsc28gbmVlZCB0aGlzIHRvIGJlIGhpZ2hseSBleHRlbnNpYmxlIHNvIGl0IGNhbiBiZSBvdmVycmlkZGVuLlxuICogVGhpcyB3aWxsIGJlIHRyaWdnZXJlZCAqYnkgYW55dGhpbmcqIHNvIGl0IG5lZWRzIHRvIHN1YnNjcmliZSB0byBldmVudHMuXG4gKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxudmFyIFN1Ym1pdHRhYmxlID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgdGhpcy4kZm9ybSA9ICRmb3JtO1xuICB0aGlzLmludGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTdWJtaXR0YWJsZS5wcm90b3R5cGUsIHtcblxuICBpbnRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zdWJtaXRCdG4gPSB0aGlzLiRmb3JtLmZpbmQoXCJpbnB1dFt0eXBlPSdzdWJtaXQnXVwiKTtcblxuICAgIHZhciBidG5UaXRsZXMgPSBbXTtcblxuICAgIHRoaXMuc3VibWl0QnRuLmVhY2goZnVuY3Rpb24oaSwgYnRuKXtcbiAgICAgIGJ0blRpdGxlcy5wdXNoKCQoYnRuKS5hdHRyKCd2YWx1ZScpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3VibWl0QnRuVGl0bGVzID0gYnRuVGl0bGVzO1xuICAgIHRoaXMuY2FuU3VibWl0ID0gdHJ1ZTtcbiAgICB0aGlzLmdsb2JhbFVwbG9hZENvdW50ID0gMDtcbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gIH0sXG5cbiAgc2V0U3VibWl0QnV0dG9uOiBmdW5jdGlvbihlLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5zdWJtaXRCdG4uYXR0cigndmFsdWUnLCBtZXNzYWdlKTtcbiAgfSxcblxuICByZXNldFN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB2YXIgdGl0bGVzID0gdGhpcy5zdWJtaXRCdG5UaXRsZXM7XG4gICAgdGhpcy5zdWJtaXRCdG4uZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgJChpdGVtKS5hdHRyKCd2YWx1ZScsIHRpdGxlc1tpbmRleF0pO1xuICAgIH0pO1xuICB9LFxuXG4gIG9uVXBsb2FkU3RhcnQ6IGZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQrKztcbiAgICB1dGlscy5sb2coJ29uVXBsb2FkU3RhcnQgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDEpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gIH0sXG5cbiAgb25VcGxvYWRTdG9wOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCA9ICh0aGlzLmdsb2JhbFVwbG9hZENvdW50IDw9IDApID8gMCA6IHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgLSAxO1xuXG4gICAgdXRpbHMubG9nKCdvblVwbG9hZFN0b3AgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2VuYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgIH1cbiAgfSxcblxuICBvbkVycm9yOiBmdW5jdGlvbihlKXtcbiAgICB1dGlscy5sb2coJ29uRXJyb3IgY2FsbGVkJyk7XG4gICAgdGhpcy5jYW5TdWJtaXQgPSBmYWxzZTtcbiAgfSxcblxuICBfZGlzYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgdGhpcy5zZXRTdWJtaXRCdXR0b24obnVsbCwgbWVzc2FnZSB8fCBpMThuLnQoXCJnZW5lcmFsOndhaXRcIikpO1xuICAgIHRoaXMuc3VibWl0QnRuXG4gICAgLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcbiAgICAuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gIH0sXG5cbiAgX2VuYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlc2V0U3VibWl0QnV0dG9uKCk7XG4gICAgdGhpcy5zdWJtaXRCdG5cbiAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgIC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgfSxcblxuICBfZXZlbnRzIDoge1xuICAgIFwiZGlzYWJsZVN1Ym1pdEJ1dHRvblwiIDogXCJfZGlzYWJsZVN1Ym1pdEJ1dHRvblwiLFxuICAgIFwiZW5hYmxlU3VibWl0QnV0dG9uXCIgIDogXCJfZW5hYmxlU3VibWl0QnV0dG9uXCIsXG4gICAgXCJzZXRTdWJtaXRCdXR0b25cIiAgICAgOiBcInNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwicmVzZXRTdWJtaXRCdXR0b25cIiAgIDogXCJyZXNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwib25FcnJvclwiICAgICAgICAgICAgIDogXCJvbkVycm9yXCIsXG4gICAgXCJvblVwbG9hZFN0YXJ0XCIgICAgICAgOiBcIm9uVXBsb2FkU3RhcnRcIixcbiAgICBcIm9uVXBsb2FkU3RvcFwiICAgICAgICA6IFwib25VcGxvYWRTdG9wXCJcbiAgfSxcblxuICBfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9ldmVudHMpLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgRXZlbnRCdXMub24odHlwZSwgdGhpc1t0aGlzLl9ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdWJtaXR0YWJsZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICBTaXJUcmV2b3IgRmxvYXRpbmcgQmxvY2sgQ29udHJvbHNcbiAgIC0tXG4gICBEcmF3cyB0aGUgJ3BsdXMnIGJldHdlZW4gYmxvY2tzXG4gICAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSBmdW5jdGlvbih3cmFwcGVyLCBpbnN0YW5jZV9pZCwgbWVkaWF0b3IpIHtcbiAgdGhpcy4kd3JhcHBlciA9IHdyYXBwZXI7XG4gIHRoaXMuaW5zdGFuY2VfaWQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihGbG9hdGluZ0Jsb2NrQ29udHJvbHMucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNfX3RvcFwiLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGF0YS1pY29uJzogJ2FkZCdcbiAgICB9O1xuICB9LFxuXG4gIGJvdW5kOiBbJ2hhbmRsZUJsb2NrTW91c2VPdXQnLCAnaGFuZGxlQmxvY2tNb3VzZU92ZXInLCAnaGFuZGxlQmxvY2tDbGljaycsICdvbkRyb3AnXSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spXG4gICAgLmRyb3BBcmVhKClcbiAgICAuYmluZCgnZHJvcCcsIHRoaXMub25Ecm9wKTtcblxuICAgIHRoaXMuJHdyYXBwZXIub24oJ21vdXNlb3ZlcicsICcuc3QtYmxvY2snLCB0aGlzLmhhbmRsZUJsb2NrTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCAnLnN0LWJsb2NrJywgdGhpcy5oYW5kbGVCbG9ja01vdXNlT3V0KVxuICAgIC5vbignY2xpY2snLCAnLnN0LWJsb2NrLS13aXRoLXBsdXMnLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24oZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGRyb3BwZWRfb24gPSB0aGlzLiRlbCxcbiAgICBpdGVtX2lkID0gZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIiksXG4gICAgYmxvY2sgPSAkKCcjJyArIGl0ZW1faWQpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGl0ZW1faWQpICYmXG4gICAgICAgICFfLmlzRW1wdHkoYmxvY2spICYmXG4gICAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdpZCcpICE9PSBpdGVtX2lkICYmXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlX2lkID09PSBibG9jay5hdHRyKCdkYXRhLWluc3RhbmNlJylcbiAgICAgICApIHtcbiAgICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICAgIH1cblxuICAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyb3BwZWRcIiwgaXRlbV9pZCk7XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tNb3VzZU92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoIWJsb2NrLmhhc0NsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJykpIHtcbiAgICAgIGJsb2NrLmFkZENsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUJsb2NrTW91c2VPdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoYmxvY2suaGFzQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKSkge1xuICAgICAgYmxvY2sucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKTtcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tDbGljazogZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jay1jb250cm9sczpyZW5kZXInLCAkKGUuY3VycmVudFRhcmdldCkpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb2F0aW5nQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBTdWJtaXR0YWJsZSA9IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdWJtaXR0YWJsZScpO1xuXG52YXIgZm9ybUJvdW5kID0gZmFsc2U7IC8vIEZsYWcgdG8gdGVsbCB1cyBvbmNlIHdlJ3ZlIGJvdW5kIG91ciBzdWJtaXQgZXZlbnRcblxudmFyIEZvcm1FdmVudHMgPSB7XG4gIGJpbmRGb3JtU3VibWl0OiBmdW5jdGlvbihmb3JtKSB7XG4gICAgaWYgKCFmb3JtQm91bmQpIHtcbiAgICAgIC8vIFhYWDogc2hvdWxkIHdlIGhhdmUgYSBmb3JtQm91bmQgYW5kIHN1Ym1pdHRhYmxlIHBlci1lZGl0b3I/XG4gICAgICAvLyB0ZWxsaW5nIEpTSGludCB0byBpZ25vcmUgYXMgaXQnbGwgY29tcGxhaW4gd2Ugc2hvdWxkbid0IGJlIGNyZWF0aW5nXG4gICAgICAvLyBhIG5ldyBvYmplY3QsIGJ1dCBvdGhlcndpc2UgYHRoaXNgIHdvbid0IGJlIHNldCBpbiB0aGUgU3VibWl0dGFibGVcbiAgICAgIC8vIGluaXRpYWxpc2VyLiBCaXQgd2VpcmQuXG4gICAgICBuZXcgU3VibWl0dGFibGUoZm9ybSk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgZm9ybS5iaW5kKCdzdWJtaXQnLCB0aGlzLm9uRm9ybVN1Ym1pdCk7XG4gICAgICBmb3JtQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbkJlZm9yZVN1Ym1pdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIG91ciBpbnN0YW5jZXMgYW5kIGRvIG91ciBmb3JtIHN1Ym1pdHMgb24gdGhlbVxuICAgIHZhciBlcnJvcnMgPSAwO1xuICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0LCBpKSB7XG4gICAgICBlcnJvcnMgKz0gaW5zdC5vbkZvcm1TdWJtaXQoc2hvdWxkVmFsaWRhdGUpO1xuICAgIH0pO1xuICAgIHV0aWxzLmxvZyhcIlRvdGFsIGVycm9yczogXCIgKyBlcnJvcnMpO1xuXG4gICAgcmV0dXJuIGVycm9ycztcbiAgfSxcblxuICBvbkZvcm1TdWJtaXQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgdmFyIGVycm9ycyA9IEZvcm1FdmVudHMub25CZWZvcmVTdWJtaXQoKTtcblxuICAgIGlmKGVycm9ycyA+IDApIHtcbiAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJvbkVycm9yXCIpO1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1FdmVudHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBGb3JtYXQgQmFyXG4gKiAtLVxuICogRGlzcGxheWVkIG9uIGZvY3VzIG9uIGEgdGV4dCBhcmVhLlxuICogUmVuZGVycyB3aXRoIGFsbCBhdmFpbGFibGUgb3B0aW9ucyBmb3IgdGhlIGVkaXRvciBpbnN0YW5jZVxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xuXG52YXIgRm9ybWF0QmFyID0gZnVuY3Rpb24ob3B0aW9ucywgbWVkaWF0b3IpIHtcbiAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLmZvcm1hdEJhciwgb3B0aW9ucyB8fCB7fSk7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcbiAgdGhpcy5fYmluZE1lZGlhdGVkRXZlbnRzKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5PYmplY3QuYXNzaWduKEZvcm1hdEJhci5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL21lZGlhdGVkLWV2ZW50cycpLCByZXF1aXJlKCcuL2V2ZW50cycpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIGNsYXNzTmFtZTogJ3N0LWZvcm1hdC1iYXInLFxuXG4gIGJvdW5kOiBbXCJvbkZvcm1hdEJ1dHRvbkNsaWNrXCIsIFwicmVuZGVyQnlTZWxlY3Rpb25cIiwgXCJoaWRlXCJdLFxuXG4gIGV2ZW50TmFtZXNwYWNlOiAnZm9ybWF0dGVyJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdwb3NpdGlvbic6ICdyZW5kZXJCeVNlbGVjdGlvbicsXG4gICAgJ3Nob3cnOiAnc2hvdycsXG4gICAgJ2hpZGUnOiAnaGlkZSdcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0LCBidG47XG4gICAgdGhpcy4kYnRucyA9IFtdO1xuXG4gICAgZm9yIChmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KGZvcm1hdE5hbWUpKSB7XG4gICAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAgIGJ0biA9ICQoXCI8YnV0dG9uPlwiLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ3N0LWZvcm1hdC1idG4gc3QtZm9ybWF0LWJ0bi0tJyArIGZvcm1hdE5hbWUgKyAnICcgKyAoZm9ybWF0Lmljb25OYW1lID8gJ3N0LWljb24nIDogJycpLFxuICAgICAgICAgICd0ZXh0JzogZm9ybWF0LnRleHQsXG4gICAgICAgICAgJ2RhdGEtdHlwZSc6IGZvcm1hdE5hbWUsXG4gICAgICAgICAgJ2RhdGEtY21kJzogZm9ybWF0LmNtZFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRidG5zLnB1c2goYnRuKTtcbiAgICAgICAgYnRuLmFwcGVuZFRvKHRoaXMuJGVsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiRiID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZWwuYmluZCgnY2xpY2snLCAnLnN0LWZvcm1hdC1idG4nLCB0aGlzLm9uRm9ybWF0QnV0dG9uQ2xpY2spO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24oKXsgdGhpcy4kZWwucmVtb3ZlKCk7IH0sXG5cbiAgcmVuZGVyQnlTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApLFxuICAgIGJvdW5kYXJ5ID0gcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgY29vcmRzID0ge307XG5cbiAgICBjb29yZHMudG9wID0gYm91bmRhcnkudG9wICsgMjAgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSB0aGlzLiRlbC5oZWlnaHQoKSArICdweCc7XG4gICAgY29vcmRzLmxlZnQgPSAoKGJvdW5kYXJ5LmxlZnQgKyBib3VuZGFyeS5yaWdodCkgLyAyKSAtICh0aGlzLiRlbC53aWR0aCgpIC8gMikgKyAncHgnO1xuXG4gICAgdGhpcy5oaWdobGlnaHRTZWxlY3RlZEJ1dHRvbnMoKTtcbiAgICB0aGlzLnNob3coKTtcblxuICAgIHRoaXMuJGVsLmNzcyhjb29yZHMpO1xuICB9LFxuXG4gIGhpZ2hsaWdodFNlbGVjdGVkQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1hdHRlcjtcbiAgICB0aGlzLiRidG5zLmZvckVhY2goZnVuY3Rpb24oJGJ0bikge1xuICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyc1skYnRuLmF0dHIoJ2RhdGEtdHlwZScpXTtcbiAgICAgICRidG4udG9nZ2xlQ2xhc3MoXCJzdC1mb3JtYXQtYnRuLS1pcy1hY3RpdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyLmlzQWN0aXZlKCkpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRm9ybWF0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGV2KXtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBidG4gPSAkKGV2LnRhcmdldCksXG4gICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tidG4uYXR0cignZGF0YS10eXBlJyldO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZm9ybWF0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIERvIHdlIGhhdmUgYSBjbGljayBmdW5jdGlvbiBkZWZpbmVkIG9uIHRoaXMgZm9ybWF0dGVyP1xuICAgIGlmKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC5vbkNsaWNrKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0Lm9uQ2xpY2spKSB7XG4gICAgICBmb3JtYXQub25DbGljaygpOyAvLyBEZWxlZ2F0ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDYWxsIGRlZmF1bHRcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGJ0bi5hdHRyKCdkYXRhLWNtZCcpLCBmYWxzZSwgZm9ybWF0LnBhcmFtKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpZ2hsaWdodFNlbGVjdGVkQnV0dG9ucygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtYXRCYXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRm9ybWF0dGVyID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIHRoaXMuZm9ybWF0SWQgPSBfLnVuaXF1ZUlkKCdmb3JtYXQtJyk7XG4gIHRoaXMuX2NvbmZpZ3VyZShvcHRpb25zIHx8IHt9KTtcbiAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgZm9ybWF0T3B0aW9ucyA9IFtcInRpdGxlXCIsIFwiY2xhc3NOYW1lXCIsIFwiY21kXCIsIFwia2V5Q29kZVwiLCBcInBhcmFtXCIsIFwib25DbGlja1wiLCBcInRvTWFya2Rvd25cIiwgXCJ0b0hUTUxcIl07XG5cbk9iamVjdC5hc3NpZ24oRm9ybWF0dGVyLnByb3RvdHlwZSwge1xuXG4gIHRpdGxlOiAnJyxcbiAgY2xhc3NOYW1lOiAnJyxcbiAgY21kOiBudWxsLFxuICBrZXlDb2RlOiBudWxsLFxuICBwYXJhbTogbnVsbCxcblxuICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bil7IHJldHVybiBtYXJrZG93bjsgfSxcbiAgdG9IVE1MOiBmdW5jdGlvbihodG1sKXsgcmV0dXJuIGh0bWw7IH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gIF9jb25maWd1cmU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBmb3JtYXRPcHRpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGF0dHIgPSBmb3JtYXRPcHRpb25zW2ldO1xuICAgICAgaWYgKG9wdGlvbnNbYXR0cl0pIHtcbiAgICAgICAgdGhpc1thdHRyXSA9IG9wdGlvbnNbYXR0cl07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH0sXG5cbiAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZSh0aGlzLmNtZCk7XG4gIH0sXG5cbiAgX2JpbmRUb0Jsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBmb3JtYXR0ZXIgPSB0aGlzLFxuICAgIGN0cmxEb3duID0gZmFsc2U7XG5cbiAgICBibG9ja1xuICAgIC5vbigna2V5dXAnLCcuc3QtdGV4dC1ibG9jaycsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICBpZihldi53aGljaCA9PT0gMTcgfHwgZXYud2hpY2ggPT09IDIyNCB8fCBldi53aGljaCA9PT0gOTEpIHtcbiAgICAgICAgY3RybERvd24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5vbigna2V5ZG93bicsJy5zdC10ZXh0LWJsb2NrJywgeyBmb3JtYXR0ZXI6IGZvcm1hdHRlciB9LCBmdW5jdGlvbihldikge1xuICAgICAgaWYoZXYud2hpY2ggPT09IDE3IHx8IGV2LndoaWNoID09PSAyMjQgfHwgZXYud2hpY2ggPT09IDkxKSB7XG4gICAgICAgIGN0cmxEb3duID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYoZXYud2hpY2ggPT09IGV2LmRhdGEuZm9ybWF0dGVyLmtleUNvZGUgJiYgY3RybERvd24gPT09IHRydWUpIHtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoZXYuZGF0YS5mb3JtYXR0ZXIuY21kLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGN0cmxEb3duID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBBbGxvdyBvdXIgRm9ybWF0dGVycyB0byBiZSBleHRlbmRlZC5cbkZvcm1hdHRlci5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybWF0dGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIE91ciBiYXNlIGZvcm1hdHRlcnMgKi9cblxudmFyIEZvcm1hdHRlciA9IHJlcXVpcmUoJy4vZm9ybWF0dGVyJyk7XG5cbnZhciBCb2xkID0gRm9ybWF0dGVyLmV4dGVuZCh7XG4gIHRpdGxlOiBcImJvbGRcIixcbiAgY21kOiBcImJvbGRcIixcbiAga2V5Q29kZTogNjYsXG4gIHRleHQgOiBcIkJcIlxufSk7XG5cbnZhciBJdGFsaWMgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwiaXRhbGljXCIsXG4gIGNtZDogXCJpdGFsaWNcIixcbiAga2V5Q29kZTogNzMsXG4gIHRleHQgOiBcImlcIlxufSk7XG5cbnZhciBMaW5rID0gRm9ybWF0dGVyLmV4dGVuZCh7XG5cbiAgdGl0bGU6IFwibGlua1wiLFxuICBpY29uTmFtZTogXCJsaW5rXCIsXG4gIGNtZDogXCJDcmVhdGVMaW5rXCIsXG4gIHRleHQgOiBcImxpbmtcIixcblxuICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBsaW5rID0gd2luZG93LnByb21wdChpMThuLnQoXCJnZW5lcmFsOmxpbmtcIikpLFxuICAgIGxpbmtfcmVnZXggPSAvKChmdHB8aHR0cHxodHRwcyk6XFwvXFwvLil8bWFpbHRvKD89XFw6Wy1cXC5cXHddK0ApLztcblxuICAgIGlmKGxpbmsgJiYgbGluay5sZW5ndGggPiAwKSB7XG5cbiAgICAgIGlmICghbGlua19yZWdleC50ZXN0KGxpbmspKSB7XG4gICAgICAgIGxpbmsgPSBcImh0dHA6Ly9cIiArIGxpbms7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuY21kLCBmYWxzZSwgbGluayk7XG4gICAgfVxuICB9LFxuXG4gIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgIG5vZGU7XG5cbiAgICBpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICBub2RlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMClcbiAgICAgIC5zdGFydENvbnRhaW5lclxuICAgICAgLnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIChub2RlICYmIG5vZGUubm9kZU5hbWUgPT09IFwiQVwiKTtcbiAgfVxufSk7XG5cbnZhciBVbkxpbmsgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwidW5saW5rXCIsXG4gIGljb25OYW1lOiBcImxpbmtcIixcbiAgY21kOiBcInVubGlua1wiLFxuICB0ZXh0IDogXCJsaW5rXCJcbn0pO1xuXG5cbmV4cG9ydHMuQm9sZCA9IG5ldyBCb2xkKCk7XG5leHBvcnRzLkl0YWxpYyA9IG5ldyBJdGFsaWMoKTtcbmV4cG9ydHMuTGluayA9IG5ldyBMaW5rKCk7XG5leHBvcnRzLlVubGluayA9IG5ldyBVbkxpbmsoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBHZW5lcmljIGZ1bmN0aW9uIGJpbmRpbmcgdXRpbGl0eSwgdXNlZCBieSBsb3RzIG9mIG91ciBjbGFzc2VzICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBib3VuZDogW10sXG4gIF9iaW5kRnVuY3Rpb25zOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuYm91bmQuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICB0aGlzW2ZdID0gdGhpc1tmXS5iaW5kKHRoaXMpO1xuICAgIH0sIHRoaXMpO1xuICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIERyb3AgQXJlYSBQbHVnaW4gZnJvbSBAbWFjY21hblxuICogaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vc3ZidGxlLWltYWdlLXVwbG9hZGluZ1xuICogLS1cbiAqIFR3ZWFrZWQgc28gd2UgdXNlIHRoZSBwYXJlbnQgY2xhc3Mgb2YgZHJvcHpvbmVcbiAqL1xuXG5cbmZ1bmN0aW9uIGRyYWdFbnRlcihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuZnVuY3Rpb24gZHJhZ092ZXIoZSkge1xuICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdzdC1kcmFnLW92ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBkcmFnTGVhdmUoZSkge1xuICAkKGUuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbiQuZm4uZHJvcEFyZWEgPSBmdW5jdGlvbigpe1xuICB0aGlzLmJpbmQoXCJkcmFnZW50ZXJcIiwgZHJhZ0VudGVyKS5cbiAgICBiaW5kKFwiZHJhZ292ZXJcIiwgIGRyYWdPdmVyKS5cbiAgICBiaW5kKFwiZHJhZ2xlYXZlXCIsIGRyYWdMZWF2ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuJC5mbi5ub0Ryb3BBcmVhID0gZnVuY3Rpb24oKXtcbiAgdGhpcy51bmJpbmQoXCJkcmFnZW50ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ292ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ2xlYXZlXCIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbiQuZm4uY2FyZXRUb0VuZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciByYW5nZSxzZWxlY3Rpb247XG5cbiAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHModGhpc1swXSk7XG4gIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblxuICBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBCYWNrYm9uZSBJbmhlcml0ZW5jZSBcbiAgLS1cbiAgRnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2RvY3VtZW50Y2xvdWQvYmFja2JvbmUvYmxvYi9tYXN0ZXIvYmFja2JvbmUuanNcbiAgQmFja2JvbmUuanMgMC45LjJcbiAgKGMpIDIwMTAtMjAxMiBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICB2YXIgcGFyZW50ID0gdGhpcztcbiAgdmFyIGNoaWxkO1xuXG4gIC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3VcbiAgLy8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG4gIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cbiAgaWYgKHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuICAgIGNoaWxkID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjtcbiAgfSBlbHNlIHtcbiAgICBjaGlsZCA9IGZ1bmN0aW9uKCl7IHJldHVybiBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgfVxuXG4gIC8vIEFkZCBzdGF0aWMgcHJvcGVydGllcyB0byB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24sIGlmIHN1cHBsaWVkLlxuICBPYmplY3QuYXNzaWduKGNoaWxkLCBwYXJlbnQsIHN0YXRpY1Byb3BzKTtcblxuICAvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuICAvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24oKXsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9O1xuICBTdXJyb2dhdGUucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgY2hpbGQucHJvdG90eXBlID0gbmV3IFN1cnJvZ2F0ZTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cbiAgLy8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG4gIC8vIGlmIHN1cHBsaWVkLlxuICBpZiAocHJvdG9Qcm9wcykge1xuICAgIE9iamVjdC5hc3NpZ24oY2hpbGQucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgfVxuXG4gIC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWRcbiAgLy8gbGF0ZXIuXG4gIGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGNoaWxkO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnJlcXVpcmUoJ2VzNi1zaGltJyk7IC8vIGJ1bmRsaW5nIGluIGZvciB0aGUgbW9tZW50IGFzIHN1cHBvcnQgaXMgdmVyeSByYXJlXG5yZXF1aXJlKCcuL2hlbHBlcnMvZXZlbnQnKTsgLy8gZXh0ZW5kcyBqUXVlcnkgaXRzZWxmXG5yZXF1aXJlKCcuL3ZlbmRvci9hcnJheS1pbmNsdWRlcycpOyAvLyBzaGltcyBFUzcgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG5cbnZhciBTaXJUcmV2b3IgPSB7XG5cbiAgY29uZmlnOiByZXF1aXJlKCcuL2NvbmZpZycpLFxuXG4gIGxvZzogcmVxdWlyZSgnLi91dGlscycpLmxvZyxcbiAgTG9jYWxlczogcmVxdWlyZSgnLi9sb2NhbGVzJyksXG5cbiAgRXZlbnRzOiByZXF1aXJlKCcuL2V2ZW50cycpLFxuICBFdmVudEJ1czogcmVxdWlyZSgnLi9ldmVudC1idXMnKSxcblxuICBFZGl0b3JTdG9yZTogcmVxdWlyZSgnLi9leHRlbnNpb25zL2VkaXRvci1zdG9yZScpLFxuICBTdWJtaXR0YWJsZTogcmVxdWlyZSgnLi9leHRlbnNpb25zL3N1Ym1pdHRhYmxlJyksXG4gIEZpbGVVcGxvYWRlcjogcmVxdWlyZSgnLi9leHRlbnNpb25zL2ZpbGUtdXBsb2FkZXInKSxcblxuICBCbG9ja01peGluczogcmVxdWlyZSgnLi9ibG9ja19taXhpbnMnKSxcbiAgQmxvY2tQb3NpdGlvbmVyOiByZXF1aXJlKCcuL2Jsb2NrLXBvc2l0aW9uZXInKSxcbiAgQmxvY2tSZW9yZGVyOiByZXF1aXJlKCcuL2Jsb2NrLXJlb3JkZXInKSxcbiAgQmxvY2tEZWxldGlvbjogcmVxdWlyZSgnLi9ibG9jay1kZWxldGlvbicpLFxuICBCbG9ja1ZhbGlkYXRpb25zOiByZXF1aXJlKCcuL2Jsb2NrLXZhbGlkYXRpb25zJyksXG4gIEJsb2NrU3RvcmU6IHJlcXVpcmUoJy4vYmxvY2stc3RvcmUnKSxcbiAgQmxvY2tNYW5hZ2VyOiByZXF1aXJlKCcuL2Jsb2NrLW1hbmFnZXInKSxcblxuICBTaW1wbGVCbG9jazogcmVxdWlyZSgnLi9zaW1wbGUtYmxvY2snKSxcbiAgQmxvY2s6IHJlcXVpcmUoJy4vYmxvY2snKSxcbiAgRm9ybWF0dGVyOiByZXF1aXJlKCcuL2Zvcm1hdHRlcicpLFxuICBGb3JtYXR0ZXJzOiByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKSxcblxuICBCbG9ja3M6IHJlcXVpcmUoJy4vYmxvY2tzJyksXG5cbiAgQmxvY2tDb250cm9sOiByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2wnKSxcbiAgQmxvY2tDb250cm9sczogcmVxdWlyZSgnLi9ibG9jay1jb250cm9scycpLFxuICBGbG9hdGluZ0Jsb2NrQ29udHJvbHM6IHJlcXVpcmUoJy4vZmxvYXRpbmctYmxvY2stY29udHJvbHMnKSxcblxuICBGb3JtYXRCYXI6IHJlcXVpcmUoJy4vZm9ybWF0LWJhcicpLFxuICBFZGl0b3I6IHJlcXVpcmUoJy4vZWRpdG9yJyksXG5cbiAgdG9NYXJrZG93bjogcmVxdWlyZSgnLi90by1tYXJrZG93bicpLFxuICB0b0hUTUw6IHJlcXVpcmUoJy4vdG8taHRtbCcpLFxuXG4gIHNldERlZmF1bHRzOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgT2JqZWN0LmFzc2lnbihTaXJUcmV2b3IuY29uZmlnLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgfSxcblxuICBnZXRJbnN0YW5jZTogZnVuY3Rpb24oaWRlbnRpZmllcikge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzWzBdO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzLmZpbmQoZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3IuSUQgPT09IGlkZW50aWZpZXI7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzW2lkZW50aWZpZXJdO1xuICB9LFxuXG4gIHNldEJsb2NrT3B0aW9uczogZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgIHZhciBibG9jayA9IFNpclRyZXZvci5CbG9ja3NbdHlwZV07XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChibG9jaykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGJsb2NrLnByb3RvdHlwZSwgb3B0aW9ucyB8fCB7fSk7XG4gIH0sXG5cbiAgcnVuT25BbGxJbnN0YW5jZXM6IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIGlmIChTaXJUcmV2b3IuRWRpdG9yLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICB2YXIgbWV0aG9kQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKFNpclRyZXZvci5jb25maWcuaW5zdGFuY2VzLCBmdW5jdGlvbihpKSB7XG4gICAgICAgIGlbbWV0aG9kXS5hcHBseShudWxsLCBtZXRob2RBcmdzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBTaXJUcmV2b3IubG9nKFwibWV0aG9kIGRvZXNuJ3QgZXhpc3RcIik7XG4gICAgfVxuICB9LFxuXG59O1xuXG5PYmplY3QuYXNzaWduKFNpclRyZXZvciwgcmVxdWlyZSgnLi9mb3JtLWV2ZW50cycpKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpclRyZXZvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIExvY2FsZXMgPSB7XG4gIGVuOiB7XG4gICAgZ2VuZXJhbDoge1xuICAgICAgJ2RlbGV0ZSc6ICAgICAgICAgICAnRGVsZXRlPycsXG4gICAgICAnZHJvcCc6ICAgICAgICAgICAgICdEcmFnIF9fYmxvY2tfXyBoZXJlJyxcbiAgICAgICdwYXN0ZSc6ICAgICAgICAgICAgJ09yIHBhc3RlIFVSTCBoZXJlJyxcbiAgICAgICd1cGxvYWQnOiAgICAgICAgICAgJy4uLm9yIGNob29zZSBhIGZpbGUnLFxuICAgICAgJ2Nsb3NlJzogICAgICAgICAgICAnY2xvc2UnLFxuICAgICAgJ3Bvc2l0aW9uJzogICAgICAgICAnUG9zaXRpb24nLFxuICAgICAgJ3dhaXQnOiAgICAgICAgICAgICAnUGxlYXNlIHdhaXQuLi4nLFxuICAgICAgJ2xpbmsnOiAgICAgICAgICAgICAnRW50ZXIgYSBsaW5rJ1xuICAgIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAndGl0bGUnOiBcIllvdSBoYXZlIHRoZSBmb2xsb3dpbmcgZXJyb3JzOlwiLFxuICAgICAgJ3ZhbGlkYXRpb25fZmFpbCc6IFwiX190eXBlX18gYmxvY2sgaXMgaW52YWxpZFwiLFxuICAgICAgJ2Jsb2NrX2VtcHR5JzogXCJfX25hbWVfXyBtdXN0IG5vdCBiZSBlbXB0eVwiLFxuICAgICAgJ3R5cGVfbWlzc2luZyc6IFwiWW91IG11c3QgaGF2ZSBhIGJsb2NrIG9mIHR5cGUgX190eXBlX19cIixcbiAgICAgICdyZXF1aXJlZF90eXBlX2VtcHR5JzogXCJBIHJlcXVpcmVkIGJsb2NrIHR5cGUgX190eXBlX18gaXMgZW1wdHlcIixcbiAgICAgICdsb2FkX2ZhaWwnOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gbG9hZGluZyB0aGUgY29udGVudHMgb2YgdGhlIGRvY3VtZW50XCJcbiAgICB9LFxuICAgIGJsb2Nrczoge1xuICAgICAgdGV4dDoge1xuICAgICAgICAndGl0bGUnOiBcIlRleHRcIlxuICAgICAgfSxcbiAgICAgIGxpc3Q6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJMaXN0XCJcbiAgICAgIH0sXG4gICAgICBxdW90ZToge1xuICAgICAgICAndGl0bGUnOiBcIlF1b3RlXCIsXG4gICAgICAgICdjcmVkaXRfZmllbGQnOiBcIkNyZWRpdFwiXG4gICAgICB9LFxuICAgICAgaW1hZ2U6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJJbWFnZVwiLFxuICAgICAgICAndXBsb2FkX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggeW91ciB1cGxvYWRcIlxuICAgICAgfSxcbiAgICAgIHZpZGVvOiB7XG4gICAgICAgICd0aXRsZSc6IFwiVmlkZW9cIlxuICAgICAgfSxcbiAgICAgIHR3ZWV0OiB7XG4gICAgICAgICd0aXRsZSc6IFwiVHdlZXRcIixcbiAgICAgICAgJ2ZldGNoX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHlvdXIgdHdlZXRcIlxuICAgICAgfSxcbiAgICAgIGVtYmVkbHk6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJFbWJlZGx5XCIsXG4gICAgICAgICdmZXRjaF9lcnJvcic6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB5b3VyIGVtYmVkXCIsXG4gICAgICAgICdrZXlfbWlzc2luZyc6IFwiQW4gRW1iZWRseSBBUEkga2V5IG11c3QgYmUgcHJlc2VudFwiXG4gICAgICB9LFxuICAgICAgaGVhZGluZzoge1xuICAgICAgICAndGl0bGUnOiBcIkhlYWRpbmdcIlxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuaWYgKHdpbmRvdy5pMThuID09PSB1bmRlZmluZWQpIHtcbiAgLy8gTWluaW1hbCBpMThuIHN0dWIgdGhhdCBvbmx5IHJlYWRzIHRoZSBFbmdsaXNoIHN0cmluZ3NcbiAgdXRpbHMubG9nKFwiVXNpbmcgaTE4biBzdHViXCIpO1xuICB3aW5kb3cuaTE4biA9IHtcbiAgICB0OiBmdW5jdGlvbihrZXksIG9wdGlvbnMpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGtleS5zcGxpdCgnOicpLCBzdHIsIG9iaiwgcGFydCwgaTtcblxuICAgICAgb2JqID0gTG9jYWxlc1tjb25maWcubGFuZ3VhZ2VdO1xuXG4gICAgICBmb3IoaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJ0ID0gcGFydHNbaV07XG5cbiAgICAgICAgaWYoIV8uaXNVbmRlZmluZWQob2JqW3BhcnRdKSkge1xuICAgICAgICAgIG9iaiA9IG9ialtwYXJ0XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdHIgPSBvYmo7XG5cbiAgICAgIGlmICghXy5pc1N0cmluZyhzdHIpKSB7IHJldHVybiBcIlwiOyB9XG5cbiAgICAgIGlmIChzdHIuaW5kZXhPZignX18nKSA+PSAwKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoJ19fJyArIG9wdCArICdfXycsIG9wdGlvbnNbb3B0XSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbn0gZWxzZSB7XG4gIHV0aWxzLmxvZyhcIlVzaW5nIGkxOG5leHRcIik7XG4gIC8vIE9ubHkgdXNlIGkxOG5leHQgd2hlbiB0aGUgbGlicmFyeSBoYXMgYmVlbiBsb2FkZWQgYnkgdGhlIHVzZXIsIGtlZXBzXG4gIC8vIGRlcGVuZGVuY2llcyBzbGltXG4gIGkxOG4uaW5pdCh7IHJlc1N0b3JlOiBMb2NhbGVzLCBmYWxsYmFja0xuZzogY29uZmlnLmxhbmd1YWdlLFxuICAgICAgICAgICAgbnM6IHsgbmFtZXNwYWNlczogWydnZW5lcmFsJywgJ2Jsb2NrcyddLCBkZWZhdWx0TnM6ICdnZW5lcmFsJyB9XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5pc0VtcHR5ID0gcmVxdWlyZSgnbG9kYXNoLmlzZW1wdHknKTtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5leHBvcnRzLmlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0Jyk7XG5leHBvcnRzLmlzU3RyaW5nID0gcmVxdWlyZSgnbG9kYXNoLmlzc3RyaW5nJyk7XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gcmVxdWlyZSgnbG9kYXNoLmlzdW5kZWZpbmVkJyk7XG5leHBvcnRzLnJlc3VsdCA9IHJlcXVpcmUoJ2xvZGFzaC5yZXN1bHQnKTtcbmV4cG9ydHMudGVtcGxhdGUgPSByZXF1aXJlKCdsb2Rhc2gudGVtcGxhdGUnKTtcbmV4cG9ydHMudW5pcXVlSWQgPSByZXF1aXJlKCdsb2Rhc2gudW5pcXVlaWQnKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWVkaWF0ZWRFdmVudHM6IHt9LFxuICBldmVudE5hbWVzcGFjZTogbnVsbCxcbiAgX2JpbmRNZWRpYXRlZEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZWRpYXRlZEV2ZW50cykuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpe1xuICAgICAgdmFyIGNiID0gdGhpcy5tZWRpYXRlZEV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgZXZlbnROYW1lID0gdGhpcy5ldmVudE5hbWVzcGFjZSA/XG4gICAgICAgIHRoaXMuZXZlbnROYW1lc3BhY2UgKyAnOicgKyBldmVudE5hbWUgOlxuICAgICAgICBldmVudE5hbWU7XG4gICAgICB0aGlzLm1lZGlhdG9yLm9uKGV2ZW50TmFtZSwgdGhpc1tjYl0uYmluZCh0aGlzKSk7XG4gICAgfSwgdGhpcyk7XG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGFnTmFtZTogJ2RpdicsXG4gIGNsYXNzTmFtZTogJ3Npci10cmV2b3JfX3ZpZXcnLFxuICBhdHRyaWJ1dGVzOiB7fSxcblxuICAkOiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnN0b3BMaXN0ZW5pbmcpKSB7IHRoaXMuc3RvcExpc3RlbmluZygpOyB9XG4gICAgdGhpcy4kZWwucmVtb3ZlKCk7XG4gIH0sXG5cbiAgX2Vuc3VyZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5lbCkge1xuICAgICAgdmFyIGF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgXy5yZXN1bHQodGhpcywgJ2F0dHJpYnV0ZXMnKSksXG4gICAgICBodG1sO1xuICAgICAgaWYgKHRoaXMuaWQpIHsgYXR0cnMuaWQgPSB0aGlzLmlkOyB9XG4gICAgICBpZiAodGhpcy5jbGFzc05hbWUpIHsgYXR0cnNbJ2NsYXNzJ10gPSB0aGlzLmNsYXNzTmFtZTsgfVxuXG4gICAgICBpZiAoYXR0cnMuaHRtbCkge1xuICAgICAgICBodG1sID0gYXR0cnMuaHRtbDtcbiAgICAgICAgZGVsZXRlIGF0dHJzLmh0bWw7XG4gICAgICB9XG4gICAgICB2YXIgJGVsID0gJCgnPCcgKyB0aGlzLnRhZ05hbWUgKyAnPicpLmF0dHIoYXR0cnMpO1xuICAgICAgaWYgKGh0bWwpIHsgJGVsLmh0bWwoaHRtbCk7IH1cbiAgICAgIHRoaXMuX3NldEVsZW1lbnQoJGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWxlbWVudCh0aGlzLmVsKTtcbiAgICB9XG4gIH0sXG5cbiAgX3NldEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5lbCA9IHRoaXMuJGVsWzBdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgQmxvY2tSZW9yZGVyID0gcmVxdWlyZSgnLi9ibG9jay1yZW9yZGVyJyk7XG5cbnZhciBTaW1wbGVCbG9jayA9IGZ1bmN0aW9uKGRhdGEsIGluc3RhbmNlX2lkLCBtZWRpYXRvciwgb3B0aW9ucykge1xuICB0aGlzLmNyZWF0ZVN0b3JlKGRhdGEpO1xuICB0aGlzLmJsb2NrSUQgPSBfLnVuaXF1ZUlkKCdzdC1ibG9jay0nKTtcbiAgdGhpcy5pbnN0YW5jZUlEID0gaW5zdGFuY2VfaWQ7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oU2ltcGxlQmxvY2sucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vYmxvY2stc3RvcmUnKSwge1xuXG4gIGZvY3VzIDogZnVuY3Rpb24oKSB7fSxcblxuICB2YWxpZCA6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSxcblxuICBjbGFzc05hbWU6ICdzdC1ibG9jaycsXG5cbiAgYmxvY2tfdGVtcGxhdGU6IF8udGVtcGxhdGUoXG4gICAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9ja19faW5uZXInPjwlPSBlZGl0b3JfaHRtbCAlPjwvZGl2PlwiXG4gICksXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdpZCc6IHRoaXMuYmxvY2tJRCxcbiAgICAgICdkYXRhLXR5cGUnOiB0aGlzLnR5cGUsXG4gICAgICAnZGF0YS1pbnN0YW5jZSc6IHRoaXMuaW5zdGFuY2VJRFxuICAgIH07XG4gIH0sXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB1dGlscy50aXRsZWl6ZSh0aGlzLnR5cGUucmVwbGFjZSgvW1xcV19dL2csICcgJykpO1xuICB9LFxuXG4gIGJsb2NrQ1NTQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmxvY2tDU1NDbGFzcyA9IHV0aWxzLnRvU2x1Zyh0aGlzLnR5cGUpO1xuICAgIHJldHVybiB0aGlzLmJsb2NrQ1NTQ2xhc3M7XG4gIH0sXG5cbiAgdHlwZTogJycsXG5cbiAgY2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB1dGlscy5jbGFzc2lmeSh0aGlzLnR5cGUpO1xuICB9LFxuXG4gIGVkaXRvckhUTUw6ICcnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge30sXG5cbiAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKXt9LFxuICBiZWZvcmVCbG9ja1JlbmRlcjogZnVuY3Rpb24oKXt9LFxuXG4gIF9zZXRCbG9ja0lubmVyIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVkaXRvcl9odG1sID0gXy5yZXN1bHQodGhpcywgJ2VkaXRvckhUTUwnKTtcblxuICAgIHRoaXMuJGVsLmFwcGVuZChcbiAgICAgIHRoaXMuYmxvY2tfdGVtcGxhdGUoeyBlZGl0b3JfaHRtbDogZWRpdG9yX2h0bWwgfSlcbiAgICApO1xuXG4gICAgdGhpcy4kaW5uZXIgPSB0aGlzLiRlbC5maW5kKCcuc3QtYmxvY2tfX2lubmVyJyk7XG4gICAgdGhpcy4kaW5uZXIuYmluZCgnY2xpY2sgbW91c2VvdmVyJywgZnVuY3Rpb24oZSl7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWZvcmVCbG9ja1JlbmRlcigpO1xuXG4gICAgdGhpcy5fc2V0QmxvY2tJbm5lcigpO1xuICAgIHRoaXMuX2Jsb2NrUHJlcGFyZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2Jsb2NrUHJlcGFyZSA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2luaXRVSSgpO1xuICAgIHRoaXMuX2luaXRNZXNzYWdlcygpO1xuXG4gICAgdGhpcy5jaGVja0FuZExvYWREYXRhKCk7XG5cbiAgICB0aGlzLiRlbC5hZGRDbGFzcygnc3QtaXRlbS1yZWFkeScpO1xuICAgIHRoaXMub24oXCJvblJlbmRlclwiLCB0aGlzLm9uQmxvY2tSZW5kZXIpO1xuICAgIHRoaXMuc2F2ZSgpO1xuICB9LFxuXG4gIF93aXRoVUlDb21wb25lbnQ6IGZ1bmN0aW9uKGNvbXBvbmVudCwgY2xhc3NOYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuJHVpLmFwcGVuZChjb21wb25lbnQucmVuZGVyKCkuJGVsKTtcbiAgICBpZiAoY2xhc3NOYW1lICYmIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLiR1aS5vbignY2xpY2snLCBjbGFzc05hbWUsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgX2luaXRVSSA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1aV9lbGVtZW50ID0gJChcIjxkaXY+XCIsIHsgJ2NsYXNzJzogJ3N0LWJsb2NrX191aScgfSk7XG4gICAgdGhpcy4kaW5uZXIuYXBwZW5kKHVpX2VsZW1lbnQpO1xuICAgIHRoaXMuJHVpID0gdWlfZWxlbWVudDtcbiAgICB0aGlzLl9pbml0VUlDb21wb25lbnRzKCk7XG4gIH0sXG5cbiAgX2luaXRNZXNzYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1zZ3NfZWxlbWVudCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19fbWVzc2FnZXMnIH0pO1xuICAgIHRoaXMuJGlubmVyLnByZXBlbmQobXNnc19lbGVtZW50KTtcbiAgICB0aGlzLiRtZXNzYWdlcyA9IG1zZ3NfZWxlbWVudDtcbiAgfSxcblxuICBhZGRNZXNzYWdlOiBmdW5jdGlvbihtc2csIGFkZGl0aW9uYWxDbGFzcykge1xuICAgIHZhciAkbXNnID0gJChcIjxzcGFuPlwiLCB7IGh0bWw6IG1zZywgY2xhc3M6IFwic3QtbXNnIFwiICsgYWRkaXRpb25hbENsYXNzIH0pO1xuICAgIHRoaXMuJG1lc3NhZ2VzLmFwcGVuZCgkbXNnKVxuICAgIC5hZGRDbGFzcygnc3QtYmxvY2tfX21lc3NhZ2VzLS1pcy12aXNpYmxlJyk7XG4gICAgcmV0dXJuICRtc2c7XG4gIH0sXG5cbiAgcmVzZXRNZXNzYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kbWVzc2FnZXMuaHRtbCgnJylcbiAgICAucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrX19tZXNzYWdlcy0taXMtdmlzaWJsZScpO1xuICB9LFxuXG4gIF9pbml0VUlDb21wb25lbnRzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrUmVvcmRlcih0aGlzLiRlbCkpO1xuICB9XG5cbn0pO1xuXG5TaW1wbGVCbG9jay5mbiA9IFNpbXBsZUJsb2NrLnByb3RvdHlwZTtcblxuLy8gQWxsb3cgb3VyIEJsb2NrIHRvIGJlIGV4dGVuZGVkLlxuU2ltcGxlQmxvY2suZXh0ZW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2V4dGVuZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUJsb2NrO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtYXJrZG93biwgdHlwZSkge1xuXG4gIC8vIERlZmVycmluZyByZXF1aXJpbmcgdGhlc2UgdG8gc2lkZXN0ZXAgYSBjaXJjdWxhciBkZXBlbmRlbmN5OlxuICAvLyBCbG9jayAtPiB0aGlzIC0+IEJsb2NrcyAtPiBCbG9ja1xuICB2YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbiAgdmFyIEZvcm1hdHRlcnMgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKTtcblxuICAvLyBNRCAtPiBIVE1MXG4gIHR5cGUgPSB1dGlscy5jbGFzc2lmeSh0eXBlKTtcblxuICB2YXIgaHRtbCA9IG1hcmtkb3duLFxuICAgICAgc2hvdWxkV3JhcCA9IHR5cGUgPT09IFwiVGV4dFwiO1xuXG4gIGlmKF8uaXNVbmRlZmluZWQoc2hvdWxkV3JhcCkpIHsgc2hvdWxkV3JhcCA9IGZhbHNlOyB9XG5cbiAgaWYgKHNob3VsZFdyYXApIHtcbiAgICBodG1sID0gXCI8ZGl2PlwiICsgaHRtbDtcbiAgfVxuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKChbXlxcKV0rKVxcKS9nbSxmdW5jdGlvbihtYXRjaCwgcDEsIHAyKXtcbiAgICByZXR1cm4gXCI8YSBocmVmPSdcIitwMitcIic+XCIrcDEucmVwbGFjZSgvXFxuL2csICcnKStcIjwvYT5cIjtcbiAgfSk7XG5cbiAgLy8gVGhpcyBtYXkgc2VlbSBjcmF6eSwgYnV0IGJlY2F1c2UgSlMgZG9lc24ndCBoYXZlIGEgbG9vayBiZWhpbmQsXG4gIC8vIHdlIHJldmVyc2UgdGhlIHN0cmluZyB0byByZWdleCBvdXQgdGhlIGl0YWxpYyBpdGVtcyAoYW5kIGJvbGQpXG4gIC8vIGFuZCBsb29rIGZvciBzb21ldGhpbmcgdGhhdCBkb2Vzbid0IHN0YXJ0IChvciBlbmQgaW4gdGhlIHJldmVyc2VkIHN0cmluZ3MgY2FzZSlcbiAgLy8gd2l0aCBhIHNsYXNoLlxuICBodG1sID0gdXRpbHMucmV2ZXJzZShcbiAgICAgICAgICAgdXRpbHMucmV2ZXJzZShodG1sKVxuICAgICAgICAgICAucmVwbGFjZSgvXyg/IVxcXFwpKChfXFxcXHxbXl9dKSopXyg/PSR8W15cXFxcXSkvZ20sIGZ1bmN0aW9uKG1hdGNoLCBwMSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI+aS88XCIrIHAxLnJlcGxhY2UoL1xcbi9nLCAnJykucmVwbGFjZSgvW1xcc10rJC8sJycpICtcIj5pPFwiO1xuICAgICAgICAgICB9KVxuICAgICAgICAgICAucmVwbGFjZSgvXFwqXFwqKD8hXFxcXCkoKFxcKlxcKlxcXFx8W15cXCpcXCpdKSopXFwqXFwqKD89JHxbXlxcXFxdKS9nbSwgZnVuY3Rpb24obWF0Y2gsIHAxKXtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPmIvPFwiKyBwMS5yZXBsYWNlKC9cXG4vZywgJycpLnJlcGxhY2UoL1tcXHNdKyQvLCcnKSArXCI+YjxcIjtcbiAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuXG4gIGh0bWwgPSAgaHRtbC5yZXBsYWNlKC9eXFw+ICguKykkL21nLFwiJDFcIik7XG5cbiAgLy8gVXNlIGN1c3RvbSBmb3JtYXR0ZXJzIHRvSFRNTCBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGZvcm1hdE5hbWUsIGZvcm1hdDtcbiAgZm9yKGZvcm1hdE5hbWUgaW4gRm9ybWF0dGVycykge1xuICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KGZvcm1hdE5hbWUpKSB7XG4gICAgICBmb3JtYXQgPSBGb3JtYXR0ZXJzW2Zvcm1hdE5hbWVdO1xuICAgICAgLy8gRG8gd2UgaGF2ZSBhIHRvSFRNTCBmdW5jdGlvbj9cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXQudG9IVE1MKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0LnRvSFRNTCkpIHtcbiAgICAgICAgaHRtbCA9IGZvcm1hdC50b0hUTUwoaHRtbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlIGN1c3RvbSBibG9jayB0b0hUTUwgZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBibG9jaztcbiAgaWYgKEJsb2Nrcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgIGJsb2NrID0gQmxvY2tzW3R5cGVdO1xuICAgIC8vIERvIHdlIGhhdmUgYSB0b0hUTUwgZnVuY3Rpb24/XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGJsb2NrLnByb3RvdHlwZS50b0hUTUwpICYmIF8uaXNGdW5jdGlvbihibG9jay5wcm90b3R5cGUudG9IVE1MKSkge1xuICAgICAgaHRtbCA9IGJsb2NrLnByb3RvdHlwZS50b0hUTUwoaHRtbCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNob3VsZFdyYXApIHtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXG5cXG4vZ20sIFwiPC9kaXY+PGRpdj48YnI+PC9kaXY+PGRpdj5cIik7XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxuL2dtLCBcIjwvZGl2PjxkaXY+XCIpO1xuICB9XG5cbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFx0L2csIFwiJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCBcIjxicj5cIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFwqXFwqLywgXCJcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvX18vLCBcIlwiKTsgIC8vIENsZWFudXAgYW55IG1hcmtkb3duIGNoYXJhY3RlcnMgbGVmdFxuXG4gIC8vIFJlcGxhY2UgZXNjYXBlZFxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiKlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFxbL2csIFwiW1wiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFxdL2csIFwiXVwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFxfL2csIFwiX1wiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFwoL2csIFwiKFwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFwpL2csIFwiKVwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXFwtL2csIFwiLVwiKTtcblxuICBpZiAoc2hvdWxkV3JhcCkge1xuICAgIGh0bWwgKz0gXCI8L2Rpdj5cIjtcbiAgfVxuXG4gIHJldHVybiBodG1sO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29udGVudCwgdHlwZSkge1xuXG4gIC8vIERlZmVycmluZyByZXF1aXJpbmcgdGhlc2UgdG8gc2lkZXN0ZXAgYSBjaXJjdWxhciBkZXBlbmRlbmN5OlxuICAvLyBCbG9jayAtPiB0aGlzIC0+IEJsb2NrcyAtPiBCbG9ja1xuICB2YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbiAgdmFyIEZvcm1hdHRlcnMgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKTtcblxuICB0eXBlID0gdXRpbHMuY2xhc3NpZnkodHlwZSk7XG5cbiAgdmFyIG1hcmtkb3duID0gY29udGVudDtcblxuICAvL05vcm1hbGlzZSB3aGl0ZXNwYWNlXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvJm5ic3A7L2csXCIgXCIpO1xuXG4gIC8vIEZpcnN0IG9mIGFsbCwgc3RyaXAgYW55IGFkZGl0aW9uYWwgZm9ybWF0dGluZ1xuICAvLyBNU1dvcmQsIEknbSBsb29raW5nIGF0IHlvdSwgcHVuay5cbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC8oIGNsYXNzPShcIik/TXNvW2EtekEtWl0rKFwiKT8pL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwhLS0oLio/KS0tPi9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCooLio/KVxcKlxcLy9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88KFxcLykqKG1ldGF8bGlua3xzcGFufFxcXFw/eG1sOnxzdDE6fG86fGZvbnQpKC4qPyk+L2dpLCAnJyk7XG5cbiAgdmFyIGJhZFRhZ3MgPSBbJ3N0eWxlJywgJ3NjcmlwdCcsICdhcHBsZXQnLCAnZW1iZWQnLCAnbm9mcmFtZXMnLCAnbm9zY3JpcHQnXSxcbiAgICAgIHRhZ1N0cmlwcGVyLCBpO1xuXG4gIGZvciAoaSA9IDA7IGk8IGJhZFRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB0YWdTdHJpcHBlciA9IG5ldyBSZWdFeHAoJzwnK2JhZFRhZ3NbaV0rJy4qPycrYmFkVGFnc1tpXSsnKC4qPyk+JywgJ2dpJyk7XG4gICAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKHRhZ1N0cmlwcGVyLCAnJyk7XG4gIH1cblxuICAvLyBFc2NhcGUgYW55dGhpbmcgaW4gaGVyZSB0aGF0ICpjb3VsZCogYmUgY29uc2lkZXJlZCBhcyBNRFxuICAvLyBNYXJrZG93biBjaGFycyB3ZSBjYXJlIGFib3V0OiAqIFtdIF8gKCkgLVxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoL1xcKi9nLCBcIlxcXFwqXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFsvZywgXCJcXFxcW1wiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxdL2csIFwiXFxcXF1cIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXy9nLCBcIlxcXFxfXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCgvZywgXCJcXFxcKFwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwpL2csIFwiXFxcXClcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLS9nLCBcIlxcXFwtXCIpO1xuXG4gIHZhciBpbmxpbmVUYWdzID0gW1wiZW1cIiwgXCJpXCIsIFwic3Ryb25nXCIsIFwiYlwiXTtcblxuICBmb3IgKGkgPSAwOyBpPCBpbmxpbmVUYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFnU3RyaXBwZXIgPSBuZXcgUmVnRXhwKCc8JytpbmxpbmVUYWdzW2ldKyc+PGJyPjwvJytpbmxpbmVUYWdzW2ldKyc+JywgJ2dpJyk7XG4gICAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKHRhZ1N0cmlwcGVyLCAnPGJyPicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVwbGFjZUJvbGRzKG1hdGNoLCBwMSwgcDIpe1xuICAgIGlmKF8uaXNVbmRlZmluZWQocDIpKSB7IHAyID0gJyc7IH1cbiAgICByZXR1cm4gXCIqKlwiICsgcDEucmVwbGFjZSgvPCguKT9iciguKT8+L2csICcnKSArIFwiKipcIiArIHAyO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVwbGFjZUl0YWxpY3MobWF0Y2gsIHAxLCBwMil7XG4gICAgaWYoXy5pc1VuZGVmaW5lZChwMikpIHsgcDIgPSAnJzsgfVxuICAgIHJldHVybiBcIl9cIiArIHAxLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLCAnJykgKyBcIl9cIiArIHAyO1xuICB9XG5cbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC88KFxcdyspKD86XFxzK1xcdys9XCJbXlwiXSsoPzpcIlxcJFteXCJdK1wiW15cIl0rKT9cIikqPlxccyo8XFwvXFwxPi9naW0sICcnKSAvL0VtcHR5IGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9tZyxcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88YS4qP2hyZWY9W1wiXCInXSguKj8pW1wiXCInXS4qPz4oLio/KTxcXC9hPi9naW0sIGZ1bmN0aW9uKG1hdGNoLCBwMSwgcDIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiW1wiICsgcDIudHJpbSgpLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLCAnJykgKyBcIl0oXCIrIHAxICtcIilcIjtcbiAgICAgICAgICAgICAgICAgICAgICB9KSAvLyBIeXBlcmxpbmtzXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxzdHJvbmc+KD86XFxzKikoLio/KShcXHMpKj88XFwvc3Ryb25nPi9naW0sIHJlcGxhY2VCb2xkcylcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGI+KD86XFxzKikoLio/KShcXHMqKT88XFwvYj4vZ2ltLCByZXBsYWNlQm9sZHMpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxlbT4oPzpcXHMqKSguKj8pKFxccyopPzxcXC9lbT4vZ2ltLCByZXBsYWNlSXRhbGljcylcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGk+KD86XFxzKikoLio/KShcXHMqKT88XFwvaT4vZ2ltLCByZXBsYWNlSXRhbGljcyk7XG5cblxuICAvLyBVc2UgY3VzdG9tIGZvcm1hdHRlcnMgdG9NYXJrZG93biBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGZvcm1hdE5hbWUsIGZvcm1hdDtcbiAgZm9yKGZvcm1hdE5hbWUgaW4gRm9ybWF0dGVycykge1xuICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KGZvcm1hdE5hbWUpKSB7XG4gICAgICBmb3JtYXQgPSBGb3JtYXR0ZXJzW2Zvcm1hdE5hbWVdO1xuICAgICAgLy8gRG8gd2UgaGF2ZSBhIHRvTWFya2Rvd24gZnVuY3Rpb24/XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0LnRvTWFya2Rvd24pICYmIF8uaXNGdW5jdGlvbihmb3JtYXQudG9NYXJrZG93bikpIHtcbiAgICAgICAgbWFya2Rvd24gPSBmb3JtYXQudG9NYXJrZG93bihtYXJrZG93bik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRG8gb3VyIGdlbmVyaWMgc3RyaXBwaW5nIG91dFxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLyhbXjw+XSspKDxkaXY+KS9nLFwiJDFcXG4kMlwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpdml0aXMgc3R5bGUgbGluZSBicmVha3MgKGhhbmRsZSB0aGUgZmlyc3QgbGluZSlcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxkaXY+PGRpdj4vZywnXFxuPGRpdj4nKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXiAoZG91YmxlIG9wZW5pbmcgZGl2cyB3aXRoIG9uZSBjbG9zZSBmcm9tIENocm9tZSlcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OjxkaXY+KShbXjw+XSspKD86PGRpdj4pL2csXCIkMVxcblwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBeIChoYW5kbGUgbmVzdGVkIGRpdnMgdGhhdCBzdGFydCB3aXRoIGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzo8ZGl2PikoPzo8YnI+KT8oW148Pl0rKSg/Ojxicj4pPyg/OjxcXC9kaXY+KS9nLFwiJDFcXG5cIikgICAgICAgIC8vIF4gKGhhbmRsZSBjb250ZW50IGluc2lkZSBkaXZzKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPFxcL3A+L2csXCJcXG5cXG5cIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFAgdGFncyBhcyBsaW5lIGJyZWFrc1xuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCguKT9iciguKT8+L2csXCJcXG5cIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgbm9ybWFsIGxpbmUgYnJlYWtzXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7L2csXCI8XCIpLnJlcGxhY2UoLyZndDsvZyxcIj5cIik7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5jb2RpbmdcblxuICAvLyBVc2UgY3VzdG9tIGJsb2NrIHRvTWFya2Rvd24gZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBibG9jaztcbiAgaWYgKEJsb2Nrcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgIGJsb2NrID0gQmxvY2tzW3R5cGVdO1xuICAgIC8vIERvIHdlIGhhdmUgYSB0b01hcmtkb3duIGZ1bmN0aW9uP1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChibG9jay5wcm90b3R5cGUudG9NYXJrZG93bikgJiYgXy5pc0Z1bmN0aW9uKGJsb2NrLnByb3RvdHlwZS50b01hcmtkb3duKSkge1xuICAgICAgbWFya2Rvd24gPSBibG9jay5wcm90b3R5cGUudG9NYXJrZG93bihtYXJrZG93bik7XG4gICAgfVxuICB9XG5cbiAgLy8gU3RyaXAgcmVtYWluaW5nIEhUTUxcbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIik7XG5cbiAgcmV0dXJuIG1hcmtkb3duO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxudmFyIHVybFJlZ2V4ID0gL14oPzooW0EtWmEtel0rKTopPyhcXC97MCwzfSkoWzAtOS5cXC1BLVphLXpdKykoPzo6KFxcZCspKT8oPzpcXC8oW14/I10qKSk/KD86XFw/KFteI10qKSk/KD86IyguKikpPyQvO1xuXG52YXIgdXRpbHMgPSB7XG4gIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGNvbnNvbGUpICYmIGNvbmZpZy5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNVUkkgOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICByZXR1cm4gKHVybFJlZ2V4LnRlc3Qoc3RyaW5nKSk7XG4gIH0sXG5cbiAgdGl0bGVpemU6IGZ1bmN0aW9uKHN0cil7XG4gICAgaWYgKHN0ciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBzdHIgID0gU3RyaW5nKHN0cikudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg/Ol58XFxzfC0pXFxTL2csIGZ1bmN0aW9uKGMpeyByZXR1cm4gYy50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgfSxcblxuICBjbGFzc2lmeTogZnVuY3Rpb24oc3RyKXtcbiAgICByZXR1cm4gdXRpbHMudGl0bGVpemUoU3RyaW5nKHN0cikucmVwbGFjZSgvW1xcV19dL2csICcgJykpLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gIH0sXG5cbiAgY2FwaXRhbGl6ZSA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCk7XG4gIH0sXG5cbiAgZmxhdHRlbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHggPSB7fTtcbiAgICAoQXJyYXkuaXNBcnJheShvYmopID8gb2JqIDogT2JqZWN0LmtleXMob2JqKSkuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgeFtpXSA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHg7XG4gIH0sXG5cbiAgdW5kZXJzY29yZWQ6IGZ1bmN0aW9uKHN0cil7XG4gICAgcmV0dXJuIHN0ci50cmltKCkucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSspL2csICckMV8kMicpXG4gICAgLnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gIH0sXG5cbiAgdG9TbHVnOiBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15cXHcgXSsvZywnJylcbiAgICAucmVwbGFjZSgvICsvZywnLScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8ganNoaW50IGZyZWV6ZTogZmFsc2VcblxuaWYgKCFbXS5pbmNsdWRlcykge1xuICBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbihzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXgqLyApIHtcbiAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHRoaXMgdmFsdWUgdG8gb2JqZWN0Jyk7XG4gICAgfVxuICAgIHZhciBPID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSBwYXJzZUludChPLmxlbmd0aCkgfHwgMDtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VJbnQoYXJndW1lbnRzWzFdKSB8fCAwO1xuICAgIHZhciBrO1xuICAgIGlmIChuID49IDApIHtcbiAgICAgIGsgPSBuO1xuICAgIH0gZWxzZSB7XG4gICAgICBrID0gbGVuICsgbjtcbiAgICAgIGlmIChrIDwgMCkge1xuICAgICAgICBrID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IE9ba107XG4gICAgICBpZiAoc2VhcmNoRWxlbWVudCA9PT0gY3VycmVudEVsZW1lbnQgfHxcbiAgICAgICAgIChzZWFyY2hFbGVtZW50ICE9PSBzZWFyY2hFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSBjdXJyZW50RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBrKys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiJdfQ==
