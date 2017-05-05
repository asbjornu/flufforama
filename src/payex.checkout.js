const fetch = require('node-fetch');
const jsome = require('jsome');
var paymentSessionCreationUrl = null;
var accessToken = null;

module.exports = at => {
    accessToken = at;

    fetch('https://api.externalintegration.payex.com/psp/checkout', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then(res => {
        return res.json();
    }).then(json => {
        jsome(json);
        paymentSessionCreationUrl = json.paymentSession;
    });

    return {
        createPaymentSession : createPaymentSession,
        capture: capture
    };
}

function createPaymentSession(reference) {
    var body = {
        amount: 199.50,
        vatAmount: 39.90,
        currency: "NOK",
        callbackUrl: "https://merchant.api/callback",
        reference: reference,
        culture: "en-US",
        fees : {
            invoice: {
                amount: 19.50,
                vatAmount: 3.90,
                description: "Invoice fee"
            }
        }
    };

    console.log(`Setting up creation of Payment Session ${reference}:`);
    jsome(body);

    return fetch(paymentSessionCreationUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(body)
    }).then(result => {
        console.log(`Payment Session ${reference} POST completed with HTTP status ${result.status}.`)
        if (result.status != 201) {
            throw `Error ${result.status}`;
        }

        return result.json();
    }).then(json => {
        jsome(json);
        return json.id;
    }).catch(e => {
        console.error(`Payment Session ${reference} POST failed:`, e)
    });
}


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
