# Open Command Prompt or PowerShell

# For Command Prompt:
set PGPASSWORD= Your password
psql -h Your database

# For PowerShell:
$env:PGPASSWORD="Your password"
psql -h Your database

# Once connected to PostgreSQL:
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    book_name VARCHAR(100),
    book_title VARCHAR(150),
    book_cover VARCHAR(150),
    book_pb VARCHAR(50),
    book_note TEXT,
    book_rating INTEGER,
    isbn VARCHAR(50)
);

# (Optional) Insert example data:
INSERT INTO books (id, book_name, book_title, book_cover, book_pb, book_note, book_rating, isbn) VALUES
(12, 'Harry Potter and the Sorcerer''s Stone', 'J. K. Rowling', 'https://covers.openlibrary.org/b/id/14444481-L.jpg', '1999-09', 'Lorem Ipsum is simply', '5', '059035342X'),
(16, 'Stoney Ridge Seasons', 'Suzanne Woods Fisher', 'https://covers.openlibrary.org/b/id/8971338-L.jpg', 'Sep 01, 2015', 'sdsadsadsada', '5','0800726790');
