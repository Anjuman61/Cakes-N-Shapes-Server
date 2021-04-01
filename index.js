const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const port =5055;
const app = express()
app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrzim.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db("cakeShop").collection("items");
  const orderCollection = client.db("cakeShop").collection("orders");

  app.get('/cakeShop',(req, res)=>{  
      productCollection.find({})
      .toArray((err, document)=>{
          res.send(document);
      })
  })


  app.get('/cakeShop/:id',(req,res)=>{
      productCollection.find({_id:ObjectID(req.params.id)})
      .toArray((err,document)=>{
          res.send(document[0])
      })
  })

  app.get('/orders', (req, res)=>{
      console.log(req.query.email)
    orderCollection.find({email:req.query.email})
    .toArray((err, document)=>{
        res.send(document)
    })
  })

  
 app.post('/addOrders', (req, res)=>{
     const newOrders = req.body;
     orderCollection.insertOne(newOrders)
     .then(result =>{
         res.send(result.insertedCount>0)
     })
     console.log(newOrders)
 })

  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    console.log('adding new event: ', newProduct)
    productCollection.insertOne(newProduct)
    .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
    })
})

app.delete('/product/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    productCollection.findOneAndDelete({_id: id})
    .then(data => {
        console.log(data)
        res.send({success: !!data.value})
    })
});

app.use((req, res) => {
    res.status(404).json({ message: "Not found!" })
});

});

app.listen(process.env.PORT || port)