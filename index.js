const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('fancy floss server running'))


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bwd7cwo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollections = client.db("fancy-floss").collection("services");
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/service/:id' , async (req, res) => {
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            const result = await serviceCollections.findOne(query)

            res.send(result)
            console.log(id);
        })


    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))