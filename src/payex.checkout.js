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
  * the URL to create Payment Orders.
  *
  * @constructor
  * @export
  * @param at The Access Token that should be used to authorize the HTTP requests performed against PayEx.
  * @return An object containing the methods createPaymentSession() and capture().
  *
  */
module.exports = at => {
    accessToken = at;

    const request = {
        "operation": "initiate-consumer-session",
        "msisdn": "+4798765432",
        "email": "olivia.nyhuus@example.com",
        "consumerCountryCode": "NO",
        "nationalIdentifier": {
            "socialSecurityNumber": "26026708248",
            "countryCode": "NO"
        }    
    };

    jsome(request);

    return fetch('https://api.stage.payex.com/psp/consumers', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    }).then(res => {
        return res.json();
    }).then(json => {
        jsome(json);

        var operation = json.operations.find(o => o.rel === 'view-consumer-identification');

        return {
            operation: operation,            
            createPaymentOrder : createPaymentOrder,
            capture: capture
        };
    }).catch(error => {
        console.error(error);
    });
}

/**
  * Creates a Payment Order.
  *
  * @export createPaymentOrder
  * @param paymentOrder The request object that will create the Payment Order.
  * @return A Promise that, when fulfilled, will return the URL of the created Payment Order.
  *
  */
function createPaymentOrder(paymentOrder) {
    jsome(paymentOrder);

    const reference = paymentOrder.paymentorder.payeeInfo.payeeReference;
    var status = 0;
    console.log(`Setting up creation of Payment Order ${reference}`);

	// Perform an HTTP POST request to the previously retrieved URL to create
	// a new Payment Order.
    return fetch('https://api.stage.payex.com/psp/paymentorders', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(paymentOrder)
    }).then(result => {
        console.log(`Payment Order ${reference} POST completed with HTTP status ${result.status}.`)
        const contentType = result.headers.get('Content-Type');
        status = result.status;

        if (contentType.indexOf('json') > 0) {
            return result.json();
        }

        throw `Invalid content type '${contentType}'`;
    }).then(json => {
        jsome(json);

        if (status != 201) {
            throw `Error ${status}`;
        }

        return json.paymentOrder;
    }).catch(e => {
        console.error(`Payment Order ${reference} POST failed:`, e)
		// TODO: We shouldn't have to return null;
		//       all Payment Order POSTs should succeed.
		return null;
    });
}

/**
  * Captures a Payment Order.
  *
  * @export capture
  * @param paymentSession The URL of the Payment Order to capture.
  * @return A Promise that, when fulfilled, will return an object containing the amount and state of the captured payment.
  *
  */
function capture(paymentSession) {
	// First GET the Payment Order to retrieve its current state.
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
		// Retrieve the `payment` property; a URL pointing to the Payment that
		// has been created during the PayEx Checkout user flow.
        return json.payment;
    }).then(paymentUrl => {
		// Perform an HTTP GET request on the Payment URL to retrieve its current state.
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

		// Find the `create-checkout-capture` operation in the returned Payment
        var captureOperation = json.operations.filter(x => x.rel == 'create-checkout-capture');
        if (captureOperation.length == 0) {
            throw `Payment ${json.payment.id} had no capture operation`;
        }

		// The `create-checkout-capture` operation's `href` contains the URL
		// we should POST the capture request to.
        var captureOperationUrl = captureOperation[0].href;

		// Perform the HTTP POST request to capture the Payment.
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
