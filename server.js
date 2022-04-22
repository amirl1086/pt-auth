
// app config
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const app = express();

const config = require('config');
const port = config.server.port;
const routes = require('./lib/routes');


app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors({origin: `http://${config.server.host}:${port}`}));

const db = require('./lib/mongo/db');
const logger = require('./logger')

app.use((req, res, next) => {
    logger.log({level: 'info', message: 'server headers middleware'});

    res.set({
        'Access-Control-Allow-Headers': 'x-access-token, Origin, Content-Type, Accept',
        'SCID': crypto.randomUUID(),
        'FCID': crypto.randomUUID()
    })
    next();
});

// routes
app.use('/api', routes);
const winston = require('winston');

//errors middleware
app.use((err, req, res, next) => {
    // console.log('error handler middleware');
    logger.log({level: 'error', message: 'middleware error:' + err});
    res.status(err.statusCode).send(err.message);
});


(async () => { // eslint-disable-line no-unexpected-multiline
    try {
        await db.connect('admin');
        app.listen(port, () => {
            logger.log({level: 'info', message: 'auth app listening at http://localhost:' + port});
        });
    } catch (err) {
        logger.log({level: 'error', message: 'error starting server, ' + err});
        process.exit(1);
    }

})();

