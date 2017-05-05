require('dotenv').config();

const fetch = require('node-fetch');
const jsome = require('jsome');
const express = require('express');
const logger = require('morgan');
const app = express();
const template = require('pug').compileFile(__dirname + '/src/templates/index.pug')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', (req, res, next) => {
    try {
        console.log(app.locals.paymentSessionUrl);

        var html = template({
            title: 'Home',
        })
        res.send(html)
    } catch (e) {
        next(e)
    }
})

app.listen(process.env.PORT || 3000, () => {
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No access token configured. Have you created an .env file with ACCESS_TOKEN=[token] in it?');
    }
    console.log(`Bootstrapping with Access Token: ${accessToken}.`)
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))

    fetch('https://api.externalintegration.payex.com/psp/checkout', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then(res => {
        return res.json();
    }).then(json => {
        jsome(json);
        app.locals.paymentSessionUrl = json.paymentSession;
    });
})


/*
            var html = template({
                title: 'Home',
            })
            jsome(json);
            res.send(html)
*/
