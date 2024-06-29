# j-stats²

j-stats² is a complete rewrite of the RetroMC CIA, designed to provide comprehensive statistics for RetroMC.

## Web Application

The j-stats² Web Application is built using Node.js and Express.js, offering a robust server-side environment for displaying player statistics and data.

## Spiral

Spiral is a Node.js script integrated into j-stats², responsible for executing periodic tasks and data synchronization processes.

### Features

- **Scheduled Tasks**: Uses node-cron for scheduling tasks like updating player statistics every 5 minutes and village data every 30 minutes.
- **Data Synchronization**: Manages synchronization of player and village data from the Minecraft server to the database.