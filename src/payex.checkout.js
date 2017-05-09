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

	// Fetch the root URL of the PayEx Checkout API to retrieve the URL
	// we should POST the Payment Session request to.
    return fetch('https://api.externalintegration.payex.com/psp/checkout', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then(res => {
        return res.json();
    }).then(json => {
        jsome(json);
        paymentSessionCreationUrl = json.paymentSession;

        return {
            createPaymentSession : createPaymentSession,
            capture: capture
        };
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

	// Perform an HTTP POST request to the previously retrieved URL to create
	// a new Payment Session.
    return fetch(paymentSessionCreationUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(request)
    }).then(result => {
        console.log(`Payment Session ${request.reference} POST completed with HTTP status ${result.status}.`)
        if (result.status != 201) {
            throw `Error ${result.status}`;
        }

        return result.json();
    }).then(json => {
        jsome(json);
        return json;
    }).catch(e => {
        console.error(`Payment Session ${request.reference} POST failed:`, e)
		// TODO: We shouldn't have to return null;
		//       all Payment Session POSTs should succeed.
		return null;
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
