import { Route, Routes } from 'react-router';

import { AlbumPage } from './pages/AlbumPage';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { AuthModal } from './components/ui/AuthModal';
import { ErrorPage } from './pages/ErrorPage';
import { HomePage } from './pages/HomePage/HomePage';
import { SearchResults } from './pages/SearchResults';
import './App.scss';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/albums/:slug" element={<AlbumPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/library" element={<AccountPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <AuthModal />
    </>
  );
}

export default App;
