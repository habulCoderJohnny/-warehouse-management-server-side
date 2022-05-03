//const packageName = require('packageName');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());








//log 
app.get('/', (req,res)=>{
    res.send('Hello from my Universe server!');
});
//log 
app.listen(port,()=>{
    console.log('Listening port..', port );
})
