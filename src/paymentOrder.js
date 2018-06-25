/**
 * The Payment Order module, used to create PaymentOrder objects.
 *
 * @module paymentOrder
 *
 */

/**
 * Initializes and returns 8 PaymentOrder objects.
 *
 * @export initialize
 * @return 8 PaymentOrder objects
 */
module.exports.initialize = () => {
  return new Array(8)
    .fill()
    .map((_, i) => i + 1)
    .map(initializePaymentOrder)
};

/**
 * Initializes a PaymentOrder object.
 *
 * @private
 * @param item The item number to create.
 * @return A PaymentOrder object.
 */
function initializePaymentOrder(item) {
  var amounts = getRandomAmounts(item);

  return {
    "paymentorder": {
      "operation": "Purchase",
      "currency": "NOK",
      "amount": amounts.amount,
      "vatAmount": amounts.vatAmount,
      "description": "Test Purchase",
      "userAgent": "Mozilla/5.0...",
      "language": "nb-NO",
      "urls": {
        "hostUrls": [ "http://test-dummy.net", "http://test-dummy2.net" ],
        "completeUrl": "http://test-dummy.net/payment-completed",
        "cancelUrl": "http://test-dummy.net/payment-canceled",
        "callbackUrl": "http://test-dummy.net/payment-callback",
        "termsOfServiceUrl": "http://test-dummy.net/termsandconditoons.pdf",
        "logoUrl": "http://test-dummy.net/logo.png"
      },
      "payeeInfo": {
        "payeeId": "12345678-1234-1234-1234-123456789012",
        "payeeReference": "CD1234",
        "payeeName": "Merchant1",
        "productCategory": "A123"
      },
      "payer": {
        "consumerProfileRef": "5adc265ff87f4313577e08d3dca1a26d",
      }
    }
  }
}

/**
 * Gets an object containing a random amount and VAT amount.
 *
 * @private
 * @param item The item number to use in the calculation of amounts.
 * @return An object containing a random amount and VAT amount.
 */
function getRandomAmounts(item) {
  var r = parseFloat(Math.round(Math.random() * 100) / 100).toFixed(2);
  var a = Math.random() * item * 223;
  var grossAmount = parseFloat(Math.round(a * 100) / 100).toFixed(1);
  var vatRate = 25;
  var vatFactor = 1 + (vatRate / 100);
  var netAmount = grossAmount / vatFactor;
  var v = grossAmount - netAmount;
  var vatAmount = parseFloat(Math.round(v * 100) / 100).toFixed(2);

  return {
    amount: grossAmount,
    vatAmount: vatAmount
  };
}
