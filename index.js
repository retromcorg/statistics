const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const app = express({ strict: true });
const knex = require('./lib/knex');
const m = require('./lib/functions');
require('dotenv').config({path: './.env'});

app.set('view engine', 'pug');

app.use(compression());
app.use(express.static('public'));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());



app.get('/', (req, res) => {
    res.render('index');
});

app.listen(process.env.PORT);