require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
app.use(cors(), express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// CRUD Endpoints

// Get all contacts
app.get('/contacts', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM contacts ORDER BY id');
  res.json(rows);
});

// Get contact by id
app.get('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
  res.status(rows[0] ? 200 : 404).json(rows[0] || { error: 'Not found' });
});

// Create
app.post('/contacts', async (req, res) => {
  const { name, mobile, email, address } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO contacts (name, mobile, email, address) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, mobile, email, address]
  );
  res.status(201).json(rows[0]);
});

// Update
app.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, mobile, email, address } = req.body;
  const { rows } = await pool.query(
    `UPDATE contacts SET name=$1, mobile=$2, email=$3, address=$4 WHERE id=$5 RETURNING *`,
    [name, mobile, email, address, id]
  );
  res.status(rows[0] ? 200 : 404).json(rows[0] || { error: 'Not found' });
});

// Delete
app.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
  res.status(result.rows[0] ? 200 : 404).json(result.rows[0] || { error: 'Not found' });
});

app.listen(process.env.PORT, () => console.log(`API running on port ${process.env.PORT}`));
