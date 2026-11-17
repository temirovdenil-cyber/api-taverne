require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const verifierToken = require("./middlewares/auth");
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ erreur: "Email et mot de passe obligatoires" });
    }
    const resultat = await pool.query(
      "SELECT * FROM Utilisateur WHERE email = $1",
      [email],
    );
    if (resultat.rows.length === 0) {
      return res.status(401).json({ erreur: "Identifiants incorrects" });
    }
    const utilisateur = resultat.rows[0];
    const motDePasseValide = await bcrypt.compare(
      password,
      utilisateur.mot_de_passe,
    );
    if (!motDePasseValide) { return res.status(401).json({ erreur: "Identifiants incorrects" });
    }
const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({ token });
  } catch (erreur) {
    console.error("Erreur login :", erreur.message);
    res
      .status(500)
      .json({ erreur: "Une erreur interne est survenue dans la Taverne" });
  }
});
app.get("/api/pnj", async (req, res) => {
  try {
    const resultat = await pool.query("SELECT * FROM Personnage");
    res.status(200).json(resultat.rows);
  } catch (erreur) {
    console.error("Erreur SQL :", erreur.message);
    res
      .status(500)
      .json({ erreur: "Une erreur interne est survenue dans la Taverne" });
  }
});
app.post("/api/pnj", verifierToken, async (req, res) => {
  try {
    const { nom, classe, niveau } = req.body;
    if (!nom || !classe || niveau === undefined) {
      return res
        .status(400)
        .json({ erreur: "Les champs nom, classe et niveau sont obligatoires" });
    }
    const resultat = await pool.query(
      "INSERT INTO Personnage (nom, classe, niveau) VALUES ($1, $2, $3) RETURNING *",
      [nom, classe, niveau],
    );
    res.status(201).json({
      message: `${nom} le ${classe} a rejoint la taverne !`,
      personnage: resultat.rows[0],
    });
  } catch (erreur) {
    console.error("Erreur SQL :", erreur.message);
    res
      .status(500)
      .json({ erreur: "Une erreur interne est survenue dans la Taverne" });
  }
});
app.listen(PORT, () => {
  console.log(`Le serveur de la Taverne est ouvert sur http://localhost:${PORT}`);
});