
// app config
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const app = express();

const config = require('config');
const port = config.server.port;
const routes = require('./lib/routes');


// middlewares
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors({origin: `http://${config.server.host}:${port}`}));

app.use((req, res, next) => {
    console.log('server headers middleware');
    res.set({
        'Access-Control-Allow-Headers': 'x-access-token, Origin, Content-Type, Accept',
        'SCID': crypto.randomUUID(),
        'FCID': crypto.randomUUID()
    });
    next();
});
app.use('/api', routes);
app.use((err, req, res, next) => {
    // console.log('error handler middleware');
    console.error('middleware error: ', err);
    res.status(err.statusCode).send(err.message);
});

// server startup
(async () => { // eslint-disable-line no-unexpected-multiline
    try {
        app.listen(port, () => {
            console.log(`auth app listening at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('error starting server: ', err);
        process.exit(1);
    }
})();