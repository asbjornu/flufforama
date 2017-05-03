var fetch = require('node-fetch');
var jsome = require('jsome');

fetch('https://api.externalintegration.payex.com/psp/checkout')
    .then(res => {
        return res.json();
    }).then(json => {
        jsome(json);
    });
