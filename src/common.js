import { ServerCommunications } from "services/serverComunication";

export function api(route) {
  return `${env("gameApi")}/${route}`;
}

export function asDebugable(thisObject) {
  thisObject.debugLevel = 1;
  thisObject.debug = (level, ...what) => {
    if (level <= thisObject.debugLevel)
      console.log(`%c ${thisObject.constructor.name}`, "color: green; font-size:1.4em", ...what);
  };
}

// Usage: className(ifOneClass,"oneClass",ifSecondClass,"secondClass"...)
export function className(...args) {
  if (args.length % 2 !== 0) args = args.slice(0, args.length - 1);
  let classes = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i]) classes.push(args[++i]);
  }
  return { className: classes.join(" ") };
}

export function consoleAccess(name, obj) {
  window[name] = obj;
}

// deep
/* 
export function deepCompare() {
  var i, l, leftChain, rightChain;

  function compare2Objects(x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (
      isNaN(x) &&
      isNaN(y) &&
      typeof x === "number" &&
      typeof y === "number"
    ) {
      return true;
    }

    // Compare primitives and export functions.
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
      return true;
    }

    // Works in case when export functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle export functions passed across iframes
    if (
      (typeof x === "export function" && typeof y === "export function") ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)
    ) {
      return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }

    if (x.constructor !== y.constructor) {
      return false;
    }

    if (x.prototype !== y.prototype) {
      return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false;
    }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }

      switch (typeof x[p]) {
        case "object":
        case "export function":
          leftChain.push(x);
          rightChain.push(y);

          if (!compare2Objects(x[p], y[p])) {
            return false;
          }

          leftChain.pop();
          rightChain.pop();
          break;

        default:
          if (x[p] !== y[p]) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {
    leftChain = []; //Todo: this can be cached
    rightChain = [];

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }

  return true;
} */

export function env(sufix) {
  return process.env[`REACT_APP_${sufix}`];
}

export function exists(obj, route, cb) {
  route = route.split(".");
  for (let dir of route) {
    if (!(typeof obj === "object" || typeof obj === "function") || obj === null || !(dir in obj))
      return false;
    obj = obj[dir];
  }

  if (typeof cb === "function") cb(obj);
  return obj;
}

export function EasyEvents() {
  this.easyEventsId = 0;
  this.easyEvents = [];

  this.addEvent = function (name) {
    name = ucFirst(name);
    this.easyEvents.push(name);
    this[`on${name}Callbacks`] = [];
    this[`onRegister${name}Callbacks`] = [];
    this[`off${name}`] = function (suscription) {
      if (exists(this, `on${name}Callbacks`))
        this[`on${name}Callbacks`] = this[`on${name}Callbacks`].filter(
          (record) => record.callback !== suscription.callback || record.id !== suscription.id
        );
    };
    this[`on${name}`] = function (callback) {
      if (typeof callback == "function") {
        let id = this.easyEventsId++;
        this[`on${name}Callbacks`].push({ callback: callback, id });

        for (let onRegisterCb of this[`onRegister${name}Callbacks`]) {
          onRegisterCb.callback(callback);
        }

        return {
          callback,
          id,
          cancel: () => {
            this[`off${name}`]({ callback, id });
          },
        };
      }
    };
    this[`onRegister${name}`] = function (cb) {
      if (typeof cb == "function") {
        let newId = this.easyEventsId++;
        this[`onRegister${name}Callbacks`].push({ callback: cb, id: newId });
        return newId;
      }
    };

    this[`fire${name}`] = function (...args) {
      for (let record of this[`on${name}Callbacks`]) record.callback(...args);
    };
  };

  this.addEvents = function (events) {
    for (let event of events) {
      this.addEvent(event);
    }
  };

  this.off = function (event, suscription) {
    if (`off${ucFirst(event)}` in this) return this[`off${ucFirst(event)}`]();
  };

  this.on = function (event, handler) {
    if (!(`on${ucFirst(event)}` in this)) {
      this.addEvent(event);
    }
    return this[`on${ucFirst(event)}`](handler);
  };
}

export function hashes(ammount) {
  var array = new Uint32Array(ammount);
  return window.crypto.getRandomValues(array);
}

export function max(...args) {
  let current = -Infinity;
  for (let arg of args) if (arg > current) current = arg;
  return current;
}

export function MultiStage(props) {
  let results = [];
  for (let stage of props.stages) {
    if ((typeof stage[0] === "function" && stage[0]()) || stage[0] === true) {
      const result = typeof stage[1] === "function" ? stage[1]() : stage[1];
      if (props.multiple) results.push(result);
      else return result;
    }
  }

  if (results.length) return results;
  return null;
}

export function required(name) {
  throw Error(`The parameter ${name} is required`);
}

export function round(val, digits) {
  return Math.round(val * 10 ** digits) / 10 ** digits;
}

var translations = null;
export function loadTranslates() {
  return ServerCommunications.get(api("translates"))
    .then((res) => {
      translations = Object.keys(res);
    })
    .error((e) => console.error("Error trying to fetch translations", e));
}

export function translate(str) {
  if (translations !== null) {
    str = str.replaceAll(/([\r\n:])/g, "");
    if (!translations.includes(str)) {
      ServerCommunications.post(api("translate"), { str })
        .then((res) => console.log(res))
        .error((err) => console.error(err));
    }

    translations.push(str);
  }

  return str;
}

export function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
