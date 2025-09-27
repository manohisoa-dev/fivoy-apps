import React, { useState } from "react";

// Composant ExpenseForm intégré
const ExpenseForm = ({ onSave, onCancel, initialExpense }) => {
  const categories = [
    "Essence",
    "Repas midi",
    "Dîner",
    "Goûter enfants",
    "Main d'œuvre",
    "Pièces cyclo",
    "Divers",
  ];

  const [expense, setExpense] = useState(
    initialExpense || {
      category: "",
      amount: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expense.category.trim()) {
      alert("Veuillez sélectionner une catégorie !");
      return;
    }
    
    if (!expense.amount || isNaN(Number(expense.amount)) || Number(expense.amount) <= 0) {
      alert("Veuillez saisir un montant valide !");
      return;
    }

    if (!expense.date) {
      alert("Veuillez sélectionner une date !");
      return;
    }

    if (typeof onSave !== 'function') {
      console.error('onSave n\'est pas une fonction:', onSave);
      alert("Erreur de configuration du formulaire");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...expense,
        amount: Number(expense.amount),
      });
      
      setExpense({
        category: "",
        amount: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
    setExpense({
      category: "",
      amount: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Catégorie *</label>
        <select
          name="category"
          value={expense.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={isSubmitting}
        >
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Montant (Ar) *</label>
        <input
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 5000"
          min="0"
          step="1"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date *</label>
        <input
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={expense.notes}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Ex : payé pour les ouvriers, repas du jour..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;