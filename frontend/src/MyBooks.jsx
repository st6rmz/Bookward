import "./MyBooks.css";
import { useEffect, useState } from "react";

function MyBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/books")
      .then((response) => response.json())
      .then((data) => {
        setBooks(data);
      });
  }, []);

  return (
    <div className="my-books">
      <header className="books-header">
        <p className="eyebrow">Your Library</p>
        <h1>My Books</h1>
        <p className="subtitle">
          Your collection, gathered in one quiet corner.
        </p>
      </header>

      <div className="book-filters">
        <button>All</button>
        <button>Reading</button>
        <button>Completed</button>
        <button>To Start</button>
      </div>

      <section className="book-list">
        {books.map((book) => (
          <article className="book-card" key={book.id}>
            <div>
              <h2>{book.title}</h2>
              <p className="book-author">{book.author}</p>
            </div>

            <span className="book-status">{book.status}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

export default MyBooks;
