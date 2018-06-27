const uuid = require('uuid/v5');
const sha256 = require('sha256');

/**
 * The Payment Order module, used to create PaymentOrder objects.
 *
 * @module paymentOrder
 *
 */

/**
 * Initializes a PaymentOrder object.
 *
 * @private
 * @param hostUrl The URL of the host.
 * @param consumerProfileRef The reference to the consumer profile.
 * @param payeeId The ID of the payee.
 * @return A PaymentOrder object.
 */
module.exports = function(hostUrl, consumerProfileRef, payeeId) {
  const amounts = getRandomAmounts();
  const payeeReference = sha256(uuid(hostUrl, uuid.URL)).substring(0, 5);

  return {
    "paymentorder": {
        "operation": "Purchase",
        "currency": "NOK",
        "amount": amounts.amount,
        "vatAmount": amounts.vatAmount,
        "description": "Test Purchase",
        "language": "nb-NO",
        "urls": {
            "hostUrls": [ hostUrl ],
            "completeUrl": hostUrl + "/payment-completed",
            "cancelUrl": hostUrl + "/payment-canceled",
            "callbackUrl": hostUrl + "/payment-callback",
            "termsOfServiceUrl": hostUrl + "/termsandconditoons.pdf"
        },
        "payeeInfo": {
            "payeeId": payeeId,
            "payeeReference": payeeReference,
        },
        "payer": {
            "consumerProfileRef": consumerProfileRef
        }
    }
}
}

/**
 * Gets an object containing a random amount and VAT amount.
 *
 * @private
 * @return An object containing a random amount and VAT amount.
 */
function getRandomAmounts() {
  var r = parseFloat(Math.round(Math.random() * 100) / 100).toFixed(2);
  var a = Math.random() * 223;
  var grossAmount = parseFloat(Math.round(a * 100) / 100).toFixed(1);
  var vatRate = 25;
  var vatFactor = 1 + (vatRate / 100);
  var netAmount = grossAmount / vatFactor;
  var v = grossAmount - netAmount;
  var vatAmount = parseFloat(Math.round(v * 100) / 100).toFixed(2);

  return {
    amount: parseInt(grossAmount * 100),
    vatAmount: parseInt(vatAmount * 100)
  };
}
