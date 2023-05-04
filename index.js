//mongodv run 
const connectToMongo=require('./db');
connectToMongo();
//express import
const express = require('express')
const app = express()
const port = 5000

app.use(express.json())
//routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})