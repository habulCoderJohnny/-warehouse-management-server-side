//const packageName = require('packageName');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());


// verify token function
const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if(token === null) return res.status(401)
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err) {
            return res.status(403).send({message: 'unAuth'})
        }
        req.decoded = decoded
        next()
    })
}



//CONNECTION
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9khll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run () {
    try{
      await client.connect();
      const productCollection = client.db("motormania").collection("Bikes")

     //SENT DATA OF PRODUCT
      app.get('/bikes', async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);
        const bikes = await cursor.toArray();
        res.send(bikes);
    });


     //FIND ONE (id) 
      app.get('/bikes/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id) };
        const bike = await productCollection.findOne(query);
        res.send(bike);
        // console.log(query);
     });

      // update id quantity
      app.put('/bikes/:id', async(req, res)=>{
        const id = req.params.id;
        const updateQuantity = req.body.quantity;
        // console.log(req.body.quantity)
        const filter = { _id: ObjectId(id) };
        const options = {upsert: true};
        const updatedDoc = {
            $set: { quantity: updateQuantity }
        }
        const result = await productCollection.updateOne(filter, updatedDoc, options);
        res.send(result)
    });

       //POST/ INSERT ONE (form) 
       app.post('/bikes', async (req, res) => {
        const newItem = req.body;
        const result = await productCollection.insertOne(newItem);
        res.send(result);
    });

    //post/add item item product
    app.put('/bikes',verifyToken,async (req,res) => {
        const item = req.body
        const email = req.query.email
        const decoded = req.decoded.email
        if(email === decoded){
            const result = await productCollection.insertOne(item)
            res.send(result)
        }
    })
    
    //delete/inventory manage items

    app.delete('/bikes',verifyToken, async(req,res) => {
        const {id,email} = req.query
        const decoded = req.decoded.email
        if(email === decoded){
            const query = {_id: ObjectId(id)}
            const result = await productCollection.deleteOne(query)
            res.send(result)
        }else{
            res.status(403).send({message: 'forbidden access'})
        }
    })

         // login into jwt added api
         app.post('/login',(req,res) => {
            const email = req.body
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            res.send({accessToken})
        })
   
      

    } 
    finally{}
  } 
  
  // call the async finc
  run().catch(console.dir);
  console.log('MOTOR MANIA now CONNECTED');

//ui 
app.get('/', (req,res)=>{
    res.send('Hello from my Universe server!');
});
//log 
app.listen(port,()=>{
    console.log('Listening port..', port );
})
