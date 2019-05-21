var mysql = require('mysql');

var connection = mysql.createConnection({

 /*  host: '103.115.35.17',
  user: 'nodeuser',
  password: 'nodeuser',
  database: 'asterisk',
  connectTimeout:30000 */
  host: '66.185.29.98',//'162.221.88.195',//'wP9j@Y$?PBX?$%kCN5@C' ssh -o StrictHostKeyChecking=no root@66.185.29.98
  user: 'root',
  password: 'X3vkaJxU8hNVwXaNbp23',
  database: 'asterisk',
  // host: 'localhost',
  // user: '',
  // password: '',
  // database: 'customer',
  // connectTimeout:30000
});

connection.connect(() => {
  console.log('You are now connected to mysql database')
});


module.exports = connection;