require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const bodyParser = require("body-parser");
const payexCheckout = require('./src/payex.checkout');
const paymentSession = require('./src/paymentsession');
const JUST = require('just');
const just = new JUST({ root: __dirname + '/src/views/', useCache: true, ext: '.jsp', watchForChanges: true });
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
		console.error(error);
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
app.post('/', (request, response, next) => {
    try {
        const checkout = app.locals.payexCheckout;
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
		console.error(error);
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
app.get('/receipt', (request, response, next) => {
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
		console.error(error);
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
    payexCheckout(process.env.ACCESS_TOKEN).then(init => {
        app.locals.payexCheckout = init;
    });
});
