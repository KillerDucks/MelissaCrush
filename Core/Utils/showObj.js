const util = require('util')

function showObj(obj){
  console.log(util.inspect(obj, {showHidden: false, depth: null})) 
};


module.exports = showObj;