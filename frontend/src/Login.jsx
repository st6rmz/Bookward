import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase} from "./supabase";

import summerBackground from "./assets/summer-background.jpg";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


  async function handleLogin(event){
    event.preventDefault();

    

    const {data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    
    if (error) {
        console.error(error);
        setErrorMessage("Invalid email or password")
        return;
    }

    navigate("/dashboard", {
    replace: true,  
    state: {
    message: "Logged in successfully!",
  },
  });


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
          <span>Don't have an account?</span>

          <Link to="/signup">
            Sign up
          </Link>
        </div>
      </header>

      {/* Login content */}
      <main className="signup-content">

        <section className="signup-card">

          {/* Card heading */}
          <div className="signup-heading">
            <div className="signup-book-icon">
              📖
            </div>

            <p className="signup-eyebrow">
              ✦ Welcome back to your library
            </p>

            <h1>
              Return to your
              <span> reading space.</span>
            </h1>

            <p>
              Your stories are waiting. Sign in to continue
              your reading journey.
            </p>
          </div>

          {/* Login form */}
          <form className="signup-form" onSubmit={handleLogin}>

            

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
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {errorMessage && (
       <div className="login-error">
        {errorMessage}
       </div>
       )}


            <div className="form-note">
              <span>✦</span>
              Your library is waiting for you.
            </div>

            <button
              type="submit"
              className="signup-submit"
            >
              Enter My Library
              <span>→</span>
            </button>

          </form>

          {/* Signup prompt */}
          <div className="signup-bottom">
            <span>New to Bookward?</span>

            <Link to="/signup">
              Create an account
            </Link>
          </div>

        </section>

      </main>

      <footer className="signup-footer">
        <span>📖</span>
        Take a moment. Pick a story. Continue.
      </footer>
    </div>
  );
}

export default Login;