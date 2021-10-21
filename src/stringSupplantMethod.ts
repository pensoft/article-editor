//@ts-nocheck
interface String {
    supplant(...args: any): string | null;
  }
  
  const getNested = function (nestedObj, path) {
    const pathArr = path.split('.');
    return pathArr.reduce((obj, key, index) => {
      return (obj && obj[key] !== 'undefined') ? (typeof obj[key] === 'function' ? obj[key]() : obj[key]) : undefined;
    }, nestedObj);
  };
  
  String.prototype.supplant = function (o) {
    let isNull;
    let isBoolean;
    let isArray;
    let isObject;
    /*const regex = /\${([^{}]*)}/g;
    const found = this.match(regex);
    if (!(typeof this === 'string' || typeof this === 'number')) {
      return this;
    }
    if (found && found.toString() === this) {
      const path = this.replace(/\${([^{}]*)}/g,
        function (a, b) {
          return b;
        });
      const val = getNested(o, path);
      if (!(typeof val === 'string' || typeof val === 'number')) {
        console.log('found:', found, ', val:', val, ', path:', path);
        return val;
      }
    }*/
    let str = this.replace(/\${([^{}]*)}/g,
      function (a, b) {
        var r = getNested(o, b);
        if (typeof r === 'boolean') {
          isBoolean = r;
        }
        if (typeof r === 'object') {
          isObject = r;
        }
        if (Array.isArray(r)) {
          isArray = r;
        }
        const s = typeof r === 'string' || typeof r === 'number' ? r : null;
        if (!s && s !== 0 && s!='') {
          isNull = true;
        }
        return s;
      }
    );
    if (isObject) {
      return isObject;
    }
    if (isArray?.length) {
      return isArray;
    }
    if (typeof isBoolean === 'boolean') {
      return isBoolean;
    }
    if (str === 'null' || isNull) {
      return null;
    }
    if (str !== this && str.match(/\${([^{}]*)}/g)?.length) {
      // console.log(str, str === this, str.supplant(o), o);
      str = str.supplant(o);
    }
    return str;
  };