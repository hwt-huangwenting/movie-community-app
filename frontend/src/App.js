import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Popular from './pages/Popular';
import NotFound from './pages/NotFound';
import MovieUpload from './pages/MovieUpload';
import MovieDetail from './pages/MovieDetail';
import Login from './auth/Login';
import Register from './auth/Register';
import Category from './pages/Category';
import MyCollections from './pages/MyCollections';
import { AuthProvider } from './auth/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/upload" element={<MovieUpload />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/category" element={<Category />} />
              <Route path="/my-collections" element={<MyCollections />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

