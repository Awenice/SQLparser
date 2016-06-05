"use strict";

let Parsimmon = require('parsimmon');

let test = Parsimmon.noneOf('test');

console.log(test.parse('aaa'));
//console.log(test.parse('tes'));