import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CreditCard, Clock, MapPin, Shield, Bell } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exp, setExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/fan/login");
      return;
    }
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("club_experiences")
        .select("*, clubs(name, logo_url)")
        .eq("id", id)
        .single();
      if (data) {
        setExp({
          id: data.id,
          title: data.title,
          club: data.clubs?.name || "Club",
          price: data.price || 0,
          date: data.date || "Date à définir",
          time: data.time || "Heure à définir",
          location: data.location || "Paris",
          address: data.address || "",
          image: data.images?.[0] || data.image_url || DEFAULT_IMAGE,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id, user, navigate]);

  const formatCard = (val: string) => {
    return val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1 / $2").slice(0, 7);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !exp || !user) return;
    setSubmitting(true);

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        customer_email: user.email,
        experience_id: exp.id,
        experience_name: exp.title,
        date_time: new Date(`${exp.date}T${exp.time}:00`).toISOString(),
        price: exp.price,
        status: "confirmed",
        payment_status: "paid",
        club_name: exp.club,
      })
      .select()
      .single();

    if (error) {
      console.error("Booking error:", error);
      setSubmitting(false);
      return;
    }

    navigate(`/confirmation/${booking.id}`);
  };

  const priceHT = exp ? Math.round(exp.price / 1.2 * 100) / 100 : 0;
  const tva = exp ? Math.round((exp.price - priceHT) * 100) / 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <p className="text-gray-500">Expérience non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/">
            <span className="font-black text-[#00694c] text-xl tracking-tight">SPORENA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-[#00694c] border-b-2 border-[#00694c] pb-0.5">Catégories</Link>
            <Link to="#" className="text-sm font-medium text-gray-700 hover:text-[#00694c]">Aide</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/fan/dashboard" className="text-sm font-medium text-gray-700 hover:text-[#00694c]">Mon espace</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-1">Étape 2 sur 3</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900">Finaliser la réservation</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield size={16} />
              <span>Sécurisé par Stripe</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
            <div className="h-full bg-[#00694c] rounded-full" style={{ width: "66%" }} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#00694c] text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h2 className="font-bold text-gray-900">Confirmation du créneau</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <img src={exp.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#00694c] text-sm mb-1">{exp.title}</p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{exp.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>{exp.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#00694c] text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h2 className="font-bold text-gray-900">Paiement Sécurisé</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button type="button" className="border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:border-[#00694c] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    Apple Pay
                  </button>
                  <button type="button" className="border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:border-[#00694c] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    Google Pay
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Ou par carte bancaire</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Numéro de carte</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#00694c] transition-colors">
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        className="bg-transparent text-sm outline-none flex-1 text-gray-800 placeholder-gray-300"
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                      />
                      <CreditCard size={16} className="text-gray-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Expiration</label>
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors placeholder-gray-300"
                        placeholder="MM / AA"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">CVC</label>
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors placeholder-gray-300"
                        placeholder="123"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Adresse de facturation</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors placeholder-gray-300"
                      placeholder="Rue, Ville, Code Postal"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-5">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 cursor-pointer flex items-center justify-center transition-colors ${agreed ? "bg-[#00694c] border-[#00694c]" : "border-gray-300"}`}
                  >
                    {agreed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    J'accepte les{" "}
                    <Link to="#" className="text-[#00694c] underline">Conditions Générales d'Utilisation</Link>
                    {" "}et la politique de confidentialité de SPORENA.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-[#eef2ff] rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Récapitulatif de la commande</h3>
                <div className="flex flex-col gap-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix HT</span>
                    <span className="text-gray-800 font-medium">{priceHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA 20%</span>
                    <span className="text-gray-800 font-medium">{tva.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission service 0%</span>
                    <span className="text-[#00694c] font-semibold">Inclus</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">Total TTC</span>
                    <span className="font-black text-3xl text-gray-900">{exp.price.toFixed(2)} €</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">Paiement sécurisé</p>
                </div>
                <button
                  type="submit"
                  disabled={!agreed || submitting}
                  className="w-full bg-[#00694c] hover:bg-[#005a40] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Shield size={16} />
                  {submitting ? "Traitement..." : `Payer ${exp.price.toFixed(2)} €`}
                </button>
                <div className="flex items-center gap-2 mt-3 justify-center">
                  <Shield size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Annulation gratuite jusqu'à 24h avant</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={16} className="text-orange-500" />
                  <span className="font-bold text-orange-700 text-sm">Dernières places !</span>
                </div>
                <p className="text-xs text-orange-600 leading-relaxed">
                  Cette expérience est très demandée pour ce créneau. Finalisez votre commande pour garantir votre place.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};
