import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Plus, MessageSquare, Megaphone, CircleHelp as HelpCircle } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    fillRate: 0,
    avgRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [topExperience, setTopExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experiencesCount, setExperiencesCount] = useState(0);

  useEffect(() => {
    if (!user?.club_id) return;
    const load = async () => {
      const [bookingsResult, expResult] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("club_id", user.club_id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("club_experiences")
          .select("*")
          .eq("club_id", user.club_id)
          .eq("status", "public"),
      ]);

      const bookings = bookingsResult.data || [];
      const experiences = expResult.data || [];
      setExperiencesCount(experiences.length);

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const totalBookings = bookings.length;
      const totalSlots = experiences.reduce((s, e) => s + (e.slots_total || 0), 0);
      const bookedSlots = experiences.reduce((s, e) => s + (e.slots_booked || 0), 0);
      const fillRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
      const avgRating = experiences.length > 0
        ? experiences.reduce((s, e) => s + (e.rating || 0), 0) / experiences.length
        : 0;

      setStats({
        totalRevenue,
        totalBookings,
        fillRate,
        avgRating: Math.round(avgRating * 10) / 10,
      });

      // Fetch recent bookings with experience details
      const recent = bookings.slice(0, 5);
      const experienceIds = recent.map((b) => b.experience_id);
      let expMap: Record<string, any> = {};
      if (experienceIds.length > 0) {
        const { data: exps } = await supabase
          .from("club_experiences")
          .select("id, title")
          .in("id", experienceIds);
        expMap = (exps || []).reduce((acc, e) => ({ ...acc, [e.id]: e }), {});
      }

      setRecentBookings(
        recent.map((b) => ({
          id: b.id,
          client: b.customer_name,
          experience: expMap[b.experience_id]?.title || "Experience",
          date: b.date_time ? new Date(b.date_time).toLocaleDateString("fr-FR") : "-",
          status: b.status === "confirmed" ? "Confirme" : b.status === "pending" ? "En attente" : "Annule",
          amount: `${b.total_price || 0} EUR`,
        }))
      );

      // Top performing experience
      const best = experiences.reduce((best, e) => {
        if (!best || (e.slots_booked || 0) > (best.slots_booked || 0)) return e;
        return best;
      }, null);
      setTopExperience(best);
      setLoading(false);
    };
    load();
  }, [user?.club_id]);

  const statCards = [
    {
      label: "CA Total",
      value: `${stats.totalRevenue.toLocaleString("fr-FR")} EUR`,
      change: "+12.5%",
      icon: "💰",
      color: "bg-green-50",
    },
    {
      label: "Reservations",
      value: `${stats.totalBookings}`,
      change: "+4%",
      icon: "📅",
      color: "bg-blue-50",
    },
    {
      label: "Taux remplissage",
      value: `${stats.fillRate}%`,
      change: "Steady",
      icon: "📊",
      color: "bg-red-50",
    },
    {
      label: "Note moyenne",
      value: `${stats.avgRating || 0} ★`,
      change: "",
      icon: "⭐",
      color: "bg-yellow-50",
    },
  ];

  const clubName = user?.club_name || "Mon Club";

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar />
      <div className="flex-1 flex flex-col">
        <ClubTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Vue d'ensemble</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Tableau de Bord</h1>
              <p className="text-gray-600">Bienvenue, {clubName}. Voici l'etat de vos experiences et revenus pour ce mois.</p>
            </div>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <span>📥</span>
                Exporter
              </button>
              <button
                onClick={() => navigate("/club/experiences/create")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00694c] text-white hover:bg-[#005a40] text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Nouvelle Experience
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {statCards.map((stat, i) => (
                    <div key={i} className={`${stat.color} rounded-2xl border border-gray-100 p-6`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{stat.icon}</div>
                        {stat.change && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            stat.change.includes("+") ? "bg-green-100 text-green-700" : "text-gray-600 bg-gray-100"
                          }`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                      <p className="font-black text-2xl text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-lg text-gray-900">Reservations recentes</h2>
                      <button
                        onClick={() => navigate("/club/bookings")}
                        className="text-[#00694c] text-sm font-semibold hover:underline"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Client</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Experience</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((booking) => (
                            <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {booking.client[0]}
                                  </div>
                                  <span className="font-medium text-gray-900">{booking.client}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{booking.experience}</td>
                              <td className="py-4 px-4 text-gray-600">{booking.date}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  booking.status === "Confirme"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "En attente"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-semibold text-gray-900">{booking.amount}</td>
                            </tr>
                          ))}
                          {recentBookings.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                Aucune reservation pour le moment.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {topExperience && (
                      <div className="bg-gradient-to-br from-[#00694c] to-[#004a35] rounded-2xl text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp size={24} />
                          <span className="text-xs font-bold bg-[#d14405] px-3 py-1 rounded-full">TRENDING</span>
                        </div>
                        <p className="text-sm text-[#d4f5e9] mb-1">Top Performing</p>
                        <h3 className="font-black text-2xl mb-4">{topExperience.title}</h3>
                        <p className="text-xs text-[#d4f5e9] mb-4">{topExperience.slots_booked || 0} reservations sur {topExperience.slots_total} places</p>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-2xl">{topExperience.price} EUR <span className="text-xs font-normal text-[#d4f5e9]">/pers.</span></span>
                          <button
                            onClick={() => navigate("/club/experiences")}
                            className="bg-white text-[#00694c] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                          >
                            Gerer
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>⚡</span> Actions Rapides
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate("/club/experiences/create")} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[#00694c] flex items-center justify-center text-white">
                            <Plus size={18} />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 text-center">Nouveau</span>
                        </button>
                        <button onClick={() => navigate("/club/bookings")} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                            <MessageSquare size={18} />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 text-center">Messages</span>
                        </button>
                        <button onClick={() => navigate("/club/experiences")} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[#00694c] flex items-center justify-center text-white">
                            <Megaphone size={18} />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 text-center">Promouvoir</span>
                        </button>
                        <button onClick={() => navigate("/club/parametres")} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                            <HelpCircle size={18} />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 text-center">Support</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={20} className="text-[#00694c]" />
                        <h3 className="font-bold text-gray-900">Boostez votre visibilite</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Vous avez actuellement {experiencesCount} experience{experiencesCount !== 1 ? "s" : ""} publique{experiencesCount !== 1 ? "s" : ""}. Les experiences avec au moins 5 photos haute resolution ont un taux de conversion 40% plus eleve.
                      </p>
                      <button onClick={() => navigate("/club/experiences")} className="text-[#00694c] font-semibold text-sm hover:underline">Optimiser mes fiches →</button>
                    </div>
                    <div className="bg-gray-900 rounded-lg text-white p-6">
                      <h3 className="font-bold mb-2">Besoin d'aide ?</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Notre equipe de conciergerie Club est disponible 7j/7 pour vous accompagner dans le parametrage de vos offres premium et creneaux specifiques.
                      </p>
                      <button className="text-white font-semibold text-sm hover:underline">Contacter un expert →</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
