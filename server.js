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
server.get('/', app.index);

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
server.post('/', app.submitOrder);

/*
 * GET /receipt
 *
 * After the POST performing capture is complete, it redirects to this page,
 * displaying the status about the captured payment.
 *
 */
server.get('/receipt', app.receipt);

/*
 * Starts the web application.
 *
 * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
 * against PayEx Checkout.
 *
 */
app.start(server);
