require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const bodyParser = require("body-parser");
const payexCheckout = require('./src/payex.checkout');
const paymentSession = require('./src/paymentsession');
const app = require('./src/app');
const JUST = require('just');
const just = new JUST({ root: __dirname + '/src/views/', useCache: true, ext: '.jsp', watchForChanges: true });
const server = express();

server.use(logger('dev'));
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.urlencoded({ extended: false }));

/*
 * GET /
 *
 * The home page, displaying the fluffy animals you can buy.
 * Should perform a series of POST requests to PayEx Checkout to create
 * one Payment Session for each fluffy animal.
 *
 */
server.get('/', (request, response, next) => {
    try {
        const checkout = server.locals.payexCheckout;
        const createPaymentSessions = paymentSession
            .initialize()
            .map(checkout.createPaymentSession)

        Promise.all(createPaymentSessions).then(paymentSessions => {
			just.render('index', { paymentSessions: paymentSessions	}, function(error, html) {
				if (error) {
					console.error(error);
					next(error);
				} else {
					response.send(html);
				}
			});
        }).catch(e => {
            console.error(e);

			just.render('error', { error: e }, function(error, html) {
				if (error) {
					console.error(error);
					next(error);
				} else {
					response.send(html);
				}
			});
        });
    } catch (e) {
		console.error(e);
        next(e);
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
server.post('/', (request, response, next) => {
    try {
        const checkout = server.locals.payexCheckout;
        const paymentSession = request.body.paymentSession;

        checkout.capture(paymentSession).then(result => {
            response.redirect(`/receipt?ps=${paymentSession}&state=${result.state}&amount=${result.amount}`)
        }).catch(e => {
            console.error(e);

			just.render('error', { error: e	}, function(error, html) {
				if (error) {
					console.error(error);
					next(error);
				} else {
					response.send(html);
				}
			});
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/*
 * GET /receipt
 *
 * After the POST performing capture is complete, it redirects to this page,
 * displaying the status about the captured payment.
 *
 */
server.get('/receipt', (request, response, next) => {
    try {
        var amount = parseFloat(Math.round(request.query.amount * 100) / 100).toFixed(2);
		var model = {
            paymentSession: request.query.ps,
            state: request.query.state,
            amount: amount
        };
		just.render('receipt', model, function(error, html) {
			if (error) {
				console.error(error);
				next(error);
			} else {
				response.send(html);
			}
		});
    } catch (e) {
        console.error(e);
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
app.start(server);
