import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, BarChart3, Filter, RotateCcw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/api";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Swal from 'sweetalert2';  

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const DashboardPage = () => {
  const [ventes, setVentes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ventesItems, setVentesItems] = useState([]);

  const safeVentes = Array.isArray(ventes) ? ventes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  // Filtres
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { user, loading: authLoading } = useContext(AuthContext);

  console.log("authLoading:", authLoading);
  console.log("user:", user);


  // Simulation de données (remplacez par vos appels Supabase réels)
  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    console.log("loadData called");
    try {
      setLoading(true);

      const [salesRes, saleItemsRes, expensesRes] = await Promise.all([
        api.get("/sales"),
        api.get("/sale-items"),
        api.get("/expenses"),
      ]);

      const ventesData = Array.isArray(salesRes.data)
        ? salesRes.data
        : salesRes.data.data;

      const expensesData = Array.isArray(expensesRes.data)
        ? expensesRes.data
        : expensesRes.data.data;

      const itemsData = Array.isArray(saleItemsRes.data)
        ? saleItemsRes.data
        : saleItemsRes.data.data;

      setVentes(ventesData || []);
      setExpenses(expensesData || []);
      setVentesItems(itemsData || []);

    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      Swal.fire({
        title: "Erreur chargement dashboard",
        text: `Une erreur s'est produite lors du chargement des données dans le dashboard`,
        icon: "warning",
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };


  const resetFilters = () => {
    setPeriod('month');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Générateur de données de démo
  const generateDemoData = (type, days) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      if (type === 'ventes') {
        const count = Math.floor(Math.random() * 10) + 5;
        for (let j = 0; j < count; j++) {
          data.push({
            id: `v${i}_${j}`,
            date: dateStr,
            total: Math.floor(Math.random() * 50000) + 10000,
            client_nom: `Client ${j + 1}`,
            mode_paiement: Math.random() > 0.5 ? 'Espèces' : 'Carte',
            created_at: date.toISOString()
          });
        }
      } else {
        const count = Math.floor(Math.random() * 5) + 2;
        const categories = [
            "Approvisionnement stock",
            "Avance sur salaire",
            "Dîner",
            "Divers",
            "Essence",
            "Goûter enfants",
            "Main d'œuvre",
            "Pièces cyclo",
            "Randry",
            "Repas midi"
        ];
        for (let j = 0; j < count; j++) {
          data.push({
            id: `e${i}_${j}`,
            date: dateStr,
            amount: Math.floor(Math.random() * 30000) + 5000,
            category: categories[Math.floor(Math.random() * categories.length)],
            created_at: date.toISOString()
          });
        }
      }
    }
    return data;
  };

  // Filtrage des données selon la période
  const getFilteredData = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit
    
    if (customStartDate && customEndDate) {
      // Comparaison directe des chaînes de dates (YYYY-MM-DD)
      return {
        ventes: safeVentes.filter(v => v.date >= customStartDate && v.date <= customEndDate),
        expenses: safeExpenses.filter(e => e.date >= customStartDate && e.date <= customEndDate)
      };
    }
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    switch(period) {
      case 'day':
        // Aujourd'hui seulement
        const todayStr = now.toISOString().slice(0, 10);
        return {
          ventes: safeVentes.filter(v => v.date === todayStr),
          expenses: safeExpenses.filter(e => e.date === todayStr)
        };
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Convertir startDate en format YYYY-MM-DD pour comparaison
    const startDateStr = startDate.toISOString().slice(0, 10);
    
    return {
      ventes: safeVentes.filter(v => v.date >= startDateStr),
      expenses: safeExpenses.filter(e => e.date >= startDateStr)
    };
  };

  const filteredData = getFilteredData();

  // Calculs des totaux
  const totalVentes = filteredData.ventes.reduce((sum, v) => sum + Number(v.total), 0);
  const totalDepenses = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const benefice = totalVentes - totalDepenses;
  const nombreVentes = filteredData.ventes.length;

  // Ventes du jour
  const today = new Date().toISOString().slice(0, 10);
  const ventesToday = safeVentes.filter(v => v.date === today);
  const totalVentesToday = ventesToday.reduce((sum, v) => sum + Number(v.total), 0);
  const depensesToday = safeExpenses.filter(e => e.date === today);
  const totalDepensesToday = depensesToday.reduce((sum, e) => sum + Number(e.amount), 0);

  // Données pour le graphique de tendance (ventes vs dépenses)
  const getTrendData = () => {
    const grouped = {};
    
    filteredData.ventes.forEach(v => {
      if (!grouped[v.date]) {
        grouped[v.date] = { date: v.date, ventes: 0, depenses: 0 };
      }
      grouped[v.date].ventes += Number(v.total);
    });
    
    filteredData.expenses.forEach(e => {
      if (!grouped[e.date]) {
        grouped[e.date] = { date: e.date, ventes: 0, depenses: 0 };
      }
      grouped[e.date].depenses += Number(e.amount);
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const trendData = getTrendData();

  // Répartition des modes de paiement
  const getPaymentMethodData = () => {
    const methods = {};
    filteredData.ventes.forEach(v => {
      const method = v.mode_paiement || 'Non spécifié';
      methods[method] = (methods[method] || 0) + Number(v.total);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  // Répartition des ventes par catégories d'articles
  const getSalesByCategoryData = () => {
    const categories = {};
    
    // Obtenir les IDs des ventes filtrées
    const venteIds = filteredData.ventes.map(v => v.id);
    
    // Filtrer les items qui correspondent aux ventes filtrées
    const filteredItems = ventesItems.filter(item => venteIds.includes(item.vente_id));
    
    // Grouper par nom d'article
    filteredItems.forEach(item => {
      const articleName = item.article_nom || 'Non catégorisé';
      const total = Number(item.quantite || 0) * Number(item.prix_unitaire || 0);
      categories[articleName] = (categories[articleName] || 0) + total;
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Répartition des dépenses par catégorie
  const getExpensesCategoryData = () => {
    const categories = {};
    filteredData.expenses.forEach(e => {
      const cat = e.category || 'Non catégorisé';
      categories[cat] = (categories[cat] || 0) + Number(e.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const paymentMethodData = getPaymentMethodData();
  const expensesCategoryData = getExpensesCategoryData();
  const salesByCategoryData = getSalesByCategoryData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }
    
  return ( 
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de vos ventes et dépenses</p>
        </div>

        {/* Filtres de période */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Période d'analyse</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
            <button
              onClick={() => setPeriod('day')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded transition-colors ${
                period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              1 an
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setPeriod('custom');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setPeriod('custom');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Ventes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Ventes</p>
            <p className="text-2xl font-bold text-gray-800">{totalVentes.toLocaleString('fr-FR')} Ar</p>
            <p className="text-xs text-gray-500 mt-1">{nombreVentes} vente(s)</p>
          </div>

          {/* Total Dépenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Dépenses</p>
            <p className="text-2xl font-bold text-gray-800">{totalDepenses.toLocaleString('fr-FR')} Ar</p>
            <p className="text-xs text-gray-500 mt-1">{filteredData.expenses.length} dépense(s)</p>
          </div>

          {/* Bénéfice */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded ${benefice >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <BarChart3 className={`w-6 h-6 ${benefice >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              {benefice >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Bénéfice Net</p>
            <p className={`text-2xl font-bold ${benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {benefice.toLocaleString('fr-FR')} Ar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {benefice >= 0 ? 'Rentable' : 'En déficit'}
            </p>
          </div>

          {/* Aujourd'hui */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-green-600 font-semibold">{totalVentesToday.toLocaleString('fr-FR')} Ar</span>
                <span className="text-gray-500 text-xs ml-1">ventes</span>
              </p>
              <p className="text-sm">
                <span className="text-red-600 font-semibold">{totalDepensesToday.toLocaleString('fr-FR')} Ar</span>
                <span className="text-gray-500 text-xs ml-1">dépenses</span>
              </p>
            </div>
          </div>
        </div>

        {/* Graphique principal - Évolution Ventes vs Dépenses */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Évolution Ventes vs Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => `${Number(value).toLocaleString('fr-FR')} Ar`}
                labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ventes" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Ventes"
                dot={{ fill: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="depenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Dépenses"
                dot={{ fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphiques de répartition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ventes par Catégorie d'Articles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Ventes par Catégorie
            </h2>
            {salesByCategoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={salesByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // Tronquer le nom si trop long
                        const shortName = name.length > 20 ? name.substring(0, 17) + '...' : name;
                        return `${shortName} ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} Ar`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {salesByCategoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="truncate" title={item.name}>{item.name}</span>
                      </div>
                      <span className="font-semibold ml-2 flex-shrink-0">{item.value.toLocaleString('fr-FR')} Ar</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
            )}
          </div>

          {/* Répartition des dépenses par catégorie */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              Dépenses par Catégorie
            </h2>
            {expensesCategoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expensesCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} Ar`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {expensesCategoryData
                    .sort((a, b) => b.value - a.value)
                    .map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value.toLocaleString('fr-FR')} Ar</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Graphique à barres comparatif */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Comparaison Journalière
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => `${Number(value).toLocaleString('fr-FR')} Ar`}
                labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
              />
              <Legend />
              <Bar dataKey="ventes" fill="#10B981" name="Ventes" />
              <Bar dataKey="depenses" fill="#EF4444" name="Dépenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;