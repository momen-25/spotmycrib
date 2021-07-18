(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Logic;

var require = meteorInstall({"node_modules":{"meteor":{"meteortoys:toykit":{"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/main.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ToyKit: () => ToyKit
});
let ToyKit;
module.link("../shared", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
module.link("./methods.js");
module.link("./publications.js");
module.link("./startup.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/methods.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Logic;
module.link("./logic", {
  Logic(v) {
    Logic = v;
  }

}, 0);
Meteor.methods({
  MeteorToysRegistry: function () {
    return Logic.registry.getList();
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publications.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/publications.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("../shared", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
Meteor.publish("MeteorToys", function (param) {
  check(param, Match.Any);

  if (param) {
    var collectionList = Mongo.Collection.getAll();
    return collectionList.map(function (name) {
      if (name) return Mongo.Collection.get(name).find();
    });
  } else {
    return [ToyKit.data.Impersonate.find({}, {
      limit: 15
    }), ToyKit.data.JetSetter.find(), ToyKit.data.AutoPub.find(), ToyKit.data.Throttle.find(), ToyKit.data.Email.find({}, {
      sort: {
        'timestamp': 1
      },
      limit: 15
    }), ToyKit.data.Result.find({}, {
      sort: {
        'timestamp': -1
      },
      limit: 15
    }), ToyKit.data.Mongol.find({}, {
      sort: {
        'Mongol_date': 1
      },
      limit: 15
    })];
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"startup.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/startup.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Logic;
module.link("./logic", {
  Logic(v) {
    Logic = v;
  }

}, 0);
module.link("./methods.js");
module.link("./publications.js");
Meteor.startup(function () {
  Logic.registry.scan();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"logic":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/logic/index.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Logic: () => Logic
});
let Registry;
module.link("./registry.js", {
  Registry(v) {
    Registry = v;
  }

}, 0);
module.runSetters(Logic = {});
Logic.registry = Registry;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"registry.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/server/logic/registry.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Registry: () => Registry
});
var Registry = {};
Registry.data = {};

Registry.register = function (data, addon) {
  var name = data.template;
  data.addon = addon;
  Registry[name] = data;
};

Registry.scan = function (organization, type) {
  var packageList = Object.keys(Package);
  packageList.forEach(function (packageName) {
    if (Package[packageName].ToyKit) {
      var addon = !packageName.includes("meteortoys:");
      Registry.register(Package[packageName].ToyKit, addon);
    }
  });
};

Registry.getList = function () {
  return Registry.data;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"shared":{"collections.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/shared/collections.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Collection: () => Collection
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let MongoInternals;
module.link("meteor/mongo", {
  MongoInternals(v) {
    MongoInternals = v;
  }

}, 1);
var _0x59c6 = ['setTimeout', 'generateList', 'get', 'isClient', 'connection', '_stores', '_getCollection', 'open', 'isServer', 'defaultRemoteCollectionDriver', 'listCollections', 'forEach', 'push', 'getList'];

(function (_0x7fe618, _0x3a4ea0) {
  var _0x2f5eab = function (_0xadad64) {
    while (--_0xadad64) {
      _0x7fe618['push'](_0x7fe618['shift']());
    }
  };

  _0x2f5eab(++_0x3a4ea0);
})(_0x59c6, 0x17a);

var _0x3617 = function (_0x3f8819, _0x232fc4) {
  _0x3f8819 = _0x3f8819 - 0x0;
  var _0x5d8702 = _0x59c6[_0x3f8819];
  return _0x5d8702;
};

var Collection = {};
var collectionList = [];
Meteor['startup'](function () {
  Collection['generateList']();

  Meteor[_0x3617('0x0')](function () {
    Collection[_0x3617('0x1')]();
  }, 0x1388);
});

Collection[_0x3617('0x2')] = function (_0x1ff186) {
  check(_0x1ff186, String);

  if (Meteor[_0x3617('0x3')]) {
    var _0xdeeda8 = Meteor[_0x3617('0x4')][_0x3617('0x5')][_0x1ff186];

    if (_0xdeeda8) return _0xdeeda8[_0x3617('0x6')]();
  } else {
    return MongoInternals['defaultRemoteCollectionDriver']()[_0x3617('0x7')](_0x1ff186);
  }
};

Collection[_0x3617('0x1')] = function () {
  if (Meteor[_0x3617('0x8')]) {
    collectionList = [];

    var _0x5b00e9 = MongoInternals[_0x3617('0x9')]()['mongo']['db'];

    var _0x16a0f9 = _0x5b00e9[_0x3617('0xa')]();

    var _0x32d094 = _0x16a0f9[_0x3617('0xb')](function (_0x355098) {
      collectionList[_0x3617('0xc')](_0x355098['name']);
    });
  }
};

Collection[_0x3617('0xd')] = function () {
  if (Meteor[_0x3617('0x3')]) {
    return Object['keys'](Meteor[_0x3617('0x4')][_0x3617('0x5')]);
  } else {
    return collectionList;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"data.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/shared/data.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Data: () => Data
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
var Data = {
  'Impersonate': new Mongo.Collection("MeteorToys.Impersonate"),
  'JetSetter': new Mongo.Collection("MeteorToys.JetSetter"),
  'Mongol': new Mongo.Collection("MeteorToys.Mongol"),
  'AutoPub': new Mongo.Collection("MeteorToys.AutoPub"),
  'Email': new Mongo.Collection("MeteorToys.Email"),
  'Result': new Mongo.Collection("MeteorToys.Result"),
  'Throttle': new Mongo.Collection("MeteorToys.Throttle")
};
Data.Impersonate.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
Data.JetSetter.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
Data.Mongol.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
Data.AutoPub.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
Data.Email.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
Data.Result.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/shared/index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ToyKit: () => ToyKit
});
let Collection;
module.link("./collections.js", {
  Collection(v) {
    Collection = v;
  }

}, 0);
let Data;
module.link("./data.js", {
  Data(v) {
    Data = v;
  }

}, 1);
let RJSON;
module.link("./parse.js", {
  RJSON(v) {
    RJSON = v;
  }

}, 2);
var ToyKit = {};

if (Meteor.isClient) {
  let ReactiveDict;
  module.link("meteor/reactive-dict", {
    ReactiveDict(v) {
      ReactiveDict = v;
    }

  }, 3);
  module.runSetters(ToyKit = new ReactiveDict("MeteorToys"));
}

ToyKit.collection = Collection;
ToyKit.data = Data;
ToyKit.parse = RJSON.parse;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parse.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/meteortoys_toykit/shared/parse.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  module1.export({
    RJSON: () => RJSON
  });
  var RJSON;
  /*
    Copyright (c) 2013, Oleg Grenrus
    All rights reserved.
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
        * Neither the name of the Oleg Grenrus nor the
          names of its contributors may be used to endorse or promote products
          derived from this software without specific prior written permission.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL OLEG GRENRUS BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  (function () {
    "use strict"; // slightly different from ES5 some, without cast to boolean
    // [x, y, z].some(f):
    // ES5:  !! ( f(x) || f(y) || f(z) || false)
    // this:    ( f(x) || f(y) || f(z) || false)

    function some(array, f) {
      var acc = false;

      for (var i = 0; i < array.length; i++) {
        acc = f(array[i], i, array);

        if (acc) {
          return acc;
        }
      }

      return acc;
    }

    function makeLexer(tokenSpecs) {
      return function (contents) {
        var tokens = [];
        var line = 1;

        function findToken() {
          return some(tokenSpecs, function (tokenSpec) {
            var m = tokenSpec.re.exec(contents);

            if (m) {
              var raw = m[0];
              contents = contents.slice(raw.length);
              return {
                raw: raw,
                matched: tokenSpec.f(m, line)
              };
            } else {
              return undefined;
            }
          });
        }

        while (contents !== "") {
          var matched = findToken();

          if (!matched) {
            var err = new SyntaxError("Unexpected character: " + contents[0] + "; input: " + contents.substr(0, 100));
            err.line = line;
            throw err;
          } // add line to token


          matched.matched.line = line; // count lines

          line += matched.raw.replace(/[^\n]/g, "").length;
          tokens.push(matched.matched);
        }

        return tokens;
      };
    }

    function fStringSingle(m) {
      // String in single quotes
      var content = m[1].replace(/([^'\\]|\\['bnrtf\\]|\\u[0-9a-fA-F]{4})/g, function (mm) {
        if (mm === "\"") {
          return "\\\"";
        } else if (mm === "\\'") {
          return "'";
        } else {
          return mm;
        }
      });
      return {
        type: "string",
        match: "\"" + content + "\"",
        value: JSON.parse("\"" + content + "\"") // abusing real JSON.parse to unquote string

      };
    }

    function fStringDouble(m) {
      return {
        type: "string",
        match: m[0],
        value: JSON.parse(m[0])
      };
    }

    function fIdentifier(m) {
      // identifiers are transformed into strings
      return {
        type: "string",
        value: m[0],
        match: "\"" + m[0].replace(/./g, function (c) {
          return c === "\\" ? "\\\\" : c;
        }) + "\""
      };
    }

    function fComment(m) {
      // comments are whitespace, leave only linefeeds
      return {
        type: " ",
        match: m[0].replace(/./g, function (c) {
          return /\s/.test(c) ? c : " ";
        })
      };
    }

    function fNumber(m) {
      return {
        type: "number",
        match: m[0],
        value: parseFloat(m[0])
      };
    }

    function fKeyword(m) {
      var value;

      switch (m[1]) {
        case "null":
          value = null;
          break;

        case "true":
          value = true;
          break;

        case "false":
          value = false;
          break;
        // no default
      }

      return {
        type: "atom",
        match: m[0],
        value: value
      };
    }

    function makeTokenSpecs(relaxed) {
      function f(type) {
        return function (m) {
          return {
            type: type,
            match: m[0]
          };
        };
      }

      var ret = [{
        re: /^\s+/,
        f: f(" ")
      }, {
        re: /^\{/,
        f: f("{")
      }, {
        re: /^\}/,
        f: f("}")
      }, {
        re: /^\[/,
        f: f("[")
      }, {
        re: /^\]/,
        f: f("]")
      }, {
        re: /^,/,
        f: f(",")
      }, {
        re: /^:/,
        f: f(":")
      }, {
        re: /^(true|false|null)/,
        f: fKeyword
      }, {
        re: /^\-?\d+(\.\d+)?([eE][+-]?\d+)?/,
        f: fNumber
      }, {
        re: /^"([^"\\]|\\["bnrtf\\\/]|\\u[0-9a-fA-F]{4})*"/,
        f: fStringDouble
      }]; // additional stuff

      if (relaxed) {
        ret = ret.concat([{
          re: /^'(([^'\\]|\\['bnrtf\\\/]|\\u[0-9a-fA-F]{4})*)'/,
          f: fStringSingle
        }, {
          re: /^\/\/.*?(?:\r\n|\r|\n)/,
          f: fComment
        }, {
          re: /^\/\*[\s\S]*?\*\//,
          f: fComment
        }, {
          re: /^[$a-zA-Z0-9_\-+\.\*\?!\|&%\^\/#\\]+/,
          f: fIdentifier
        }]);
      }

      return ret;
    }

    var lexer = makeLexer(makeTokenSpecs(true));
    var strictLexer = makeLexer(makeTokenSpecs(false));

    function previousNWSToken(tokens, index) {
      for (; index >= 0; index--) {
        if (tokens[index].type !== " ") {
          return index;
        }
      }

      return undefined;
    }

    function stripTrailingComma(tokens) {
      var res = [];
      tokens.forEach(function (token, index) {
        if (token.type === "]" || token.type === "}") {
          // go backwards as long as there is whitespace, until first comma
          var commaI = previousNWSToken(res, index - 1);

          if (commaI && res[commaI].type === ",") {
            var preCommaI = previousNWSToken(res, commaI - 1);

            if (preCommaI && res[preCommaI].type !== "[" && res[preCommaI].type !== "{") {
              res[commaI] = {
                type: " ",
                match: " ",
                line: tokens[commaI].line
              };
            }
          }
        }

        res.push(token);
      });
      return res;
    }

    function transform(text) {
      // Tokenize contents
      var tokens = lexer(text); // remove trailing commas

      tokens = stripTrailingComma(tokens); // concat stuff

      return tokens.reduce(function (str, token) {
        return str + token.match;
      }, "");
    }

    function popToken(tokens, state) {
      var token = tokens[state.pos];
      state.pos += 1;

      if (!token) {
        var line = tokens.length !== 0 ? tokens[tokens.length - 1].line : 1;
        return {
          type: "eof",
          line: line
        };
      }

      return token;
    }

    function strToken(token) {
      switch (token.type) {
        case "atom":
        case "string":
        case "number":
          return token.type + " " + token.match;

        case "eof":
          return "end-of-file";

        default:
          return "'" + token.type + "'";
      }
    }

    function skipColon(tokens, state) {
      var colon = popToken(tokens, state);

      if (colon.type !== ":") {
        var message = "Unexpected token: " + strToken(colon) + ", expected ':'";

        if (state.tolerant) {
          state.warnings.push({
            message: message,
            line: colon.line
          });
          state.pos -= 1;
        } else {
          var err = new SyntaxError(message);
          err.line = colon.line;
          throw err;
        }
      }
    }

    function skipPunctuation(tokens, state, valid) {
      var punctuation = [",", ":", "]", "}"];
      var token = popToken(tokens, state);

      while (true) {
        // eslint-disable-line no-constant-condition
        if (valid && valid.indexOf(token.type) !== -1) {
          return token;
        } else if (token.type === "eof") {
          return token;
        } else if (punctuation.indexOf(token.type) !== -1) {
          var message = "Unexpected token: " + strToken(token) + ", expected '[', '{', number, string or atom";

          if (state.tolerant) {
            state.warnings.push({
              message: message,
              line: token.line
            });
            token = popToken(tokens, state);
          } else {
            var err = new SyntaxError(message);
            err.line = token.line;
            throw err;
          }
        } else {
          return token;
        }
      }
    }

    function raiseError(state, token, message) {
      if (state.tolerant) {
        state.warnings.push({
          message: message,
          line: token.line
        });
      } else {
        var err = new SyntaxError(message);
        err.line = token.line;
        throw err;
      }
    }

    function raiseUnexpected(state, token, expected) {
      raiseError(state, token, "Unexpected token: " + strToken(token) + ", expected " + expected);
    }

    function checkDuplicates(state, obj, token) {
      var key = token.value;

      if (state.duplicate && Object.prototype.hasOwnProperty.call(obj, key)) {
        raiseError(state, token, "Duplicate key: " + key);
      }
    }

    function appendPair(state, obj, key, value) {
      value = state.reviver ? state.reviver(key, value) : value;

      if (value !== undefined) {
        obj[key] = value;
      }
    }

    function parsePair(tokens, state, obj) {
      var token = skipPunctuation(tokens, state, [":"]);
      var key;
      var value;

      if (token.type !== "string") {
        raiseUnexpected(state, token, "string");

        switch (token.type) {
          case ":":
            token = {
              type: "string",
              value: "null",
              line: token.line
            };
            state.pos -= 1;
            break;

          case "number":
          case "atom":
            token = {
              type: "string",
              value: "" + token.value,
              line: token.line
            };
            break;

          case "[":
          case "{":
            state.pos -= 1;
            value = parseAny(tokens, state); // eslint-disable-line no-use-before-define

            appendPair(state, obj, "null", value);
            return;
          // no default
        }
      }

      checkDuplicates(state, obj, token);
      key = token.value;
      skipColon(tokens, state);
      value = parseAny(tokens, state); // eslint-disable-line no-use-before-define

      appendPair(state, obj, key, value);
    }

    function parseElement(tokens, state, arr) {
      var key = arr.length;
      var value = parseAny(tokens, state); // eslint-disable-line no-use-before-define

      arr[key] = state.reviver ? state.reviver("" + key, value) : value;
    }

    function parseObject(tokens, state) {
      return parseMany(tokens, state, {}, {
        // eslint-disable-line no-use-before-define
        skip: [":", "}"],
        elementParser: parsePair,
        elementName: "string",
        endSymbol: "}"
      });
    }

    function parseArray(tokens, state) {
      return parseMany(tokens, state, [], {
        // eslint-disable-line no-use-before-define
        skip: ["]"],
        elementParser: parseElement,
        elementName: "json object",
        endSymbol: "]"
      });
    }

    function parseMany(tokens, state, obj, opts) {
      var token = skipPunctuation(tokens, state, opts.skip);

      if (token.type === "eof") {
        raiseUnexpected(state, token, "'" + opts.endSymbol + "' or " + opts.elementName);
        token = {
          type: opts.endSymbol,
          line: token.line
        };
      }

      switch (token.type) {
        case opts.endSymbol:
          return obj;

        default:
          state.pos -= 1; // push the token back

          opts.elementParser(tokens, state, obj);
          break;
      } // Rest


      while (true) {
        // eslint-disable-line no-constant-condition
        token = popToken(tokens, state);

        if (token.type !== opts.endSymbol && token.type !== ",") {
          raiseUnexpected(state, token, "',' or '" + opts.endSymbol + "'");
          token = {
            type: token.type === "eof" ? opts.endSymbol : ",",
            line: token.line
          };
          state.pos -= 1;
        }

        switch (token.type) {
          case opts.endSymbol:
            return obj;

          case ",":
            opts.elementParser(tokens, state, obj);
            break;
          // no default
        }
      }
    }

    function endChecks(tokens, state, ret) {
      if (state.pos < tokens.length) {
        raiseError(state, tokens[state.pos], "Unexpected token: " + strToken(tokens[state.pos]) + ", expected end-of-input");
      } // Throw error at the end


      if (state.tolerant && state.warnings.length !== 0) {
        var message = state.warnings.length === 1 ? state.warnings[0].message : state.warnings.length + " parse warnings";
        var err = new SyntaxError(message);
        err.line = state.warnings[0].line;
        err.warnings = state.warnings;
        err.obj = ret;
        throw err;
      }
    }

    function parseAny(tokens, state, end) {
      var token = skipPunctuation(tokens, state);
      var ret;

      if (token.type === "eof") {
        raiseUnexpected(state, token, "json object");
      }

      switch (token.type) {
        case "{":
          ret = parseObject(tokens, state);
          break;

        case "[":
          ret = parseArray(tokens, state);
          break;

        case "string":
        case "number":
        case "atom":
          ret = token.value;
          break;
        // no default
      }

      if (end) {
        ret = state.reviver ? state.reviver("", ret) : ret;
        endChecks(tokens, state, ret);
      }

      return ret;
    }

    function parse(text, opts) {
      if (typeof opts === "function" || opts === undefined) {
        return JSON.parse(transform(text), opts);
      } else if (new Object(opts) !== opts) {
        // eslint-disable-line no-new-object
        throw new TypeError("opts/reviver should be undefined, a function or an object");
      }

      opts.relaxed = opts.relaxed !== undefined ? opts.relaxed : true;
      opts.warnings = opts.warnings || opts.tolerant || false;
      opts.tolerant = opts.tolerant || false;
      opts.duplicate = opts.duplicate || false;

      if (!opts.warnings && !opts.relaxed) {
        return JSON.parse(text, opts.reviver);
      }

      var tokens = opts.relaxed ? lexer(text) : strictLexer(text);

      if (opts.relaxed) {
        // Strip commas
        tokens = stripTrailingComma(tokens);
      }

      if (opts.warnings) {
        // Strip whitespace
        tokens = tokens.filter(function (token) {
          return token.type !== " ";
        });
        var state = {
          pos: 0,
          reviver: opts.reviver,
          tolerant: opts.tolerant,
          duplicate: opts.duplicate,
          warnings: []
        };
        return parseAny(tokens, state, true);
      } else {
        var newtext = tokens.reduce(function (str, token) {
          return str + token.match;
        }, "");
        return JSON.parse(newtext, opts.reviver);
      }
    }

    function stringifyPair(obj, key) {
      return JSON.stringify(key) + ":" + stringify(obj[key]); // eslint-disable-line no-use-before-define
    }

    function stringify(obj) {
      switch (typeof obj) {
        case "string":
        case "number":
        case "boolean":
          return JSON.stringify(obj);
        // no default
      }

      if (Array.isArray(obj)) {
        return "[" + obj.map(stringify).join(",") + "]";
      }

      if (new Object(obj) === obj) {
        // eslint-disable-line no-new-object
        var keys = Object.keys(obj);
        keys.sort();
        return "{" + keys.map(stringifyPair.bind(null, obj)) + "}";
      }

      return "null";
    } // Export  stuff


    module1.runSetters(RJSON = {
      transform: transform,
      parse: parse,
      stringify: stringify
    }); // /* global window, module */
    // if (typeof window !== "undefined") {
    //   window.RJSON = RJSON;
    // }
    // if (typeof module !== "undefined") {
    //   module.exports = RJSON;
    // }
  })();
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/meteortoys:toykit/server/main.js");

/* Exports */
Package._define("meteortoys:toykit", exports);

})();

//# sourceURL=meteor://💻app/packages/meteortoys_toykit.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9ydG95czp0b3lraXQvc2VydmVyL21haW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21ldGVvcnRveXM6dG95a2l0L3NlcnZlci9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tZXRlb3J0b3lzOnRveWtpdC9zZXJ2ZXIvcHVibGljYXRpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tZXRlb3J0b3lzOnRveWtpdC9zZXJ2ZXIvc3RhcnR1cC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9ydG95czp0b3lraXQvc2VydmVyL2xvZ2ljL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tZXRlb3J0b3lzOnRveWtpdC9zZXJ2ZXIvbG9naWMvcmVnaXN0cnkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21ldGVvcnRveXM6dG95a2l0L3NoYXJlZC9jb2xsZWN0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9ydG95czp0b3lraXQvc2hhcmVkL2RhdGEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21ldGVvcnRveXM6dG95a2l0L3NoYXJlZC9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9ydG95czp0b3lraXQvc2hhcmVkL3BhcnNlLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIlRveUtpdCIsImxpbmsiLCJ2IiwiTG9naWMiLCJNZXRlb3IiLCJtZXRob2RzIiwiTWV0ZW9yVG95c1JlZ2lzdHJ5IiwicmVnaXN0cnkiLCJnZXRMaXN0IiwicHVibGlzaCIsInBhcmFtIiwiY2hlY2siLCJNYXRjaCIsIkFueSIsImNvbGxlY3Rpb25MaXN0IiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiZ2V0QWxsIiwibWFwIiwibmFtZSIsImdldCIsImZpbmQiLCJkYXRhIiwiSW1wZXJzb25hdGUiLCJsaW1pdCIsIkpldFNldHRlciIsIkF1dG9QdWIiLCJUaHJvdHRsZSIsIkVtYWlsIiwic29ydCIsIlJlc3VsdCIsIk1vbmdvbCIsInN0YXJ0dXAiLCJzY2FuIiwiUmVnaXN0cnkiLCJyZWdpc3RlciIsImFkZG9uIiwidGVtcGxhdGUiLCJvcmdhbml6YXRpb24iLCJ0eXBlIiwicGFja2FnZUxpc3QiLCJPYmplY3QiLCJrZXlzIiwiUGFja2FnZSIsImZvckVhY2giLCJwYWNrYWdlTmFtZSIsImluY2x1ZGVzIiwiTW9uZ29JbnRlcm5hbHMiLCJfMHg1OWM2IiwiXzB4N2ZlNjE4IiwiXzB4M2E0ZWEwIiwiXzB4MmY1ZWFiIiwiXzB4YWRhZDY0IiwiXzB4MzYxNyIsIl8weDNmODgxOSIsIl8weDIzMmZjNCIsIl8weDVkODcwMiIsIl8weDFmZjE4NiIsIlN0cmluZyIsIl8weGRlZWRhOCIsIl8weDViMDBlOSIsIl8weDE2YTBmOSIsIl8weDMyZDA5NCIsIl8weDM1NTA5OCIsIkRhdGEiLCJhbGxvdyIsImluc2VydCIsInJlbW92ZSIsInVwZGF0ZSIsIlJKU09OIiwiaXNDbGllbnQiLCJSZWFjdGl2ZURpY3QiLCJjb2xsZWN0aW9uIiwicGFyc2UiLCJtb2R1bGUxIiwic29tZSIsImFycmF5IiwiZiIsImFjYyIsImkiLCJsZW5ndGgiLCJtYWtlTGV4ZXIiLCJ0b2tlblNwZWNzIiwiY29udGVudHMiLCJ0b2tlbnMiLCJsaW5lIiwiZmluZFRva2VuIiwidG9rZW5TcGVjIiwibSIsInJlIiwiZXhlYyIsInJhdyIsInNsaWNlIiwibWF0Y2hlZCIsInVuZGVmaW5lZCIsImVyciIsIlN5bnRheEVycm9yIiwic3Vic3RyIiwicmVwbGFjZSIsInB1c2giLCJmU3RyaW5nU2luZ2xlIiwiY29udGVudCIsIm1tIiwibWF0Y2giLCJ2YWx1ZSIsIkpTT04iLCJmU3RyaW5nRG91YmxlIiwiZklkZW50aWZpZXIiLCJjIiwiZkNvbW1lbnQiLCJ0ZXN0IiwiZk51bWJlciIsInBhcnNlRmxvYXQiLCJmS2V5d29yZCIsIm1ha2VUb2tlblNwZWNzIiwicmVsYXhlZCIsInJldCIsImNvbmNhdCIsImxleGVyIiwic3RyaWN0TGV4ZXIiLCJwcmV2aW91c05XU1Rva2VuIiwiaW5kZXgiLCJzdHJpcFRyYWlsaW5nQ29tbWEiLCJyZXMiLCJ0b2tlbiIsImNvbW1hSSIsInByZUNvbW1hSSIsInRyYW5zZm9ybSIsInRleHQiLCJyZWR1Y2UiLCJzdHIiLCJwb3BUb2tlbiIsInN0YXRlIiwicG9zIiwic3RyVG9rZW4iLCJza2lwQ29sb24iLCJjb2xvbiIsIm1lc3NhZ2UiLCJ0b2xlcmFudCIsIndhcm5pbmdzIiwic2tpcFB1bmN0dWF0aW9uIiwidmFsaWQiLCJwdW5jdHVhdGlvbiIsImluZGV4T2YiLCJyYWlzZUVycm9yIiwicmFpc2VVbmV4cGVjdGVkIiwiZXhwZWN0ZWQiLCJjaGVja0R1cGxpY2F0ZXMiLCJvYmoiLCJrZXkiLCJkdXBsaWNhdGUiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJhcHBlbmRQYWlyIiwicmV2aXZlciIsInBhcnNlUGFpciIsInBhcnNlQW55IiwicGFyc2VFbGVtZW50IiwiYXJyIiwicGFyc2VPYmplY3QiLCJwYXJzZU1hbnkiLCJza2lwIiwiZWxlbWVudFBhcnNlciIsImVsZW1lbnROYW1lIiwiZW5kU3ltYm9sIiwicGFyc2VBcnJheSIsIm9wdHMiLCJlbmRDaGVja3MiLCJlbmQiLCJUeXBlRXJyb3IiLCJmaWx0ZXIiLCJuZXd0ZXh0Iiwic3RyaW5naWZ5UGFpciIsInN0cmluZ2lmeSIsIkFycmF5IiwiaXNBcnJheSIsImpvaW4iLCJiaW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLFFBQU0sRUFBQyxNQUFJQTtBQUFaLENBQWQ7QUFBbUMsSUFBSUEsTUFBSjtBQUFXRixNQUFNLENBQUNHLElBQVAsQ0FBWSxXQUFaLEVBQXdCO0FBQUNELFFBQU0sQ0FBQ0UsQ0FBRCxF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QUFFQTtBQUNBO0FBQ0E7QUFDRCxHQW5qQkEsR0FBRCIsImZpbGUiOiIvcGFja2FnZXMvbWV0ZW9ydG95c190b3lraXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUb3lLaXQgfSBmcm9tIFwiLi4vc2hhcmVkXCJcblxuaW1wb3J0IFwiLi9tZXRob2RzLmpzXCI7XG5pbXBvcnQgXCIuL3B1YmxpY2F0aW9ucy5qc1wiO1xuaW1wb3J0IFwiLi9zdGFydHVwLmpzXCI7XG5cbmV4cG9ydCB7IFRveUtpdCB9IiwiaW1wb3J0IHsgTG9naWMgfSBmcm9tIFwiLi9sb2dpY1wiXG5cbk1ldGVvci5tZXRob2RzKHtcbiAgTWV0ZW9yVG95c1JlZ2lzdHJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIExvZ2ljLnJlZ2lzdHJ5LmdldExpc3QoKTtcbiAgfVxufSkiLCJpbXBvcnQgeyBUb3lLaXQgfSBmcm9tIFwiLi4vc2hhcmVkXCJcblxuTWV0ZW9yLnB1Ymxpc2goXCJNZXRlb3JUb3lzXCIsIGZ1bmN0aW9uIChwYXJhbSkge1xuXHRjaGVjayhwYXJhbSwgTWF0Y2guQW55KTtcblxuXHRpZiAocGFyYW0pIHtcblx0XHR2YXIgY29sbGVjdGlvbkxpc3QgPSBNb25nby5Db2xsZWN0aW9uLmdldEFsbCgpO1xuXG5cdFx0cmV0dXJuIGNvbGxlY3Rpb25MaXN0Lm1hcChmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRpZiAobmFtZSkgcmV0dXJuIE1vbmdvLkNvbGxlY3Rpb24uZ2V0KG5hbWUpLmZpbmQoKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0VG95S2l0LmRhdGEuSW1wZXJzb25hdGUuZmluZCh7fSwge2xpbWl0OiAxNX0pLFxuXHRcdFx0VG95S2l0LmRhdGEuSmV0U2V0dGVyLmZpbmQoKSxcblx0XHRcdFRveUtpdC5kYXRhLkF1dG9QdWIuZmluZCgpLFxuXHRcdFx0VG95S2l0LmRhdGEuVGhyb3R0bGUuZmluZCgpLFxuXHRcdFx0VG95S2l0LmRhdGEuRW1haWwuZmluZCh7fSwgIHtzb3J0OiB7J3RpbWVzdGFtcCc6IDF9LGxpbWl0OiAxNX0pLFxuXHRcdFx0VG95S2l0LmRhdGEuUmVzdWx0LmZpbmQoe30sIHtzb3J0OiB7J3RpbWVzdGFtcCc6IC0xfSxsaW1pdDogMTV9KSxcblx0XHRcdFRveUtpdC5kYXRhLk1vbmdvbC5maW5kKHt9LCB7c29ydDogeydNb25nb2xfZGF0ZSc6IDF9LCBsaW1pdDogMTV9KSxcblx0XHRdO1xuXHR9XG59KTsiLCJpbXBvcnQgeyBMb2dpYyB9IGZyb20gXCIuL2xvZ2ljXCJcbmltcG9ydCBcIi4vbWV0aG9kcy5qc1wiXG5pbXBvcnQgXCIuL3B1YmxpY2F0aW9ucy5qc1wiXG5cbk1ldGVvci5zdGFydHVwKGZ1bmN0aW9uKCkge1xuICBMb2dpYy5yZWdpc3RyeS5zY2FuKCk7XG59KTsiLCJpbXBvcnQgeyBSZWdpc3RyeSB9IGZyb20gXCIuL3JlZ2lzdHJ5LmpzXCJcblxuTG9naWMgPSB7fVxuTG9naWMucmVnaXN0cnkgPSBSZWdpc3RyeTtcblxuZXhwb3J0IHsgTG9naWMgfSIsInZhciBSZWdpc3RyeSA9IHt9O1xuUmVnaXN0cnkuZGF0YSA9IHt9O1xuXG5SZWdpc3RyeS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkYXRhLCBhZGRvbikge1xuXHR2YXIgbmFtZSA9IGRhdGEudGVtcGxhdGU7XG5cdGRhdGEuYWRkb24gPSBhZGRvbjtcbiAgXHRSZWdpc3RyeVtuYW1lXSA9IGRhdGE7XG59XG5cblJlZ2lzdHJ5LnNjYW4gPSBmdW5jdGlvbiAob3JnYW5pemF0aW9uLCB0eXBlKSB7XG5cdHZhciBwYWNrYWdlTGlzdCA9IE9iamVjdC5rZXlzKFBhY2thZ2UpO1xuXG5cdHBhY2thZ2VMaXN0LmZvckVhY2goZnVuY3Rpb24gKHBhY2thZ2VOYW1lKSB7XG5cdFx0aWYgKFBhY2thZ2VbcGFja2FnZU5hbWVdLlRveUtpdCkge1xuXHRcdFx0dmFyIGFkZG9uID0gIXBhY2thZ2VOYW1lLmluY2x1ZGVzKFwibWV0ZW9ydG95czpcIik7XG5cdCAgXHRcdFJlZ2lzdHJ5LnJlZ2lzdGVyKFBhY2thZ2VbcGFja2FnZU5hbWVdLlRveUtpdCwgYWRkb24pXG5cdFx0fVxuICBcdH0pXG59XG5cblJlZ2lzdHJ5LmdldExpc3QgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBSZWdpc3RyeS5kYXRhO1xufVxuXG5leHBvcnQgeyBSZWdpc3RyeSB9IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcbmltcG9ydCB7IE1vbmdvSW50ZXJuYWxzIH0gZnJvbSBcIm1ldGVvci9tb25nb1wiO1xuXG52YXIgXzB4NTljNj1bJ3NldFRpbWVvdXQnLCdnZW5lcmF0ZUxpc3QnLCdnZXQnLCdpc0NsaWVudCcsJ2Nvbm5lY3Rpb24nLCdfc3RvcmVzJywnX2dldENvbGxlY3Rpb24nLCdvcGVuJywnaXNTZXJ2ZXInLCdkZWZhdWx0UmVtb3RlQ29sbGVjdGlvbkRyaXZlcicsJ2xpc3RDb2xsZWN0aW9ucycsJ2ZvckVhY2gnLCdwdXNoJywnZ2V0TGlzdCddOyhmdW5jdGlvbihfMHg3ZmU2MTgsXzB4M2E0ZWEwKXt2YXIgXzB4MmY1ZWFiPWZ1bmN0aW9uKF8weGFkYWQ2NCl7d2hpbGUoLS1fMHhhZGFkNjQpe18weDdmZTYxOFsncHVzaCddKF8weDdmZTYxOFsnc2hpZnQnXSgpKTt9fTtfMHgyZjVlYWIoKytfMHgzYTRlYTApO30oXzB4NTljNiwweDE3YSkpO3ZhciBfMHgzNjE3PWZ1bmN0aW9uKF8weDNmODgxOSxfMHgyMzJmYzQpe18weDNmODgxOT1fMHgzZjg4MTktMHgwO3ZhciBfMHg1ZDg3MDI9XzB4NTljNltfMHgzZjg4MTldO3JldHVybiBfMHg1ZDg3MDI7fTt2YXIgQ29sbGVjdGlvbj17fTt2YXIgY29sbGVjdGlvbkxpc3Q9W107TWV0ZW9yWydzdGFydHVwJ10oZnVuY3Rpb24oKXtDb2xsZWN0aW9uWydnZW5lcmF0ZUxpc3QnXSgpO01ldGVvcltfMHgzNjE3KCcweDAnKV0oZnVuY3Rpb24oKXtDb2xsZWN0aW9uW18weDM2MTcoJzB4MScpXSgpO30sMHgxMzg4KTt9KTtDb2xsZWN0aW9uW18weDM2MTcoJzB4MicpXT1mdW5jdGlvbihfMHgxZmYxODYpe2NoZWNrKF8weDFmZjE4NixTdHJpbmcpO2lmKE1ldGVvcltfMHgzNjE3KCcweDMnKV0pe3ZhciBfMHhkZWVkYTg9TWV0ZW9yW18weDM2MTcoJzB4NCcpXVtfMHgzNjE3KCcweDUnKV1bXzB4MWZmMTg2XTtpZihfMHhkZWVkYTgpcmV0dXJuIF8weGRlZWRhOFtfMHgzNjE3KCcweDYnKV0oKTt9ZWxzZXtyZXR1cm4gTW9uZ29JbnRlcm5hbHNbJ2RlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyJ10oKVtfMHgzNjE3KCcweDcnKV0oXzB4MWZmMTg2KTt9fTtDb2xsZWN0aW9uW18weDM2MTcoJzB4MScpXT1mdW5jdGlvbigpe2lmKE1ldGVvcltfMHgzNjE3KCcweDgnKV0pe2NvbGxlY3Rpb25MaXN0PVtdO3ZhciBfMHg1YjAwZTk9TW9uZ29JbnRlcm5hbHNbXzB4MzYxNygnMHg5JyldKClbJ21vbmdvJ11bJ2RiJ107dmFyIF8weDE2YTBmOT1fMHg1YjAwZTlbXzB4MzYxNygnMHhhJyldKCk7dmFyIF8weDMyZDA5ND1fMHgxNmEwZjlbXzB4MzYxNygnMHhiJyldKGZ1bmN0aW9uKF8weDM1NTA5OCl7Y29sbGVjdGlvbkxpc3RbXzB4MzYxNygnMHhjJyldKF8weDM1NTA5OFsnbmFtZSddKTt9KTt9fTtDb2xsZWN0aW9uW18weDM2MTcoJzB4ZCcpXT1mdW5jdGlvbigpe2lmKE1ldGVvcltfMHgzNjE3KCcweDMnKV0pe3JldHVybiBPYmplY3RbJ2tleXMnXShNZXRlb3JbXzB4MzYxNygnMHg0JyldW18weDM2MTcoJzB4NScpXSk7fWVsc2V7cmV0dXJuIGNvbGxlY3Rpb25MaXN0O319O1xuXG5leHBvcnQgeyBDb2xsZWN0aW9uIH0iLCJpbXBvcnQgeyBNb25nbyB9IGZyb20gXCJtZXRlb3IvbW9uZ29cIjtcblxudmFyIERhdGEgPSB7XG4gICdJbXBlcnNvbmF0ZSc6IG5ldyBNb25nby5Db2xsZWN0aW9uKFwiTWV0ZW9yVG95cy5JbXBlcnNvbmF0ZVwiKSxcbiAgJ0pldFNldHRlcic6ICAgbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJNZXRlb3JUb3lzLkpldFNldHRlclwiKSxcbiAgJ01vbmdvbCc6ICAgICAgbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJNZXRlb3JUb3lzLk1vbmdvbFwiKSxcbiAgJ0F1dG9QdWInOiAgICAgbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJNZXRlb3JUb3lzLkF1dG9QdWJcIiksXG4gICdFbWFpbCc6ICAgICAgIG5ldyBNb25nby5Db2xsZWN0aW9uKFwiTWV0ZW9yVG95cy5FbWFpbFwiKSxcbiAgJ1Jlc3VsdCc6ICAgICAgbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJNZXRlb3JUb3lzLlJlc3VsdFwiKSxcbiAgJ1Rocm90dGxlJzogICAgbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJNZXRlb3JUb3lzLlRocm90dGxlXCIpXG59XG5cbkRhdGEuSW1wZXJzb25hdGUuYWxsb3coe1xuICBpbnNlcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uICgpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5cbkRhdGEuSmV0U2V0dGVyLmFsbG93KHtcbiAgaW5zZXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuXG5EYXRhLk1vbmdvbC5hbGxvdyh7XG4gIGluc2VydDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcblxuRGF0YS5BdXRvUHViLmFsbG93KHtcbiAgaW5zZXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuXG5EYXRhLkVtYWlsLmFsbG93KHtcbiAgaW5zZXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuXG5EYXRhLlJlc3VsdC5hbGxvdyh7XG4gIGluc2VydDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcblxuZXhwb3J0IHsgRGF0YSB9IiwiaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gXCIuL2NvbGxlY3Rpb25zLmpzXCI7XG5pbXBvcnQgeyBEYXRhIH0gZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHsgUkpTT04gfSBmcm9tICcuL3BhcnNlLmpzJztcblxudmFyIFRveUtpdCA9IHt9O1xuXG5pZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG5cdGltcG9ydCB7IFJlYWN0aXZlRGljdCB9IGZyb20gXCJtZXRlb3IvcmVhY3RpdmUtZGljdFwiXG5cdFRveUtpdCA9IG5ldyBSZWFjdGl2ZURpY3QoXCJNZXRlb3JUb3lzXCIpXG59XG5cblRveUtpdC5jb2xsZWN0aW9uID0gQ29sbGVjdGlvbjtcblRveUtpdC5kYXRhID0gRGF0YTtcblRveUtpdC5wYXJzZSA9IFJKU09OLnBhcnNlO1xuXG5leHBvcnQgeyBUb3lLaXQgfSIsInZhciBSSlNPTjtcbi8qXG4gIENvcHlyaWdodCAoYykgMjAxMywgT2xlZyBHcmVucnVzXG4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cbiAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbiAgICAgICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAgICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgT2xlZyBHcmVucnVzIG5vciB0aGVcbiAgICAgICAgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbiAgICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG5cbiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG4gIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiAgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgT0xFRyBHUkVOUlVTIEJFIExJQUJMRSBGT1IgQU5ZXG4gIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4gIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbiAgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EXG4gIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG4gIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuKi9cbihmdW5jdGlvbiAoKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIHNsaWdodGx5IGRpZmZlcmVudCBmcm9tIEVTNSBzb21lLCB3aXRob3V0IGNhc3QgdG8gYm9vbGVhblxuICAvLyBbeCwgeSwgel0uc29tZShmKTpcbiAgLy8gRVM1OiAgISEgKCBmKHgpIHx8IGYoeSkgfHwgZih6KSB8fCBmYWxzZSlcbiAgLy8gdGhpczogICAgKCBmKHgpIHx8IGYoeSkgfHwgZih6KSB8fCBmYWxzZSlcbiAgZnVuY3Rpb24gc29tZShhcnJheSwgZikge1xuICAgIHZhciBhY2MgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBhY2MgPSBmKGFycmF5W2ldLCBpLCBhcnJheSk7XG4gICAgICBpZiAoYWNjKSB7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlTGV4ZXIodG9rZW5TcGVjcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoY29udGVudHMpIHtcbiAgICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICAgIHZhciBsaW5lID0gMTtcblxuICAgICAgZnVuY3Rpb24gZmluZFRva2VuKCkge1xuICAgICAgICByZXR1cm4gc29tZSh0b2tlblNwZWNzLCBmdW5jdGlvbiAodG9rZW5TcGVjKSB7XG4gICAgICAgICAgdmFyIG0gPSB0b2tlblNwZWMucmUuZXhlYyhjb250ZW50cyk7XG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIHZhciByYXcgPSBtWzBdO1xuICAgICAgICAgICAgY29udGVudHMgPSBjb250ZW50cy5zbGljZShyYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHJhdzogcmF3LFxuICAgICAgICAgICAgICBtYXRjaGVkOiB0b2tlblNwZWMuZihtLCBsaW5lKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKGNvbnRlbnRzICE9PSBcIlwiKSB7XG4gICAgICAgIHZhciBtYXRjaGVkID0gZmluZFRva2VuKCk7XG5cbiAgICAgICAgaWYgKCFtYXRjaGVkKSB7XG4gICAgICAgICAgdmFyIGVyciA9IG5ldyBTeW50YXhFcnJvcihcIlVuZXhwZWN0ZWQgY2hhcmFjdGVyOiBcIiArIGNvbnRlbnRzWzBdICsgXCI7IGlucHV0OiBcIiArIGNvbnRlbnRzLnN1YnN0cigwLCAxMDApKTtcbiAgICAgICAgICBlcnIubGluZSA9IGxpbmU7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIGxpbmUgdG8gdG9rZW5cbiAgICAgICAgbWF0Y2hlZC5tYXRjaGVkLmxpbmUgPSBsaW5lO1xuXG4gICAgICAgIC8vIGNvdW50IGxpbmVzXG4gICAgICAgIGxpbmUgKz0gbWF0Y2hlZC5yYXcucmVwbGFjZSgvW15cXG5dL2csIFwiXCIpLmxlbmd0aDtcblxuICAgICAgICB0b2tlbnMucHVzaChtYXRjaGVkLm1hdGNoZWQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmU3RyaW5nU2luZ2xlKG0pIHtcbiAgICAvLyBTdHJpbmcgaW4gc2luZ2xlIHF1b3Rlc1xuICAgIHZhciBjb250ZW50ID0gbVsxXS5yZXBsYWNlKC8oW14nXFxcXF18XFxcXFsnYm5ydGZcXFxcXXxcXFxcdVswLTlhLWZBLUZdezR9KS9nLCBmdW5jdGlvbiAobW0pIHtcbiAgICAgIGlmIChtbSA9PT0gXCJcXFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiXFxcXFxcXCJcIjtcbiAgICAgIH0gZWxzZSBpZiAobW0gPT09IFwiXFxcXCdcIikge1xuICAgICAgICByZXR1cm4gXCInXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbW07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIG1hdGNoOiBcIlxcXCJcIiArIGNvbnRlbnQgKyBcIlxcXCJcIixcbiAgICAgIHZhbHVlOiBKU09OLnBhcnNlKFwiXFxcIlwiICsgY29udGVudCArIFwiXFxcIlwiKSwgLy8gYWJ1c2luZyByZWFsIEpTT04ucGFyc2UgdG8gdW5xdW90ZSBzdHJpbmdcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZlN0cmluZ0RvdWJsZShtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBtYXRjaDogbVswXSxcbiAgICAgIHZhbHVlOiBKU09OLnBhcnNlKG1bMF0pLFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmSWRlbnRpZmllcihtKSB7XG4gICAgLy8gaWRlbnRpZmllcnMgYXJlIHRyYW5zZm9ybWVkIGludG8gc3RyaW5nc1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgdmFsdWU6IG1bMF0sXG4gICAgICBtYXRjaDogXCJcXFwiXCIgKyBtWzBdLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgcmV0dXJuIGMgPT09IFwiXFxcXFwiID8gXCJcXFxcXFxcXFwiIDogYztcbiAgICAgIH0pICsgXCJcXFwiXCIsXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZDb21tZW50KG0pIHtcbiAgICAvLyBjb21tZW50cyBhcmUgd2hpdGVzcGFjZSwgbGVhdmUgb25seSBsaW5lZmVlZHNcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCIgXCIsXG4gICAgICBtYXRjaDogbVswXS5yZXBsYWNlKC8uL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHJldHVybiAoL1xccy8pLnRlc3QoYykgPyBjIDogXCIgXCI7XG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZk51bWJlcihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICBtYXRjaDogbVswXSxcbiAgICAgIHZhbHVlOiBwYXJzZUZsb2F0KG1bMF0pLFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmS2V5d29yZChtKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHN3aXRjaCAobVsxXSkge1xuICAgICAgY2FzZSBcIm51bGxcIjogdmFsdWUgPSBudWxsOyBicmVhaztcbiAgICAgIGNhc2UgXCJ0cnVlXCI6IHZhbHVlID0gdHJ1ZTsgYnJlYWs7XG4gICAgICBjYXNlIFwiZmFsc2VcIjogdmFsdWUgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAvLyBubyBkZWZhdWx0XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcImF0b21cIixcbiAgICAgIG1hdGNoOiBtWzBdLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlVG9rZW5TcGVjcyhyZWxheGVkKSB7XG4gICAgZnVuY3Rpb24gZih0eXBlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSwgbWF0Y2g6IG1bMF0gfTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHJldCA9IFtcbiAgICAgIHsgcmU6IC9eXFxzKy8sIGY6IGYoXCIgXCIpIH0sXG4gICAgICB7IHJlOiAvXlxcey8sIGY6IGYoXCJ7XCIpIH0sXG4gICAgICB7IHJlOiAvXlxcfS8sIGY6IGYoXCJ9XCIpIH0sXG4gICAgICB7IHJlOiAvXlxcWy8sIGY6IGYoXCJbXCIpIH0sXG4gICAgICB7IHJlOiAvXlxcXS8sIGY6IGYoXCJdXCIpIH0sXG4gICAgICB7IHJlOiAvXiwvLCBmOiBmKFwiLFwiKSB9LFxuICAgICAgeyByZTogL146LywgZjogZihcIjpcIikgfSxcbiAgICAgIHsgcmU6IC9eKHRydWV8ZmFsc2V8bnVsbCkvLCBmOiBmS2V5d29yZCB9LFxuICAgICAgeyByZTogL15cXC0/XFxkKyhcXC5cXGQrKT8oW2VFXVsrLV0/XFxkKyk/LywgZjogZk51bWJlciB9LFxuICAgICAgeyByZTogL15cIihbXlwiXFxcXF18XFxcXFtcImJucnRmXFxcXFxcL118XFxcXHVbMC05YS1mQS1GXXs0fSkqXCIvLCBmOiBmU3RyaW5nRG91YmxlIH0sXG4gICAgXTtcblxuICAgIC8vIGFkZGl0aW9uYWwgc3R1ZmZcbiAgICBpZiAocmVsYXhlZCkge1xuICAgICAgcmV0ID0gcmV0LmNvbmNhdChbXG4gICAgICAgIHsgcmU6IC9eJygoW14nXFxcXF18XFxcXFsnYm5ydGZcXFxcXFwvXXxcXFxcdVswLTlhLWZBLUZdezR9KSopJy8sIGY6IGZTdHJpbmdTaW5nbGUgfSxcbiAgICAgICAgeyByZTogL15cXC9cXC8uKj8oPzpcXHJcXG58XFxyfFxcbikvLCBmOiBmQ29tbWVudCB9LFxuICAgICAgICB7IHJlOiAvXlxcL1xcKltcXHNcXFNdKj9cXCpcXC8vLCBmOiBmQ29tbWVudCB9LFxuICAgICAgICB7IHJlOiAvXlskYS16QS1aMC05X1xcLStcXC5cXCpcXD8hXFx8JiVcXF5cXC8jXFxcXF0rLywgZjogZklkZW50aWZpZXIgfSxcbiAgICAgIF0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICB2YXIgbGV4ZXIgPSBtYWtlTGV4ZXIobWFrZVRva2VuU3BlY3ModHJ1ZSkpO1xuICB2YXIgc3RyaWN0TGV4ZXIgPSBtYWtlTGV4ZXIobWFrZVRva2VuU3BlY3MoZmFsc2UpKTtcblxuICBmdW5jdGlvbiBwcmV2aW91c05XU1Rva2VuKHRva2VucywgaW5kZXgpIHtcbiAgICBmb3IgKDsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgICAgaWYgKHRva2Vuc1tpbmRleF0udHlwZSAhPT0gXCIgXCIpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RyaXBUcmFpbGluZ0NvbW1hKHRva2Vucykge1xuICAgIHZhciByZXMgPSBbXTtcblxuICAgIHRva2Vucy5mb3JFYWNoKGZ1bmN0aW9uICh0b2tlbiwgaW5kZXgpIHtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBcIl1cIiB8fCB0b2tlbi50eXBlID09PSBcIn1cIikge1xuICAgICAgICAvLyBnbyBiYWNrd2FyZHMgYXMgbG9uZyBhcyB0aGVyZSBpcyB3aGl0ZXNwYWNlLCB1bnRpbCBmaXJzdCBjb21tYVxuICAgICAgICB2YXIgY29tbWFJID0gcHJldmlvdXNOV1NUb2tlbihyZXMsIGluZGV4IC0gMSk7XG5cbiAgICAgICAgaWYgKGNvbW1hSSAmJiByZXNbY29tbWFJXS50eXBlID09PSBcIixcIikge1xuICAgICAgICAgIHZhciBwcmVDb21tYUkgPSBwcmV2aW91c05XU1Rva2VuKHJlcywgY29tbWFJIC0gMSk7XG4gICAgICAgICAgaWYgKHByZUNvbW1hSSAmJiByZXNbcHJlQ29tbWFJXS50eXBlICE9PSBcIltcIiAmJiByZXNbcHJlQ29tbWFJXS50eXBlICE9PSBcIntcIikge1xuICAgICAgICAgICAgcmVzW2NvbW1hSV0gPSB7XG4gICAgICAgICAgICAgIHR5cGU6IFwiIFwiLFxuICAgICAgICAgICAgICBtYXRjaDogXCIgXCIsXG4gICAgICAgICAgICAgIGxpbmU6IHRva2Vuc1tjb21tYUldLmxpbmUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXMucHVzaCh0b2tlbik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNmb3JtKHRleHQpIHtcbiAgICAvLyBUb2tlbml6ZSBjb250ZW50c1xuICAgIHZhciB0b2tlbnMgPSBsZXhlcih0ZXh0KTtcblxuICAgIC8vIHJlbW92ZSB0cmFpbGluZyBjb21tYXNcbiAgICB0b2tlbnMgPSBzdHJpcFRyYWlsaW5nQ29tbWEodG9rZW5zKTtcblxuICAgIC8vIGNvbmNhdCBzdHVmZlxuICAgIHJldHVybiB0b2tlbnMucmVkdWNlKGZ1bmN0aW9uIChzdHIsIHRva2VuKSB7XG4gICAgICByZXR1cm4gc3RyICsgdG9rZW4ubWF0Y2g7XG4gICAgfSwgXCJcIik7XG4gIH1cblxuICBmdW5jdGlvbiBwb3BUb2tlbih0b2tlbnMsIHN0YXRlKSB7XG4gICAgdmFyIHRva2VuID0gdG9rZW5zW3N0YXRlLnBvc107XG4gICAgc3RhdGUucG9zICs9IDE7XG5cbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICB2YXIgbGluZSA9IHRva2Vucy5sZW5ndGggIT09IDAgPyB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLmxpbmUgOiAxO1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJlb2ZcIiwgbGluZTogbGluZSB9O1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0clRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlIFwiYXRvbVwiOlxuICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICByZXR1cm4gdG9rZW4udHlwZSArIFwiIFwiICsgdG9rZW4ubWF0Y2g7XG4gICAgICBjYXNlIFwiZW9mXCI6XG4gICAgICAgIHJldHVybiBcImVuZC1vZi1maWxlXCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gXCInXCIgKyB0b2tlbi50eXBlICsgXCInXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tpcENvbG9uKHRva2Vucywgc3RhdGUpIHtcbiAgICB2YXIgY29sb24gPSBwb3BUb2tlbih0b2tlbnMsIHN0YXRlKTtcbiAgICBpZiAoY29sb24udHlwZSAhPT0gXCI6XCIpIHtcbiAgICAgIHZhciBtZXNzYWdlID0gXCJVbmV4cGVjdGVkIHRva2VuOiBcIiArIHN0clRva2VuKGNvbG9uKSArIFwiLCBleHBlY3RlZCAnOidcIjtcbiAgICAgIGlmIChzdGF0ZS50b2xlcmFudCkge1xuICAgICAgICBzdGF0ZS53YXJuaW5ncy5wdXNoKHtcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgIGxpbmU6IGNvbG9uLmxpbmUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0YXRlLnBvcyAtPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVyciA9IG5ldyBTeW50YXhFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgZXJyLmxpbmUgPSBjb2xvbi5saW5lO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tpcFB1bmN0dWF0aW9uKHRva2Vucywgc3RhdGUsIHZhbGlkKSB7XG4gICAgdmFyIHB1bmN0dWF0aW9uID0gW1wiLFwiLCBcIjpcIiwgXCJdXCIsIFwifVwiXTtcbiAgICB2YXIgdG9rZW4gPSBwb3BUb2tlbih0b2tlbnMsIHN0YXRlKTtcbiAgICB3aGlsZSAodHJ1ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgaWYgKHZhbGlkICYmIHZhbGlkLmluZGV4T2YodG9rZW4udHlwZSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gXCJlb2ZcIikge1xuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9IGVsc2UgaWYgKHB1bmN0dWF0aW9uLmluZGV4T2YodG9rZW4udHlwZSkgIT09IC0xKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gXCJVbmV4cGVjdGVkIHRva2VuOiBcIiArIHN0clRva2VuKHRva2VuKSArIFwiLCBleHBlY3RlZCAnWycsICd7JywgbnVtYmVyLCBzdHJpbmcgb3IgYXRvbVwiO1xuICAgICAgICBpZiAoc3RhdGUudG9sZXJhbnQpIHtcbiAgICAgICAgICBzdGF0ZS53YXJuaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICBsaW5lOiB0b2tlbi5saW5lLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRva2VuID0gcG9wVG9rZW4odG9rZW5zLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGVyciA9IG5ldyBTeW50YXhFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICBlcnIubGluZSA9IHRva2VuLmxpbmU7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmFpc2VFcnJvcihzdGF0ZSwgdG9rZW4sIG1lc3NhZ2UpIHtcbiAgICBpZiAoc3RhdGUudG9sZXJhbnQpIHtcbiAgICAgIHN0YXRlLndhcm5pbmdzLnB1c2goe1xuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICBsaW5lOiB0b2tlbi5saW5lLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgU3ludGF4RXJyb3IobWVzc2FnZSk7XG4gICAgICBlcnIubGluZSA9IHRva2VuLmxpbmU7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmFpc2VVbmV4cGVjdGVkKHN0YXRlLCB0b2tlbiwgZXhwZWN0ZWQpIHtcbiAgICByYWlzZUVycm9yKHN0YXRlLCB0b2tlbiwgXCJVbmV4cGVjdGVkIHRva2VuOiBcIiArIHN0clRva2VuKHRva2VuKSArIFwiLCBleHBlY3RlZCBcIiArIGV4cGVjdGVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRHVwbGljYXRlcyhzdGF0ZSwgb2JqLCB0b2tlbikge1xuICAgIHZhciBrZXkgPSB0b2tlbi52YWx1ZTtcblxuICAgIGlmIChzdGF0ZS5kdXBsaWNhdGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgcmFpc2VFcnJvcihzdGF0ZSwgdG9rZW4sIFwiRHVwbGljYXRlIGtleTogXCIgKyBrZXkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZFBhaXIoc3RhdGUsIG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIHZhbHVlID0gc3RhdGUucmV2aXZlciA/IHN0YXRlLnJldml2ZXIoa2V5LCB2YWx1ZSkgOiB2YWx1ZTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVBhaXIodG9rZW5zLCBzdGF0ZSwgb2JqKSB7XG4gICAgdmFyIHRva2VuID0gc2tpcFB1bmN0dWF0aW9uKHRva2Vucywgc3RhdGUsIFtcIjpcIl0pO1xuICAgIHZhciBrZXk7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgaWYgKHRva2VuLnR5cGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJhaXNlVW5leHBlY3RlZChzdGF0ZSwgdG9rZW4sIFwic3RyaW5nXCIpO1xuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgXCI6XCI6XG4gICAgICAgICAgdG9rZW4gPSB7XG4gICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgdmFsdWU6IFwibnVsbFwiLFxuICAgICAgICAgICAgbGluZTogdG9rZW4ubGluZSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc3RhdGUucG9zIC09IDE7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICBjYXNlIFwiYXRvbVwiOlxuICAgICAgICAgIHRva2VuID0ge1xuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIHZhbHVlOiBcIlwiICsgdG9rZW4udmFsdWUsXG4gICAgICAgICAgICBsaW5lOiB0b2tlbi5saW5lLFxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIltcIjpcbiAgICAgICAgY2FzZSBcIntcIjpcbiAgICAgICAgICBzdGF0ZS5wb3MgLT0gMTtcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlQW55KHRva2Vucywgc3RhdGUpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICAgICAgYXBwZW5kUGFpcihzdGF0ZSwgb2JqLCBcIm51bGxcIiwgdmFsdWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gbm8gZGVmYXVsdFxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRHVwbGljYXRlcyhzdGF0ZSwgb2JqLCB0b2tlbik7XG4gICAga2V5ID0gdG9rZW4udmFsdWU7XG4gICAgc2tpcENvbG9uKHRva2Vucywgc3RhdGUpO1xuICAgIHZhbHVlID0gcGFyc2VBbnkodG9rZW5zLCBzdGF0ZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcblxuICAgIGFwcGVuZFBhaXIoc3RhdGUsIG9iaiwga2V5LCB2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUVsZW1lbnQodG9rZW5zLCBzdGF0ZSwgYXJyKSB7XG4gICAgdmFyIGtleSA9IGFyci5sZW5ndGg7XG4gICAgdmFyIHZhbHVlID0gcGFyc2VBbnkodG9rZW5zLCBzdGF0ZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICBhcnJba2V5XSA9IHN0YXRlLnJldml2ZXIgPyBzdGF0ZS5yZXZpdmVyKFwiXCIgKyBrZXksIHZhbHVlKSA6IHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VPYmplY3QodG9rZW5zLCBzdGF0ZSkge1xuICAgIHJldHVybiBwYXJzZU1hbnkodG9rZW5zLCBzdGF0ZSwge30sIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgc2tpcDogW1wiOlwiLCBcIn1cIl0sXG4gICAgICBlbGVtZW50UGFyc2VyOiBwYXJzZVBhaXIsXG4gICAgICBlbGVtZW50TmFtZTogXCJzdHJpbmdcIixcbiAgICAgIGVuZFN5bWJvbDogXCJ9XCIsXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUFycmF5KHRva2Vucywgc3RhdGUpIHtcbiAgICByZXR1cm4gcGFyc2VNYW55KHRva2Vucywgc3RhdGUsIFtdLCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgIHNraXA6IFtcIl1cIl0sXG4gICAgICBlbGVtZW50UGFyc2VyOiBwYXJzZUVsZW1lbnQsXG4gICAgICBlbGVtZW50TmFtZTogXCJqc29uIG9iamVjdFwiLFxuICAgICAgZW5kU3ltYm9sOiBcIl1cIixcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTWFueSh0b2tlbnMsIHN0YXRlLCBvYmosIG9wdHMpIHtcbiAgICB2YXIgdG9rZW4gPSBza2lwUHVuY3R1YXRpb24odG9rZW5zLCBzdGF0ZSwgb3B0cy5za2lwKTtcblxuICAgIGlmICh0b2tlbi50eXBlID09PSBcImVvZlwiKSB7XG4gICAgICByYWlzZVVuZXhwZWN0ZWQoc3RhdGUsIHRva2VuLCBcIidcIiArIG9wdHMuZW5kU3ltYm9sICsgXCInIG9yIFwiICsgb3B0cy5lbGVtZW50TmFtZSk7XG5cbiAgICAgIHRva2VuID0ge1xuICAgICAgICB0eXBlOiBvcHRzLmVuZFN5bWJvbCxcbiAgICAgICAgbGluZTogdG9rZW4ubGluZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlIG9wdHMuZW5kU3ltYm9sOlxuICAgICAgICByZXR1cm4gb2JqO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdGF0ZS5wb3MgLT0gMTsgLy8gcHVzaCB0aGUgdG9rZW4gYmFja1xuICAgICAgICBvcHRzLmVsZW1lbnRQYXJzZXIodG9rZW5zLCBzdGF0ZSwgb2JqKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gUmVzdFxuICAgIHdoaWxlICh0cnVlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG4gICAgICB0b2tlbiA9IHBvcFRva2VuKHRva2Vucywgc3RhdGUpO1xuXG4gICAgICBpZiAodG9rZW4udHlwZSAhPT0gb3B0cy5lbmRTeW1ib2wgJiYgdG9rZW4udHlwZSAhPT0gXCIsXCIpIHtcbiAgICAgICAgcmFpc2VVbmV4cGVjdGVkKHN0YXRlLCB0b2tlbiwgXCInLCcgb3IgJ1wiICsgb3B0cy5lbmRTeW1ib2wgKyBcIidcIik7XG5cbiAgICAgICAgdG9rZW4gPSB7XG4gICAgICAgICAgdHlwZTogdG9rZW4udHlwZSA9PT0gXCJlb2ZcIiA/IG9wdHMuZW5kU3ltYm9sIDogXCIsXCIsXG4gICAgICAgICAgbGluZTogdG9rZW4ubGluZSxcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0ZS5wb3MgLT0gMTtcbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2Ugb3B0cy5lbmRTeW1ib2w6XG4gICAgICAgICAgcmV0dXJuIG9iajtcblxuICAgICAgICBjYXNlIFwiLFwiOlxuICAgICAgICAgIG9wdHMuZWxlbWVudFBhcnNlcih0b2tlbnMsIHN0YXRlLCBvYmopO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBubyBkZWZhdWx0XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW5kQ2hlY2tzKHRva2Vucywgc3RhdGUsIHJldCkge1xuICAgIGlmIChzdGF0ZS5wb3MgPCB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICByYWlzZUVycm9yKHN0YXRlLCB0b2tlbnNbc3RhdGUucG9zXSxcbiAgICAgICAgXCJVbmV4cGVjdGVkIHRva2VuOiBcIiArIHN0clRva2VuKHRva2Vuc1tzdGF0ZS5wb3NdKSArIFwiLCBleHBlY3RlZCBlbmQtb2YtaW5wdXRcIik7XG4gICAgfVxuXG4gICAgLy8gVGhyb3cgZXJyb3IgYXQgdGhlIGVuZFxuICAgIGlmIChzdGF0ZS50b2xlcmFudCAmJiBzdGF0ZS53YXJuaW5ncy5sZW5ndGggIT09IDApIHtcbiAgICAgIHZhciBtZXNzYWdlID0gc3RhdGUud2FybmluZ3MubGVuZ3RoID09PSAxID8gc3RhdGUud2FybmluZ3NbMF0ubWVzc2FnZSA6IHN0YXRlLndhcm5pbmdzLmxlbmd0aCArIFwiIHBhcnNlIHdhcm5pbmdzXCI7XG4gICAgICB2YXIgZXJyID0gbmV3IFN5bnRheEVycm9yKG1lc3NhZ2UpO1xuICAgICAgZXJyLmxpbmUgPSBzdGF0ZS53YXJuaW5nc1swXS5saW5lO1xuICAgICAgZXJyLndhcm5pbmdzID0gc3RhdGUud2FybmluZ3M7XG4gICAgICBlcnIub2JqID0gcmV0O1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQW55KHRva2Vucywgc3RhdGUsIGVuZCkge1xuICAgIHZhciB0b2tlbiA9IHNraXBQdW5jdHVhdGlvbih0b2tlbnMsIHN0YXRlKTtcbiAgICB2YXIgcmV0O1xuXG4gICAgaWYgKHRva2VuLnR5cGUgPT09IFwiZW9mXCIpIHtcbiAgICAgIHJhaXNlVW5leHBlY3RlZChzdGF0ZSwgdG9rZW4sIFwianNvbiBvYmplY3RcIik7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlIFwie1wiOlxuICAgICAgICByZXQgPSBwYXJzZU9iamVjdCh0b2tlbnMsIHN0YXRlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiW1wiOlxuICAgICAgICByZXQgPSBwYXJzZUFycmF5KHRva2Vucywgc3RhdGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgIGNhc2UgXCJhdG9tXCI6XG4gICAgICAgIHJldCA9IHRva2VuLnZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIG5vIGRlZmF1bHRcbiAgICB9XG5cbiAgICBpZiAoZW5kKSB7XG4gICAgICByZXQgPSBzdGF0ZS5yZXZpdmVyID8gc3RhdGUucmV2aXZlcihcIlwiLCByZXQpIDogcmV0O1xuICAgICAgZW5kQ2hlY2tzKHRva2Vucywgc3RhdGUsIHJldCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT09IFwiZnVuY3Rpb25cIiB8fCBvcHRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRyYW5zZm9ybSh0ZXh0KSwgb3B0cyk7XG4gICAgfSBlbHNlIGlmIChuZXcgT2JqZWN0KG9wdHMpICE9PSBvcHRzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3LW9iamVjdFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm9wdHMvcmV2aXZlciBzaG91bGQgYmUgdW5kZWZpbmVkLCBhIGZ1bmN0aW9uIG9yIGFuIG9iamVjdFwiKTtcbiAgICB9XG5cbiAgICBvcHRzLnJlbGF4ZWQgPSBvcHRzLnJlbGF4ZWQgIT09IHVuZGVmaW5lZCA/IG9wdHMucmVsYXhlZCA6IHRydWU7XG4gICAgb3B0cy53YXJuaW5ncyA9IG9wdHMud2FybmluZ3MgfHwgb3B0cy50b2xlcmFudCB8fCBmYWxzZTtcbiAgICBvcHRzLnRvbGVyYW50ID0gb3B0cy50b2xlcmFudCB8fCBmYWxzZTtcbiAgICBvcHRzLmR1cGxpY2F0ZSA9IG9wdHMuZHVwbGljYXRlIHx8IGZhbHNlO1xuXG4gICAgaWYgKCFvcHRzLndhcm5pbmdzICYmICFvcHRzLnJlbGF4ZWQpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQsIG9wdHMucmV2aXZlcik7XG4gICAgfVxuXG4gICAgdmFyIHRva2VucyA9IG9wdHMucmVsYXhlZCA/IGxleGVyKHRleHQpIDogc3RyaWN0TGV4ZXIodGV4dCk7XG5cbiAgICBpZiAob3B0cy5yZWxheGVkKSB7XG4gICAgICAvLyBTdHJpcCBjb21tYXNcbiAgICAgIHRva2VucyA9IHN0cmlwVHJhaWxpbmdDb21tYSh0b2tlbnMpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLndhcm5pbmdzKSB7XG4gICAgICAvLyBTdHJpcCB3aGl0ZXNwYWNlXG4gICAgICB0b2tlbnMgPSB0b2tlbnMuZmlsdGVyKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICByZXR1cm4gdG9rZW4udHlwZSAhPT0gXCIgXCI7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHN0YXRlID0geyBwb3M6IDAsIHJldml2ZXI6IG9wdHMucmV2aXZlciwgdG9sZXJhbnQ6IG9wdHMudG9sZXJhbnQsIGR1cGxpY2F0ZTogb3B0cy5kdXBsaWNhdGUsIHdhcm5pbmdzOiBbXSB9O1xuICAgICAgcmV0dXJuIHBhcnNlQW55KHRva2Vucywgc3RhdGUsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbmV3dGV4dCA9IHRva2Vucy5yZWR1Y2UoZnVuY3Rpb24gKHN0ciwgdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHN0ciArIHRva2VuLm1hdGNoO1xuICAgICAgfSwgXCJcIik7XG5cbiAgICAgIHJldHVybiBKU09OLnBhcnNlKG5ld3RleHQsIG9wdHMucmV2aXZlcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RyaW5naWZ5UGFpcihvYmosIGtleSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShrZXkpICsgXCI6XCIgKyBzdHJpbmdpZnkob2JqW2tleV0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gIH1cblxuICBmdW5jdGlvbiBzdHJpbmdpZnkob2JqKSB7XG4gICAgc3dpdGNoICh0eXBlb2Ygb2JqKSB7XG4gICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICAgIC8vIG5vIGRlZmF1bHRcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgcmV0dXJuIFwiW1wiICsgb2JqLm1hcChzdHJpbmdpZnkpLmpvaW4oXCIsXCIpICsgXCJdXCI7XG4gICAgfVxuICAgIGlmIChuZXcgT2JqZWN0KG9iaikgPT09IG9iaikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy1vYmplY3RcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICAgIGtleXMuc29ydCgpO1xuICAgICAgcmV0dXJuIFwie1wiICsga2V5cy5tYXAoc3RyaW5naWZ5UGFpci5iaW5kKG51bGwsIG9iaikpICsgXCJ9XCI7XG4gICAgfVxuICAgIHJldHVybiBcIm51bGxcIjtcbiAgfVxuXG4gIC8vIEV4cG9ydCAgc3R1ZmZcbiAgUkpTT04gPSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5LFxuICB9O1xuXG4gIC8vIC8qIGdsb2JhbCB3aW5kb3csIG1vZHVsZSAqL1xuICAvLyBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyAgIHdpbmRvdy5SSlNPTiA9IFJKU09OO1xuICAvLyB9XG5cbiAgLy8gaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gICBtb2R1bGUuZXhwb3J0cyA9IFJKU09OO1xuICAvLyB9XG59KCkpO1xuXG5leHBvcnQgeyBSSlNPTiB9Il19
