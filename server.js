require('dotenv').config();

const fetch = require('node-fetch');
const jsome = require('jsome');
const express = require('express');
const logger = require('morgan');
const app = express();
const template = require('pug').compileFile(__dirname + '/src/templates/index.pug');

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));

app.get('/', (req, res, next) => {
    try {
        var createPaymentSession = item => {
            var body = {
                amount: 199.50,
                vatAmount: 39.90,
                currency: "NOK",
                callbackUrl: "https://merchant.api/callback",
                reference: `fluffy-${item}`,
                culture: "en-US",
                fees : {
                    "invoice": {
                        "amount": 19.50,
                        "vatAmount": 3.90,
                        "description": "Invoice fee"
                    }
                }
            };

            console.log(`Setting up creation of Payment Session ${item}:`);
            jsome(body);

            return fetch(app.locals.paymentSessionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify(body)
            }).then(result => {
                console.log(`Payment Session ${item} POST completed with HTTP status ${result.status}.`)
                if (result.status == 401) {
                    throw 'Unauthorized!';
                }

                return result.json();
            }).then(json => {
                jsome(json);
                return json.id;
            }).catch(e => {
                console.error(`Payment Session ${item} POST failed:`, e)
            });
        };

        var createPaymentSessions = new Array(8).fill().map((_, i) => i + 1).map(createPaymentSession);
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
        app.locals.paymentSessionUrl = json.paymentSession;
    });
});
