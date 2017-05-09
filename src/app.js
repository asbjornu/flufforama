const payexCheckout = require('./payex.checkout');
const paymentSession = require('./paymentsession');
const view = require('./view');
var server = null;

module.exports = {
    start: start,
    showIndex: showIndex,
    submitOrder: submitOrder,
    showReceipt: showReceipt,
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
    require('dotenv').config();
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=<ACCESS_TOKEN> in it?');
        accessToken = '<NO_ACCESS_TOKEN_CONFIGURED>';
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    payexCheckout(process.env.ACCESS_TOKEN).then(init => {
        var port = process.env.PORT || 3000;
        s.locals.payexCheckout = init;
        s.listen(port, () => {
            console.log('Listening on http://localhost:' + port);
        });
    });
}

/*
 * Handles the rendering of the index page.
 *
 * The home page, displaying the fluffy animals you can buy.
 * Should perform a series of POST requests to PayEx Checkout to create
 * one Payment Session for each fluffy animal.
 *
 */
function showIndex(request, response, next) {
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
        }).catch(error => showError(error, response, next));
    } catch (error) {
        showError(error, response, next);
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
        }).catch(error => showError(error, response, next));
    } catch (error) {
        showError(error, response, next);
    }
}

/*
 * Handles the rendering of the receipt page.
 *
 * After the POST performing capture is complete, it redirects to this page,
 * displaying the status about the captured payment.
 *
 */
function showReceipt(request, response, next) {
    try {
		var model = {
            paymentSession: request.query.ps,
            state: request.query.state,
            amount: parseFloat(Math.round(request.query.amount * 100) / 100).toFixed(2)
        };
		view.render('receipt', model, response, next);
    } catch (error) {
        showError(error, response, next);
    }
}

/*
 * Handles the rendering of an error.
 *
 */
function showError(error, response, next) {
    console.error(error);

    try {
        var model = {
            error: error
        };
        view.render('error', model, response, next);
    } catch (e) {
        console.error(e);
        next(e);
    }
}
