// const mongoose = require("mongoose");

// const schema = new mongoose.Schema({
// 	coinName: { type: String, required: true },
// 	buy: { type: Number, required: true },
// });

// const Coin = mongoose.model("coins", schema);
// module.exports = Coin;

const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
  coinName: String,
  buy: String,
});

const postModel = mongoose.model("coins", coinSchema);

module.exports = postModel;