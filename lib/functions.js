const axios = require("axios");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

momentDurationFormatSetup(moment);

require('dotenv').config({path: './.env'});

// request
async function request(url) {
    let data = false;
    try {
    await axios.get(url)
        .then(async function (response) {
            data = response.status != 200 ? false : response.data;
        });
    }
    catch(e) {
        data = false;
    }
    return data;
}

// get betaevo cape
async function getUserCape(uuid) {
    let cape = await request(process.env.capeURL+uuid+".png");
    return cape ? "data:image/png;base64,"+Buffer.from(cape).toString('base64') : '';
}

// get server information
async function getServer() {
    let server = await request(process.env.newServerURL);
    return server && !server['error'] ? server : false;
}

// get all villages
async function getVillages() {
    let villages = await request(process.env.villagesURL);
    return villages['villages'] && !villages['error'] ? villages['villages'] : false;
}


// don't stress mojang api
async function searchUser(db, player) {
    // check db first
    let user = await db('player_data').where(!isUUID(player) ? {"username": player} : {"uuid": player}).select("username", "uuid");
    if(user.length == 0) {

        let p = await getMojangUser(player);
        if(p) {
        // reutn mojang but cache that shit in my db pls
        let data = await getUser(p.uuid);

        if(data) {
                await insertPlayer(db, p.uuid, data)
                return {
                    username: p.username,
                    uuid: p.uuid
                };
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else {
        return user[0];
    }
}

// get mojang information
async function getMojangUser(user) {
    let u = await request(process.env.ashconURL+user);
    return u ? u : false;  
}

// get a village's information
async function getVillage(uuid) {
    let village = await request(process.env.villageURL+uuid);
    return village && !village['error'] ? village : false;  
}

// get user's villages
async function getUserVillage(uuid) {
    let villages = await request(process.env.playervillageURL+uuid);
    return villages && villages['found'] ? villages : false;  
}

// get user statistics
async function getUser(uuid) {
    let u = await request(process.env.userURL+uuid);
    return u && u['found'] ? u : false;  
}


// is this user online?

async function isPlayerOnline(username) {
    let server = await getServer();
    let r = [];
    const userObject = server['players'].find(item => item.name === username);
    
    return userObject ? {
        online: true,
        z:  Math.floor(userObject.z),
        x:  Math.floor(userObject.x),
        y:  Math.floor(userObject.y)
    } :  {
        online: false
    };
}


// get a user's RMC bans
async function getUserBans(uuid) {
    let bans = await request(process.env.banuserURL + uuid);

    if(bans) {
        var cnt = 0;       
        var pardoned = 0; 
        var b = [];

        bans['bans'].forEach(element => {

            if(element.serverName == 'RetroMC') {
                cnt++;
                if(element.pardoned) {
                    pardoned++;
                }
    
                b.push({
                    admin: [element.adminUsername, element.adminUUID],
                    player: [element.playerName, element.playerUUID],
                    reason: element.reason,
                    pardoned: element.pardoned,
                    evidence: element.evidence,
                    date: element.timeIssued
                });

            }

        });
    }

    return {
        bans: b,
        banned: bans.isBanned,
        pardenedCount: pardoned,
        totalPunishments: cnt
    };

}

// unix to mm/dd/yyyy
function unixToDate(time) {
    return moment.unix(time).format('MM/DD/YYYY');
}

// unix to mm/dd/yyyy hh:mm:ss
function unixToDate2(time) {
    return moment.unix(time).format('MM/DD/YYYY hh:mm:ss');
}


// seconds to hours
function secondsToHour(seconds){
    return moment.duration(seconds, 'seconds').format("hh");
}

function formatNumber(num) {
    return Math.floor(num).toLocaleString();
}

async function insertPlayer(db, uuid, data) {
    await db('player_data').insert({
        playerDeaths: data.playerDeaths,
        playersKilled: data.playersKilled,
        joinCount: data.joinCount,
        itemDropDetails: data.itemDropDetails,
        metersTraveled: data.metersTraveled,
        uuid: uuid,
        username: data.lastUsername,
        firstJoin: data.firstJoin,
        trustScore: data.trustScore,
        blockDetailsPlaced: data.blockDetailsPlaced,
        blocksPlaced: data.blocksPlaced,
        playTime: data.playTime,
        lastJoin: data.lastJoin,
        itemsDropped: data.itemsDropped,
        blockDetailsDestroyed: JSON.stringify(data.blockDetailsDestroyed),
        groups: data.groups[0],
        trustLevel: data.trustLevel,
        creaturesKilled: data.creaturesKilled,
        money: data.money,
        blocksDestroyed: data.blocksDestroyed,
        lastCached: unixNow(),
        firstCached: unixNow()
    });
}


    
async function purgeOldPings(db) {
    await db('server_players')
    .where('cached', '<', unixNow()-86400)
    .del()
}


async function purgeOldCoords(db) {
    await db('player_coords')
    // don't care if they're over a month old
    .where('cached', '<', unixNow()-2.6298e+6)
    .del()
}

function unixNow() {
    const now = new Date();
    return Math.floor(now.getTime() / 1000);
}

async function insertCoords(db, uuid,x,y,z,world) {
    await db('player_coords').insert({
        uuid: uuid,
        x: x,
        y: y,
        z: z,
        cached: unixNow(),
        world: world
    });
}

async function insertVillage(db, uuid, data) {
    await db('server_villages').insert({
        name: data.name,
        uuid: uuid,
        owner: data.owner,
        created: data.creationTime,
        assts: JSON.stringify(data.assistants),
        world: data.spawn.world,
        x: data.spawn.x,
        y: data.spawn.y,
        z: data.spawn.z,
        balance: data.balance,
        members: JSON.stringify(data.members),
        claims: data.claims,
        flags: JSON.stringify(data.flags),
        firstCached: unixNow(),
        lastCached: unixNow()
    })
}

async function updateVillage(db, uuid, data) {
    await db('server_villages').where("uuid", uuid).update({
        name: data.name,
        owner: data.owner,
        assts: JSON.stringify(data.assistants),
        world: data.spawn.world,
        x: data.spawn.x,
        y: data.spawn.y,
        z: data.spawn.z,
        balance: data.balance,
        members: JSON.stringify(data.members),
        claims: data.claims,
        flags: JSON.stringify(data.flags),
        lastCached: unixNow()
    })
}

async function getUsername(db, uuid) {
    let user = await db('player_data').where("uuid", uuid);
    return user.length != 0 ? user[0].username : 'Unknown';
}

async function getVillageName(db, uuid) {
    let v = await db('server_villages').where("uuid", uuid);
    return v.length != 0 ? v[0].name : 'Unknown';
}


async function updatePlayer(db, uuid, data) {
    await db('player_data').where("uuid", uuid).update({
        playerDeaths: data.playerDeaths,
        playersKilled: data.playersKilled,
        joinCount: data.joinCount,
        itemDropDetails: JSON.stringify(data.itemDropDetails),
        metersTraveled: data.metersTraveled,
        username: data.lastUsername,
        trustScore: data.trustScore,
        blockDetailsPlaced: JSON.stringify(data.blockDetailsPlaced),
        blocksPlaced: data.blocksPlaced,
        playTime: data.playTime,
        lastJoin: data.lastJoin,
        itemsDropped: data.itemsDropped,
        blockDetailsDestroyed: JSON.stringify(data.blockDetailsDestroyed),
        groups: data.groups[0],
        trustLevel: data.trustLevel,
        creaturesKilled: data.creaturesKilled,
        money: data.money,
        blocksDestroyed: data.blocksDestroyed,
        lastCached: unixNow()
    });
}

async function playerExists(db, uuid) {
    let d = await db("player_data").select("uuid").where("uuid", uuid)
    return d.length == 0 ? false : true;
}


async function villageExists(db, uuid) {
    let d = await db("server_villages").select("uuid").where("uuid", uuid)
    return d.length == 0 ? false : true;
}

async function insertPlayerCount(db, amount) {
    await db('server_players').insert({
    amount: amount,
    cached: unixNow()
    });
}

function getRankColor(rank) {
    switch (rank) {
        case 'developer':
            return '<span class="minecraft-red minecraft-bold">Developer</span>';
        case 'admin':
            return '<span class="minecraft-dark-red minecraft-bold">Admin</span>';
        case 'moderator':
            return '<span class="minecraft-gold minecraft-bold">Moderator</span>';
        case 'helper':
            return '<span class="minecraft-dark-aqua minecraft-bold">Helper</span>';
        case 'trooper':
            return '<span class="minecraft-red minecraft-bold">trooper</span>';
        case 'donator+':
            return '<span class="minecraft-red">Donator+</span>';
        case 'donatorplusplus':
            return '<span class="minecraft-red">Donator++</span>';
        case 'diamondcitizen':
            return '<span class="minecraft-aqua">[</span><span class="minecraft-green">Citizen<span class="minecraft-aqua">]</span></span>';
        case 'trusted':
            return '<span class="minecraft-gold">[</span><span class="minecraft-green">Citizen<span class="minecraft-gold">]</span></span>';
        case 'citizen':
            return '<span class="minecraft-green">Citizen</span>';
        case 'hero':
            return '<span class="minecraft-dark-green">Hero</span>';
        case 'legend':
            return '<span class="minecraft-dark-blue">Legend</span>';
        case 'trial':
            return '<span class="minecraft-green">Trial Helper</span>';
        case 'mystic':
            return '<span class="minecraft-aqua">Mystic</span>';
        default:
            return '<span class="minecraft-dark-gray">Wanderer</span>';
      }
}

// check if a valid UUID
function isUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

module.exports = {
    getUserCape,
    getServer,
    getVillages,
    getMojangUser,
    getUserVillage,
    getUser,
    getVillage,
    unixToDate,
    secondsToHour,
    getRankColor,
    isUUID,
    formatNumber,
    playerExists,
    villageExists,
    insertPlayer,
    updatePlayer,
    insertCoords,
    purgeOldPings,
    insertPlayerCount,
    updateVillage,
    insertVillage,
    purgeOldCoords,
    getUserBans,
    unixToDate2,
    isPlayerOnline,
    getUsername,
    getVillageName,
    searchUser
}
