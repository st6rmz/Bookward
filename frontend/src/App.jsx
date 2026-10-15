import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import MyBooks from "./MyBooks";
import AddBook from "./AddBook"
import BookDetails from "./BookDetails";
import EditBook from "./EditBook";
import ProtectedRoute from "./ProtectedRoute";
import BookReader from "./BookReader";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />




        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        />
        <Route
        path="/books"
        element={
          <ProtectedRoute>
            <MyBooks />
          </ProtectedRoute>
        }
        />

        <Route
        path="/addbook"
        element={
          <ProtectedRoute>
            <AddBook />
          </ProtectedRoute>
        }
        />

        <Route 
        path="/books/:id"
        element={
          <ProtectedRoute>
            <BookDetails />
          </ProtectedRoute>
        }
        />

        <Route
        path="/books/:id/edit"
        element={
          <ProtectedRoute>
            <EditBook/>
          </ProtectedRoute>
        }
        />

        <Route
        path="/books/:id/read"
        element={
       <ProtectedRoute>
        <BookReader />
       </ProtectedRoute>
      }
     />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
