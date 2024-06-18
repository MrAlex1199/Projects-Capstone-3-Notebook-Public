import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import pg from 'pg';
import 'dotenv/config'

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Database on local

// const db = new pg.Client({
//     user: "postgres",
//     host: "localhost",
//     database: "Notebook",
//     password: "2589",
//     port: 5432,
// });
// db.connect();

const db = new pg.Client({
    connectionString: process.env.DATABASELINK,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

async function baseData() {
    const bookData = await db.query("SELECT * FROM books");
    let bookL = [];
    bookData.rows.forEach((booklist) => {
        bookL.push(booklist);
    });
    return bookL;
  }

app.get('/', async (req, res) => {
    try {
        const bookData1 = await baseData();
        res.render('index.ejs', { bookData1 });
    } catch (error) {
        console.error('Error fetching book data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/about', (req, res) => {res.render('about.ejs');});
app.get('/contact', (req, res) => {res.render('contact.ejs');});
app.get('/addbooks', (req, res) => {res.render('partials/addbooks.ejs');});

const ISBN_S = [];
const bookd_name = [];
const bookd_title = [];
const bookd_cover = [];
const bookd_publishDates = [];

app.post('/Search', async (req, res) => {
    ISBN_S.splice(0, ISBN_S.length);
    bookd_name.splice(0, bookd_name.length);
    bookd_title.splice(0, bookd_title.length);
    bookd_cover.splice(0, bookd_cover.length);
    bookd_publishDates.splice(0, bookd_publishDates.length);
    let BookISBN = req.body['BOOK-Search-ISBN'];
    try {
        const { data: { records } } = await axios.get(`http://openlibrary.org/api/volumes/brief/isbn/${BookISBN}.json`);
        const publishDates = records[Object.keys(records)[0]].publishDates[0];
        const ISBN = records[Object.keys(records)[0]].isbns[0];
        const record = records[Object.keys(records)[0]].data;
        const { title, authors } = record;
        const bookauthors = authors[0].name;
        const { large: bookcover } = record.cover;
        ISBN_S.push(ISBN);
        bookd_name.push(title);
        bookd_title.push(bookauthors);
        bookd_cover.push(bookcover);
        bookd_publishDates.push(publishDates);
        res.render('partials/addbooks.ejs', { bookData: { title, bookauthors, bookcover, publishDates, ISBN } });
    } catch {
        res.redirect("/addbooks");
    }
});

app.post('/add-note', async (req, res) => {
    try {
        const Book_note = req.body['Review-text-in'];
        const Book_rating = req.body['stars'];
        await db.query(
            "INSERT INTO ibook (Book_name, BooK_title, Book_cover, Book_PB, Book_note, Book_rating, isbn) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [ bookd_name[0],bookd_title[0],bookd_cover[0],bookd_publishDates[0],Book_note,Book_rating,ISBN_S[0] ]
        );
        ISBN_S.splice(0, ISBN_S.length);
        bookd_name.splice(0, bookd_name.length);
        bookd_title.splice(0, bookd_title.length);
        bookd_cover.splice(0, bookd_cover.length);
        bookd_publishDates.splice(0, bookd_publishDates.length);
        res.redirect("/");
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Error: " + error.message);
    }
});

app.post('/edit', async (req, res) => {
    const edit_book_text = req.body.updatedItemTitle;
    const edit_book_id = req.body.editItemId;
    try {
        await db.query('UPDATE ibook SET book_note = $1 WHERE id = $2', [edit_book_text, edit_book_id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete', async (req, res) => {
    const bookId = req.body.deleteItemId;
    try {
        await db.query('DELETE FROM ibook WHERE id = $1', [bookId]);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send('Error deleting book');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});