"use strict";

class Pattern {
  constructor(exec) {
    this.exec = exec;
  }
}

Pattern.txt = function (text) {
  return new Pattern((str, pos = 0) => {
    if (str.substr(pos, text.length) === text) {
      return {
        res: text,
        end: pos + text.length
      };
    }
  });
};

Pattern.rgx = function (regexp) {
  return new Pattern((str, pos = 0) => {
    var m = regexp.exec(str.slice(pos));
    if (m && m.index === 0) {
      return {
        res: m[0],
        end: pos + m[0].length
      };
    }
  });
};

Pattern.opt = function (pattern) {
  return new Pattern((str, pos = 0) => {
    return pattern.exec(str, pos) || {res: null, end: pos};
  });
};

Pattern.exc = function (pattern, except) {
  return new Pattern((str, pos = 0) => {
    return !except.exec(str, pos) && pattern.exec(str, pos);
  });
};

Pattern.any = function (...patterns) {
  return new Pattern((str, pos = 0) => {
    for (var r, i = 0; i < patterns.length; i++)
      if (r = patterns[i].exec(str, pos)) {
        return r;
      }
  });
};

Pattern.seq = function (...patterns) {
  return new Pattern((str, pos = 0) => {
    var i, r, end = pos, res = [];

    for (i = 0; i < patterns.length; i++) {
      r = patterns[i].exec(str, end);
      if (!r) {
        return;
      }
      res.push(r.res);
      end = r.end;
    }

    return {
      res: res,
      end: end
    };
  });
};

