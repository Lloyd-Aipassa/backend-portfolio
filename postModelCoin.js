const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
  coinName: String,
  amount: Number,
});

const postModelCoin = mongoose.model("coins", coinSchema);

module.exports = postModelCoin;