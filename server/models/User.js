// models/User.js
const pool = require('../db');
const bcrypt = require('bcrypt');

const createUser = async ({ name, lastname, email, password, phone, gender, photo }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, lastname, email, password, phone, gender, photo) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, lastname, email, hashedPassword, phone, gender || null, photo || null]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const updateProfile = async (userId, profileData) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in profileData) {
    fields.push(`${key} = $${idx}`);
    values.push(profileData[key]);
    idx++;
  }

  if (fields.length === 0) return;

  values.push(userId);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`;
  await pool.query(query, values);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateProfile
};
