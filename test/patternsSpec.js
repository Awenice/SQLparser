"use strict";
var Pattern = require('patterns');

describe('patterns', () => {
  it('Pattern constructor', () => {
    function fn() {
      return true;
    }

    var pattern = new Pattern(fn);

    expect(pattern.exec).toEqual(fn);
    expect(pattern.exec()).toBeTruthy();
  });

  it('Pattern.then', () => {

  });

  it('txt pattern', () => {
    var pattern = Pattern.txt('test');
    expect(pattern.exec('test  ')).toEqual({ res: 'test', end: 4 });
    expect(pattern.exec('abtestasdasdasd', 2)).toEqual({ res: 'test', end: 6 });
    expect(pattern.exec('txet', 0)).toBeUndefined();
  });

  it('rgx pattern', () => {
    var pattern = Pattern.rgx(/\d+/);
    expect(pattern.exec('999')).toEqual({ res: "999", end: 3 });
    expect(pattern.exec('999', 2)).toEqual({ res: "9", end: 3 });
    expect(pattern.exec("abc")).toBeUndefined();
  });

  it('opt pattern', () => {
    var pattern = Pattern.opt(Pattern.rgx(/\d+/));
    expect(pattern.exec('999')).toEqual({ res: "999", end: 3 });
    expect(pattern.exec('999', 2)).toEqual({ res: "9", end: 3 });
    expect(pattern.exec("abc")).toEqual({ res: null, end: 0 });
  });

  it('exc pattern', () => {
    var pattern = Pattern.exc(Pattern.rgx(/[A-Z]/), Pattern.txt("A"));
    expect(pattern.exec('R')).toEqual({ res: "R", end: 1 });
    expect(pattern.exec('RRR', 2)).toEqual({ res: "R", end: 3 });
    expect(pattern.exec("A")).toBeUndefined();
  });

  it('any pattern', () => {
    var pattern = Pattern.any(Pattern.txt('abc'), Pattern.rgx(/[A-Z]+/));
    expect(pattern.exec('abc')).toEqual({ res: "abc", end: 3 });
    expect(pattern.exec('RRRRR', 2)).toEqual({ res: "RRR", end: 5 });
    expect(pattern.exec('123')).toBeUndefined();
  });

  it('seq pattern', () => {
    var pattern = Pattern.seq(Pattern.txt('qwe'), Pattern.txt('rty'));
    expect(pattern.exec('qwerty')).toEqual({ res: ['qwe', 'rty'], end: 6 });
    expect(pattern.exec('abqwerty1', 2)).toEqual({ res: ['qwe', 'rty'], end: 8 });
    expect(pattern.exec('qwe2rty')).toBeUndefined();
  });

  it('rep pattern', () => {
    var pattern = Pattern.rep();
  });
});