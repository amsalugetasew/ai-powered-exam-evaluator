import React from 'react';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Home />
      </main>
    </div>
  );
}

export default App;
