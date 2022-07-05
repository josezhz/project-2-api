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

    const allCharacters = await db.collection("characters").find({}).toArray();
    const allWeapons = await db.collection("weapons").find({}).toArray();
    const allArtifacts = await db.collection("artifacts").find({}).toArray();
    const allBosses = await db.collection("bosses").find({}).toArray();

    app.get("/", function (req, res) {
        res.send("Hello World");
    });

    app.get("/teams", async function (req, res) {
        let teamName = req.body.teamName;
        let numberOfFiveStar = req.body.numberOfFiveStars;
        let includedCharacters = req.body.includedCharacters;
        let recommendedBosses = req.body.recommendedBosses;

        let criteria = {};
        let teams = await db.collection("teams").find(criteria).toArray();
        res.json({ teams });
    });

    app.post("/teams", async function (req, res) {
        let team_name = req.body.team_name;
        let team_composition = req.body.team_composition;
        let bosses = req.body.bosses;
        let rotation_guide = req.body.rotation_guide;
        let notes= req.body.notes;
        await db.collection("teams").insertOne({
            team_name,
            team_composition,
            bosses,
            rotation_guide,
            notes
        });
        res.sendStatus(200);
    });
}
main();

app.listen(3000, function () { console.log("server started"); });