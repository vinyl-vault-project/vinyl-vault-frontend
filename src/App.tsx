import { Route, Routes } from 'react-router';

import { HomePage } from './pages/HomePage/HomePage';
import './App.scss';

function NotFoundPage() {
  return (
    <main className="home-page home-page--not-found">
      <section className="home-page__container home-page__status">
        <h1>Page not found</h1>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
