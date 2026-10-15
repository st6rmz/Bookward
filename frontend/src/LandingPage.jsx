import "./LandingPage.css";
import { Link } from "react-router-dom";
import { useState } from "react";

import summerBackground from "./assets/summer-background.jpg";
import autumnBackground from "./assets/autumn-background.jpg";
import springBackground from "./assets/spring-background.jpg";
import winterBackground from "./assets/winter-background.jpg";

function LandingPage() {
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

  return (
    <div
      className={`landing theme-${theme}`}
      style={{
        "--background-image": `url(${currentTheme.background})`,
      }}
    >
      {/* Seasonal atmosphere */}
      <div
        className={`particle-container particle-${theme}`}
        aria-hidden="true"
      >
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

      {/* Top navigation */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-icon">📖</div>
          <span>Bookward</span>
        </div>

        <nav className="landing-navigation">
          <Link to="/login" className="login-link">
            Log In
          </Link>

          <Link to="/signup" className="signup-link">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main landing content */}
      <main className="landing-content">
        <section className="hero">
          <p className="hero-eyebrow">
            ✦ Your personal reading space
          </p>

          <h1>
            Every book has a
            <span> place in your story.</span>
          </h1>

          <p className="hero-description">
            Bookward is your cozy digital library for keeping track
            of the books you want to read, the stories you're enjoying,
            and the ones you've already finished.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="hero-button primary">
              <span>✦</span>
              Create Your Library
            </Link>

            <Link to="/login" className="hero-button secondary">
              I Already Have an Account
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">📚</div>

            <div>
              <h3>Build Your Library</h3>
              <p>
                Keep all your books organized in one peaceful
                little corner of the internet.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📖</div>

            <div>
              <h3>Track Your Journey</h3>
              <p>
                Keep track of what you're reading, what you've
                finished, and what's waiting for you.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✦</div>

            <div>
              <h3>Make It Yours</h3>
              <p>
                Choose a seasonal atmosphere and make your
                reading space feel like home.
              </p>
            </div>
          </div>
        </section>

        {/* Theme selector */}
        <section className="landing-themes">
          <p>Choose your atmosphere</p>

          <div className="landing-theme-buttons">
            {Object.entries(themes).map(([themeKey, themeData]) => (
              <button
                key={themeKey}
                className={`landing-theme-button ${
                  theme === themeKey ? "selected" : ""
                }`}
                onClick={() => setTheme(themeKey)}
                aria-label={`Choose ${themeData.name} theme`}
              >
                {themeData.icon}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <span></span>
        Bookward · A place for your stories
      </footer>
    </div>
  );
}

export default LandingPage;