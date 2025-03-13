const express = require('express');
require('dotenv').config();
const shajs = require('sha.js');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
connectDB();

const mongoCollection = client.db("Cluster0").collection("guitar-app");

// Insert a Sample Blog Post (Run Once)
async function initProfileData() {
  await mongoCollection.insertOne({
    title: "Welcome to My Blog",
    post: "This is a sample blog post!",
  });
}
// Uncomment to run once: initProfileData();

// 🏠 Home Page - Display Blog Posts
app.get('/', async (req, res) => {
  let results = await mongoCollection.find({}).toArray();
  res.render('profile', { profileData: results });
});

// 📝 Insert a New Blog Post
app.post('/insert', async (req, res) => {
  await mongoCollection.insertOne({
    title: req.body.title,
    post: req.body.post
  });
  res.redirect('/');
});

// 🗑️ Delete a Blog Post
app.post('/delete', async (req, res) => {
  await mongoCollection.findOneAndDelete({
    "_id": new ObjectId(req.body.deleteId)
  });
  res.redirect('/');
});

// ✏️ Update a Blog Post
app.post('/update', async (req, res) => {
  await mongoCollection.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(req.body.updateId) },
    { $set: { title: req.body.updateTitle, post: req.body.updatePost } }
  );
  res.redirect('/');
});

// Start the Server
app.listen(port, () => console.log(`🚀 Server is running on http://localhost:${port}`));
