const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "job_portal"
});

module.exports = pool;
