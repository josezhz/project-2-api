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
        let teamName = req.query.teamName;
        let numberOfFiveStar = req.query.numberOfFiveStars;
        let includedCharacters = req.query.includedCharacters; // Array of ObjectId Eg.["62c3be3de120685cac3ab51b", ...]
        let bosses = req.query.bosses; // Array of ObjectId ["62c3d18ee120685cac423196", ...]

        let criteria = {};
        if (teamName) { criteria.team_name = teamName };
        if (numberOfFiveStar) { criteria.number_of_five_star = numberOfFiveStar };
        if (includedCharacters) {
            let includedCharactersCriteria = includedCharacters.map(c => {
                return { team_composition: { $elemMatch: { character: ObjectId(c) } } };
            });
            criteria = {
                ...criteria,
                $and: includedCharactersCriteria
            };
        };
        if (bosses) { criteria.bosses = { $all: bosses.map(b => ObjectId(b)) } };

        let teams = await db.collection("teams").find(criteria).toArray();
        res.json({ teams });
    });

    app.post("/teams", async function (req, res) {
        let team_name = req.query.team_name;
        let team_composition = req.query.team_composition;
        let bosses = req.query.bosses;
        let rotation_guide = req.query.rotation_guide;
        let notes = req.query.notes;
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