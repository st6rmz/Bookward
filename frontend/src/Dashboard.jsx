import "./Dashboard.css";
import { Link, useLocation } from "react-router-dom";
import {  useEffect,useState } from "react";
import { supabase } from "./supabase";

import summerBackground from "./assets/summer-background.jpg";
import autumnBackground from "./assets/autumn-background.jpg";
import springBackground from "./assets/spring-background.jpg";
import winterBackground from "./assets/winter-background.jpg";

function Dashboard() {
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
  const [userName, setUserName] = useState("");
  const [bookStats, setBookStats] = useState({
    total: 0,
    reading: 0,
    completed: 0,
    toStart: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);


 useEffect(() => {
  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      // 1. Get the authenticated user
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      const userId = authData.user.id;

      // 2. Retrieve the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_name")
        .eq("user_id", userId)
        .maybeSingle();

      
      if (profileError) {
        throw profileError;
      }

      if (!profile || !profile.user_name) {
        setError("We couldn't find your profile. Please contact support.");
        return;
      }

      setUserName(profile.user_name);

      // 3. Retrieve this user's books
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("status")
        .eq("user_id", userId);

      if (booksError) {
        throw booksError;
      }

      // 4. Calculate the statistics
      const stats = {
        total: books.length,
        reading: books.filter((book) => book.status === "Reading").length,
        completed: books.filter((book) => book.status === "Completed").length,
        toStart: books.filter((book) => book.status === "To Start").length,
      };

      setBookStats(stats);
    } catch (error) {
      console.error("Dashboard loading failed:", error);
      setError("We couldn't load your dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  loadDashboard();
}, [retryCount]);


function handleRetry() {
  setRetryCount((count) => count + 1);
}


  async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return;
  }

  window.location.href = "/";
}


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

  return (
    <div
      className={`dashboard theme-${theme}`}
      style={{
        "--background-image": `url(${currentTheme.background})`,
      }}
    >

      
      {/* Animated seasonal atmosphere */}
      <div className={`particle-container particle-${theme}`} aria-hidden="true">
         {Array.from({ length: 10 }).map((_, index) => (
         <span
         key={index}
      className={`particle particle-${index + 1}`}
    >
      {theme === "summer" && "🍃"}
      {theme === "autumn" && "🍂"}
      {theme === "spring" && "🌸"}
      {theme === "winter" && "❄️"}
    </span>
  ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">📖</div>
          <span>Bookward</span>
        </div>

        <nav className="navigation">
          <Link to="/dashboard" className="nav-link active">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/books" className="nav-link">
            <span>▣</span>
            My Books
          </Link>

          <Link to="/addbook" className="nav-link">
            <span>＋</span>
            Add Book
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <button className="settings-button">
            <span>⚙</span>
            Settings
          </button>

        <button
           className="settings-button"
           onClick={handleLogout}
         >
         <span>↪</span>
        Logout
        </button>



        </div>
      </aside>




      {successMessage && (
     <div className="success-message">
       {successMessage}
     </div>
   )}

    {error && (
  <div className="dashboard-error" role="alert">
    <p>{error}</p>

    <button onClick={handleRetry} disabled={isLoading}>
      {isLoading ? "Retrying..." : "Try Again"}
    </button>
  </div>
)}


      {/* Main content */}
      <main className="dashboard-content">
        {/* Welcome */}
        <header className="welcome">
          <p className="eyebrow">
            ✦ Welcome back to Bookward
          </p>

          <h1>Welcome, {userName}!</h1>

          <p className="subtitle">
            Settle in, pick a book, and track your journey.
          </p>
        </header>

        {/* Library */}
        <section className="library-card">
          <div className="card-header">
            <div className="section-title">
              <span className="section-icon">📖</span>
              <h2>Your Library</h2>
            </div>

            <span className="sparkle">✦</span>
          </div>

          <div className="stats">
            <Link to="/books" className="stat stat-clickable">
              <span className="stat-icon">📚</span>
              <span className="stat-number">{isLoading ? "..." : error ? "-" : bookStats.total}</span>
              <span className="stat-label">Total Books</span>
              <span className="stat-arrow">→</span>
            </Link>

            <div className="stat">
              <span className="stat-icon">📖</span>
              <span className="stat-number">{isLoading ? "..." : error ? "-" : bookStats.reading}</span>
              <span className="stat-label">Reading</span>
            </div>

            <div className="stat">
              <span className="stat-icon">✓</span>
              <span className="stat-number">{isLoading ? "..." : error ? "-" : bookStats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>

            <div className="stat">
              <span className="stat-icon">🔖</span>
              <span className="stat-number">{isLoading ? "..." : error ? "-" : bookStats.toStart}</span>
              <span className="stat-label">To Start</span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="actions">
          <div className="section-heading">
            <div>
              <h2>Library Actions</h2>
              <p>What would you like to do?</p>
            </div>

            <span>→</span>
          </div>

          <div className="action-buttons">
            <Link to="/addbook" className="action-button add">
              <span className="action-icon">＋</span>
              Add Book
            </Link>

           

            <Link to="/books" className="action-button view">
              <span className="action-icon">◉</span>
              View Books
            </Link>
          </div>
        </section>

        {/* Theme selector */}
        <section className="theme-section">
          <div className="section-heading">
            <div>
              <h2>Choose Your Theme</h2>
              <p>Switch up the world, make it yours.</p>
            </div>

            <span className="theme-current">
              {currentTheme.icon}
            </span>
          </div>

          <div className="theme-grid">
            {Object.entries(themes).map(([themeKey, themeData]) => (
              <button
                key={themeKey}
                className={`theme-card ${
                  theme === themeKey ? "selected" : ""
                }`}
                onClick={() => setTheme(themeKey)}
              >
                <div
                  className={`theme-preview theme-preview-${themeKey}`}
                  style={{
                    backgroundImage: `url(${themeData.background})`,
                  }}
                >
                  <span>{themeData.icon}</span>
                </div>

                <div className="theme-name">
                  {themeData.name}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;