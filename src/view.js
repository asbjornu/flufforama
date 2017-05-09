const JUST = require('just');
const just = new JUST({ root: __dirname + '/views/', useCache: true, ext: '.jsp', watchForChanges: true });

module.exports = {
    render: render
}

function render(viewName, viewModel, response, next) {
    just.render(viewName, viewModel, function(error, html) {
        if (error) {
            console.error(error);
            next(error);
        } else {
            response.send(html);
        }
    });
}
