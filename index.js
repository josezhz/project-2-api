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

    app.get("/characters", async function (req, res) {
        let characters = await db.collection("characters").find({}).toArray();
        res.json(characters)
    });
    app.get("/weapons", async function (req, res) {
        let weapons = await db.collection("weapons").find({}).toArray();
        res.json(weapons)
    });
    app.get("/artifacts", async function (req, res) {
        let artifacts = await db.collection("artifacts").find({}).toArray();
        res.json(artifacts)
    });
    app.get("/bosses", async function (req, res) {
        let bosses = await db.collection("bosses").find({}).toArray();
        res.json(bosses)
    });

    app.post("/teams", async function (req, res) {
        let newTeam = req.body.newTeam
        await db.collection("teams").insertOne({
            _id: new ObjectId(),
            ...newTeam
        });
        res.sendStatus(200);
    });

    app.get("/teams", async function (req, res) {
        let { teamName, numberOfFiveStar, includedCharacters, targetedBoss } = req.query;

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
        if (targetedBoss) { criteria.bosses = { $in: targetedBoss.map(b => ObjectId(b)) } };

        let teams = await db.collection("teams").find(criteria).toArray();
        res.json({ teams });
    });

    app.put("/teams/:_id", async function (req, res) {
        let { _id } = req.params;
        console.log(req.body);
        await db.collection("teams").replaceOne({
            _id: ObjectId(_id)
        }, req.body);
        res.sendStatus(200);
    });

    app.delete("/teams/:_id", async function (req, res) {
        let { _id } = req.params;
        await db.collection("teams").deleteOne({
            _id: ObjectId(_id)
        });
        res.sendStatus(200);
    });
}
main();

app.listen(process.env.PORT, function () { console.log("server started"); });