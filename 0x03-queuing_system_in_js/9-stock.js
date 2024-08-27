import { createClient } from 'redis';
import express from 'express';
import { promisify } from 'util';
const app = express();

const redisClient = createClient();
redisClient.on('connect', function () {
  console.log('Redis client connected to the server');
});

redisClient.on('error', function (error) {
  console.log(`Redis client not connected to the server: ${error}`);
});

const get = promisify(redisClient.get).bind(redisClient);

const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 }
];
const getItemById = (id) => {
  return listProducts.filter((item) => item.itemId === id)[0];
};

const reserveStockById = (itemId, stock) => {
  redisClient.set(itemId, stock);
};

const getCurrentReservedStockById = async (itemId) => {
  return await get(itemId);
};

app.get('/list_products', (req, res) => {
  res.json(listProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const item = await getItemById(parseInt(itemId));
  if (!item) {
    return res.json({ status: 'Product not found' });
  }
  const itemRes = await getCurrentReservedStockById(parseInt(itemId));
  const result = {
    itemId: item.itemId,
    itemName: item.itemName,
    price: item.price,
    initialAvailableQuantity: item.initialAvailableQuantity,
    currentQuantity: itemRes !== null ? parseInt(itemRes) : item.initialAvailableQuantity
  };
  return res.json(result);
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const item = await getItemById(parseInt(itemId));
  if (!item) {
    return res.json({ status: 'Product not found' });
  }
  const itemRes = await getCurrentReservedStockById(parseInt(itemId));
  if (itemRes < 1) {
    res.json({ status: 'Not enough stock available', itemId: item.itemId });
  } else {
    reserveStockById(itemId, item.initialAvailableQuantity - 1);
    res.json({ status: 'Reservation confirmed', itemId: item.itemId });
  }
});

app.listen(1245, () => {
  console.log('app listening at http://localhost:1245');
});
