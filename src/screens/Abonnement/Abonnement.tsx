import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CreditCard, Shield, Zap, ArrowRight, TriangleAlert as AlertTriangle } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Gratuit",
    description: "Parfait pour débuter et tester la plateforme. Lorem ipsum dolor sit amet.",
    features: [
      "2 expériences actives",
      "Réservations illimitées",
      "Tableau de bord basique",
      "Support email",
    ],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "Par mois",
    description: "Pour les clubs actifs qui veulent accélérer leurs revenus.",
    features: [
      "Expériences illimitées",
      "Paiements intégrés",
      "Analytiques avancées",
      "Support prioritaire",
      "Badges \"Club Vérifié\"",
    ],
    cta: "Passer au Pro",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    period: "Par mois",
    description: "La solution complète pour les clubs professionnels.",
    features: [
      "Tout du Pro",
      "Mise en avant sur l'accueil",
      "Campagnes marketing automatisées",
      "API & Webhooks",
      "Responsable de compte dédié",
    ],
    cta: "Contactez-nous",
    highlight: false,
  },
];

const MOCK_PAYMENTS = [
  { id: "pm_1", brand: "visa", last4: "4242", expiry: "12/26" },
  { id: "pm_2", brand: "mastercard", last4: "8888", expiry: "06/25" },
];

export const Abonnement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [paymentMethods, setPaymentMethods] = useState(MOCK_PAYMENTS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleChangePlan = async () => {
    if (selectedPlan === currentPlan) {
      setMessage("Vous êtes déjà sur ce plan.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setCurrentPlan(selectedPlan);
      setMessage("Plan mis à jour avec succès !");
      setLoading(false);
    }, 1000);
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <ClubTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Abonnement & Facturation</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Abonnement</h1>
              <p className="text-gray-600">Gérez votre plan, vos moyens de paiement et votre historique de facturation.</p>
            </div>

            {message && (
              <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.includes("déjà") || message.includes("erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            {/* Current Plan */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Plan actuel</p>
                  <h2 className="text-2xl font-black text-gray-900">
                    {PLANS.find((p) => p.id === currentPlan)?.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {PLANS.find((p) => p.id === currentPlan)?.period}
                    </span>
                  </h2>
                </div>
                <div className="bg-[#f0faf6] text-[#00694c] px-4 py-2 rounded-full text-sm font-bold">
                  Actif
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {PLANS.find((p) => p.id === currentPlan)?.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-[#00694c]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-2xl border p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-[#00694c] bg-[#f0faf6]"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00694c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Recommandé
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-black text-xl text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-black text-4xl text-gray-900">{plan.price}€</span>
                    <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-[#00694c] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      selectedPlan === plan.id
                        ? "bg-[#00694c] text-white hover:bg-[#005a40]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-4 mb-12">
              <button
                onClick={() => setSelectedPlan(currentPlan)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlan}
                disabled={loading || selectedPlan === currentPlan}
                className="px-6 py-2.5 rounded-xl bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? "Mise à jour..." : "Confirmer le changement"}
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Moyens de Paiement</h3>
                    <p className="text-sm text-gray-500">Cartes enregistrées pour vos paiements récurrents.</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <CreditCard size={16} />
                    Ajouter
                  </button>
                </div>
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune carte enregistrée.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex-wrap">
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">{p.brand}</div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">•••• {p.last4}</p>
                          <p className="text-xs text-gray-500">Expire {p.expiry}</p>
                        </div>
                        <button
                          onClick={() => handleRemovePayment(p.id)}
                          className="ml-auto p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <AlertTriangle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Security */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Sécurité & Conformité</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Paiements sécurisés par Stripe</p>
                      <p className="text-xs text-gray-500">PCI DSS Level 1 certifié</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Facturation automatique</p>
                      <p className="text-xs text-gray-500">Prélèvement le 1er de chaque mois</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Annulation sans frais</p>
                      <p className="text-xs text-gray-500">Jusqu'à 7 jours avant le renouvellement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
