var fetch = require('node-fetch');

fetch('https://api.externalintegration.payex.com/psp/checkout')
    .then(res => {
        return res.json();
    }).then(json => {
        console.log(json);
    });
