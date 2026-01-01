import { useState, useEffect } from "react";
import { PrinterCheck, Clock, ShoppingCart, DollarSign, Menu, ClipboardList, Film } from 'lucide-react';
import LibraryPage from './modules/library/LibraryPage';
import CounterApp from './CounterApp';
import PosterGenerator from './PosterGenerator';
import SalesPage from './modules/sales/SalesPage';
import ExpensesPage from './modules/expenses/ExpensesPage';
import Orders from './modules/orders/Orders';
import Footer from "./Footer";
import LoadingOverlay from './components/LoadingOverlay';
import { supabase } from './lib/supabaseClient';
import WatermarkStudio from './WatermarkStudio.jsx';

function App() {
  const [currentApp, setCurrentApp] = useState('counter');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  useEffect(() => {
    // Charger le compteur initial
    loadPendingOrdersCount();

    // Configuration du canal Realtime
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📥 Changement détecté dans orders:', payload);
          
          // Gérer les différents types d'événements
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('🔄 Statut de la souscription Realtime:', status);
      });

    // Nettoyage au démontage
    return () => {
      console.log('🧹 Nettoyage du canal Realtime');
      supabase.removeChannel(channel);
    };
  }, []);

  // Fonction pour gérer les mises à jour temps réel
  const handleRealtimeUpdate = (payload) => {
    const { eventType, old: oldRecord, new: newRecord } = payload;

    console.log('🔍 Type d\'événement:', eventType);
    console.log('📊 Ancien enregistrement:', oldRecord);
    console.log('📊 Nouvel enregistrement:', newRecord);

    // Déterminer si cela affecte le compteur des commandes en attente
    let shouldReloadCount = false;

    switch (eventType) {
      case 'INSERT':
        // Nouvelle commande ajoutée
        if (newRecord?.status === 'En attente') {
          shouldReloadCount = true;
        }
        break;

      case 'UPDATE':
        // Statut modifié
        const oldStatus = oldRecord?.status;
        const newStatus = newRecord?.status;
        
        // Si le statut change vers ou depuis "En attente"
        if (oldStatus !== newStatus && 
            (oldStatus === 'En attente' || newStatus === 'En attente')) {
          shouldReloadCount = true;
        }
        break;

      case 'DELETE':
        // Commande supprimée
        if (oldRecord?.status === 'En attente') {
          shouldReloadCount = true;
        }
        break;

      default:
        // Pour tout autre cas, recharger par sécurité
        shouldReloadCount = true;
    }

    if (shouldReloadCount) {
      console.log('🔄 Rechargement du compteur nécessaire');
      // Petit délai pour s'assurer que la base de données est à jour
      setTimeout(() => {
        loadPendingOrdersCount();
      }, 100);
    }
  };

  // Fonction pour charger le nombre de commandes en attente
  const loadPendingOrdersCount = async () => {
    if (isLoadingCount) return; // Éviter les appels multiples simultanés

    setIsLoadingCount(true);
    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'En attente');

      if (error) {
        console.error('❌ Erreur en chargeant les commandes:', error);
      } else {
        console.log('✅ Nombre de commandes en attente:', count);
        setPendingOrdersCount(count || 0);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Fonction pour supprimer une commande
  const handleDeleteOrder = async (id) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        // En cas d'erreur, recharger manuellement
        loadPendingOrdersCount();
      }
      // Pas besoin de recharger manuellement, Realtime s'en charge
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      loadPendingOrdersCount(); // Fallback en cas d'erreur
    }
  };

  // Fonction pour mettre à jour le statut d'une commande
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        // En cas d'erreur, recharger manuellement
        loadPendingOrdersCount();
      }
      // Pas besoin de recharger manuellement, Realtime s'en charge
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      loadPendingOrdersCount(); // Fallback en cas d'erreur
    }
  };

  // Fonction pour afficher le bouton de navigation
  const navBtn = (key, label, Icon) => (
    <button
      onClick={() => setCurrentApp(key)}
      className={`flex w-full lg:w-auto items-center px-4 py-2 mb-1 rounded whitespace-nowrap transition-colors duration-200
        ${currentApp === key ? 'bg-violet-600' : 'bg-gray-600 hover:bg-gray-500'}`}
    >
      <Icon className="w-4 h-4 text-white-300 mr-2" />
      {label}
      {key === 'orders' && pendingOrdersCount > 0 && (
        <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs rounded-full transition-all duration-300 ${
          isLoadingCount ? 'animate-pulse' : ''
        }`}>
          {pendingOrdersCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="App">
      {/* Navigation */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span>Fivoy </span>
            <span className="hidden lg:inline">Services Imerintsiatosika</span>
          </h1>

          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Menu */}
          <nav className={`lg:flex gap-4 ${isMenuOpen ? 'block' : 'hidden'} lg:block justify-center`}>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 mt-4 lg:mt-0">
              {navBtn('counter', 'Compteur', Clock)}
              {navBtn('sales', 'Ventes', ShoppingCart)}
              {navBtn('expenses', 'Dépenses', DollarSign)}
              {navBtn('poster', 'Posters PDF', PrinterCheck)}
              {navBtn('orders', 'Commandes', ClipboardList)}
              {navBtn('library', 'Bibliothèque', Film)}
            </div>
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
      {currentApp === 'orders' && (
        <Orders 
          onDeleteOrder={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      {currentApp === 'library' && <LibraryPage />}

      <Footer />
    </div>
  );
}

export default App;