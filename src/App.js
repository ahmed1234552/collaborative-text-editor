import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
  useMatch,
} from "react-router-dom";
import Signup from "./components/pages/signup";
import Login from "./components/pages/login";
// import TextEditor from "./components/pages/TextEditor";
import "./App.css"; // Import CSS file for styling
import logo from "./images/logo.png"; // Import your image file
import DashboardPage from "./components/pages/DashboardPage";
import Texteditor from "./components/pages/Texteditor.jsx"; // Import QuillEditor component

function Navbar() {
  const location = useLocation();
  const isTextEditor = useMatch("/text-editor/:id");

  // Hide the navbar on the /signup and /login pages
  if (
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/text-editor" ||
    isTextEditor
    // location.pathname === "/text-editor"
  ) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/login" className="nav-button">
        Login
      </Link>
      <Link to="/signup" className="nav-button">
        Signup
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/text-editor/:documentId" element={<Texteditor />} />
          <Route
            path="/"
            element={<img src={logo} alt="Logo" className="logo" />}
          />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
