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
    return fetch(paymentSession, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).then(result => {
        console.log(`GET ${paymentSession} completed with HTTP status ${result.status}.`)
        if (result.status != 200) {
            throw `Error ${result.status}`;
        }

        return result.json();
    }).then(json => {
        jsome(json);
        return json.payment;
    }).then(paymentUrl => {
        return fetch(paymentUrl, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }).then(result => {
        console.log(`GET ${paymentSession} completed with HTTP status ${result.status}.`)
        if (result.status != 200) {
            throw `Error ${result.status}`;
        }

        return result.json();
    }).then(json => {
        jsome(json);

        var captureOperation = json.operations.filter(x => x.rel == 'create-checkout-capture');
        if (captureOperation.length == 0) {
            throw `Payment ${json.payment.id} had no capture operation`;
        }

        var captureOperationUrl = captureOperation[0].href;

        return fetch(captureOperationUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transaction: {
                    description: 'Capturing the fluff!'
                }
            })
        });
    }).then(result => {
        console.log(`Capture completed with HTTP status ${result.status}.`)
        if (result.status != 201) {
            throw `Error ${result.status}`;
        }

        return result.json()
    }).then(json => {
        jsome(json);
        return {
            amount: json.capture.transaction.amount,
            state: json.capture.transaction.state
        }
    })
}
