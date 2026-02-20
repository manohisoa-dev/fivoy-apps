import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

const DailyReportModal = ({ onClose, selectedDate, onDateChange }) => {
  const [reportData, setReportData] = useState({
    sales: [],
    expenses: [],
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    loading: true
  });

  const loadDailyReport = async (date) => {
    setReportData(prev => ({ ...prev, loading: true }));
    
    try {
      // Charger les ventes du jour avec leurs items
      const { data: ventesData, error: ventesError } = await supabase
        .from("ventes")
        .select(`
          *,
          vente_items (
            id,
            article_nom,
            quantite,
            prix_unitaire,
            total_ligne
          )
        `)
        .eq("date", date)
        .order("created_at", { ascending: false });

      // Charger les dépenses du jour
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (ventesError || expensesError) {
        console.error("Erreur:", ventesError || expensesError);
        return;
      }

      const ventes = ventesData || [];
      const expenses = expensesData || [];

      // Calculer le total des ventes
      const totalSales = ventes.reduce((sum, vente) => {
        return sum + Number(vente.total);
      }, 0);

      // Calculer le total des dépenses
      const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);

      const profit = totalSales - totalExpenses;

      // Transformer les données pour l'affichage
      const salesForDisplay = [];
      ventes.forEach(vente => {
        if (vente.vente_items && vente.vente_items.length > 0) {
          vente.vente_items.forEach(item => {
            salesForDisplay.push({
              id: item.id,
              product_name: item.article_nom,
              quantity: item.quantite,
              unit_price: item.prix_unitaire,
              total: item.total_ligne,
              vente_id: vente.id,
              client_nom: vente.client_nom,
              mode_paiement: vente.mode_paiement,
              notes: vente.notes
            });
          });
        } else {
          // Si pas d'items, afficher la vente elle-même
          salesForDisplay.push({
            id: vente.id,
            product_name: 'Vente générale',
            quantity: 1,
            unit_price: vente.total,
            total: vente.total,
            vente_id: vente.id,
            client_nom: vente.client_nom,
            mode_paiement: vente.mode_paiement,
            notes: vente.notes
          });
        }
      });

      setReportData({
        sales: salesForDisplay,
        expenses,
        totalSales,
        totalExpenses,
        profit,
        loading: false
      });

    } catch (error) {
      console.error("Erreur lors du chargement du rapport:", error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadDailyReport(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    onDateChange(newDate);
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("fr-FR") + " Ar";
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return "text-green-600";
    if (profit < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getProfitIcon = (profit) => {
    if (profit > 0) return <TrendingUp className="w-5 h-5" />;
    if (profit < 0) return <TrendingDown className="w-5 h-5" />;
    return <DollarSign className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Rapport journalier</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Sélecteur de date */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Date du rapport</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {reportData.loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Chargement du rapport...</p>
            </div>
          ) : (
            <>
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Ventes</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.totalSales)}
                  </p>
                  <p className="text-sm text-green-700">
                    {reportData.sales.length} transaction(s)
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Dépenses</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.totalExpenses)}
                  </p>
                  <p className="text-sm text-red-700">
                    {reportData.expenses.length} dépense(s)
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  reportData.profit >= 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getProfitIcon(reportData.profit)}
                    <span className="font-medium">Bénéfice</span>
                  </div>
                  <p className={`text-2xl font-bold ${getProfitColor(reportData.profit)}`}>
                    {formatCurrency(reportData.profit)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reportData.profit >= 0 ? 'Profitable' : 'Déficitaire'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Détail des ventes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-700">
                    Ventes du jour
                  </h3>
                  {reportData.sales.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {reportData.sales.map((sale) => (
                        <div key={sale.id} className="bg-green-50 p-3 rounded border border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{sale.product_name}</p>
                              <p className="text-sm text-gray-600">
                                {sale.quantity} × {formatCurrency(sale.unit_price)}
                              </p>
                              {sale.client_nom && (
                                <p className="text-xs text-blue-600">Client: {sale.client_nom}</p>
                              )}
                              {sale.mode_paiement && (
                                <p className="text-xs text-gray-500">Paiement: {sale.mode_paiement}</p>
                              )}
                              {sale.notes && (
                                <p className="text-xs text-gray-500 mt-1">{sale.notes}</p>
                              )}
                            </div>
                            <p className="font-bold text-green-600">
                              {formatCurrency(sale.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune vente enregistrée</p>
                  )}
                </div>

                {/* Détail des dépenses */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-700">
                    Dépenses du jour
                  </h3>
                  {reportData.expenses.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {reportData.expenses.map((expense) => (
                        <div key={expense.id} className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{expense.category}</p>
                              <p className="text-sm text-gray-600">
                                Payé par: {expense.paid_by}
                              </p>
                              {expense.note && (
                                <p className="text-xs text-gray-500 mt-1">{expense.note}</p>
                              )}
                            </div>
                            <p className="font-bold text-red-600">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune dépense enregistrée</p>
                  )}
                </div>
              </div>

              {/* Analyse */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Analyse</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    • Marge brute : {reportData.totalSales > 0 
                      ? ((reportData.profit / reportData.totalSales) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p>
                    • Ratio dépenses/ventes : {reportData.totalSales > 0 
                      ? ((reportData.totalExpenses / reportData.totalSales) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  {reportData.profit < 0 && (
                    <p className="text-red-600 font-medium">
                      ⚠️ Attention : Les dépenses dépassent les ventes aujourd'hui
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReportModal;