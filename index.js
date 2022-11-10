const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('fancy floss server running'))

function VerifyToken(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.send({ error: 'unauthorize access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
        if (err) {
            return res.send({ error: 'unauthorize access' })
        }
        req.decoded = decoded
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bwd7cwo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollections = client.db("fancy-floss").collection("services");
        const reviewsCollections = client.db("fancy-floss").collection("reviews");


        // jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: '1d' })
            res.send({ token })
        })
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })
        app.post('/services', async (req, res) => {
            const userInfo = req.body
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
            const option = { upsert: true }
            const updateReview = {
                $set: {
                    textarea: reviews.textarea
                }
            }
            const result = await reviewsCollections.updateOne(query, updateReview, option);
            res.send(result)
        })
        app.get('/myreviews', VerifyToken, async (req, res) => {
            const email = req.query.email
            const decoded = req.decoded
          
            let query = {}
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorize user' })
            }
            if (email) {
                query = {
                    email: email
                }
            }
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