require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const pug = require('pug');
const bodyParser = require("body-parser");
const payexCheckout = require('./src/payex.checkout');
const paymentSession = require('./src/paymentsession');
const app = express();

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * GET /
 *
 * The home page, displaying the fluffy animals you can buy.
 * Should perform a series of POST requests to PayEx Checkout to create
 * one Payment Session for each fluffy animal.
 *
 */
app.get('/', (request, response, next) => {
    try {
        const checkout = app.locals.payexCheckout;
        const template = pug.compileFile(__dirname + '/src/templates/index.pug');
        const createPaymentSessions = paymentSession
            .initialize()
            .map(checkout.createPaymentSession)

        Promise.all(createPaymentSessions).then(paymentSessions => {
            // TODO: We shouldn't have to filter on undefined;
            //       all Payment Session POSTs should succeed.
            paymentSessions = paymentSessions.filter(x => x != undefined);
            var html = template({
                title: 'Home',
                paymentSessions: paymentSessions
            })
            response.send(html);
        }).catch(e => {
            console.error(e)
            var html = template({
                title: 'Error',
                error: e
            })
            response.send(html);
        });
    } catch (e) {
        next(e)
    }
});

/*
 * POST /
 *
 * Invoked after the PayEx Checkout is complete. The posted form will have
 * `paymentSession` as a hidden field, containing the URL of the Payment
 * Session that was purchased.
 *
 * Performs capture on the created Payment and redirects to the receipt.
 *
 */
app.post('/', (request, response, next) => {
    try {
        const checkout = app.locals.payexCheckout;
        const paymentSession = request.body.paymentSession;

        checkout.capture(paymentSession).then(result => {
            response.redirect(`/receipt?ps=${paymentSession}&state=${result.state}&amount=${result.amount}`)
        }).catch(e => {
            console.error(e);
            const template = pug.compileFile(__dirname + '/src/templates/error.pug');
            var html = template({
                error: e
            })
            response.send(html);
        });
    } catch (e) {
        next(e)
    }
});

/*
 * GET /receipt
 *
 * After the POST performing capture is complete, it redirects to this page,
 * displaying the status about the captured payment.
 *
 */
app.get('/receipt', (request, response, next) => {
    try {
        const template = pug.compileFile(__dirname + '/src/templates/receipt.pug');
        var amount = parseFloat(Math.round(request.query.amount * 100) / 100).toFixed(2);
        var html = template({
            paymentSession: request.query.ps,
            state: request.query.state,
            amount: amount
        })
        response.send(html);
    } catch (e) {
        next(e)
    }
});

/*
 * Starts the web application.
 *
 * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
 * against PayEx Checkout.
 *
 */
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
