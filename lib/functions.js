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
    return moment.duration(seconds, 'seconds').format("hh");
}

function formatNumber(num) {
    return Math.floor(num).toLocaleString();
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
        case 'donator+':
            return '<span class="minecraft-red">Donator+</span>';
        case 'donatorplusplus':
            return '<span class="minecraft-red">Donator++</span>';
        case 'citizen':
            return '<span class="minecraft-green">Citizen</span>';
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

function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_-]{3,16}$/;
    return regex.test(username);
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
    isValidUsername,
    formatNumber
}