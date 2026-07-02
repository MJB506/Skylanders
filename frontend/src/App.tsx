import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;