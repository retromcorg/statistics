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

app.get('/villages', async (req, res) => {
    let villages = await m.getVillages();
    !villages ? res.status(404).render('404') :  res.render('villages', {data: villages,m});  
})

app.get('/player/:player', async (req, res) => {
    if(req.params.player) {
        if(!m.isUUID(req.params.player)) {
            let player = await m.getMojangUser(req.params.player);
            if(player) {
                let user = await(m.getUser(player['uuid']));
                !user ? res.status(404).render('404', {type: 'player'}) :  res.render('player', {data: user,m});  
            }
            else {
                res.status(404).render('404', {type: 'player'});        
            }
        }
        else {
            if(m.isValidUsername(req.params.player)) {
                let user = await(m.getUser(req.params.player));
                !user ? res.status(404).render('404', {type: 'player'}) :  res.render('player', {data: user,m});  
            }
            else {
                res.status(404).render('404', {type: 'player'});
            }
        }
    }
    else {
        res.status(404).render('404', {type: 'player'});    
    }
});

app.get('*', (req, res) => {
    res.status(404).render('404');
});


app.listen(process.env.PORT);