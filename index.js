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
        const reviewsCollections = client.db("fancy-floss").collection("reviews");
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })
        app.post('/services', async (req, res) => {
            const userInfo = req.body
            console.log("🚀 ~ file: index.js ~ line 37 ~ app.post ~ userInfo", userInfo)
            const result = await serviceCollections.insertOne(userInfo)
            res.send(result)

        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await serviceCollections.findOne(query)
            res.send(result)
        })
        app.post('/reviews', async (req, res) => {
            const userInfo = req.body
            console.log("🚀 ~ file: index.js ~ line 37 ~ app.post ~ userInfo", userInfo)
            const result = await reviewsCollections.insertOne(userInfo)
            res.send(result)

        })
        app.get('/reviews', async (req, res) => {
            const id = req.query.id
            const query = { servicesId: id }
            const cursor = reviewsCollections.find(query).sort({ date: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })
        app.delete('/deletereview/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollections.deleteOne(query);
            res.send(result)
        })
        app.put('/updatereview/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const reviews = req.body
            console.log(reviews)
            const option = { upsert: true }
            const updateReview = {
                $set: {
                    textarea: reviews.textarea
                }
            }
            const result = await reviewsCollections.updateOne(query, updateReview, option);
            res.send(result)
        })
        app.get('/myreviews', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = reviewsCollections.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))