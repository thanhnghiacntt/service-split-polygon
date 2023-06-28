'use strict';

const fs = require('fs');

module.exports = info;
module.exports.default = info;

/**
 * Ghi nội dung string ra file
 * @param {string} text 
 */
function info(text){
    fs.appendFile('log.txt', text + "\r\n", function (err) {
        if (err) throw err;
    });
}