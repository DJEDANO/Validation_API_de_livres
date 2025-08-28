const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données SQLite');
    }
});

// Création de la table books
db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Erreur lors de la création de la table:', err);
    } else {
        console.log('Table "books" prête ou déjà existante');
    }
});

// GET /books - Récupérer tous les livres
app.get('/books', (req, res) => {
    db.all('SELECT * FROM books ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Middleware de validation pour les livres
const validateBook = (req, res, next) => {
    const { title, author } = req.body;
    
    // Vérification de la présence des champs
    if (!title || !author) {
        return res.status(400).json({ 
            error: 'Champs manquants',
            details: 'Le titre et l\'auteur sont requis'
        });
    }
    
    // Conversion en string et trim
    const trimmedTitle = title.toString().trim();
    const trimmedAuthor = author.toString().trim();
    
    // Validation des champs vides
    if (trimmedTitle.length === 0 || trimmedAuthor.length === 0) {
        return res.status(400).json({ 
            error: 'Champs vides',
            details: 'Le titre et l\'auteur ne peuvent pas être vides'
        });
    }
    
    // Validation de la longueur minimale
    if (trimmedTitle.length < 2) {
        return res.status(400).json({ 
            error: 'Titre invalide',
            details: 'Le titre doit contenir au moins 2 caractères'
        });
    }
    
    if (trimmedAuthor.length < 2) {
        return res.status(400).json({ 
            error: 'Auteur invalide',
            details: 'Le nom de l\'auteur doit contenir au moins 2 caractères'
        });
    }
    
    // Stocker les valeurs nettoyées pour les routes
    req.cleanedBook = {
        title: trimmedTitle,
        author: trimmedAuthor
    };
    
    next();
};

// POST /books - Créer un nouveau livre avec validation
app.post('/books', validateBook, (req, res) => {
    const { title, author } = req.cleanedBook;
    
    db.run(
        'INSERT INTO books (title, author) VALUES (?, ?)',
        [title, author],
        function(err) {
            if (err) {
                return res.status(500).json({ 
                    error: 'Erreur de base de données',
                    details: err.message 
                });
            }
            res.status(201).json({
                id: this.lastID,
                title,
                author,
                message: 'Livre créé avec succès'
            });
        }
    );
});

// Route racine
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de livres fonctionnelle',
        endpoints: {
            'GET /books': 'Récupérer tous les livres',
            'POST /books': 'Créer un nouveau livre'
        }
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('API de gestion de livres prête');
});