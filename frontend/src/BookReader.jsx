import "./BookReader.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { 
  getPdf,
  saveReadingProgress,
  getReadingProgress, } from "./pdfStorage";
import * as pdfjsLib from "pdfjs-dist";
import AmbienceMixer from "./AmbienceMixer";

import summerBackground from "./assets/summer-background.jpg";
import autumnBackground from "./assets/autumn-background.jpg";
import springBackground from "./assets/spring-background.jpg";
import winterBackground from "./assets/winter-background.jpg";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function BookReader() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState("summer");
  const [pageInput, setPageInput] = useState(1);
  const [pageMode, setPageMode] = useState("light");
  const [progressLoaded, setProgressLoaded] = useState(false);

  const [threeDFlip, setThreeDFlip] = useState(true);
  const [pageTurning, setPageTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState("");
  const [targetPage, setTargetPage] = useState(null);

  const [zoom, setZoom] = useState(100);

  const currentCanvasRef = useRef(null);
  const targetCanvasRef = useRef(null);

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

  /*
   * Load PDF
   */
  useEffect(() => {
  async function loadPdf() {
    try {
      setProgressLoaded(false);

      const file = await getPdf(id);

      if (!file) {
        console.error("No PDF found for this book.");
        return;
      }

      const arrayBuffer = await file.arrayBuffer();

      const loadedPdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const savedPage =
        await getReadingProgress(id);

      if (
        savedPage &&
        savedPage >= 1 &&
        savedPage <= loadedPdf.numPages
      ) {
        setCurrentPage(savedPage);
      } else {
        setCurrentPage(1);
      }

      // Only tell React the PDF is ready
      // after the saved page has been loaded.
      setPdf(loadedPdf);

      // Now it is safe for the saving effect to run.
      setProgressLoaded(true);

      console.log("PDF loaded:", loadedPdf);
      console.log(
        "Total pages:",
        loadedPdf.numPages
      );
      console.log(
        "Saved page:",
        savedPage
      );
    } catch (error) {
      console.error(
        "Failed to load PDF:",
        error
      );
    }
  }

  loadPdf();
}, [id]);


useEffect(() => {
  if (!pdf || !progressLoaded) {
    return;
  }

  async function saveProgress() {
    try {
      await saveReadingProgress(
        id,
        currentPage
      );
    } catch (error) {
      console.error(
        "Failed to save reading progress:",
        error
      );
    }
  }

  saveProgress();
}, [
  pdf,
  progressLoaded,
  currentPage,
  id,
]);

  /*
   * Render a PDF page onto a canvas
   */
  async function renderPage(pageNumber, canvas) {
  if (!pdf || !canvas) {
    return null;
  }

  const page = await pdf.getPage(pageNumber);

  const scale = 1.5 * (zoom / 100);

  const viewport = page.getViewport({
    scale,
  });

  const devicePixelRatio = Math.min(
    window.devicePixelRatio || 1, 1.5
  );

  canvas.width = Math.floor(
    viewport.width * devicePixelRatio
  );

  canvas.height = Math.floor(
    viewport.height * devicePixelRatio
  );

  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const context = canvas.getContext("2d");

  const renderTask = page.render({
    canvasContext: context,
    viewport: viewport,
    transform:
      devicePixelRatio !== 1
        ? [
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0,
          ]
        : null,
  });

  return renderTask;
}

  /*
   * Render current page
   */
 useEffect(() => {
  if (!pdf) {
    return;
  }

  let renderTask = null;
  let cancelled = false;

  async function renderCurrentPage() {
    try {
      if (!currentCanvasRef.current || cancelled) {
        return;
      }

      renderTask = await renderPage(
        currentPage,
        currentCanvasRef.current
      );

      if (cancelled && renderTask) {
        renderTask.cancel();
        return;
      }

      if (renderTask) {
        await renderTask.promise;
      }
    } catch (error) {
      if (
        !cancelled &&
        error?.name !== "RenderingCancelledException"
      ) {
        console.error(
          "Failed to render current page:",
          error
        );
      }
    }
  }

  renderCurrentPage();

  return () => {
    cancelled = true;

    if (renderTask) {
      renderTask.cancel();
    }
  };
}, [pdf, currentPage, zoom]);

  /*
   * Render target page underneath current page
   */
 useEffect(() => {
  if (!pdf || !targetPage) {
    return;
  }

  let renderTask = null;
  let cancelled = false;

  async function renderTargetPage() {
    try {
      if (!targetCanvasRef.current || cancelled) {
        return;
      }

      renderTask = await renderPage(
        targetPage,
        targetCanvasRef.current
      );

      if (cancelled && renderTask) {
        renderTask.cancel();
        return;
      }

      if (renderTask) {
        await renderTask.promise;
      }
    } catch (error) {
      if (
        !cancelled &&
        error?.name !== "RenderingCancelledException"
      ) {
        console.error(
          "Failed to render target page:",
          error
        );
      }
    }
  }

  renderTargetPage();

  return () => {
    cancelled = true;

    if (renderTask) {
      renderTask.cancel();
    }
  };
}, [pdf, targetPage, zoom]);



  useEffect(() => {
  setPageInput(String(currentPage));
}, [currentPage]);

  /*
   * Zoom out
   */
  function zoomOut() {
    setZoom((currentZoom) =>
      Math.max(75, currentZoom - 25)
    );
  }

  /*
   * Zoom in
   */
  function zoomIn() {
    setZoom((currentZoom) =>
      Math.min(200, currentZoom + 25)
    );
  }



  /*
   * Page input handler (jump to page)
   */
  function handlePageInput(event) {
  if (event.key !== "Enter") {
    return;
  }

  const pageNumber = Number(pageInput);

  if (
    pageNumber >= 1 &&
    pageNumber <= pdf.numPages
  ) {
    setCurrentPage(pageNumber);
  } else {
    setPageInput(String(currentPage));
  }
}








  /*
   * Turn to previous page
   */
  function goToPreviousPage() {
    if (
      !pdf ||
      currentPage <= 1 ||
      pageTurning
    ) {
      return;
    }

    const nextPage = currentPage - 1;

    if (!threeDFlip) {
      setCurrentPage(nextPage);
      return;
    }

    startPageTurn(nextPage, "previous");
  }

  /*
   * Turn to next page
   */
  function goToNextPage() {
    if (
      !pdf ||
      currentPage >= pdf.numPages ||
      pageTurning
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    if (!threeDFlip) {
      setCurrentPage(nextPage);
      return;
    }

    startPageTurn(nextPage, "next");
  }

  /*
   * Start 3D page turn
   */
  function startPageTurn(nextPage, direction) {
    setTargetPage(nextPage);
    setTurnDirection(direction);
    setPageTurning(true);

    setTimeout(() => {
      setCurrentPage(nextPage);
    }, 450);

    setTimeout(() => {
      setPageTurning(false);
      setTurnDirection("");
      setTargetPage(null);
    }, 750);
  }

  /*
   * Keyboard controls
   */
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowLeft") {
        goToPreviousPage();
      }

      if (event.key === "ArrowRight") {
        goToNextPage();
      }

      if (event.key === "Escape") {
        navigate(`/books/${id}`);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    pdf,
    currentPage,
    pageTurning,
    threeDFlip,
    id,
  ]);

  return (
    <div
      className={`book-reader theme-${theme}`}
      style={{
        "--background-image": `url(${currentTheme.background})`,
      }}
    >
      {/* Seasonal particles */}
      <div
        className={`reader-particles particle-${theme}`}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }).map(
          (_, index) => (
            <span
              key={index}
              className={`reader-particle reader-particle-${index + 1}`}
            >
              {theme === "summer" && "🍃"}
              {theme === "autumn" && "🍂"}
              {theme === "spring" && "🌸"}
              {theme === "winter" && "❄️"}
            </span>
          )
        )}
      </div>

      {/* Header */}
      <header className="reader-header">
        <button
          className="reader-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
        >
          <span className="reader-brand-icon">
            📖
          </span>

          <span>Bookward</span>
        </button>

        <div className="reader-settings">
          {/* Atmosphere */}
          <div className="reader-theme-section">
            <span className="reader-theme-label">
              Atmosphere
            </span>

            <div className="reader-theme-buttons">
              {Object.entries(themes).map(
                ([themeKey, themeData]) => (
                  <button
                    key={themeKey}
                    className={`reader-theme-button ${
                      theme === themeKey
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setTheme(themeKey)
                    }
                    aria-label={`Choose ${themeData.name} theme`}
                  >
                    {themeData.icon}
                  </button>
                )
              )}
            </div>
          </div>


           {/* Page Mode */}
     <div className="reader-page-mode-section">
     <span className="reader-theme-label">
       Page Mode
      </span>

      <button
       className={`reader-page-mode-toggle ${
       pageMode
      }`}
    onClick={() =>
      setPageMode(
        pageMode === "light"
          ? "dark"
          : "light"
        )
       }
       aria-label={`Page Mode ${
        pageMode === "light"
          ? "Light"
          : "Dark"
        }`}
      >
         {pageMode === "light"
          ? "LIGHT"
          : "DARK"}
         </button>
          </div>



          {/* 3D Flip */}
          <div className="reader-flip-section">
            <span className="reader-theme-label">
              3D Flip
            </span>

            <button
              className={`reader-flip-toggle ${
                threeDFlip ? "on" : "off"
              }`}
              onClick={() =>
                setThreeDFlip(!threeDFlip)
              }
              aria-label={`3D Flip ${
                threeDFlip ? "On" : "Off"
              }`}
            >
              {threeDFlip ? "ON" : "OFF"}
            </button>
          </div>

          {/* Zoom */}
          <div className="reader-zoom-section">
            <span className="reader-theme-label">
              Zoom
            </span>

            <div className="reader-zoom-controls">
              <button
                className="reader-zoom-button"
                onClick={zoomOut}
                disabled={zoom === 75}
                aria-label="Zoom out"
              >
                −
              </button>

              <span className="reader-zoom-value">
                {zoom}%
              </span>

              <button
                className="reader-zoom-button"
                onClick={zoomIn}
                disabled={zoom === 200}
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reader */}
      <main className="reader-content">
        <button
          className="reader-back-button"
          onClick={() =>
            navigate(`/books/${id}`)
          }
        >
          ← Back to Book
        </button>

        <div
  className={`book ${
    pageTurning ? "turning" : ""
  } ${pageMode === "dark" ? "dark-mode" : ""}`}
>
  {/* Click zones for page navigation */}
  <button
    className="book-click-zone book-click-zone-left"
    onClick={goToPreviousPage}
    disabled={currentPage === 1 || pageTurning}
    aria-label="Previous page"
  ></button>

  <button
    className="book-click-zone book-click-zone-right"
    onClick={goToNextPage}
    disabled={
      !pdf ||
      currentPage === pdf.numPages ||
      pageTurning
    }
    aria-label="Next page"
  ></button>

  {/* Target page underneath */}
  {threeDFlip && targetPage && (
    <div
      className={`book-page book-page-underneath ${
        turnDirection
      }`}
    >
      <canvas
        ref={targetCanvasRef}
        style={{
          filter:
            pageMode === "dark"
              ? "invert(0.88)"
              : "none",
        }}
      ></canvas>
    </div>
  )}

  {/* Current page */}
  <div
    className={`book-page book-page-current ${
      pageTurning
        ? `page-turning ${turnDirection}`
        : ""
    }`}
  >
    <canvas
      ref={currentCanvasRef}
      style={{
        filter:
          pageMode === "dark"
            ? "invert(0.88)"
            : "none",
      }}
    ></canvas>
  </div>
</div>
        {/* Page navigation */}
        {pdf && (
          <div className="reader-controls">
            <button
              className="reader-navigation-button"
              onClick={goToPreviousPage}
              disabled={
                currentPage === 1 ||
                pageTurning
              }
              aria-label="Previous page"
            >
              ←
            </button>

            <div className="reader-page-info">
              <span className="reader-page-label">
                Page
              </span>

              <input
               className="reader-page-input"
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(e) =>
                  setPageInput(e.target.value)
                }
                onKeyDown={handlePageInput}
                aria-label="Page number"
               />
              <span className="reader-page-total">
                of {pdf.numPages}
              </span>
            </div>

            <button
              className="reader-navigation-button"
              onClick={goToNextPage}
              disabled={
                currentPage === pdf.numPages ||
                pageTurning
              }
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}

        <p className="reader-hint">
          Use ← and → to turn pages · Esc to return
        </p>
      </main>

      <AmbienceMixer />
    </div>
  );
}

export default BookReader;
