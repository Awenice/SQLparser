"use strict";

class Pattern {
  constructor(exec) {
    this.exec = exec;
  }

  then(transform) {
    var self = this;
    return new Pattern(function (str, pos) {
      var r = self.exec(str, pos);
      return r && {res: transform(r.res), end: r.end};
    });
  }

  static txt(text) {
    return new Pattern((str, pos = 0) => {
      if (str.substr(pos, text.length) === text) {
        return {
          res: text,
          end: pos + text.length
        };
      }
    });
  }

  static rgx(regexp) {
    return new Pattern((str, pos = 0) => {
      var m = regexp.exec(str.slice(pos));
      if (m && m.index === 0) {
        return {
          res: m[0],
          end: pos + m[0].length
        };
      }
    });
  }

  static opt(pattern) {
    return new Pattern((str, pos = 0) => {
      return pattern.exec(str, pos) || {res: null, end: pos};
    });
  }

  static exc(pattern, except) {
    return new Pattern((str, pos = 0) => {
      var result = !except.exec(str, pos) && pattern.exec(str, pos);
      return result ? result : undefined;
    });
  }

  static any(...patterns) {
    return new Pattern((str, pos = 0) => {
      for (var r, i = 0; i < patterns.length; i++)
        if (r = patterns[i].exec(str, pos)) {
          return r;
        }
    });
  }

  static seq(...patterns) {
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
  }

  static rep(pattern, separator) {
    var separated = !separator ? pattern :
      Pattern.seq(separator, pattern).then(r => r[1]);

    return new Pattern(function (str, pos = 0) {
      var res = [], end = pos, r = pattern.exec(str, end);

      while (r && r.end > end) {
        res.push(r.res);
        end = r.end;
        r = separated.exec(str, end);
      }

      return res.length ? {res: res, end: end} : undefined;
    });
  }
}

module.exports = Pattern;