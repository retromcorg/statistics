const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const m = require("./lib/functions");
const app = express({ strict: true });
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



// get the user cape string
app.get('/api/cape', async (req, res) => {
    if(req.query['uuid']) {
        let cape = await m.getUserCape(req.query['uuid']);

        if(cape) {
            res.json({ cape: cape, status: true});
        }
        else {
            res.json({status: false, message: "no cape for this user"});  
        }
    }
    else {
        res.json({status: false, message: "invalid params"});
    }
})

app.get('/player/:player', async (req, res) => {

    let player = await m.getMojangUser(req.params.player);

    if(player) {
        let user = await m.getUser(player['uuid']);

        !user ? res.status(404).render('404') :  res.render('player', {data: user,m});
    }
    else {
        res.status(404).render('404');
    }
});

app.listen(process.env.PORT);