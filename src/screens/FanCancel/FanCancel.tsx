import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, MapPin, X, Shield } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanCancel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refund, setRefund] = useState({ percent: 100, amount: 0, serviceFee: 0 });
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || !user?.email) return;
      const { data } = await supabase
        .from("bookings")
        .select("*, club_experiences(*, clubs(name))")
        .eq("id", id)
        .eq("customer_email", user.email)
        .single();
      if (data) {
        setBooking(data);
        const total = data.total_price || 0;
        const serviceFee = 5;
        const now = new Date();
        const eventDate = data.date_time ? new Date(data.date_time) : new Date();
        const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        let refundPercent = 100;
        if (hoursDiff < 24) refundPercent = 0;
        else if (hoursDiff < 72) refundPercent = 50;
        const refundAmount = Math.round((total - serviceFee) * (refundPercent / 100) * 100) / 100;
        setRefund({ percent: refundPercent, amount: refundAmount, serviceFee });
      }
      setLoading(false);
    };
    load();
  }, [id, user?.email]);

  const handleCancel = async () => {
    if (!id) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    navigate("/fan/dashboard");
  };

  const handleKeep = () => {
    navigate("/fan/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Réservation non trouvée</p>
          <button onClick={() => navigate("/fan/dashboard")} className="mt-4 text-[#00694c] font-semibold hover:underline">Retour</button>
        </div>
      </div>
    );
  }

  const exp = booking.club_experiences;
  const hoursDiff = booking.date_time ? (new Date(booking.date_time).getTime() - new Date().getTime()) / (1000 * 60 * 60) : 0;

  const timeline = [
    { label: "> 72h", desc: "Remboursement", percent: 100, active: hoursDiff > 72 },
    { label: "Maintenant (48h)", desc: "Partiel", percent: 50, active: hoursDiff > 24 && hoursDiff <= 72 },
    { label: "24h - 72h", desc: "Remboursement", percent: 50, active: false },
    { label: "< 24h", desc: "Remboursement", percent: 0, active: hoursDiff <= 24 },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <FanTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
            <p className="text-[10px] font-bold text-[#d14405] tracking-widest uppercase mb-2">Annulation de réservation</p>
            <h1 className="text-4xl font-black text-gray-900 mb-4">Voulez-vous vraiment annuler ?</h1>
            <p className="text-gray-600 mb-8 max-w-md">
              Nous sommes désolés de vous voir partir. Veuillez consulter les conditions d'annulation ci-dessous avant de confirmer.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Politique d'annulation */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#f0faf6] flex items-center justify-center">
                      <Shield size={16} className="text-[#00694c]" />
                    </div>
                    <h3 className="font-bold text-gray-900">Politique d'annulation</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {timeline.map((t, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${t.active ? "bg-[#00694c]" : "bg-gray-100"}`}>
                          <div className={`w-3 h-3 rounded-full ${t.active ? "bg-white" : "bg-gray-300"}`} />
                        </div>
                        <p className={`text-[10px] font-bold leading-tight ${t.active ? "text-[#d14405]" : "text-gray-500"}`}>{t.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{t.desc}</p>
                        <p className={`text-sm font-bold mt-1 ${t.active ? "text-[#d14405]" : "text-gray-900"}`}>{t.percent}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <button onClick={handleCancel} className="flex-1 bg-[#d14405] text-white font-bold py-4 rounded-xl hover:bg-[#b83c04] transition-colors flex items-center justify-center gap-2">
                    <X size={18} /> Confirmer l'annulation
                  </button>
                  <button onClick={handleKeep} className="flex-1 bg-[#e8f0fe] text-[#00694c] font-bold py-4 rounded-xl hover:bg-[#d4e4fc] transition-colors">
                    Garder ma réservation
                  </button>
                </div>
              </div>

              {/* Booking summary */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative h-48">
                  <img src={exp?.images?.[0] || exp?.image_url || DEFAULT_IMAGE} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{exp?.category}</p>
                    <h3 className="font-bold text-white text-lg">{exp?.title}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0faf6] flex items-center justify-center">
                      <CalendarDays size={16} className="text-[#00694c]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date & Heure</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {booking.date_time ? new Date(booking.date_time).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}
                        {booking.date_time ? ", " + new Date(booking.date_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0faf6] flex items-center justify-center">
                      <MapPin size={16} className="text-[#00694c]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lieu</p>
                      <p className="font-semibold text-sm text-gray-900">{exp?.location || "-"}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix initial</span>
                      <span className="font-semibold text-gray-900">{booking.total_price?.toFixed(2) || "0.00"} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais de service</span>
                      <span className="font-semibold text-gray-900">{refund.serviceFee.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-[#d14405]">Remboursement</span>
                      <span className="text-[#d14405]">{refund.amount.toFixed(2)} €</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    Les frais de service ne sont pas remboursables. Le remboursement sera crédité sur votre mode de paiement d'origine sous 5 à 10 jours ouvrés.
                  </p>
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
