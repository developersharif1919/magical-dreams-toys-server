const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

const { v4: uuidv4 } = require('uuid');

// Middleware 
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hmqqjse.mongodb.net/?retryWrites=true&w=majority`;

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

    const toysCollection = client.db('magicalDreamsToys').collection('toys');

    app.get('/alltoys', async (req, res) => {
      const { search } = req.query;
      let query = {};
      if (search) {
        query = { 'subcategories.name': { $regex: search, $options: 'i' } };
      }
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    // Single Toys 
    app.get('/alltoys/:id', async (req, res) => {
      const subcategoryId = req.params.id;
      const query = { 'subcategories.id': subcategoryId };
      const options = {
        projection: {
          _id: 0

        }
      }
      const result = await toysCollection.findOne(query, options);
      res.send(result);
    });

   app.get('/mytoys', async(req, res)=>{
    console.log(req.query.sellerEmail)
    const {sellerEmail} = req.query;

    let query = {};
    if (sellerEmail) {
      query['subcategories.sellerEmail'] = sellerEmail;
    }

    const result = await toysCollection.find(query).toArray();
    res.send(result)
   })

    app.post('/alltoys', async (req, res) => {
      const toyInformation = req.body;

      // Generate a new ID for the subcategory
      const subcategoryId = uuidv4();

      // Assign the ID to the subcategory object
      toyInformation.subcategories[0].id = subcategoryId;

      const result = await toysCollection.insertOne(toyInformation);
      res.send(result)
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res) => {
  res.send('Magical Dreams Toys Is Running');
})

app.listen(port, () => {
  console.log(`Magical Dreams Toys Is Running On: ${port}`);
})