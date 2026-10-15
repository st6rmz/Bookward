import "./AddBook.css";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { supabase } from "./supabase";

function AddBook() {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [addingBookIndex, setAddingBookIndex] = useState(null); // Fixed: Track the specific index

  const messageTimer = useRef(null);

  async function searchBooks() {
    if (search.trim().length < 3) {
      setBooks([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://bookward-backend.onrender.com/books/search?q=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Book search failed:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function selectBook(book, index) {
    // Fixed: Block request if ANY book is currently loading
    if (addingBookIndex !== null) return;

    setAddingBookIndex(index);

    const formData = new FormData();
    formData.append("title", book.title);
    formData.append("author", book.authors?.join(", ") || "Unknown author");
    formData.append("status", "To Start");
    formData.append("notes", "");
    formData.append("google_image_url", book.cover?.replace("http:", "https:") || "");


    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      alert("You must be logged in to add a book.");
      setAddingBookIndex(null);
      return;
    }

    const token = data.session.access_token;

    try {
      const response = await fetch("https://bookward-backend.onrender.com/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add book");

      setSuccessMessage("Book added successfully!");
      clearTimeout(messageTimer.current);
      messageTimer.current = setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to add book:", error);
      alert("Could not add the book. Please try again.");
    } finally {
      setAddingBookIndex(null);
    }
  }

  async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const title = formData.get("title").trim();
  const author = formData.get("author").trim();
  const status = formData.get("status");

  if (!title || !author) {
    alert("Please fill out the title and author fields.");
    return;
  }

  const validStatuses = ["To Start", "Reading", "Completed"];

  if (!validStatuses.includes(status)) {
    alert("Please select a valid status");
    return;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    alert("You must be logged in to add a book.");
    return;
  }

  const token = data.session.access_token;

  try {
    const response = await fetch("https://bookward-backend.onrender.com/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add book");
    }

    setSuccessMessage("Book added successfully!");

    clearTimeout(messageTimer.current);

    messageTimer.current = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    event.target.reset();

  } catch (err) {
    console.error("Failed to add book:", err);
    alert("Could not add the book. Please try again.");
  }
}

  return (
    <div className="add-book">
      {successMessage && (
        <div className="success-message">
          <span>✓</span>
          {successMessage}
        </div>
      )}

      <header className="books-header">
        <p className="eyebrow">Your Library</p>
        <h1>Add Book</h1>
        <p className="subtitle">Add a book via Searching or adding one Manually.</p>
      </header>

      <div className="book-search">
        <label>Search for a book</label>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" onClick={searchBooks}>Search</button>
        </div>

        {loading && <p>Searching...</p>}

        {books.length > 0 && (
          <div className="search-results">
            {books.map((book, index) => (
              <div className="book-card" key={book.id || index}>
                {/* Fixed Image formatting class wrapper */}
                <div className="book-cover-container">
                  {book.cover ? (
                    <img src={book.cover.replace("http:", "https:")} alt={book.title} />
                  ) : (
                    <div className="no-cover">No Cover Available</div>
                  )}
                </div>
                <h3>{book.title}</h3>
                <p>{book.authors?.length > 0 ? book.authors.join(", ") : "Unknown author"}</p>
                
                {/* Fixed: Only show button loading text for the processing book */}
                <button
                  type="button"
                  onClick={() => selectBook(book, index)}
                  disabled={addingBookIndex !== null}
                >
                  {addingBookIndex === index ? "Adding..." : "Select"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      <form className="book-form" onSubmit={handleSubmit}>
        <label>Book Title</label>
        <input type="text" name="title" required />

        <label>Book Author</label>
        <input type="text" name="author" required />

        <label>Status</label>
        <select name="status" required>
          <option value="To Start">To Start</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
        </select>

        <label>Notes</label>
        <textarea name="notes"></textarea>

        <label>Book Image (Max file size: 2MB)</label>
        <input type="file" name="image" accept="image/*" />

        <div className="add-button">
          <button type="submit">Add Book</button>
        </div>
      </form>

      <div className="add-book-back">
        <Link to="/dashboard" className="add-book-back-link">Back</Link>
      </div>
    </div>
  );
}

export default AddBook;
