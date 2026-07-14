import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import SignupPage from './pages/SignupPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import RecoverAccountPage from './pages/RecoverAccountPage';
import PasswordResetPage from './pages/PasswordResetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<EmailConfirmationPage />} />
        <Route path="/recover-account" element={<RecoverAccountPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
