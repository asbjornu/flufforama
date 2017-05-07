/**
  * The PayEx Checkout module, containing the HTTP communication
  * stuff required to create and capture PayEx Checkout Payments.
  *
  * @module payex.checkout
  *
  */
const fetch = require('node-fetch');
const jsome = require('jsome');
var paymentSessionCreationUrl = null;
var accessToken = null;

/**
  * Initializes the PayEx Checkout module with Access Token and
  * the URL to create Payment Sessions.
  *
  * @constructor
  * @export
  * @param at The Access Token that should be used to authorize the HTTP requests performed against PayEx.
  * @return An object containing the methods createPaymentSession() and capture().
  *
  */
module.exports = at => {
    accessToken = at;

    return new Promise((resolve, reject) => {
        return resolve({
            createPaymentSession: createPaymentSession,
            capture: capture
        });
    });
}

/**
  * Creates a Payment Session.
  *
  * @export createPaymentSession
  * @param request The request object that will create the Payment Session.
  * @return A Promise that, when fulfilled, will return the URL of the created Payment Session.
  *
  */
function createPaymentSession(request) {
    console.log(`Setting up creation of Payment Session ${request.reference}:`);
    jsome(request);

    return new Promise((resolve, reject) => {
        return resolve({
            id: 'https://implement.me/',
            amount: request.amount
        })
    });
}

/**
  * Captures a Payment Session.
  *
  * @export capture
  * @param paymentSession The URL of the Payment Session to capture.
  * @return A Promise that, when fulfilled, will return an object containing the amount and state of the captured payment.
  *
  */
function capture(paymentSession) {
    return new Promise((resolve, reject) => {
        return resolve({
            state: 'Completed',
            amount: 0
        })
    });
}
