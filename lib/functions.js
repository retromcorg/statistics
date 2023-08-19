const axios = require("axios");
const moment = require("moment");

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
    let server = await request(process.env.serverURL);
    return server && !server['error'] ? server : false;
}

// get all villages
async function getVillages() {
    let villages = await request(process.env.villagesURL);
    return villages && !villages['error'] ? villages : false;
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
    return villages && !villages['error'] ? villages : false;  
}

// get user statistics
async function getUser(uuid) {
    let u = await request(process.env.userURL+uuid);
    return u && u['found'] ? u : false;  
}

// unix to mm/dd/yyyy
function unixToDate(time) {
    return moment.unix(time).format('MM/DD/YYYY');
}

// seconds to hours
function secondsToHour(seconds){
    const duration = moment.duration(seconds, 'seconds');
    const hours = duration.hours();
    return hours;
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
    secondsToHour
}