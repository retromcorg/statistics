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

// error
app.use((err, req, res, next) => {
      res.status(500).render('error', {status: '500', msg: 'Oops! Something went wrong.'});
});
  

app.get('/', (req, res) => {
    res.render('index');
});

// get the user cape string
app.get('/api/cape', async (req, res) => {
    if(req.query['uuid']) {
        if(m.isUUID(req.query['uuid'])) {
            let cape = await m.getUserCape(req.query['uuid']);

            if(cape) {
                res.json({ cape: cape, status: true});
            }
            else {
                res.status(404).json({status: false, message: "no cape for this user"});  
            }
        }
        else {
            res.status(500).json({status: false, message: "invalid uuid entered"});    
        }
    }
    else {
        res.status(500).json({status: false, message: "invalid params"});
    }
})

app.get('/villages', async (req, res) => {
    let villages = await m.getVillages();
    !villages ? res.status(500).render('error', {status: '500', msg: 'Oops! Something went wrong.'}) :  res.render('villages', {data: villages,m});  
})

app.get('/player/:player', async (req, res) => {
    if(req.params.player) {
        if(!m.isUUID(req.params.player)) {
            let player = await m.getMojangUser(req.params.player);
            if(player) {
                let user = await(m.getUser(player['uuid']));
                !user ? res.status(404).render('error', {status: '404', msg: 'User not found.'}) :  res.render('player', {data: user,m});  
            }
            else {
                res.status(404).render('error', {status: '500', msg: 'Oops! Minecraft user does not exist.'});        
            }
        }
        else {
            if(m.isValidUsername(req.params.player)) {
                let user = await(m.getUser(req.params.player));
                !user ? res.status(404).render('error', {status: '404', msg: 'User not found.'}) :  res.render('player', {data: user,m});  
            }
            else {
                res.status(500).render('error', {status: '500', msg: 'Oops! Invalid username!'});
            }
        }
    }
    else {
        res.status(500).render('error', {status: '500', msg: 'Oops! Invalid parameters.'});    
    }
});


app.get('*', (req, res) => {
    res.status(404).render('error', {status: '404', msg: 'Page not found.'});        
});


app.listen(process.env.PORT);