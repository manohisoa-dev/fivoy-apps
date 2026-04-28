import { useState, useEffect, useContext } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, BarChart3, Filter, RotateCcw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];
const formatHour = (hour) => `${String(hour).padStart(2, "0")}h`;

const DashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { user, loading: authLoading } = useContext(AuthContext);

  const getDashboardParams = () => {
    if (customStartDate && customEndDate) {
      return {
        period: "custom",
        start_date: customStartDate,
        end_date: customEndDate,
      };
    }

    return { period };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/dashboard/stats", {
        params: getDashboardParams(),
      });

      setDashboardStats(response.data);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      Swal.fire({
        title: "Erreur chargement dashboard",
        text: "Une erreur s'est produite lors du chargement des donnees dans le dashboard",
        icon: "warning",
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, period, customStartDate, customEndDate]);

  const resetFilters = () => {
    setPeriod("month");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const summary = dashboardStats?.summary || {};
  const totalVentes = Number(summary.total_sales || 0);
  const totalDepenses = Number(summary.total_expenses || 0);
  const benefice = Number(summary.net_profit || 0);
  const nombreVentes = Number(summary.sales_count || 0);
  const nombreDepenses = Number(summary.expenses_count || 0);
  const totalVentesToday = Number(summary.today_sales || 0);
  const totalDepensesToday = Number(summary.today_expenses || 0);
  const trendData = dashboardStats?.trend || [];
  const salesByCategoryData = dashboardStats?.sales_by_category || [];
  const expensesCategoryData = dashboardStats?.expenses_by_category || [];
  const salesByHourData = dashboardStats?.sales_by_hour || [];
  const topSalesHours = [...salesByHourData]
    .filter((item) => Number(item.total) > 0)
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des donnees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de vos ventes et depenses</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Periode d'analyse</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
            <button
              onClick={() => setPeriod("day")}
              className={`px-4 py-2 rounded transition-colors ${
                period === "day" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded transition-colors ${
                period === "week" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded transition-colors ${
                period === "month" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-4 py-2 rounded transition-colors ${
                period === "year" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              1 an
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de debut
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setPeriod("custom");
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
                  setPeriod("custom");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Ventes</p>
            <p className="text-2xl font-bold text-gray-800">{totalVentes.toLocaleString("fr-FR")} Ar</p>
            <p className="text-xs text-gray-500 mt-1">{nombreVentes} vente(s)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Depenses</p>
            <p className="text-2xl font-bold text-gray-800">{totalDepenses.toLocaleString("fr-FR")} Ar</p>
            <p className="text-xs text-gray-500 mt-1">{nombreDepenses} depense(s)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded ${benefice >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
                <BarChart3 className={`w-6 h-6 ${benefice >= 0 ? "text-primary" : "text-orange-600"}`} />
              </div>
              {benefice >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Benefice Net</p>
            <p className={`text-2xl font-bold ${benefice >= 0 ? "text-green-600" : "text-red-600"}`}>
              {benefice.toLocaleString("fr-FR")} Ar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {benefice >= 0 ? "Rentable" : "En deficit"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-green-600 font-semibold">{totalVentesToday.toLocaleString("fr-FR")} Ar</span>
                <span className="text-gray-500 text-xs ml-1">ventes</span>
              </p>
              <p className="text-sm">
                <span className="text-red-600 font-semibold">{totalDepensesToday.toLocaleString("fr-FR")} Ar</span>
                <span className="text-gray-500 text-xs ml-1">depenses</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolution Ventes vs Depenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => `${Number(value).toLocaleString("fr-FR")} Ar`}
                labelFormatter={(date) => new Date(date).toLocaleDateString("fr-FR")}
              />
              <Legend />
              <Line type="monotone" dataKey="ventes" stroke="#10B981" strokeWidth={2} name="Ventes" dot={{ fill: "#10B981" }} />
              <Line type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} name="Depenses" dot={{ fill: "#EF4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Heures de forte activite
            </h2>
            {topSalesHours.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topSalesHours.map((item) => (
                  <span key={item.hour} className="px-3 py-1 bg-blue-50 text-primary text-sm font-medium rounded">
                    {formatHour(item.hour)}: {Number(item.total)} vente(s)
                  </span>
                ))}
              </div>
            )}
          </div>
          {salesByHourData.some((item) => Number(item.total) > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesByHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={formatHour} interval={1} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${Number(value)} vente(s)`, "Ventes"]}
                  labelFormatter={(hour) => formatHour(hour)}
                />
                <Bar dataKey="total" fill="#3B82F6" name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune vente sur la periode selectionnee</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Ventes par Categorie
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
                        const shortName = name.length > 20 ? name.substring(0, 17) + "..." : name;
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
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} Ar`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {salesByCategoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="truncate" title={item.name}>{item.name}</span>
                      </div>
                      <span className="font-semibold ml-2 flex-shrink-0">{Number(item.value).toLocaleString("fr-FR")} Ar</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnee disponible</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              Depenses par Categorie
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
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} Ar`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {expensesCategoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{Number(item.value).toLocaleString("fr-FR")} Ar</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnee disponible</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparaison Journaliere
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => `${Number(value).toLocaleString("fr-FR")} Ar`}
                labelFormatter={(date) => new Date(date).toLocaleDateString("fr-FR")}
              />
              <Legend />
              <Bar dataKey="ventes" fill="#10B981" name="Ventes" />
              <Bar dataKey="depenses" fill="#EF4444" name="Depenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
