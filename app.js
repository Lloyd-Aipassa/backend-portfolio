const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./connctionToMongdb");
const postModelCoin = require("./postModelCoin");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));

// CRUD applications Inspection

//POST
app.post("/coins", async (req, res) => {
	const { coinName, amount } = req.body;

	try {
		const newCoin = await postModelCoin.create({
			coinName,
			amount,
		});
		res.json(newCoin);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Get all coins
app.get("/coins", async (req, res) => {
	try {
		const coins = await postModelCoin.find();
		res.json(coins);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(3001, () => {
	console.log("db conncted to poort 3001");
});

//Get single
app.get("/coins:id", async (req, res) => {
	const { coinName } = req.params;
	try {
		const schade = await postModelCoin.findById(id);
		res.json(schade);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Delete coin
app.delete("/coins/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const deletedCoin = await postModelCoin.findByIdAndDelete(id);
		if (!deletedCoin) {
			return res.status(404).json({ message: "Coin not found" });
		}
		res.json({ message: "Coin deleted successfully", deletedCoin });
	} catch (error) {
		res.status(500).json({ message: "Error deleting coin", error: error.message });
	}
});


