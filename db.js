require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erreur de connexion à la base Neon :", err.stack);
  } else {
    console.log("Connecté avec succès à la base de données PostgreSQL !");
    release();
  }
});
module.exports = pool;
app.use(cors(corsOptions));
app.use(express.json())