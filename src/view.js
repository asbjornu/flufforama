/**
  * The View module, responsible for rendering views.
  *
  * @module view
  *
  */
const JUST = require('just');
const just = new JUST({ root: __dirname + '/views/', useCache: true, ext: '.jsp', watchForChanges: true });

/**
  * Renders a view.
  *
  * @export render
  * @param viewName The name of the view to render.
  * @param viewModel The view model to pass to the view.
  * @param response The Express Response object.
  * @param next The Express Next object.
  *
  */
module.exports.render = (viewName, viewModel, response, next) => {
    just.render(viewName, viewModel, function(error, html) {
        if (error) {
            console.error(error);
            next(error);
        } else {
            response.send(html);
        }
    });
};
