import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import Login from './components/Login';
import Upload from './components/Upload';
import Approval from './components/Approval';
import Edit from './components/Edit';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app-container">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/upload" />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify/:verificationToken" element={<VerifyEmail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/approval/:postId" element={<Approval />} />
                  <Route path="/edit/:postId" element={<Edit />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
