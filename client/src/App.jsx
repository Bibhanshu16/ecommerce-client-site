import React, { useState, useEffect } from 'react';
import Loader from "./Components/Loader";
import Navbar from "./Components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import DailyHeader from "./Components/DailyHeader";
import Contactheader from './Components/Contactheader';
import SearchResults from './Components/SearchResults';
import UserPortal from "./Components/UserPortal";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePageLoad = () => setLoading(false);

    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
      return () => window.removeEventListener("load", handlePageLoad);
    }
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Router>
      {/* These are outside Routes but inside Router */}
      <DailyHeader />
      <Contactheader />
      <Navbar />
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cart' element={<Cart />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path='/userPortal' element={<UserPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
