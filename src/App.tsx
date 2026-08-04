import { Link, Route, Routes } from 'react-router';

function HomePage() {
  return <h1>Hello world!</h1>;
}

function CatalogPage() {
  return <h1>Catalog</h1>;
}

function NotFoundPage() {
  return <h1>Page not found</h1>;
}

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/catalog">Catalog</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
