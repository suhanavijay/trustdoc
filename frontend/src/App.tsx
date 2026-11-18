import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { IssuerDashboard } from './pages/IssuerDashboard';
import { VerifierPortal } from './pages/VerifierPortal';
import { VerifyById } from './pages/VerifyById';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/issue" element={<IssuerDashboard />} />
            <Route path="/verify" element={<VerifierPortal />} />
            <Route path="/verify/:documentId" element={<VerifyById />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
