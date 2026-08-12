import { Route, Routes } from 'react-router';

import { AlbumPage } from './pages/AlbumPage';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { HomePage } from './pages/HomePage/HomePage';
import { SearchResults } from './pages/SearchResults';
import './App.scss';

function NotFoundPage() {
  return (
    <main className="app-not-found">
      <section className="app-container app-not-found__status">
        <h1>Page not found</h1>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/albums/:slug" element={<AlbumPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/account/library" element={<AccountPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
