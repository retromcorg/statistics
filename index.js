const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const m = require("./lib/functions");
const db = require("./lib/db");
let types = {
    playerDeaths: 'Player Deaths',
    playersKilled: 'Player Kills',
    joinCount: 'Join Count',
    metersTraveled: 'Blocks Traveled',
    trustScore: 'Trust Score',
    blocksPlaced: 'Blocks Placed',
    playTime: 'Playtime',
    itemsDropped: 'Items Dropped',
    trustLevel: 'Trust Level',
    creaturesKilled: 'Mob Killed',
    money: 'Balance',
    blocksDestroyed: 'Blocks Broken'
};

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

// get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    if(req.query['type']) {
        if(req.query['type'] in types) {
            let data = await db("player_data").select("uuid", "username",req.query['type']).orderBy(req.query['type'], "DESC").limit(25);

            res.json({
                status: true,
                type: req.query['type'],
                name: types[req.query['type']],
                data: data
            })
        }
        else {
            res.status(500).json({status: false, message: "invalid type", types: types});
        }
    }
    else {
        res.status(500).json({status: false, message: "invalid params"});
    }

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


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/leaderboard', (req, res) => {
    res.render('leaderboard', {types});
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
		let user = await(m.getUser(req.params.player));
                !user ? res.status(404).render('error', {status: '404', msg: 'User not found.'}) :  res.render('player', {data: user,m});
        }
    }
    else {
        res.status(500).render('error', {status: '500', msg: 'Oops! Invalid parameters.'});
    }
});


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
		let user = await(m.getUser(req.params.player));
                !user ? res.status(404).render('error', {status: '404', msg: 'Village not found.'}) :  res.render('village', {data: village,m});
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
