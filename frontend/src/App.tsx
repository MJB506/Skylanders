import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import SignupPage from './pages/SignupPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import RecoverAccountPage from './pages/RecoverAccountPage';
import PasswordResetPage from './pages/PasswordResetPage';
import CollectionPage from './pages/CollectionPage';
import WishlistPage from './pages/WishlistPage';
import FriendsPage from './pages/FriendsPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/search" element={<SearchPage />} />
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