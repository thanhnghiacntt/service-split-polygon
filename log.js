'use strict';

const fs = require('fs');

module.exports = info;
module.exports.default = info;

function info(text){
    fs.appendFile('log.txt', text + "\r\n", function (err) {
        if (err) throw err;
    });
}