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

function validateTeam(t) {
    return (
        t.team_name
        && Array.isArray(t.team_composition)
        && Number.isInteger(t.number_of_five_star)
        && t.number_of_five_star >= 0 && t.number_of_five_star <= 4
        && Array.isArray(t.bosses)
        && Array.isArray(t.rotation_guide)
        && Array.isArray(t.notes)
    );
}

async function main() {
    await MongoUtil.connect(MONGO_URI, "project_2");
    const db = MongoUtil.getDB();

    app.get("/characters", async function (req, res) {
        let characters = await db.collection("characters").find({}).sort({ rarity: 1, value: 1 }).toArray();
        res.json(characters);
    });
    app.get("/weapons", async function (req, res) {
        let weapons = await db.collection("weapons").find({}).sort({ rarity: 1, value: 1 }).toArray();
        res.json(weapons);
    });
    app.get("/artifacts", async function (req, res) {
        let artifacts = await db.collection("artifacts").find({}).sort({ rarity: 1, value: 1 }).toArray();
        res.json(artifacts);
    });
    app.get("/bosses", async function (req, res) {
        let bosses = await db.collection("bosses").find({}).sort({ value: 1 }).toArray();
        res.json(bosses);
    });

    app.post("/teams", async function (req, res) {
        let { newTeam } = req.body;
        if (validateTeam(newTeam)) {
            await db.collection("teams").insertOne({
                _id: new ObjectId(),
                ...newTeam
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });

    app.get("/teams", async function (req, res) {
        let { teamName, numberOfFiveStar, includedCharacters, targetBoss } = req.query;

        let criteria = {};
        if (teamName) { criteria.team_name = { $regex: teamName, $options: "i" } };
        if (numberOfFiveStar) { criteria.number_of_five_star = { $eq: parseInt(numberOfFiveStar) } };
        if (includedCharacters) {
            let includedCharactersCriteria = includedCharacters.map(c => {
                return { team_composition: { $elemMatch: { "character.$oid": c } } };
            });
            criteria = {
                ...criteria,
                $and: includedCharactersCriteria
            };
        };
        if (targetBoss) { criteria.bosses = { $all: [{ $oid: targetBoss }] } };

        let teams = await db.collection("teams").find(criteria, { team_name: 0, number_of_five_star: 0 }).toArray();
        res.json({ teams });
    });

    app.put("/teams/:_id", async function (req, res) {
        let { _id } = req.params;
        let { modifiedTeam } = req.body;
        if (validateTeam(modifiedTeam)) {
            await db.collection("teams").replaceOne({
                _id: ObjectId(_id)
            }, req.body.modifiedTeam);
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }

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