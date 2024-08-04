const express = require('express');
const { client, createTables, createProduct, createUser, fetchUsers, fetchProducts, createFavorite, fetchFavorites, destroyFavorite } = require('./db');

const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const { id } = req.params;
    const favorites = await fetchFavorites(id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_id } = req.body;
    
    const favorite = await createFavorite(id, product_id);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
  try {
    const { userId, id } = req.params;
    await destroyFavorite(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const init = async () => {
  try {
    await client.connect();
    await createTables();
    app.listen(3000, () => {
      console.log('Server is listening on port 3000');
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

init();