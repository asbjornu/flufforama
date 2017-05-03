var fetch = require('node-fetch');
var jsome = require('jsome');
var express = require('express');
var logger = require('morgan');
var app = express();
var template = require('pug').compileFile(__dirname + '/src/templates/index.pug')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', function(req, res, next) {
    try {
        fetch('https://api.externalintegration.payex.com/psp/checkout')
            .then(res => {
                return res.json();
            }).then(json => {
                var html = template({
                    title: 'Home'
                })
                jsome(json);
                res.send(html)
            });
    } catch (e) {
        next(e)
    }
})

app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})
