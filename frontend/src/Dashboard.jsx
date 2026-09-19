import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="welcome">
        <p className="eyebrow">Welcome back to Bookward</p>
        <h1>Welcome, Jeremy!</h1>
        <p className="subtitle">
          Settle in, pick a book, and track your journey.
        </p>
      </header>

      <section className="library-card">
        <div className="card-header">
          <p>Your Library</p>
          <span>✦</span>
        </div>

        <div className="stats">
          <Link to="/books" className="stat">
            <span className="stat-number">13</span>
            <span className="stat-label">Total Books</span>
          </Link>

          <div className="stat">
            <span className="stat-number">3</span>
            <span className="stat-label">Reading</span>
          </div>

          <div className="stat">
            <span className="stat-number">6</span>
            <span className="stat-label">Completed</span>
          </div>

          <div className="stat">
            <span className="stat-number">4</span>
            <span className="stat-label">To Start</span>
          </div>
        </div>
      </section>

      <section className="actions">
        <h2>Library Actions</h2>

        <div className="action-buttons">
          <Link to="/addbook">
          <button>Add Book</button>
          </Link>
          <button>Edit Book</button>
          <button>Remove Book</button>
          <button>View Books</button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;