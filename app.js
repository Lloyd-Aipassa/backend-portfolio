// const express = require("express");
// const cors = require("cors");
// const app = express();
// const db = require("./connctionToMongdb");
// const postModelCoin = require("./postModelCoin");
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(cors({ origin: "*" }));


// const express = require("express");
// const cors = require("cors");
// const app = express();
// const db = require("./connctionToMongdb");
// const postModelCoin = require("./postModelCoin");

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Meer specifieke CORS-configuratie
// app.use(cors({
// 	origin: ['http://localhost:4321', 'https://lloyds-coin-portfolio.netlify.app'],
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true // Als je credentials nodig hebt
// }));

// const cors = require('cors');

// app.use(cors(corsOptions));

const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./connctionToMongdb");
const postModelCoin = require("./postModelCoin");

// CORS-configuratie
const corsOptions = {
  origin: ['http://localhost:4321', 'https://lloyds-coin-portfolio.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


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
// Get single coin
app.get("/coins/:coinName", async (req, res) => {
	// Voeg een dubbele punt toe voor coinName
	const { coinName } = req.params; // Haal coinName op uit de routeparameters
	try {
		const coin = await postModelCoin.findOne({ coinName }); // Zoek naar de coin op basis van coinName
		if (!coin) {
			return res
				.status(404)
				.json({ message: "Coin not found" }); // Geef een 404-status terug als de coin niet gevonden is
		}
		res.json(coin); // Retourneer de gevonden coin
	} catch (error) {
		res.status(500).send(error); // Foutafhandeling bij serverfouten
	}
});

// Update coin (PATCH)
app.patch("/coins/:coinName", async (req, res) => {
    const { coinName } = req.params;  // Haal de coinName op uit de URL
    const { amount } = req.body;  // Haal de nieuwe amount op uit de body

    console.log(`Attempting to update coin: ${coinName} with amount: ${amount}`); // Debug log

    try {
        // Zoek de coin op basis van coinName
        const coinToUpdate = await postModelCoin.findOne({ coinName });

        if (!coinToUpdate) {
            console.log(`Coin ${coinName} not found in database.`);  // Debug log
            return res.status(404).json({ message: "Coin not found" });
        }

        // Als de coin wordt gevonden, update de amount
        coinToUpdate.amount = amount;

        // Sla de update op in de database
        await coinToUpdate.save();

        console.log('Updated Coin:', coinToUpdate);  // Debug log

        // Stuur de bijgewerkte coin terug als JSON
        res.json(coinToUpdate);
    } catch (error) {
        console.error("Error updating coin:", error);  // Foutmelding
        res.status(500).json({ message: "Error updating coin", error: error.message });
    }
});

  
  
  

// Delete coin
app.delete("/coins/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const deletedCoin = await postModelCoin.findByIdAndDelete(id);
		if (!deletedCoin) {
			return res
				.status(404)
				.json({ message: "Coin not found" });
		}
		res.json({ message: "Coin deleted successfully", deletedCoin });
	} catch (error) {
		res.status(500).json({
			message: "Error deleting coin",
			error: error.message,
		});
	}
});
