const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const client = new Client(process.env.DATABASE_URL || "postgres://localhost/the-acme-store");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    
    CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    );
    
    CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_favorite UNIQUE (user_id, product_id)
    );
  `;

  await client.query(SQL);
};

const createProduct = async (name) => {
  const id = uuidv4();
  const result = await client.query(
    'INSERT INTO products (id, name) VALUES ($1, $2) RETURNING *',
    
    [id, name]
  );
  return result.rows[0];
};

const createUser = async (username, password) => {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await client.query(
    'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *',
    [id, username, hashedPassword]
  );
  return result.rows[0];
};

const fetchUsers = async () => {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
};

const fetchProducts = async () => {
  const result = await client.query('SELECT * FROM products');
  return result.rows;
};

const createFavorite = async (userId, productId) => {
  const id = uuidv4();
  const result = await client.query(
    'INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *',
    [id, userId, productId]
  );
  return result.rows[0];
};

const fetchFavorites = async (userId) => {
  const result = await client.query(
    'SELECT * FROM favorites WHERE user_id = $1',
    [userId]
  );
  return result.rows;
};

const destroyFavorite = async (userId, favoriteId) => {
  await client.query(
    'DELETE FROM favorites WHERE id = $1 AND user_id = $2',
    [favoriteId, userId]
  );
};

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};