
import "./EditBook.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import summerBackground from "./assets/summer-background.jpg";

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the existing book
  useEffect(() => {
    async function loadBook() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!data.session) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const token = data.session.access_token;

      try {
        const response = await fetch(
          `https://bookward-backend.onrender.com/books/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load book");
        }

        const data = await response.json();

        setBook(data);
      } catch (error) {
        console.error(error);
        alert("Could not load this book.");
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const title = formData.get("title");
    const author = formData.get("author");
    const status = formData.get("status");

    if (!title || !author || !status) {
      alert("Please fill in all required fields.");
      return;
    }

   
    const image = formData.get("image");

    if (!image || image.size === 0) {
      formData.delete("image");
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      alert("Could not authenticate.");
      return;
    }

    if (!data.session) {
      console.error("No active session");
      alert("Please log in again.");
      return;
    }

    const token = data.session.access_token;

    try {
      const response = await fetch(
        `https://bookward-backend.onrender.com/books/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update book");
      }

      navigate(`/books/${id}`, {
        state: {
          message: "Book updated successfully",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Could not update this book.");
    }
  }

 
  
  if (loading) {
    return (
      <div
        className="book-details loading-screen"
        style={{
          "--background-image": `url(${summerBackground})`,
        }}
      >
        <div className="loading-content">

          <div className="loading-book">
            <span>📖</span>
          </div>

          <p className="loading-eyebrow">
            ✦ Bookward Library ✦
          </p>

          <h1>Opening the library...</h1>

          <p className="loading-message">
            Retrieving your book from the shelves
          </p>

          <div
            className="loading-dots"
            aria-label="Loading"
          >
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
          </div>

        </div>
      </div>
    );
  }

  if (!book) {
    return <p>Book could not be found.</p>;
  }

    return (
    <div className="edit-book">

      <header className="books-header">
        <p className="eyebrow">
          Your Library
        </p>

        <h1>Edit Book</h1>

        <p className="subtitle">
          Make changes to your book and keep your
          reading journey up to date.
        </p>
      </header>

      <form
        className="book-form"
        onSubmit={handleSubmit}
      >

        <label>
          Book Title
        </label>

        <input
          type="text"
          name="title"
          defaultValue={book.title}
          required
        />

        <label>
          Book Author
        </label>

        <input
          type="text"
          name="author"
          defaultValue={book.author}
          required
        />

        <label>
          Status
        </label>

        <select
          name="status"
          defaultValue={book.status}
          required
        >
          <option value="To Start">
            To Start
          </option>

          <option value="Reading">
            Reading
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

        <label>
          Notes
        </label>

        <textarea
          name="notes"
          defaultValue={book.notes || ""}
        />

        <label>
          Current Book Cover
        </label>

        <div className="current-book-cover">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.title}
            />
          ) : (
            <p>
              No cover uploaded.
            </p>
          )}
        </div>

        <label>
          Replace Book Cover (Optional)
        </label>

        <input
          type="file"
          name="image"
          accept="image/*"
        />

        <p className="edit-image-note">
          Leave this empty to keep your current cover.
        </p>

        {/* ========================================
           Unified Action Row (Inside the form)
           ======================================== */}
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
          
          <Link to={`/books/${id}`} className="cancel-btn">
            Cancel
          </Link>
        </div>

      </form>

    </div>
  );
}

export default EditBook;
