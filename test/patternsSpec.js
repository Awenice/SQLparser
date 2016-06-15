"use strict";

describe('app spec', () => {
  it('Pattern constructor', () => {
    function fn() {
      return true;
    }

    let pattern = new Pattern(fn);

    expect(pattern.exec).toEqual(fn);
    expect(pattern.exec()).toBeTruthy();
  });

  it('txt pattern', () => {
    expect(Pattern.txt('test').exec('test  ')).toEqual({ res: 'test', end: 4 });
    expect(Pattern.txt('test').exec('abtestasdasdasd', 2)).toEqual({ res: 'test', end: 6 });
    expect(Pattern.txt('text').exec('txet', 0)).toBeUndefined();
  });

  it('rgx pattern', () => {

  });

  it('opt pattern', () => {

  });

  it('exc pattern', () => {

  });

  it('any pattern', () => {

  });

  it('seq pattern', () => {

  });
});