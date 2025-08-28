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

// Utilisez le middleware dans votre route
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