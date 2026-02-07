const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let poolPromise = (async () => {
  // Validate required env vars
  const missing = [];
  if (!process.env.DB_SERVER) missing.push('DB_SERVER');
  if (!process.env.DB_NAME) missing.push('DB_NAME');
  if (!process.env.DB_USER) missing.push('DB_USER');
  if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');

  if (missing.length > 0) {
    console.error(
      `Missing database environment variables: ${missing.join(', ')}.\nPlease create a .env file with these values, e.g.\nDB_SERVER=localhost\nDB_NAME=YourDB\nDB_USER=sa\nDB_PASSWORD=yourpassword\nDB_PORT=1433`
    );
    return null;
  }

  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log('Connected to SQL Server');
    return pool;
  } catch (err) {
    console.error('Database connection failed!', err && err.message ? err.message : err);
    // Do not throw to avoid crashing the entire server; return null so handlers can respond gracefully
    return null;
  }
})();

module.exports = {
  sql,
  poolPromise,
};

