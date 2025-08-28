const db = require('../database/database');

class Book {
    static getAll(callback) {
        db.all('SELECT * FROM books ORDER BY created_at DESC', callback);
    }

    static create(book, callback) {
        const { title, author } = book;
        db.run(
            'INSERT INTO books (title, author) VALUES (?, ?)',
            [title, author],
            function(err) {
                callback(err, { id: this.lastID, ...book });
            }
        );
    }
}

module.exports = Book;