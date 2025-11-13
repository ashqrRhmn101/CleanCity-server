const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CleanCity server is running...");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yaijel2.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const db = client.db("CleanCity");
    const issuesCollection = db.collection("issues");
    const contributionCollection = db.collection("contribution");

    // // Get => Find all Issues
    app.get("/issues", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await issuesCollection.find(query).toArray();
      res.send(result);
    });

    // Latest Issues
    app.get("/latest-issues", async (req, res) => {
      const cursor = issuesCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get => find ID single Issues
    app.get("/issues/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await issuesCollection.findOne(query);
      res.send(result);
    });

    // Post => create Issues
    app.post("/issues", async (req, res) => {
      const newIssues = req.body;
      const result = await issuesCollection.insertOne(newIssues);
      res.send(result);
    });

    // update Issues
    app.patch("/issues/:id", async (req, res) => {
      const id = req.params.id;
      const updateIssues = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          title: updateIssues.title,
          category: updateIssues.category,
          description: updateIssues.description,
          amount: updateIssues.amount,
          status: updateIssues.status,
        },
      };
      const result = await issuesCollection.updateOne(query, update);
      res.send(result);
    });

    // Delete Issues
    app.delete("/issues/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await issuesCollection.deleteOne(query);
      res.send(result);
    });

    // contributions related apis >
    // get by email

    app.get("/contribution", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = contributionCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // create post
    app.post("/contribution", async (req, res) => {
      const newContribution = req.body;
      const result = await contributionCollection.insertOne(newContribution);
      res.send(result);
    });

    // contributions issues get by id
    app.get("/issues/contribution/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { issueId: _id };
      const cursor = contributionCollection.find(query).sort({ amount: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    //------------------
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
