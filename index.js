const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil");
const { FindCursor } = require("mongodb");
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.use(cors());

async function main() {
    await MongoUtil.connect(MONGO_URI, "project_2");
    const db = MongoUtil.getDB();

    app.get("/", function (req, res) {
        res.send("Hello World");
    });

    app.get("/teams", async function (req, res) {
        let teams = await db.collection("teams").find({}).toArray();
        res.json({ teams });
    });
}
main();

app.listen(3000, function () { console.log("server started"); });