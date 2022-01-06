import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";

import { auth } from "./fire.js";

import WelcomePage from "./pages/WelcomePage";
import { CircularProgress } from "@mui/material";
import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./components/NotFound";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(null);

  auth.onAuthStateChanged((user) => {
    return user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  }, []);

  if (isLoggedIn == null) {
    return <LoadingPage />;
  }

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<WelcomePage />} />
            <Route path="/signup" element={<WelcomePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
