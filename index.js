const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

app.get("/", (req, res) => {
  res.send("Time Traker Is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.gvlvc6q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("time-track").collection("task");
    const usersCollection = client.db("time-track").collection("users");

    app.post("/tasks", async (req, res) => {
      console.log(req.body);
      const data = req.body;
      const result = await taskCollection.insertOne(data);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });
    app.get("/tasks", async (req, res) => {
      const query = req.query.email;
      console.log(query);
      if (query) {
        const result = await taskCollection
          .find({ owner_mail: query })
          .toArray();
        res.send(result);
      }
    });
    app.get("/task", async (req, res) => {
      const query = req.query.task_id;
      console.log(query);
      const result = await taskCollection.findOne({ _id: new ObjectId(query) });
      res.send(result);
    });
    app.put("/updateTask/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedTask = req.body;
      const task = {
        $set: {
          task_name: updatedTask?.task_name,
          description: updatedTask?.description,
          duration: updatedTask?.duration,
        },
      };

      const result = await taskCollection.updateOne(filter, task, option);
      console.log(result);
      res.send(result);
    });
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
