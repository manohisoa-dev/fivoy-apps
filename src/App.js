import React, { useState } from 'react';
import { PrinterCheck, Clock, ShoppingCart, DollarSign, Menu } from 'lucide-react'; // Remplacer Plus par Menu
import CounterApp from './CounterApp';
import PosterGenerator from './PosterGenerator';
import SalesPage from './modules/sales/SalesPage';
import Footer from "./Footer";
import ExpensesPage from "./modules/expenses/ExpensesPage";

function App() {
  const [currentApp, setCurrentApp] = useState('counter');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="App">
      {/* Navigation entre les apps */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span>Fivoy </span>
            <span class="hidden lg:block">Services Imerintsiatosika</span>
          </h1>
          <button 
            className="lg:hidden text-white" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" /> {/* Menu hamburger avec trois lignes */}
          </button>
          <nav className={`lg:flex gap-4 ${isMenuOpen ? 'block' : 'hidden'} lg:block justify-center`}>
            <button
              onClick={() => setCurrentApp('counter')}
              className={`flex w-full items-center px-4 py-2 mb-1 rounded ${
                currentApp === 'counter' 
                  ? 'bg-violet-600' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <Clock className="w-4 h-4 text-white-300 mr-2" /> Compteur
            </button>

            <button
              onClick={() => setCurrentApp('sales')}
              className={`flex w-full items-center px-4 py-2 mb-1 rounded ${
                currentApp === 'sales'
                  ? 'bg-violet-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-white-300 mr-2" /> Ventes
            </button>
            
            <button
              onClick={() => setCurrentApp('expenses')}
              className={`flex w-full items-center px-4 py-2 mb-1 rounded ${
                currentApp === 'expenses' 
                  ? 'bg-violet-600' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <DollarSign className="w-4 h-4 mr-2" /> Dépenses
            </button>

            <button
              onClick={() => setCurrentApp('poster')}
              className={`flex w-full h-12 items-center px-4 py-2 mb-1 rounded ${ // Hauteur fixe de 3rem
                currentApp === 'poster'
                  ? 'bg-violet-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              } whitespace-nowrap`} // Empêche le texte de sauter à la ligne
            >
              <PrinterCheck className="w-4 h-4 text-white-300 mr-2" />
              Posters PDF
            </button>

          </nav>
        </div>
      </div>

      {/* Affichage de l'app sélectionnée */}
      {currentApp === 'counter' && <CounterApp />}
      {currentApp === 'sales' && <SalesPage />}
      {currentApp === 'poster' && <PosterGenerator />}
      {currentApp === 'expenses' && <ExpensesPage />}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
