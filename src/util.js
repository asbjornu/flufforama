const uuid = require('uuid/v1');
const sha256 = require('sha256');

/**
  *
  * @module Utils
  *
  */
module.exports = {
    generatePayeeReference: generatePayeeReference
}

/**
 * Generates a unique Payee Reference.
 *
 * @private
 * @return A unique Payee Reference string.
 */
function generatePayeeReference() {
    return sha256(uuid()).substring(0, 6);
};