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
app.use(require('body-parser').urlencoded({ extended: false }));
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
            let data = await db("player_data")
            .select("uuid", "username", req.query['type'])
            .distinct('uuid') // Ensure distinct UUIDs
            .orderBy(req.query['type'], "DESC")
            .limit(25);

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

// search villages
app.post('/api/searchVillages', async (req, res) => {
    if(req.body['village']) {
        let data = await db('server_villages').whereRaw("name REGEXP ?", req.body['village']);
        let v = [];

        if(data.length != 0) {
            const promises = data.map(async (element) => {
                let username = await m.searchUser(db,element.owner);
                v.push({
                    owner: username.username,
                    owner_uuid: element.owner,
                    name: element.name,
                    uuid: element.uuid,
                    members: JSON.parse(element.members).length,
		assistants: JSON.parse(element.assts).length,
                    claims: element.claims
                });
            });

            await Promise.all(promises);

            res.json({
                data: v,
                status: true
            });
                        
  
        }
        else {
            res.json({
                status: false, code: 2,msg: "no villages in db"
            })
        }

    }
    else {
        res.status(500).json({status: false, message: "invalid params"});
    }
})

// online status
app.get('/api/online', async (req, res) => {
    if(req.query['username']) {
       let s = await m.isPlayerOnline(req.query['username']);
       s.status = true;
       res.json(s);
    }
    else {
        res.status(500).json({status: false, message: "invalid params"});
    }
})


// server
app.get('/api/server', async (req, res) => {
    let server = await m.getServer();

    let data = await db('server_players').orderBy("cached", "DESC").limit(30);

    let d = [];
    let h = [];
    let players = [];

    data.slice().reverse().forEach(element => {
        d.push(element.amount);
        h.push(m.unixToDate2(element.cached))
    });

    server['players'].forEach(async element => {
        

        players.push({
            username: element.name,
            uuid: element.uuid,
            display: element.display_name,
            coords: {
                x: element.x,
                y: element.y,
                z: element.z,
                world: element.world
            },
        });

    });
    res.json({
        status: true,
        cnt: server.player_count,
        max: server.max_players,
        online: players,
        players: d,
        timestamps: h
    })

})

// bans
app.get('/api/bans', async (req, res) => {
    if(req.query['uuid']) {
        if(m.isUUID(req.query['uuid'])) {
            let b = await m.getUserBans(req.query['uuid']);

            res.json(b); 
           
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


app.get('/chat', (req, res) => {
    res.render('chat');
});


app.get('/villages', (req, res) => {
    res.render('villages');
});

// get the user villages
app.get('/api/user_villages', async (req, res) => {
    if(req.query['uuid']) {
        if(m.isUUID(req.query['uuid'])) {
            let villages = await m.getUserVillage(req.query['uuid']);
            let ow = [];
            let a = [];
            let o = [];

            if(villages) {
                const promise = villages.villages.owner.map(async e => {
                    let name = await m.getVillageName(db, e);
                    ow.push({
                        village_uuid: e,
                        village:  name
                    })
                });
                await Promise.all(promise);

                const promise1 = villages.villages.member.map(async e => {
                    let name = await m.getVillageName(db, e);
                    o.push({
                        village_uuid: e,
                        village:  name
                    })
                    
                });
               await Promise.all(promise1);

                const promise2 = villages.villages.assistant.map(async e => {
                    let name = await m.getVillageName(db, e);
                    a.push({
                        village_uuid: e,
                        village:  name
                    })
                    
                });


                await Promise.all(promise2);



                res.json({
                    status: true,
                    data: {
                        member: o,
                        assistant: a,
                        owner: ow
                    }
                });
            }
            else {
                res.status(404).json({status: false, message: "no villages for this user"});  
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
        let player = await m.searchUser(db, req.params.player);
        if(player) {
            let user = await(m.getUser(player['uuid']));
            !user ? res.status(404).render('error', {status: '404', msg: 'User not found.'}) :  res.render('player', {data: user,m});  
        }
        else {
            res.status(404).render('error', {status: '500', msg: 'Oops! Minecraft user does not exist.'});        
        }
    }
    else {
        res.status(500).render('error', {status: '500', msg: 'Oops! Invalid parameters.'});    
    }
});

app.get('/village/:village', async (req, res) => {
    if(req.params.village) {
        let village = await db('server_villages').where(!m.isUUID(req.params.village) ? {"name": req.params.village} : {"uuid": req.params.village});
        if(village.length != 0) {

            const promises = village.map(async (element) => {
                let username = await m.searchUser(db,element.owner);
                village[0].username = username.username;


            });

            await Promise.all(promises);

            let j = [];
            let l = [];

            const promises2 = JSON.parse(village[0].members).map(async e => {
                let u = await m.searchUser(db, e);
                j.push(u);
            });
            await Promise.all(promises2);

            const promises3 = JSON.parse(village[0].assts).map(async e => {
                let u = await m.searchUser(db, e);
                l.push(u);
            });
            await Promise.all(promises3);

            village[0].memberList = j;
            village[0].asstList = l;

            res.render('village', {data: village[0],m});  
        }
        else {
            res.status(404).render('error', {status: '404', msg: 'Oops! Village does not exist.'});        
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