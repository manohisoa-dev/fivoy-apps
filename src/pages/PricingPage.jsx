import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Check, Star } from "lucide-react";

const PricingPage = () => {
  const { trialDaysRemaining } = useContext(AuthContext);

  const isExpired = trialDaysRemaining !== null && trialDaysRemaining < 0;

  const plans = [
    {
      name: "Starter",
      price: "39 000 Ar",
      description: "Pour les boutiques en démarrage",
      features: [
        "Gestion des ventes",
        "Gestion des dépenses",
        "Dashboard simple",
        "1 utilisateur",
        "Support email"
      ],
      highlight: false
    },
    {
      name: "Pro",
      price: "79 000 Ar",
      description: "Le choix des boutiques ambitieuses",
      features: [
        "Tout le plan Starter",
        "Générateur Posters PDF",
        "Statistiques avancées",
        "3 utilisateurs",
        "Support prioritaire",
        "Sauvegarde automatique"
      ],
      highlight: true
    },
    {
      name: "Business",
      price: "129 000 Ar",
      description: "Pour les structures organisées",
      features: [
        "Tout le plan Pro",
        "Utilisateurs illimités",
        "Modules futurs inclus",
        "Branding personnalisé",
        "Support premium prioritaire"
      ],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-6">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Choisissez le plan adapté à votre boutique
        </h1>
        <p className="text-gray-300 text-lg">
          Développez votre activité avec une solution professionnelle,
          fiable et évolutive.
        </p>

        {isExpired && (
          <div className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Votre essai est terminé — Choisissez un plan pour continuer
          </div>
        )}
      </div>

      {/* PLANS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-8 shadow-2xl transition transform hover:-translate-y-1 ${
              plan.highlight
                ? "bg-white text-gray-900 scale-105 border-4 border-violet-600"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white text-xs px-4 py-1 rounded-full flex items-center gap-1">
                <Star size={14} /> Le plus populaire
              </div>
            )}

            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-sm mb-6 opacity-80">{plan.description}</p>

            <div className="text-3xl font-extrabold mb-6">
              {plan.price}
              <span className="text-base font-medium opacity-70"> / mois</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.highlight
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              Choisir ce plan
            </button>
          </div>
        ))}

      </div>

      {/* GARANTIE */}
      <div className="max-w-3xl mx-auto text-center mt-20">
        <h3 className="text-xl font-semibold mb-4">
          Garantie 7 jours satisfait ou remboursé
        </h3>
        <p className="text-gray-400">
          Testez Fivoy en toute confiance. Vos données sont sécurisées,
          sauvegardées automatiquement et protégées.
        </p>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-20 space-y-8">
        <h3 className="text-2xl font-bold text-center mb-10">
          Questions fréquentes
        </h3>

        <div>
          <h4 className="font-semibold">Puis-je changer de plan ?</h4>
          <p className="text-gray-400 text-sm mt-1">
            Oui, vous pouvez évoluer vers un plan supérieur à tout moment.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Mes données sont-elles sécurisées ?</h4>
          <p className="text-gray-400 text-sm mt-1">
            Oui, toutes vos données sont sauvegardées et protégées.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Y a-t-il un engagement ?</h4>
          <p className="text-gray-400 text-sm mt-1">
            Non. Vous pouvez arrêter votre abonnement à tout moment.
          </p>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;