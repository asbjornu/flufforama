const payexCheckout = require('./payex.checkout');
const paymentSession = require('./paymentsession');
const view = require('./view');
var server = null;

module.exports = {
    start: start,
    index: index,
    submitOrder: submitOrder,
    receipt: receipt,
}

/*
 * Handles the rendering of the index page.
 *
 * The home page, displaying the fluffy animals you can buy.
 * Should perform a series of POST requests to PayEx Checkout to create
 * one Payment Session for each fluffy animal.
 *
 */
function index(request, response, next) {
    try {
        const checkout = server.locals.payexCheckout;
        const createPaymentSessions = paymentSession
            .initialize()
            .map(checkout.createPaymentSession)

        Promise.all(createPaymentSessions).then(paymentSessions => {
            var model = {
                paymentSessions: paymentSessions
            };
            view.render('index', model, response, next);
        }).catch(e => {
            console.error(e);
            var model = {
                error: e
            };
            view.render('error', model, response, next);
        });
    } catch (e) {
		console.error(e);
        next(e);
    }
}


/*
 * Handles the submission of the order.
 *
 * Invoked after the PayEx Checkout is complete. The posted form will have
 * `paymentSession` as a hidden field, containing the URL of the Payment
 * Session that was purchased.
 *
 * Performs capture on the created Payment and redirects to the receipt.
 *
 */
function submitOrder(request, response, next) {
    try {
        const checkout = server.locals.payexCheckout;
        const paymentSession = request.body.paymentSession;

        checkout.capture(paymentSession).then(result => {
            const url = `/receipt?ps=${paymentSession}&state=${result.state}&amount=${result.amount}`;
            console.log('Redirecting to:', url);
            response.redirect(url);
        }).catch(e => {
            console.error(e);
            var model = {
                error: e
            };
            view.render('error', model, response, next);
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
}

/*
 * Handles the rendering of the receipt page.
 *
 * After the POST performing capture is complete, it redirects to this page,
 * displaying the status about the captured payment.
 *
 */
function receipt(request, response, next) {
    try {
        var amount = parseFloat(Math.round(request.query.amount * 100) / 100).toFixed(2);
		var model = {
            paymentSession: request.query.ps,
            state: request.query.state,
            amount: amount
        };
		view.render('receipt', model, response, next);
    } catch (e) {
        console.error(e);
        next(e);
    }
}

/*
 * Starts the web application.
 *
 * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
 * against PayEx Checkout.
 *
 */
function start(s) {
    server = s;
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=<ACCESS_TOKEN> in it?');
        accessToken = '<NO_ACCESS_TOKEN_CONFIGURED>';
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    payexCheckout(process.env.ACCESS_TOKEN).then(init => {
        s.locals.payexCheckout = init;
        s.listen(process.env.PORT || 3000, () => {
            console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
        });
    });
}
