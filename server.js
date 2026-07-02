require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require("path");
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect();
var api = require('./api');
api.setApp(app, client);

app.get("/", (req, res) => {
    res.send("Cards API is running");
});

app.listen(5000); // start Node + Express server on port 5000
