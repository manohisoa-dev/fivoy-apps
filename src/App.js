import React, { useState } from 'react';
import { PrinterCheck, Clock, ShoppingCart, DollarSign, Menu, ClipboardList } from 'lucide-react';
import CounterApp from './CounterApp';
import PosterGenerator from './PosterGenerator';
import SalesPage from './modules/sales/SalesPage';
import ExpensesPage from './modules/expenses/ExpensesPage';
import Orders from './modules/orders/Orders'; // ⬅️ NEW
import Footer from "./Footer";
import LoadingOverlay from './components/LoadingOverlay';

function App() {
  const [currentApp, setCurrentApp] = useState('counter');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navBtn = (key, label, Icon) => (
    <button
      onClick={() => setCurrentApp(key)}
      className={`flex w-full lg:w-auto items-center px-4 py-2 mb-1 rounded whitespace-nowrap
        ${currentApp === key ? 'bg-violet-600' : 'bg-gray-600 hover:bg-gray-500'}`}
    >
      <Icon className="w-4 h-4 text-white-300 mr-2" /> {label}
    </button>
  );

  return (
    <div className="App">
      {/* Navigation */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span>Fivoy </span>
            <span className="hidden lg:block">Services Imerintsiatosika</span> {/* ⬅️ className fix */}
          </h1>

          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Menu */}
          <nav className={`lg:flex gap-4 ${isMenuOpen ? 'block' : 'hidden'} lg:block justify-center`}>
            {navBtn('counter', 'Compteur', Clock)}
            {navBtn('sales', 'Ventes', ShoppingCart)}
            {navBtn('expenses', 'Dépenses', DollarSign)}
            {navBtn('poster', 'Posters PDF', PrinterCheck)}
            {navBtn('orders', 'Commandes', ClipboardList)} {/* ⬅️ NEW */}
          </nav>
        </div>
      </div>

      {/* Loader global */}
      <LoadingOverlay />

      {/* Contenu */}
      {currentApp === 'counter' && <CounterApp />}
      {currentApp === 'sales' && <SalesPage />}
      {currentApp === 'expenses' && <ExpensesPage />}
      {currentApp === 'poster' && <PosterGenerator />}
      {currentApp === 'orders' && <Orders />}{/* ⬅️ NEW */}

      <Footer />
    </div>
  );
}

export default App;
