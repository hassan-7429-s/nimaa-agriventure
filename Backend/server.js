const path = require('path');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'nimaa';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. Create a .env file with your MongoDB connection string.');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function start() {
  await client.connect();
  const db = client.db(DB_NAME);
  const contacts = db.collection('contacts');
  const projects = db.collection('projects');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..')));

  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', db: DB_NAME });
  });

  app.get('/api/projects', async (req, res) => {
    const items = await projects.find({}).limit(10).toArray();
    res.json(items);
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const result = await contacts.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
