import { useState, useEffect } from "react";
import { DollarSign, Plus, TrendingDown, Calendar, BarChart3, Filter, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ExpenseForm from "./ExpenseForm";
import { supabase } from "../../lib/supabaseClient";


// Couleurs pour le graphique en secteurs
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showTotalDetails, setShowTotalDetails] = useState(false);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // États pour le filtrage
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erreur lors du chargement:", error);
        return;
      }
      
      const expenseData = data || [];
      setExpenses(expenseData);
      setFilteredExpenses(expenseData);
      
      // Calculer le total général
      const total = expenseData.reduce((sum, expense) => sum + Number(expense.amount), 0);
      setTotalExpenses(total);
      
      // Calculer le total du jour
      const today = new Date().toISOString().slice(0, 10);
      const todayTotal = expenseData
        .filter(expense => expense.date === today)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      setTodayExpenses(todayTotal);
      
    } catch (err) {
      console.error("Erreur réseau:", err);
    }
  };

  // Fonction de filtrage
  const applyFilters = () => {
    let filtered = [...expenses];
    
    // Filtrer par date de début
    if (startDate) {
      filtered = filtered.filter(expense => expense.date >= startDate);
    }
    
    // Filtrer par date de fin
    if (endDate) {
      filtered = filtered.filter(expense => expense.date <= endDate);
    }
    
    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
    setCurrentPage(1); // Reset à la première page
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setFilteredExpenses(expenses);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, selectedCategory, expenses]);

  const handleSaveExpense = async (form) => {
    try {
      const payload = {
        date: form.date,
        category: form.category,
        amount: Number(form.amount),
        note: form.notes || null,
        paid_by: "caisse",
      };

      const { error } = await supabase.from("expenses").insert([payload]);
      
      if (error) {
        console.error("Erreur Supabase:", error);
        alert(`Impossible d'enregistrer la dépense: ${error.message}`);
        return;
      }

      await loadExpenses();
      setShowForm(false);
      alert("Dépense enregistrée avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      alert("Erreur réseau lors de l'enregistrement.");
    }
  };

  const handleCancelExpense = () => {
    setShowForm(false);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    filteredExpenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += Number(expense.amount);
    });
    return categories;
  };

  const getChartData = () => {
    const categoryData = getExpensesByCategory();
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
      formatted: `${Number(value).toLocaleString("fr-FR")} Ar`
    }));
  };

  const getUniqueCategories = () => {
    return [...new Set(expenses.map(expense => expense.category))];
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Fonction pour masquer/afficher le total
  const formatTotal = (amount) => {
    if (showTotalDetails) {
      return amount.toLocaleString("fr-FR");
    }
    if (amount >= 1000000) {
      return `${Math.floor(amount / 1000000)}M+`;
    }
    if (amount >= 100000) {
      return `${Math.floor(amount / 100000)}00K+`;
    }
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000)}0K+`;
    }
    return amount.toLocaleString("fr-FR");
  };

  const expensesByCategory = getExpensesByCategory();
  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Titre principal */}
          <div className="bg-white rounded-lg shadow p-4 md:col-span-1 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dépenses</h1>
              <p className="text-gray-500 text-sm">Suivi des charges</p>
            </div>
          </div>

          {/* Total général */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total général</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-red-600">
                    {formatTotal(totalExpenses)} Ar
                  </p>
                  <button
                    onClick={() => setShowTotalDetails(!showTotalDetails)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showTotalDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Total du jour */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aujourd'hui</p>
                <p className="text-xl font-bold text-orange-600">
                  {todayExpenses.toLocaleString("fr-FR")} Ar
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {filteredExpenses.length} dépense(s) trouvée(s)
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une dépense
          </button>
          
          <button
            onClick={() => setShowDailyReport(true)}
            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Rapport journalier
          </button>
        </div>

        {/* Graphique de répartition par catégorie */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Répartition par catégorie</h2>
          
          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en secteurs */}
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} Ar`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Liste détaillée */}
              <div>
                <h3 className="font-medium mb-3">Détails par catégorie</h3>
                <div className="space-y-3">
                  {Object.entries(expensesByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount], index) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {Number(amount).toLocaleString("fr-FR")} Ar
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée à afficher pour la période sélectionnée
            </div>
          )}
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Nouvelle dépense</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ExpenseForm 
              onSave={handleSaveExpense} 
              onCancel={handleCancelExpense}
            />
          </div>
        )}

        {/* Liste des dépenses avec pagination */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Dépenses ({filteredExpenses.length})
            </h2>
            
            {/* Info pagination */}
            <div className="text-sm text-gray-500">
              Page {currentPage} sur {totalPages}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Catégorie</th>
                  <th className="px-3 py-2 text-right">Montant</th>
                  <th className="px-3 py-2 text-left">Note</th>
                  <th className="px-3 py-2 text-left">Payé par</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">
                      {new Date(e.date).toLocaleDateString("fr-FR")} <br />
                      <span className="text-xs text-gray-500">
                        {new Date(e.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-red-600">
                      {Number(e.amount).toLocaleString("fr-FR")} Ar
                    </td>
                    <td className="px-3 py-2">{e.note || "—"}</td>
                    <td className="px-3 py-2">{e.paid_by || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {currentExpenses.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune dépense trouvée pour cette période</p>
            </div>
          )}
          
          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredExpenses.length)} sur {filteredExpenses.length} résultats
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                
                {/* Numéros de pages */}
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-2 border rounded ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de rapport journalier */}
        {showDailyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Rapport journalier</h3>
                <button
                  onClick={() => setShowDailyReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner une date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                {(() => {
                  const dayExpenses = expenses.filter(e => e.date === selectedDate);
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
                  
                  return (
                    <>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Date sélectionnée</p>
                        <p className="font-semibold">{new Date(selectedDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-600">Total du jour</p>
                        <p className="text-xl font-bold text-blue-800">{dayTotal.toLocaleString('fr-FR')} Ar</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Nombre de dépenses</p>
                        <p className="font-semibold">{dayExpenses.length}</p>
                      </div>
                      
                      {dayExpenses.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Détail des dépenses :</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {dayExpenses.map(expense => (
                              <div key={expense.id} className="text-xs bg-white p-2 rounded border">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{expense.category}</span>
                                  <span className="text-red-600 font-semibold">{Number(expense.amount).toLocaleString('fr-FR')} Ar</span>
                                </div>
                                {expense.note && (
                                  <p className="text-gray-500 mt-1">{expense.note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowDailyReport(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const dayExpenses = expenses.filter(e => e.date === selectedDate);
                    if (dayExpenses.length > 0) {
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + "Date,Catégorie,Montant,Note\n"
                        + dayExpenses.map(e => `${e.date},${e.category},${e.amount},"${e.note || ''}"`).join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `rapport-${selectedDate}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert("Aucune dépense à exporter pour cette date.");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Exporter CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;