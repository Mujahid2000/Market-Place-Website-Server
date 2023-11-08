const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5050;

//middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mujahid.frqpuda.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db('JobsDB');
    const jobCollection = database.collection('addJobs')
    const bitCollection = database.collection('bitJobs')


    // post method for jwt
    app.post('/jwt', async (req, res) =>{
      const body = req.body;
      // jwt.sign("payload", "secretKey", "expireInfo")
      const token = jwt.sign(body, process.env.SECRET , {expiresIn: "1h"});
      console.log();
      res.send({body, token});
    })
    // posted jobs post

    app.post("/addJobs", async(req, res) =>{
        try{
            const body = req.body;
            const result = await jobCollection.insertOne(body);
            console.log(body);
            res.send(result)
        }   catch(error){
            console.log(error);
        }
    })
    // posted jobs get
    app.get('/addJobs', async (req, res) => {
      try{
        const query = {};
        if(req.query.buyerEmail){
          query.buyerEmail = req.query.buyerEmail;
        }
        const result = await jobCollection.find(query).toArray();
        res.send(result)
    }   catch(error){
        console.log(error);
        res.status(500).send('internal server error')
    }
})

app.delete('/addJobs/:id', async (req, res) => {
  try{
    const id = req.params.id;
  const query= {_id: new ObjectId(id)}
  const result = await jobCollection.deleteOne(query)
  res.send(result);
  }catch(err){
    console.log(err);
  }
  
  });

    // bit jobs
    app.post('/bitJobs', async(req, res) =>{
      try{
          const body = req.body;
          const result = await bitCollection.insertOne(body)
          console.log(body);
          res.send(body)
      }catch(error){
        console.log(error);
      }
    })
    // bit jobs get
    app.get('/bitJobs', async(req, res) =>{
      try{
        const query = {};
        if(req.query.employerEmail){
          query.employerEmail = req.query.employerEmail;
        }
        const result = await bitCollection.find(query).toArray();
        res.send(result)
    }   catch(error){
        console.log(error);
        res.status(500).send('internal server error')
    }
    })
    // app.get('/bitJobs', async(req, res) =>{
    //   try{
    //     const query = {};
    //     if(req.query.buyerEmail){
    //       query.buyerEmail = req.query.buyerEmail;
    //     }
    //     const result = await bitCollection.find(query).toArray();
    //     res.send(result)
    // }   catch(error){
    //     console.log(error);
    //     res.status(500).send('internal server error')
    // }
    // })

    //bit req post
    // app.post('/bidReq', async(req, res) =>{
    //   try{
    //     const body = req.body;
    //     const result = await bitCollection.insertOne(body)
    //     console.log(body);
    //     res.send(body)
    //   }catch(error){
    //     console.log(error);
    //     res.status(500).send('Request server is not Running');
    //   }
    // })

    // //bit get 
    // app.get('/')

    // get updatedata
    app.get('/addJobs/:id',async(req, res) =>{
      try{
        const jobsData = await jobCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        console.log(jobsData);
        res.send(jobsData);
      }catch(error){
        console.log(error);
      }
    });

    // now updated data
    app.put('/addJobs/:id', async(req, res) =>{
      const id = {_id: new ObjectId(req.params.id)};
      const body = req.body;
      const updatedData = {
        $set:{
            ...body,
        },
      }
      const option = {upsert: true};
      const result = await jobCollection.updateOne(id, updatedData, option)
      console.log(body);
      res.send(result)
    })

    // get data by id
    app.get('/addJobs/:id', async(req, res) =>{
      try{
        const job = await jobCollection.findOne({
          _id: new ObjectId(req.params._id),
        });
        console.log(job);

        res.send(job);
      }catch(error){
        console.log(error);
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Marketplace server is running')
})

app.listen(port, () =>{
    console.log(`Marketplace server is running on the port  ${port}`);
})