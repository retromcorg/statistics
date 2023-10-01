require('dotenv').config({path: './.env'});

module.exports = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      port : process.env.DB_PORT,
      user : process.env.DB_USER,
      password : process.env.DB_PWD,
      database : process.env.DB_NAME
    },
    useNullAsDefault: true
});