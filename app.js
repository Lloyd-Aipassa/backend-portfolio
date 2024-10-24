const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./connctionToMongdb");
const bcrypt = require("bcryptjs");  // Voor wachtwoord hashing
const jwt = require('jsonwebtoken');
const postModelCoin = require("./postModelCoin");
const postModelUser = require("./postModelUser");  
const cookieParser = require('cookie-parser');
app.use(cookieParser());




/************************************************************************************************************/
/*************************************  Middleware *********************************************************/
/***********************************************************************************************************/

// CORS-configuratie
const corsOptions = {
	origin: ['http://localhost:4321', 'https://lloyds-coin-portfolio.netlify.app'],
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
  };

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Check voor een webtoken Webtoken configuratie
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Geen toegang - niet ingelogd" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token niet geldig" });
    }
};


// Beveiligde route
app.get('/users/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Toegang verleend tot profiel',
        user: req.user
    });
});

// Middleware voor redirect naar login
const redirectIfNotAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        return res.redirect('/login');
    }
    authenticateToken(req, res, next);
};




/************************************************************************************************************/
/************************************* EINDE Middleware *********************************************************/
/***********************************************************************************************************/



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


// Get all coins
app.get("/coins", async (req, res) => {
	try {
		const coins = await postModelCoin.find();
		res.json(coins);
	} catch (error) {
		res.status(500).send(error);
	}
});



// Login en gebruikersregistratie
app.post("/users", async (req, res) => {
	const { email, password } = req.body;

	// Controleer of de gebruiker al bestaat
	try {
		const userExists = await postModelUser.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash het wachtwoord
		const hashedPassword = await bcrypt.hash(password, 10);

		// Maak de nieuwe gebruiker aan
		const newUser = await postModelUser.create({
			email,
			password: hashedPassword,  // Wachtwoord veilig opslaan
		});

		res.json(newUser);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Inloggen
// Login route
app.post("/users/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Zoek de gebruiker
        const user = await postModelUser.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Ongeldige inloggegevens" });
        }

        // Vergelijk wachtwoorden
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Ongeldige inloggegevens" });
        }

        // Genereer JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        // Zet de token in een cookie
        res.cookie('jwt', token, {
            httpOnly: true,        // Voorkomt toegang via JavaScript
            secure: process.env.NODE_ENV === 'production',  // Alleen HTTPS in productie
            sameSite: 'strict',    // Bescherming tegen CSRF
            maxAge: 31536000000        // Cookie vervalt na 1 jaar
        });

        res.json({
            message: "Succesvol ingelogd",
            userId: user._id
        });

    } catch (error) {
        console.error("Login fout:", error);
        res.status(500).json({ message: "Server fout bij inloggen" });
    }
});

//test



app.post('/users/logout', (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: 'Succesvol uitgelogd' });
});


// creer  de check-auth route voor de login pagina (ben je ingelogd dan naar dasbord)
app.get('/users/check-auth', authenticateToken, (req, res) => {
    res.json({
        message: 'Gebruiker is ingelogd',
        user: req.user
    });
});


// creer  de check-auth route voor de login pagina (ben je niet ingelogd dan naar login)
app.get('/users/profile', redirectIfNotAuthenticated, (req, res) => {
    res.json({
        message: 'Toegang verleend tot profiel',
        user: req.user
    });
});

app.get('/dashboard', redirectIfNotAuthenticated, (req, res) => {
    res.json({
        message: 'Welkom op het dashboard!',
        user: req.user
    });
});


// Start de server
app.listen(3001, () => {
	console.log("db connected to port 3001");
});

