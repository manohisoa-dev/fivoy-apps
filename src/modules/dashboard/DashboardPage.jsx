import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, BarChart3, Filter, RotateCcw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { supabase } from "../../lib/supabaseClient";

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const DashboardPage = () => {
    const DASHBOARD_PIN = "855217584056";
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState("");

  const [ventes, setVentes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Simulation de données (remplacez par vos appels Supabase réels)
  useEffect(() => {
    const unlocked = sessionStorage.getItem("dashboard_unlocked");
    setIsUnlocked(unlocked === "true");
    
    loadData();
  }, []);

    const unlockDashboard = () => {
        if (pin === DASHBOARD_PIN) {
            sessionStorage.setItem("dashboard_unlocked", "true");
            setIsUnlocked(true);
        } else {
            alert("Code incorrect");
        }
    };


  const loadData = async () => {
    try {
        setLoading(true);
        
        // Charger TOUTES les ventes (pas de limite)
        let allVentes = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;
        
        console.log('🔄 Début du chargement des ventes...');
        
        while (hasMore) {
        const { data: batch, error } = await supabase
            .from('ventes')
            .select('*')
            .order('date', { ascending: false })
            .range(from, from + batchSize - 1);
        
        if (error) {
            console.error('❌ Erreur ventes:', error);
            throw error;
        }
        
        if (batch && batch.length > 0) {
            allVentes = [...allVentes, ...batch];
            from += batchSize;
            console.log(`📦 Chargé ${allVentes.length} ventes...`);
            
            // Si on a reçu moins que batchSize, c'est la dernière page
            if (batch.length < batchSize) {
            hasMore = false;
            }
        } else {
            hasMore = false;
        }
        }
        
        console.log('✅ === RÉSULTAT VENTES ===');
        console.log('📊 Total ventes chargées:', allVentes.length);
        console.log('🔝 Première vente (récente):', allVentes[0]);
        console.log('🔚 Dernière vente (ancienne):', allVentes[allVentes.length - 1]);
        
        // Calculer le total pour vérification
        const totalVentes = allVentes.reduce((sum, v) => sum + Number(v.total || 0), 0);
        console.log('💰 Total CA de toutes les ventes:', totalVentes.toLocaleString('fr-FR'), 'Ar');
        
        // Charger les dépenses
        console.log('🔄 Chargement des dépenses...');
        const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
        if (expensesError) {
        console.error('❌ Erreur dépenses:', expensesError);
        throw expensesError;
        }
        
        console.log('✅ === RÉSULTAT DÉPENSES ===');
        console.log('📊 Total dépenses chargées:', expensesData?.length || 0);
        
        setVentes(allVentes);
        setExpenses(expensesData || []);
        
        console.log('✅ Chargement terminé avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        alert('Erreur lors du chargement des données. Vérifiez la console pour plus de détails.');
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
        ventes: ventes.filter(v => v.date >= customStartDate && v.date <= customEndDate),
        expenses: expenses.filter(e => e.date >= customStartDate && e.date <= customEndDate)
      };
    }
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    switch(period) {
      case 'day':
        // Aujourd'hui seulement
        const todayStr = now.toISOString().slice(0, 10);
        return {
          ventes: ventes.filter(v => v.date === todayStr),
          expenses: expenses.filter(e => e.date === todayStr)
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
      ventes: ventes.filter(v => v.date >= startDateStr),
      expenses: expenses.filter(e => e.date >= startDateStr)
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
  const ventesToday = ventes.filter(v => v.date === today);
  const totalVentesToday = ventesToday.reduce((sum, v) => sum + Number(v.total), 0);
  const depensesToday = expenses.filter(e => e.date === today);
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

  if (!isUnlocked) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">🔒 Tableau de bord verrouillé</h2>
            <input
            type="password"
            placeholder="Code d'accès"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3"
            />
            <button
            onClick={unlockDashboard}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
            Déverrouiller
            </button>
        </div>
        </div>
    );
    }

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
          {/* Répartition par mode de paiement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Modes de Paiement
            </h2>
            {paymentMethodData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} Ar`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {paymentMethodData.map((item, index) => (
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