/**
  * The server, setting up Express.
  *
  */
const express = require('express');
const logger = require('morgan');
const bodyParser = require("body-parser");
const app = require('./src/app');
const server = express();

server.use(logger('dev'));
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());

/**
  * GET /
  *
  * The home page, displaying the fluffy animals you can buy.
  * Should perform a series of POST requests to PayEx Checkout to create
  * one Payment Order for each fluffy animal.
  *
  */
server.get('/', app.showIndex);

/**
  * POST /
  *
  * Invoked after the PayEx Checkout is complete. The posted form will have
  * `paymentOrder` as a hidden field, containing the URL of the Payment
  * Session that was purchased.
  *
  * Performs capture on the created Payment and redirects to the receipt.
  *
  */
server.post('/', app.submitOrder);

/**
  * GET /receipt
  *
  * After the POST performing capture is complete, it redirects to this page,
  * displaying the status about the captured payment.
  *
  */
server.get('/receipt', app.showReceipt);

/**
  * Starts the web application.
  *
  * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
  * against PayEx Checkout.
  *
  */
app.start(server);
