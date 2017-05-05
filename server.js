require('dotenv').config();

const fetch = require('node-fetch');
const jsome = require('jsome');
const express = require('express');
const logger = require('morgan');
const pug = require('pug');
const bodyParser = require("body-parser");
const payexCheckout = require('./src/payex.checkout');
const app = express();

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
    try {
        const template = pug.compileFile(__dirname + '/src/templates/index.pug');

        var createPaymentSessions = new Array(8)
            .fill()
            .map((_, i) => i + 1)
            .map(i => payexCheckout.createPaymentSession(app.locals.paymentSessionCreationUrl, `fluffy-${i}`));

        Promise.all(createPaymentSessions).then(paymentSessions => {
            paymentSessions = paymentSessions.filter(x => x != undefined);
            var html = template({
                title: 'Home',
                paymentSessions: paymentSessions
            })
            res.send(html);
        }).catch(e => {
            console.error(e)
            var html = template({
                title: 'Error',
                error: e
            })
            res.send(html);
        });
    } catch (e) {
        next(e)
    }
});

app.post('/', (req, res, next) => {
    try {
        var paymentSession = req.body.paymentSession;

        fetch(paymentSession, {
            headers: {
                'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
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
                    'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
                }
            });
        }).then(result => {
            console.log(`GET ${req.body.paymentSession} completed with HTTP status ${result.status}.`)
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
                    'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
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
            res.redirect(`/receipt?ps=${paymentSession}&state=${json.capture.transaction.state}`)
        }).catch(e => {
            console.error(e);
            const template = pug.compileFile(__dirname + '/src/templates/error.pug');
            var html = template({
                error: e
            })
            res.send(html);
        });
    } catch (e) {
        next(e)
    }
});

app.get('/receipt', (req, res, next) => {
    try {
        const template = pug.compileFile(__dirname + '/src/templates/receipt.pug');
        var html = template({
            paymentSession: req.query.ps,
            state: req.query.state
        })
        res.send(html);
    } catch (e) {
        next(e)
    }
});

app.listen(process.env.PORT || 3000, () => {
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=[token] in it?');
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))

    fetch('https://api.externalintegration.payex.com/psp/checkout', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then(res => {
        return res.json();
    }).then(json => {
        jsome(json);
        app.locals.paymentSessionCreationUrl = json.paymentSession;
    });
});
