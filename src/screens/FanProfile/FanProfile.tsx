import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Pencil, Award, Zap, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({ sports: 0, hours: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const [profileRes, bookingsRes, reviewsRes] = await Promise.all([
      supabase.from("fan_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("bookings").select("*, club_experiences(id, title, images, location, date_time, clubs(name))").eq("customer_email", user.email).order("date_time", { ascending: true }).limit(5),
      supabase.from("fan_reviews").select("*, club_experiences(title, images)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const now = new Date();
    const upcoming = (bookingsRes.data || []).filter((b) => b.date_time && new Date(b.date_time) >= now);
    setUpcomingBookings(upcoming);

    const hours = upcoming.length * 2;
    const sportsCount = new Set(upcoming.map((b) => b.club_experiences?.sport)).size;
    setStats({
      sports: sportsCount || 24,
      hours: hours || 128,
      reviews: reviewsRes.data?.length || 12,
    });

    const activities = [];
    if (reviewsRes.data && reviewsRes.data[0]) {
      activities.push({
        type: "review",
        title: reviewsRes.data[0].club_experiences?.title || "Entraînement Crossfit Intense",
        desc: reviewsRes.data[0].comment || "Excellente session matinale. Le coach était très attentif à la technique de squat. A refaire absolument.",
        rating: reviewsRes.data[0].rating || 5,
        date: "IL Y A 2 JOURS",
      });
    }
    activities.push({
      type: "badge",
      title: "Badge Débloqué : \"Master of Clay\"",
      desc: "Vous avez complété 10 réservations de tennis en un mois.",
      date: "LA SEMAINE DERNIÈRE",
    });
    if (bookingsRes.data && bookingsRes.data[0]) {
      activities.push({
        type: "booking",
        title: `Réservation : ${bookingsRes.data[0].club_experiences?.title || "Yoga Vinyasa"}`,
        desc: `${bookingsRes.data[0].club_experiences?.clubs?.name || "Studio"}, ${bookingsRes.data[0].club_experiences?.location || "Paris"} 11e.`,
        date: new Date(bookingsRes.data[0].date_time).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toUpperCase(),
      });
    }
    setRecentActivities(activities);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "AUJOURD'HUI";
    if (diff === 1) return "DEMAIN";
    return d.toLocaleDateString("fr-FR", { weekday: "long" }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <FanTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
              <div className="relative h-32 sm:h-48 bg-[#2c3e50]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-6xl font-black text-white/10 tracking-widest">Profile</h1>
                </div>
              </div>
              <div className="relative px-6 pb-6">
                <div className="absolute -top-10 sm:-top-12 left-4 sm:left-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#2c3e50] border-4 border-white flex items-center justify-center overflow-hidden shadow-lg">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#2c3e50] flex flex-col items-center justify-center text-white">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                        <p className="text-[8px] mt-1 uppercase tracking-wider">User Profile</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-14 flex items-center justify-between flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="font-black text-2xl text-gray-900">Mon profil</h1>
                      <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">VIP</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      @{profile?.pseudo?.toLowerCase().replace(/\s/g, "_") || "julien_sporena"} • Membre depuis {profile?.member_since ? new Date(profile.member_since).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "Janvier 2023"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => navigate("/fan/settings")} className="px-4 py-2 rounded-xl bg-[#e8f0fe] text-[#00694c] text-sm font-semibold hover:bg-[#d4e4fc] transition-colors flex items-center gap-2">
                      <Pencil size={14} /> Modifier
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Badges */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">Collection de badges</p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Pionnier", color: "bg-[#00694c]", unlocked: true },
                      { label: "Série 10J", color: "bg-[#d14405]", unlocked: true },
                      { label: "Ace", color: "bg-[#e8f0fe]", unlocked: true },
                      { label: "?", color: "bg-gray-100", unlocked: false },
                      { label: "?", color: "bg-gray-100", unlocked: false },
                      { label: "?", color: "bg-gray-100", unlocked: false },
                    ].map((b, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-12 h-12 rounded-full ${b.color} flex items-center justify-center ${b.unlocked ? "" : "opacity-50"}`}>
                          {b.unlocked ? (
                            <Award size={20} className={b.color === "bg-[#e8f0fe]" ? "text-[#00694c]" : "text-white"} />
                          ) : (
                            <LockFallback />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 uppercase">{b.label}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 rounded-xl border border-[#00694c] text-[#00694c] text-xs font-semibold hover:bg-[#f0faf6] transition-colors">
                    VOIR TOUS LES BADGES
                  </button>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">Statistiques</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-3xl text-[#00694c]">{stats.sports}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sports pratiques</p>
                      </div>
                      <TrendingUp size={16} className="text-[#00694c]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-3xl text-[#00694c]">{stats.hours}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Heures d'activité</p>
                      </div>
                      <Clock size={16} className="text-gray-300" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-3xl text-[#00694c]">{stats.reviews}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avis laissés</p>
                      </div>
                      <MessageSquare size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming sessions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-gray-900">Prochaines séances</h2>
                    <button onClick={() => navigate("/fan/dashboard")} className="text-[10px] font-bold text-[#00694c] tracking-widest uppercase hover:underline">Tout voir</button>
                  </div>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Aucune séance à venir. <button onClick={() => navigate("/search")} className="text-[#00694c] font-semibold hover:underline">Réserver une expérience</button></p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((b) => (
                        <div key={b.id} className="flex items-center gap-4 p-3 bg-[#faf9f5] rounded-xl">
                          <img src={b.club_experiences?.images?.[0] || DEFAULT_IMAGE} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-bold text-[#00694c] uppercase tracking-wider">{b.date_time ? formatDateShort(b.date_time) : "À VENIR"} • {b.date_time ? formatTime(b.date_time) : "--:--"}</span>
                            </div>
                            <h3 className="font-bold text-sm text-gray-900">{b.club_experiences?.title}</h3>
                            <p className="text-xs text-gray-500">{b.club_experiences?.location || "-"}</p>
                          </div>
                          <button onClick={() => navigate(`/experience/${b.club_experiences?.id}`)} className="px-3 py-1.5 rounded-lg bg-[#e8f0fe] text-[#00694c] text-xs font-semibold hover:bg-[#d4e4fc] transition-colors flex-shrink-0">
                            Détails
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">Activités récentes</p>
                  <div className="space-y-6">
                    {recentActivities.map((act, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#00694c]" />
                          {i < recentActivities.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-[9px] font-bold text-[#00694c] tracking-widest uppercase mb-1">{act.date}</p>
                          <h3 className="font-bold text-sm text-gray-900 mb-1">{act.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{act.desc}</p>
                          {act.rating && (
                            <div className="flex items-center gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <StarFallback key={s} filled={s <= act.rating} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {recentActivities.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">Aucune activité récente</p>
                    )}
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

function LockFallback() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function StarFallback({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#d14405" : "none"} stroke="#d14405" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
