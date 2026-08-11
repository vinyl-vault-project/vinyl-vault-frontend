import { Route, Routes } from 'react-router';

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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
