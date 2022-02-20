
// app config
const express = require("express");
const cors = require("cors");
const app = express();

const config = require('config');
const port = config.server.port;
const routes = require('./lib/routes');


app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors({origin: `http://${config.server.host}:${port}`}));

const db = require('./lib/mongo/db');

const errorHandler = (err, req, res, next) => {
    console.log('error handler middleware');
    console.error(`error stack: ${err.stack}`);
    res.status(err.statusCode).send(err.message);
};

app.use(function (req, res, next) {
    console.log('server headers middleware');
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// routes
app.use('/api', routes);

//errors middleware
app.use(errorHandler);


(async () => { // eslint-disable-line no-unexpected-multiline
    await db.connect('admin');
    app.listen(port, () => {
        console.log(`auth app listening at http://localhost:${port}`)
    });
})();

