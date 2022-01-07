import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";

import { auth } from "./fire.js";

import WelcomePage from "./pages/WelcomePage";
import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./components/NotFound";
import DevPage from "./pages/DevPage";
import LoginPage from "./pages/LoginPage";

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<WelcomePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Navigate to="/"/>} /> 
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
