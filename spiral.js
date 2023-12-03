const db = require("./lib/db");
const m = require("./lib/functions");
const cron = require('node-cron');

require('dotenv').config({path: './.env'});

const promiseExecutionUser = async () => {
    u()
};

const promiseExecutionVillages = async () => {
    v()
};

// players every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    promiseExecutionUser()
});

// villages every 30 minutes
cron.schedule('*/30 * * * *', () => {
    promiseExecutionVillages();
});

async function v() {
        // step 1, get all villages
        let villages = await m.getVillages();
        if(villages) {
            villages.forEach(async element => {
    
            // step 1.5, check if the village 
            let data = await m.getVillage(element.uuid);
    
            if(data) {
                let check = await m.villageExists(db, element.uuid);
                if(!check) {
    
                    await m.insertVillage(db, element.uuid,data);
                    console.log(`[j-stats2] inserted village ${element.name}.`);
                }
                else {
                    // update data
                    await m.updateVillage(db, element.uuid,data);
                    console.log(`[j-stats2] updated village ${element.name}.`);
                }
            }
            });
        }
}

async function u() {
    let server = await m.getServer();

    // step 1.5, remove old entries and save the server player count
    await m.purgeOldPings(db);
    console.log(`[j-stats2] removed any old pings.`);

    await m.insertPlayerCount(db, server.player_count);
    console.log(`[j-stats2] pinged server with ${server.player_count} online.`);

    // step 2, do shit with the players
    server.players.forEach(async element => {
        // get UUID
        let muuid = await m.getMojangUser(element.name);

        // ONLY PUT IN VALID ACCOUNTS
        if(muuid) {
            let data = await m.getUser(muuid.uuid)

            // if its successful
            if(data) {     
                let check = await m.playerExists(db,muuid.uuid);
                if(!check) {
                    m.insertPlayer(db, muuid.uuid, data);
                    console.log(`[j-stats2] ${element.name} is now in the database`);
                }
                else {
                    m.updatePlayer(db, muuid.uuid, data);
                    console.log(`[j-stats2] ${element.name} global data updated`);
                }

                await m.purgeOldCoords(db);
                await m.insertCoords(db, muuid.uuid, element.x, element.y, element.z, element.world)
                console.log(`[j-stats2] ${element.name} coords logged`);

            }
        }
    });
  
}