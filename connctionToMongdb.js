const mongoose  = require("mongoose");
const dotenv = require('dotenv')
dotenv.config()

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

// const uri = `mongodb+srv://leonievanast:xwmdcVh_9!Ct!WU@cluster0.b8bz7.mongodb.net/coinssDB?retryWrites=true&w=majority&appName=Cluster0`
const uri = `mongodb+srv://gappie1000:brBcumazCZnRK4D1@cluster0.gnde3nb.mongodb.net/coinsDb?retryWrites=true&w=majority`


const conneCtion = mongoose.connect(uri, connectionParams)
.then(()=> console.log('connected to the cloud atlas'))
.catch((err)=> console.log(err));

module.exports = conneCtion

