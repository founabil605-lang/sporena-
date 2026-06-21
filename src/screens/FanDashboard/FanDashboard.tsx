import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Ticket, X, Trophy, Zap, Star } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const [profileRes, bookingsRes, recsRes] = await Promise.all([
      supabase.from("fan_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("bookings").select("*, club_experiences(*, clubs(name))").or(`user_id.eq.${user.id},customer_email.eq.${user.email}`).order("date_time", { ascending: false }),
      supabase.from("club_experiences").select("*, clubs(name)").eq("status", "public").order("created_at", { ascending: false }).limit(4),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const allBookings = bookingsRes.data || [];
    const now = new Date();
    const upcoming = allBookings.filter((b) => b.date_time && new Date(b.date_time) >= now);
    const past = allBookings.filter((b) => b.date_time && new Date(b.date_time) < now);
    setUpcomingBookings(upcoming);
    setHistoryBookings(past);

    if (recsRes.data) {
      setRecommendations(recsRes.data.map((exp: any) => ({
        id: exp.id,
        image: exp.images?.[0] || exp.image_url || DEFAULT_IMAGE,
        title: exp.title,
        sport: exp.sport,
        location: exp.location,
        price: exp.price,
        rating: exp.rating,
        club: exp.clubs?.name || "Club",
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCancel = (bookingId: string) => {
    navigate(`/fan/cancel/${bookingId}`);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar />
      <div className="flex-1 flex flex-col">
        <FanTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Profile header */}
            <div className="bg-[#2c3e50] rounded-2xl text-white p-6 mb-8 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserFallback />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-black text-2xl">{profile?.pseudo || "Sportif Lyon"}</h2>
                  <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Membre VIP</span>
                </div>
                <p className="text-sm text-white/70 mb-2">Membre depuis {profile?.member_since ? new Date(profile.member_since).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "Jan 2024"}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-white/60 text-xs"><Trophy size={14} /><span>3</span></div>
                  <div className="flex items-center gap-1 text-white/60 text-xs"><Zap size={14} /><span>12</span></div>
                  <div className="flex items-center gap-1 text-white/60 text-xs"><CalendarDays size={14} /><span>{upcomingBookings.length} à venir</span></div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center flex-shrink-0">
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Score Sportif</p>
                <p className="font-black text-3xl">{profile?.sport_score?.toLocaleString("fr-FR") || "2,480"} <span className="text-sm font-normal">pts</span></p>
              </div>
            </div>

            {/* Upcoming experiences */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl text-gray-900">Prochaines expériences</h2>
                <span className="text-xs font-bold text-[#00694c] tracking-widest uppercase">{upcomingBookings.length} à venir</span>
              </div>
              {upcomingBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">Aucune réservation à venir. <button onClick={() => navigate("/search")} className="text-[#00694c] font-semibold hover:underline">Explorer les expériences</button></p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                      <img src={b.club_experiences?.images?.[0] || DEFAULT_IMAGE} alt="" className="w-32 h-24 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{b.status === "confirmed" ? "Confirmé" : b.status}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mb-1">{b.club_experiences?.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><CalendarDays size={12} />{b.date_time ? formatDate(b.date_time) : "-"}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} />{b.club_experiences?.location || "-"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-[#00694c] text-lg">{b.total_price}€</span>
                        <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#00694c] text-white text-xs font-semibold hover:bg-[#005a40] transition-colors">
                          <Ticket size={12} /> Voir le billet
                        </button>
                        <button onClick={() => handleCancel(b.id)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div className="mb-8">
              <h2 className="font-bold text-xl text-gray-900 mb-4">Historique</h2>
              {historyBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">Aucune expérience terminée.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {historyBookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <img src={b.club_experiences?.images?.[0] || DEFAULT_IMAGE} alt="" className="w-full h-40 object-cover bg-gray-100" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Terminé</span>
                          <span className="text-xs text-gray-400">{b.date_time ? formatDate(b.date_time) : "-"}</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 mb-3">{b.club_experiences?.title}</h3>
                        <button onClick={() => navigate(`/search`)} className="w-full py-2 rounded-lg border border-[#00694c] text-[#00694c] text-xs font-semibold hover:bg-[#f0faf6] transition-colors">
                          Réserver à nouveau
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending reviews */}
            {historyBookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-4 flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#f0faf6] flex items-center justify-center text-[#00694c]">
                  <MessageSquareFallback />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">{historyBookings[0]?.club_experiences?.title}</p>
                  <p className="text-xs text-gray-500">Votre expérience s'est terminée il y a 2 jours.</p>
                </div>
                <button onClick={() => navigate("/fan/reviews")} className="px-4 py-2 rounded-lg bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors">
                  Donner mon avis
                </button>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl text-gray-900">Prochainement pour vous</h2>
                <button onClick={() => navigate("/search")} className="text-[#00694c] text-sm font-semibold hover:underline">Voir tout</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((exp) => (
                  <div key={exp.id} onClick={() => navigate(`/experience/${exp.id}`)} className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group">
                    <div className="relative">
                      <img src={exp.image} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="bg-[#d14405] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Populaire</span>
                        <h3 className="font-bold text-white text-base mt-1 drop-shadow">{exp.title}</h3>
                        <p className="text-xs text-white/80">Par {exp.club}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{exp.rating}</span>
                          <span className="font-bold text-white text-sm">{exp.price}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

function UserFallback() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function MessageSquareFallback() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
