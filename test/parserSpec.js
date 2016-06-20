"use strict";
var SQLparser = require('parser');

describe('SQLparser', () => {
  var parser = new SQLparser(),
    query;

  describe('testing private statements', () => {
    it('parse white spaces', () => {
      expect(parser._whiteSpaces.exec('   test')).toEqual({
        res: '   ',
        end: 3
      });
    });

    it('parse optional spaces', () => {
      expect(parser._optionalWhiteSpaces.exec('   test')).toEqual({
        res: '   ',
        end: 3
      });
      expect(parser._optionalWhiteSpaces.exec('test')).toEqual({
        res: null,
        end: 0
      });
    });

    it('parse dot', () => {
      expect(parser._dot.exec('.')).toEqual({
        res: '.',
        end: 1
      });
    });

    it('parse comma', () => {
      expect(parser._comma.exec(',')).toEqual({
        res: ',',
        end: 1
      });
    });

    it('parse string', () => {
      expect(parser._comma.exec(',')).toEqual({
        res: ',',
        end: 1
      });
    });

    it('parse comparison', () => {
      var operators = [
        '<>',
        '<=',
        '>=',
        '<',
        '>',
        '='
      ];

      operators.forEach(operator => {
        expect(parser._comparison.exec(operator)).toEqual({
          res: operator,
          end: operator.length
        });
      });
    });

    it('parse table field', () => {
      expect(parser._field.exec('table.column')).toEqual({
        res: {
          table: 'table',
          column: 'column'
        },
        end: 12
      });
    });

    it('parse fields list', () => {
      expect(parser._fieldList.exec('table.column  ,  table1.column1')).toEqual({
        res: [
          {
            table: 'table',
            column: 'column'
          },
          {
            table: 'table1',
            column: 'column1'
          }
        ],
        end: 31
      });
    });

    it('parse equality expression', () => {
      expect(parser._equalityExpression.exec('table.column = table1.column1')).toEqual({
        res: {
          left: {
            table: 'table',
            column: 'column'
          },
          right: {
            table: 'table1',
            column: 'column1'
          }
        },
        end: 29
      });
    });

    it('parse comparing expression', () => {
      expect(parser._comparingExpression.exec('table.column <> table1.column1')).toEqual({
        res: {
          left: {
            table: 'table',
            column: 'column'
          },
          right: {
            table: 'table1',
            column: 'column1'
          },
          type: '<>'
        },
        end: 30
      });
    });

    it('parse select expression', () => {
      expect(parser._selectExpression.exec('SELECT * FROM table')).toEqual({
        res: {
          select: {
            fields: '*',
            from: 'table'
          }
        },
        end: 19
      });

      expect(parser._selectExpression.exec('SELECT table.qwerty, table1.asdfgh FROM table')).toEqual({
        res: {
          select: {
            fields: [
              {
                column: 'qwerty',
                table: 'table'
              },
              {
                column: 'asdfgh',
                table: 'table1'
              }
            ],
            from: 'table'
          }
        },
        end: 45
      });
    });

    it('parse join expression', () => {
      expect(parser._joinExpression.exec('JOIN table ON table1.qwerty=table.qwerty')).toEqual({
        res: {
          join: {
            left: {
              table: 'table1',
              column: 'qwerty'
            },
            right: {
              table: 'table',
              column: 'qwerty'
            },
            table: 'table'
          }
        },
        end: 40
      });
    });

    it('parse where expression', () => {
      expect(parser._whereExpression.exec('WHERE table.qwerty > table.asdfgh')).toEqual({
        res: {
          where: {
            left: {
              column: 'qwerty',
              table: 'table'
            },
            right: {
              column: 'asdfgh',
              table: 'table'
            },
            type: '>'
          }
        },
        end: 33
      });
    });
  });

  it('simple select', () => {
    query = 'SELECT * FROM table';
    expect(parser.parse(query)).toEqual({
      select: {
        fields: '*',
        from: 'table'
      }
    });
  });

  it('complex select', () => {
    query = `SELECT table.id, table.name, table.table1_id, table.table2_id FROM table
             JOIN table1 ON table1.id = table.table1_id
             JOIN table2 ON table2.id = table.table2_id
             WHERE table.id > table2.id`;
    expect(parser.parse(query)).toEqual({
      select: {
        fields: [
          {
            column: 'id',
            table: 'table'
          },
          {
            column: 'name',
            table: 'table'
          },
          {
            column: 'table1_id',
            table: 'table'
          },
          {
            column: 'table2_id',
            table: 'table'
          }
        ],
        from: 'table'
      },
      join: [
        {
          left: {
            column: 'id',
            table: 'table1'
          },
          right: {
            column: 'table1_id',
            table: 'table'
          },
          table: 'table1'
        },
        {
          left: {
            column: 'id',
            table: 'table2'
          },
          right: {
            column: 'table2_id',
            table: 'table'
          },
          table: 'table2'
        }
      ],
      where: {
        left: {
          column: 'id',
          table: 'table'
        },
        right: {
          column: 'id',
          table: 'table2'
        },
        type: '>'
      }
    });
  });
});