// core libs
const { createServer } = require('http');

// third party libs
const next = require('next');

// local libs
const routes = require('./routes');

/* set up the http server */

const app = next({
    dev: process.env.NDOE_ENV !== 'production'
});
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    createServer(handler).listen(3000, err => {
        if (err) {
            throw err;
        }
        console.log('Ready on localhost:3000');
    });
})