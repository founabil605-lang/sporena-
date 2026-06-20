import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Download, FileText, CreditCard, Sparkles, ArrowUpRight, TrendingUp, Check, X, Save, Plus } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const Abonnement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState("basic");
  const [planEndDate, setPlanEndDate] = useState("");
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newCard, setNewCard] = useState({ brand: "visa", last4: "", expiry: "", type: "card" });
  const [message, setMessage] = useState("");

  const loadData = async () => {
    if (!user?.club_id) return;
    setLoading(true);
    const [clubRes, billingRes, paymentRes] = await Promise.all([
      supabase.from("clubs").select("subscription_plan, created_at").eq("id", user.club_id).single(),
      supabase.from("billing_history").select("*").eq("club_id", user.club_id).order("date", { ascending: false }),
      supabase.from("payment_methods").select("*").eq("club_id", user.club_id).order("is_default", { ascending: false }),
    ]);
    if (clubRes.data) {
      setPlan(clubRes.data.subscription_plan || "basic");
      const created = new Date(clubRes.data.created_at || Date.now());
      const end = new Date(created.getFullYear() + 1, created.getMonth(), created.getDate());
      setPlanEndDate(end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }));
    }
    if (billingRes.data) setBillingHistory(billingRes.data);
    if (paymentRes.data) setPaymentMethods(paymentRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.club_id]);

  const handleChangePlan = async (newPlan: "basic" | "premium") => {
    if (!user?.club_id || plan === newPlan) return;
    await supabase.from("clubs").update({ subscription_plan: newPlan }).eq("id", user.club_id);
    setPlan(newPlan);
    const amount = newPlan === "premium" ? 49 : 0;
    const desc = newPlan === "premium" ? "SPORENA Premium Club - Mensuel" : "SPORENA Basic Plan - Mensuel";
    await supabase.from("billing_history").insert({
      club_id: user.club_id,
      description: desc,
      amount,
      status: "paid",
      date: new Date().toISOString(),
    });
    setMessage(`Vous êtes passé au plan ${newPlan === "premium" ? "Premium Club" : "Basic"} !`);
    setTimeout(() => setMessage(""), 3000);
    loadData();
  };

  const handleAddPayment = async () => {
    if (!user?.club_id || !newCard.last4 || newCard.last4.length !== 4 || !newCard.expiry) {
      setMessage("Veuillez saisir les 4 derniers chiffres et la date d'expiration.");
      return;
    }
    const { data, error } = await supabase.from("payment_methods").insert({
      club_id: user.club_id,
      type: newCard.type,
      brand: newCard.brand,
      last4: newCard.last4,
      expiry: newCard.expiry,
      is_default: paymentMethods.length === 0,
    }).select("*").single();
    if (!error && data) {
      setPaymentMethods([...paymentMethods, data]);
      setShowPaymentModal(false);
      setNewCard({ brand: "visa", last4: "", expiry: "", type: "card" });
      setMessage("Moyen de paiement ajouté !");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(error?.message || "Erreur lors de l'ajout.");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Supprimer ce moyen de paiement ?")) return;
    await supabase.from("payment_methods").delete().eq("id", id);
    setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };
  const statusLabel = (status: string) => {
    switch (status) {
      case "paid": return "Payé";
      case "pending": return "En attente";
      default: return status;
    }
  };

  const defaultPayment = paymentMethods.find((p) => p.is_default) || paymentMethods[0];
  const commissionRate = plan === "premium" ? 8 : 15;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar />
      <div className="flex-1 flex flex-col">
        <ClubTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Membership Management</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Abonnement</h1>
              <p className="text-gray-600">Gérez votre présence sur SPORENA. Optimisez vos commissions et accédez à des outils de marketing exclusifs.</p>
            </div>

            {message && (
              <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.includes("Erreur") || message.includes("Veuillez") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current plan card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Plan Actuel</p>
                <h2 className="font-black text-3xl text-gray-900 mb-2">{plan === "premium" ? "Premium Club" : "Basic"}</h2>
                <p className="text-sm text-gray-500 mb-4">Valide jusqu'au {planEndDate}</p>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Commission</span>
                    <span className="text-sm font-bold text-gray-900">{commissionRate}% par vente</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00694c] rounded-full" style={{ width: `${plan === "premium" ? 30 : 65}%` }} />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Vous utilisez actuellement {plan === "premium" ? "35%" : "65%"} de votre quota de visibilité mensuel.</p>
              </div>

              {/* Basic plan */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Basic</h3>
                <p className="font-black text-3xl text-gray-900 mb-1">0€<span className="text-sm font-normal text-gray-500"> /mois</span></p>
                <div className="space-y-3 mt-6 mb-8">
                  <div className="flex items-center gap-3"><Check size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Listing standard sur la plateforme</span></div>
                  <div className="flex items-center gap-3"><Check size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Commission de 15%</span></div>
                  <div className="flex items-center gap-3"><Check size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Support email 48h</span></div>
                </div>
                <button onClick={() => handleChangePlan("basic")} disabled={plan === "basic" || loading} className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400">
                  {plan === "basic" ? "Plan Actuel" : "Basculer Basic"}
                </button>
              </div>

              {/* Premium plan */}
              <div className="bg-white rounded-2xl border-2 border-[#00694c] p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00694c] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">Recommandé</div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Premium Club</h3>
                <p className="font-black text-3xl text-gray-900 mb-1">49€<span className="text-sm font-normal text-gray-500"> /mois</span></p>
                <div className="space-y-3 mt-6 mb-8">
                  <div className="flex items-center gap-3"><Star size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Boost de visibilité (Top Search)</span></div>
                  <div className="flex items-center gap-3"><TrendingUp size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Commission réduite à 8%</span></div>
                  <div className="flex items-center gap-3"><Sparkles size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Advanced Analytics Dashboard</span></div>
                  <div className="flex items-center gap-3"><ArrowUpRight size={16} className="text-[#00694c]" /><span className="text-sm text-gray-600">Manager dédié 24/7</span></div>
                </div>
                <button onClick={() => handleChangePlan("premium")} disabled={plan === "premium" || loading} className="w-full py-3 rounded-xl bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                  {plan === "premium" ? "Plan Actuel" : "Passer au Premium"}
                </button>
              </div>
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Paiement</h3>
                <button onClick={() => setShowPaymentModal(true)} className="text-[#00694c] text-sm font-semibold hover:underline flex items-center gap-2">
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Aucun moyen de paiement. <button onClick={() => setShowPaymentModal(true)} className="text-[#00694c] font-semibold hover:underline">Ajouter une carte</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">{p.brand}</div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">•••• {p.last4}</p>
                        <p className="text-xs text-gray-500">Expire {p.expiry}</p>
                      </div>
                      {p.is_default && <span className="ml-auto text-xs font-bold text-[#00694c] bg-[#f0faf6] px-3 py-1 rounded-full">Par défaut</span>}
                      <button onClick={() => handleDeletePayment(p.id)} className="ml-2 p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing history */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Historique de Facturation</h3>
                <button className="text-[#00694c] text-sm font-semibold hover:underline flex items-center gap-2">
                  <Download size={16} />
                  Tout exporter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Montant</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Aucun historique de facturation</td>
                      </tr>
                    )}
                    {billingHistory.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-600">{new Date(bill.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="py-4 px-4 text-gray-900">{bill.description}</td>
                        <td className="py-4 px-4 font-semibold text-gray-900">{bill.amount.toFixed(2)} €</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(bill.status)}`}>
                            {statusLabel(bill.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
                            <FileText size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl text-white p-6">
                <h3 className="font-bold text-lg mb-2">Besoin d'un plan Entreprise ?</h3>
                <p className="text-sm text-gray-400 mb-4">Pour les clubs gérant plus de 50 expériences par mois avec des besoins personnalisés.</p>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Nous contacter
                </button>
              </div>
              <div className="bg-[#00694c] rounded-2xl text-white p-6">
                <h3 className="font-bold text-lg mb-2">Offre de parrainage</h3>
                <p className="text-sm text-[#d4f5e9] mb-4">Invitez un autre club et recevez 3 mois de Premium offerts.</p>
                <button className="bg-white text-[#00694c] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Inviter
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Add payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">Ajouter un moyen de paiement</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Type</label>
                <select value={newCard.brand} onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#00694c]">
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">4 derniers chiffres</label>
                <input value={newCard.last4} onChange={(e) => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c]" placeholder="4242" maxLength={4} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Date d'expiration</label>
                <input value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c]" placeholder="MM/YY" />
              </div>
            </div>
            <button onClick={handleAddPayment} className="w-full bg-[#00694c] text-white font-semibold py-3 rounded-xl hover:bg-[#005a40] transition-colors flex items-center justify-center gap-2">
              <Save size={16} />
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
