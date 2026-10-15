import "./BookDetails.css";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { 
  savePdf,
   getPdf,
  getReadingProgress } from "./pdfStorage";

import * as pdfjsLib from "pdfjs-dist";

import summerBackground from "./assets/summer-background.jpg";
import autumnBackground from "./assets/autumn-background.jpg";
import springBackground from "./assets/spring-background.jpg";
import winterBackground from "./assets/winter-background.jpg";


pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function BookDetails() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasPdf, setHasPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [theme, setTheme] = useState("summer");

const themes = {
  summer: {
    name: "Summer",
    icon: "☀",
    background: summerBackground,
  },
  autumn: {
    name: "Autumn",
    icon: "🍂",
    background: autumnBackground,
  },
  spring: {
    name: "Spring",
    icon: "🌸",
    background: springBackground,
  },
  winter: {
    name: "Winter",
    icon: "❄",
    background: winterBackground,
  },
};

const currentTheme = themes[theme];


  const progressPercentage =
  totalPages > 0 && currentPage > 0
    ? Math.round((currentPage / totalPages) * 100)
    : 0;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);

      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  async function handleDelete() {
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

    try {
      const response = await fetch(
        `https://bookward-backend.onrender.com/books/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      navigate("/books", {
        state: {
          message: "Book deleted successfully",
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

 async function handlePdfSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (file.type !== "application/pdf") {
    alert("Please select a PDF file.");
    return;
  }

  try {
    await savePdf(id, file);

    setHasPdf(true);

    console.log("PDF saved successfully.");
  } catch (error) {
    console.error("Failed to save PDF:", error);
  }
}

  useEffect(() => {
    async function loadBook() {
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
          throw new Error("Failed to fetch book");
        }

        const data = await response.json();

        setBook(data);
      } catch (error) {
        console.error(error);
        setError("Book not found");
      }
    }

    loadBook();
  }, [id]);

  useEffect(() => {
  async function checkForPdf() {
    try {
      const pdf = await getPdf(id);

      if (pdf) {
        setHasPdf(true);
      }
    } catch (error) {
      console.error("Failed to check for PDF:", error);
    }
  }

  checkForPdf();
}, [id]);


//Load the reading progress when the component mounts or when the book ID changes
useEffect(() => {
  async function loadReadingProgress() {
    try {
      const file = await getPdf(id);

      if (!file) {
        setHasPdf(false);
        setCurrentPage(0);
        setTotalPages(0);
        return;
      }

      setHasPdf(true);

      // Find out how many pages the PDF contains.
      const arrayBuffer = await file.arrayBuffer();

      const loadedPdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      setTotalPages(loadedPdf.numPages);

      // Retrieve the last page saved by BookReader.
      const savedPage = await getReadingProgress(id);

      if (
        Number.isInteger(savedPage) &&
        savedPage >= 1 &&
        savedPage <= loadedPdf.numPages
      ) {
        setCurrentPage(savedPage);
      } else {
        setCurrentPage(0);
      }

      // Release the PDF document resources.
      await loadedPdf.destroy();
    } catch (error) {
      console.error("Failed to load reading progress:", error);
    }
  }

  loadReadingProgress();
}, [id]);







  if (error) {
    return <p>{error}</p>;
  }

  if (!book) {
  return (
    <div
      className={`book-details loading-screen theme-${theme}`}
      style={{
        "--background-image": `url(${currentTheme.background})`,
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

        <div className="loading-dots" aria-label="Loading">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

      </div>
    </div>
  );
}

  return (
        <div
         className={`book-details theme-${theme}`}
         style={{
         "--background-image": `url(${currentTheme.background})`,
          }}
         >



      <div className="details-container">

        <Link to="/books" className="back-button">
          ← Back to My Books
        </Link>

        <div className="details-theme-selector">
  <span className="details-theme-label">
    Reading atmosphere
  </span>

  <div className="details-theme-buttons">
    {Object.entries(themes).map(([key, seasonalTheme]) => (
      <button
        key={key}
        type="button"
        className={`details-theme-button ${
          theme === key ? "active" : ""
        }`}
        onClick={() => setTheme(key)}
        aria-label={`${seasonalTheme.name} theme`}
        aria-pressed={theme === key}
        title={seasonalTheme.name}
      >
        {seasonalTheme.icon}
      </button>
       ))}
     </div>
     </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="details-content">

          <div className="details-cover-container">
            {book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="details-cover"
              />
            ) : (
              <div className="details-no-cover">
                <span>📖</span>
                <p>No Cover</p>
              </div>
            )}
          </div>

          <div className="details-info">

            {hasPdf && totalPages > 0 && (
           <div className="reading-progress">
           <div className="reading-progress-header">
            <h2>Reading Progress</h2>
             <span>{progressPercentage}%</span>
          </div>

         <div
          className="reading-progress-track"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={totalPages}
          aria-valuenow={currentPage}
       >
        <div
          className="reading-progress-fill"
          style={{
          width: `${progressPercentage}%`,
        }}
      />
    </div>

       <p className="reading-progress-pages">
         {currentPage > 0
        ? `Page ${currentPage} of ${totalPages}`
        : `Not started · ${totalPages} pages`}
       </p>
      </div>
    )}

            <p className="eyebrow">Book Details</p>

            <h1>{book.title}</h1>

            <p className="author">
              by {book.author}
            </p>

            <div className="detail-divider"></div>

            <div className="status-row">
              <span>Status</span>

              <span className="book-status">
                {book.status}
              </span>
            </div>

            <div className="notes-section">
              <h2>Notes</h2>

              <p>
                {book.notes || "No notes added."}
              </p>
            </div>

            <div className="book-actions">

              {hasPdf ? (
                <button
                  className="read-button"
                  onClick={() => navigate(`/books/${id}/read`)}
                >
                   Read Book
                </button>
              ) : (
                <>
                  <button
                    className="read-button"
                    onClick={() =>
                      document.getElementById("pdf-input").click()
                    }
                  >
                     Add PDF
                  </button>

                  <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfSelect}
                    style={{ display: "none" }}
                  />
                </>
              )}

              <button
                className="edit-button"
                onClick={() => navigate(`/books/${id}/edit`)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={handleDelete}
              >
                Delete
              </button>

            </div>


          </div>

        </div>

      </div>

    </div>
  );
}

export default BookDetails;


