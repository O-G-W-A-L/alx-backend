import { createClient } from 'redis';
import { createQueue } from 'kue';
import { promisify } from 'util';
import express from 'express';

const redisClient = createClient();

redisClient.on('connect', () => {
  console.log('Redis client connected to the server');
});
redisClient.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err}`);
});

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);

let reservationEnabled = true;
const queue = createQueue();
const app = express();

const reserveSeat = async (number) => {
  try {
    await set('available_seats', number);
  } catch (err) {
    console.error(`Error reserving seat: ${err}`);
  }
};

const getCurrentAvailableSeats = async () => {
  try {
    return await get('available_seats');
  } catch (err) {
    console.error(`Error fetching available seats: ${err}`);
    return '0';
  }
};

app.get('/available_seats', async (req, res) => {
  try {
    const seats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: seats });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }

  try {
    const job = queue.create('reserve_seat').save((err) => {
      if (err) {
        return res.json({ status: 'Reservation failed' });
      }
      res.json({ status: 'Reservation in process' });
    });

    job.on('failed', (err) => {
      console.log(`Seat reservation job ${job.id} failed: ${err.message || err.toString()}`);
    });
    job.on('complete', () => {
      console.log(`Seat reservation job ${job.id} completed`);
    });
  } catch {
    res.json({ status: 'Reservation failed' });
  }
});

app.get('/process', async (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    try {
      const seats = await getCurrentAvailableSeats();
      const availableSeats = Number(seats);

      if (availableSeats <= 0) {
        reservationEnabled = false;
        return done(new Error('Not enough seats available'));
      }

      await reserveSeat(availableSeats - 1);
      done();
    } catch (err) {
      done(err);
    }
  });
});

app.listen(1245, async () => {
  await reserveSeat(50);
  console.log('Server is running on port 1245');
});
