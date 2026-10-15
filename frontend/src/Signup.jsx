import "./Signup.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "./supabase";

import summerBackground from "./assets/summer-background.jpg";


function Signup() {

  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  async function handleSignup(event) {
  event.preventDefault();

  const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      user_name: userName.trim(),
    },
  },
});

  if (error) {
    console.error(error);
    return;
  }

  



  return (
    <div
      className="signup-page"
      style={{
        "--background-image": `url(${summerBackground})`,
      }}
    >
      {/* Warm ambient lighting */}
      <div className="signup-glow"></div>

      {/* Seasonal atmosphere */}
      <div className="signup-particles" aria-hidden="true">
        <span className="signup-particle particle-one">🍃</span>
        <span className="signup-particle particle-two">🍃</span>
        <span className="signup-particle particle-three">✦</span>
        <span className="signup-particle particle-four">🍃</span>
        <span className="signup-particle particle-five">✦</span>
      </div>

      {/* Top navigation */}
      <header className="signup-header">
        <Link to="/" className="signup-brand">
          <div className="signup-brand-icon">📖</div>
          <span>Bookward</span>
        </Link>

        <div className="signup-header-login">
          <span>Already have an account?</span>

          <Link to="/login">
            Log in
          </Link>
        </div>
      </header>

      {/* Signup content */}
      <main className="signup-content">

        <section className="signup-card">

          {/* Card heading */}
          <div className="signup-heading">
            <div className="signup-book-icon">
              📖
            </div>

            <p className="signup-eyebrow">
              ✦ Welcome to your library
            </p>

            <h1>
              Create your
              <span> reading space.</span>
            </h1>

            <p>
              Settle in, create your account, and start building
              a library filled with stories worth remembering.
            </p>
          </div>

          {/* Form */}
          <form className="signup-form" onSubmit={handleSignup}>

            <div className="form-group">
              <label htmlFor="user_name">
                Your Name
              </label>

              <input
                id="user_name"
                type="text"
                placeholder="What should we call you?"
                value={userName}
                onChange={(event) => setuserName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="form-note">
              <span>✦</span>
              Your account will keep your library private.
            </div>

            <button
              type="submit"
              className="signup-submit"
            >
              Create My Library
              <span>→</span>
            </button>

          </form>

          {/* Login prompt */}
          <div className="signup-bottom">
            <span>Already have a Bookward account?</span>

            <Link to="/login">
              Log in
            </Link>
          </div>

        </section>

      </main>

      <footer className="signup-footer">
        <span>📖</span>
        Take a moment. Pick a story. Begin.
      </footer>
    </div>
  );
}
}

export default Signup;