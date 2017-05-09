const payexCheckout = require('./payex.checkout');

module.exports = {
    start: start
}


/*
 * Starts the web application.
 *
 * Bootstraps with the environment variable ACCESS_TOKEN, used to authorize
 * against PayEx Checkout.
 *
 */
function start(server) {
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=<ACCESS_TOKEN> in it?');
        accessToken = '<NO_ACCESS_TOKEN_CONFIGURED>';
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    payexCheckout(process.env.ACCESS_TOKEN).then(init => {
        server.locals.payexCheckout = init;
        server.listen(process.env.PORT || 3000, () => {
            console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
        });
    });
}
