import "./SignupSuccess.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { supabase } from "./supabase";
import summerBackground from "./assets/summer-background.jpg";

function SignupSuccess() {
  const location = useLocation();
  const email = location.state?.email || "";

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleResendEmail() {
    if (!email) {
      setMessage(
        "Please return to signup and enter your email address again."
      );
      setMessageType("error");
      return;
    }

    setIsResending(true);
    setMessage("");
    setMessageType("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("A new verification email has been requested.");
      setMessageType("success");
    } catch (error) {
      console.error("Resend email error:", error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div
      className="signup-success-page"
      style={{
        "--background-image": `url(${summerBackground})`,
      }}
    >
      <div className="signup-success-glow" />

      <div className="signup-success-particles" aria-hidden="true">
        <span className="success-particle success-particle-one">🍃</span>
        <span className="success-particle success-particle-two">✦</span>
        <span className="success-particle success-particle-three">🍃</span>
        <span className="success-particle success-particle-four">✦</span>
      </div>

      <header className="signup-success-header">
        <Link to="/" className="signup-success-brand">
          <span className="signup-success-brand-icon">📖</span>
          <span>Bookward</span>
        </Link>
      </header>

      <main className="signup-success-content">
        <section className="signup-success-card">
          <div className="success-envelope">
            <span>✉</span>
            <span className="success-envelope-sparkle">✦</span>
          </div>

          <p className="success-eyebrow">
            ✦ One little step left
          </p>

          <h1>
            Your library
            <span> awaits you.</span>
          </h1>

          <p className="success-description">
            Your Bookward account is almost ready.
            We've requested a verification email so you
            can confirm your email address and begin your reading journey.
          </p>

          {email && (
            <div className="success-email-box">
              <span className="success-email-label">
                VERIFICATION EMAIL SENT TO
              </span>

              <span className="success-email-address">
                {email}
              </span>
            </div>
          )}

          <div className="success-instructions">
            <div className="success-step-icon">1</div>
            <p>Open your inbox and look for the Bookward verification email.</p>

            <div className="success-step-icon">2</div>
            <p>Open the email and select the confirmation link.</p>

            <div className="success-step-icon">3</div>
            <p>Return to Bookward and log in to your account.</p>
          </div>

          <p className="success-spam-note">
            ✧ Can't find the email? Check your spam or junk folder too.
          </p>

          {message && (
            <div
              className={`success-message ${messageType}`}
              role="status"
            >
              {message}
            </div>
          )}

          <button
            type="button"
            className="success-resend-button"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending
              ? "Requesting email..."
              : "Didn't receive it? Resend email"}
          </button>

          <Link to="/login" className="success-login-button">
            Continue to Log In <span>→</span>
          </Link>

          <Link to="/signup" className="success-back-link">
            ← Back to sign up
          </Link>
        </section>
      </main>

      <footer className="signup-success-footer">
        📖 &nbsp; Your next chapter starts here.
      </footer>
    </div>
  );
}

export default SignupSuccess;
