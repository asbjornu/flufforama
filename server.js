require('dotenv').config();

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
        const checkout = app.locals.payexCheckout;
        const createPaymentSessions = new Array(8)
            .fill()
            .map((_, i) => i + 1)
            .map(i => checkout.createPaymentSession(`fluffy-${i}`));

        Promise.all(createPaymentSessions).then(paymentSessions => {
            // TODO: We shouldn't have to filter on undefined;
            //       all Payment Session POSTs should succeed.
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
        const checkout = app.locals.payexCheckout;
        const paymentSession = req.body.paymentSession;

        checkout.capture(paymentSession).then(result => {
            res.redirect(`/receipt?ps=${paymentSession}&state=${result.state}&amount=${result.amount}`)
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
        var amount = parseFloat(Math.round(req.query.amount * 100) / 100).toFixed(2);
        var html = template({
            paymentSession: req.query.ps,
            state: req.query.state,
            amount: amount
        })
        res.send(html);
    } catch (e) {
        next(e)
    }
});

app.listen(process.env.PORT || 3000, () => {
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=<ACCESS_TOKEN> in it?');
        accessToken = '<NO_ACCESS_TOKEN_CONFIGURED>';
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
    app.locals.payexCheckout = payexCheckout(process.env.ACCESS_TOKEN);
});
