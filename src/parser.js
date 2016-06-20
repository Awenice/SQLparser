"use strict";

var Patterns = require('patterns');

class SQLparser {
  constructor() {
    this._whiteSpaces = Patterns.rgx(/\s+/);
    this._optionalWhiteSpaces = Patterns.opt(this._whiteSpaces);
    this._dot = Patterns.txt('.');
    this._comma = Patterns.txt(',');
    this._string = Patterns.rgx(/[a-z_]+[a-z0-9_]+/);
    this._comparison = Patterns.any(
      Patterns.txt('<>'),
      Patterns.txt('<='),
      Patterns.txt('>='),
      Patterns.txt('<'),
      Patterns.txt('>'),
      Patterns.txt('=')
    );

    this._field = Patterns.seq(
      this._string,
      this._dot,
      this._string
    ).then(result => {
      return {
        table: result[0],
        column: result[2]
      };
    });
    this._fieldList = Patterns.any(
      Patterns.txt('*'),
      Patterns.rep(
        this._field,
        Patterns.seq(
          this._optionalWhiteSpaces,
          this._comma,
          this._optionalWhiteSpaces
        )
      )
    );

    this._equalityExpression = Patterns.seq(
      this._field,
      this._optionalWhiteSpaces,
      Patterns.txt('='),
      this._optionalWhiteSpaces,
      this._field
    ).then(result => {
      return {
        left: result[0],
        right: result[4]
      };
    });
    this._comparingExpression = Patterns.seq(
      this._field,
      this._optionalWhiteSpaces,
      this._comparison,
      this._optionalWhiteSpaces,
      this._field
    ).then(result => {
      return {
        left: result[0],
        right: result[4],
        type: result[2]
      };
    });

    this._selectExpression = Patterns.seq(
      Patterns.rgx(/select/i),
      this._whiteSpaces,
      this._fieldList,
      this._whiteSpaces,
      Patterns.rgx(/from/i),
      this._whiteSpaces,
      this._string,
      this._optionalWhiteSpaces
    ).then(result => {
      return {
        select: {
          fields: result[2],
          from: result[6]
        }
      };
    });

    this._joinExpression = Patterns.seq(
      Patterns.rgx(/join/i),
      this._whiteSpaces,
      this._string,
      this._whiteSpaces,
      Patterns.rgx(/on/i),
      this._whiteSpaces,
      this._equalityExpression,
      this._optionalWhiteSpaces
    ).then(result => {
      return {
        join: {
          left: result[6].left,
          right: result[6].right,
          table: result[2]
        }
      };
    });

    this._whereExpression = Patterns.seq(
      Patterns.rgx(/where/i),
      this._whiteSpaces,
      this._comparingExpression,
      this._optionalWhiteSpaces
    ).then(result => {
      return {
        where: result[2]
      };
    });

    this._query = Patterns.seq(
      this._selectExpression,
      this._optionalWhiteSpaces,
      Patterns.opt(
        Patterns.rep(
          this._joinExpression,
          this._optionalWhiteSpaces
        )
      ),
      Patterns.opt(this._whereExpression)
    ).then(result => {
      var ast = {
        select: result[0].select
      };

      if (result[2]) {
        ast.join = result[2].map(function (joinSection) {
          return joinSection.join;
        });
      }

      if (result[3]) {
        ast.where = result[3].where;
      }

      return ast;
    });
  }

  parse(string) {
    return this._query.exec(string).res;
  }
}

module.exports = SQLparser;