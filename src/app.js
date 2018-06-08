/**
  * The App module, containing the application logic.
  *
  * @module app
  *
  */
const payexCheckout = require('./payex.checkout');
const paymentOrder = require('./paymentorder');
const view = require('./view');
var server = null;

/**
  * Starts the web application.
  *
  * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
  * against PayEx Checkout.
  *
  * @export start
  * @param express The Express server object.
  * @return void
  *
  */
module.exports.start = express => {
    server = express;
    require('dotenv').config();
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=<ACCESS_TOKEN> in it?');
        accessToken = '<NO_ACCESS_TOKEN_CONFIGURED>';
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    payexCheckout(process.env.ACCESS_TOKEN).then(init => {
        var port = process.env.PORT || 3000;
        express.locals.payexCheckout = init;
        express.listen(port, () => {
            console.log('Listening on http://localhost:' + port);
        });
    });
};

/**
  * Handles the rendering of the index page.
  *
  * Shows the index page, displaying the fluffy animals you can buy.
  * Should perform a series of POST requests to PayEx Checkout to create
  * one Payment Session for each fluffy animal.
  *
  * @export showIndex
  * @param request The Express Request object.
  * @param response The Express Response object.
  * @param next The Express Next object.
  * @return void
  *
  */
module.exports.showIndex = (request, response, next) => {
    try {
        const checkout = server.locals.payexCheckout;
        const createPaymentOrders = paymentOrder
            .initialize()
            .map(checkout.createPaymentOrder)

        Promise.all(createPaymentOrders).then(paymentOrders => {
            var model = {
                paymentOrders: paymentOrders
            };
            view.render('index', model, response, next);
        }).catch(error => showError(error, response, next));
    } catch (error) {
        showError(error, response, next);
    }
};


/**
  * Handles the submission of the order.
  *
  * Invoked after the PayEx Checkout is complete. The posted form will have
  * `paymentOrder` as a hidden field, containing the URL of the Payment
  * Session that was purchased.
  *
  * Performs capture on the created Payment and redirects to the receipt.
  *
  * @export submitOrder
  * @param request The Express Request object.
  * @param response The Express Response object.
  * @param next The Express Next object.
  * @return void
  *
  */
module.exports.submitOrder = (request, response, next) => {
    try {
        const checkout = server.locals.payexCheckout;
        const paymentOrder = request.body.paymentOrder;

        checkout.capture(paymentOrder).then(result => {
            const url = `/receipt?ps=${paymentOrder}&state=${result.state}&amount=${result.amount}`;
            console.log('Redirecting to:', url);
            response.redirect(url);
        }).catch(error => showError(error, response, next));
    } catch (error) {
        showError(error, response, next);
    }
};

/**
  * Handles the rendering of the receipt page.
  *
  * After the POST performing capture is complete, it redirects to this page,
  * displaying the status about the captured payment.
  *
  * @export showReceipt
  * @param request The Express Request object.
  * @param response The Express Response object.
  * @param next The Express Next object.
  * @return void
  *
  */
module.exports.showReceipt = (request, response, next) => {
    try {
		var model = {
            paymentOrder: request.query.ps,
            state: request.query.state,
            amount: parseFloat(Math.round(request.query.amount * 100) / 100).toFixed(2)
        };
		view.render('receipt', model, response, next);
    } catch (error) {
        showError(error, response, next);
    }
};

/**
  * Handles the rendering of an error.
  *
  * @private
  * @param request The Express Request object.
  * @param response The Express Response object.
  * @param next The Express Next object.
  * @return void
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
