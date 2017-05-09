const payexCheckout = require('./payex.checkout');
const paymentSession = require('./paymentsession');
const view = require('./view');
var server = null;

module.exports = {
    start: start,
    index: index,
}

/*
 * GET /
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
