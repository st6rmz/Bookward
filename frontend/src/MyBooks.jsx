import "./MyBooks.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "./supabase"

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("All");

  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);

      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

   
   useEffect(() => {
  async function loadBooks() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      return;
    }

    if (!data.session) {
      console.error("No active session");
      return;
    }

    const token = data.session.access_token;
    
    const response = await fetch("https://bookward-backend.onrender.com/books", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
      return;
    }

    const books = await response.json();

    setBooks(books);
  }

  loadBooks();
}, []);



  const filteredBooks =
    filter === "All"
      ? books
      : books.filter((book) => book.status === filter);

  return (
    <div className="my-books">

      {/* Header */}
      <header className="books-header">
        <p className="eyebrow">Your Library</p>

        <h1>My Books</h1>

        <p className="subtitle">
          Your collection, gathered in one quiet corner.
        </p>
      </header>


      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}


      {/* Filters */}
      <div className="book-filters">

        <button
          className={filter === "All" ? "active" : ""}
          onClick={() => setFilter("All")}
        >
          All
        </button>

        <button
          className={filter === "Reading" ? "active" : ""}
          onClick={() => setFilter("Reading")}
        >
          Reading
        </button>

        <button
          className={filter === "Completed" ? "active" : ""}
          onClick={() => setFilter("Completed")}
        >
          Completed
        </button>

        <button
          className={filter === "To Start" ? "active" : ""}
          onClick={() => setFilter("To Start")}
        >
          To Start
        </button>

      </div>


      {/* Bookcase */}
      <section className="bookcase">

        <div className="bookcase-top">
          <h2>
            {filter === "All" ? "My Collection" : filter}
          </h2>
        </div>


        {/* Books */}
        <div className="bookcase-interior">

          {filteredBooks.map((book) => (

            <Link
              to={`/books/${book.id}`}
              key={book.id}
              className="book-item"
            >

              {/* Book Cover */}
              <div className="book-cover">

                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
                  />
                ) : (
                  <div className="no-cover">
                    <span>📖</span>
                    
                  </div>
                )}

              </div>


              {/* Book Information */}
              <div className="book-info">

                <h3>{book.title}</h3>

                <p className="book-author">
                  {book.author}
                </p>

                <span
                  className={`book-status ${book.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {book.status}
                </span>

              </div>

            </Link>

          ))}


          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="empty-library">

              <span>📚</span>

              <h3>No books here yet</h3>

              <p>
                Add a book to start filling your library.
              </p>

              <Link to="/addbook">
                Add a Book
              </Link>

            </div>
          )}

        </div>


        {/* Wooden Shelf */}
        <div className="wooden-shelf"></div>

      </section>


      {/* Back Button */}
      <div className="add-book-back">

        <Link to="/dashboard" className="add-book-back-link">
          Back
        </Link>

      </div>

    </div>
  );
}

export default MyBooks;