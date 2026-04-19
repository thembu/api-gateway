const pool = require("../db");

module.exports = async function logger({ method, path, status, ip, blocked, duration, blockReason = null }) {
  try {

    await pool.execute(
      `INSERT INTO request_logs 
        (method, path, status_code, duration_ms, ip, blocked, block_reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [method, path, status, duration, ip, blocked, blockReason]
    );    

  } catch (err) {
    console.error("Logging error:", err);
  }
};
