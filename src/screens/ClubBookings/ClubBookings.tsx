import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const ClubBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadData = async () => {
    if (!user?.club_id) return;
    setLoading(true);
    const [bookingsResult, expResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("club_id", user.club_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("club_experiences")
        .select("id, title")
        .eq("club_id", user.club_id),
    ]);
    if (bookingsResult.data) setBookings(bookingsResult.data);
    if (expResult.data) setExperiences(expResult.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.club_id]);

  const expMap = useMemo(() => {
    return experiences.reduce((acc, e) => ({ ...acc, [e.id]: e }), {});
  }, [experiences]);

  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (filterPeriod !== "all") {
      const now = new Date();
      const periodDays = { "7": 7, "30": 30, "90": 90 };
      const days = periodDays[filterPeriod as keyof typeof periodDays];
      if (days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        list = list.filter((b) => new Date(b.created_at) >= cutoff);
      }
    }
    if (filterExperience !== "all") {
      list = list.filter((b) => b.experience_id === filterExperience);
    }
    if (filterStatus !== "all") {
      list = list.filter((b) => b.status === filterStatus);
    }
    return list;
  }, [bookings, filterPeriod, filterExperience, filterStatus]);

  const totalRevenue = filteredBookings.reduce((s, b) => s + (b.total_price || 0), 0);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };
  const statusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirme";
      case "pending": return "En attente";
      case "cancelled": return "Annule";
      default: return status;
    }
  };

  // Calendar helpers
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const prevMonth = () => setCalendarDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calYear, calMonth + 1, 1));
  const calendarBookings = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredBookings.forEach((b) => {
      if (b.date_time) {
        const d = new Date(b.date_time).toISOString().split("T")[0];
        map[d] = [...(map[d] || []), b];
      }
    });
    return map;
  }, [filteredBookings]);

  const monthName = new Date(calYear, calMonth).toLocaleString("fr-FR", { month: "long", year: "numeric" });
  const weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <ClubTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Gestion des flux</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Reservations</h1>
              <p className="text-gray-600">Gerez vos participants, suivez vos revenus et assurez le bon deroulement de chaque session sportive.</p>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <Download size={16} />
                Exporter CSV
              </button>
              <button
                onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "calendar" ? "bg-[#00694c] text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar size={16} />
                Vue Calendrier
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Periode</label>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]"
                  >
                    <option value="all">Toutes</option>
                    <option value="7">7 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                    <option value="90">90 derniers jours</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Experience</label>
                  <select
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]"
                  >
                    <option value="all">Toutes les experiences</option>
                    {experiences.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="confirmed">Confirme</option>
                    <option value="pending">En attente</option>
                    <option value="cancelled">Annule</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Total Reservations</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#00694c]">{filteredBookings.length}</span>
                    <span className="text-green-600 text-sm">↑</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : viewMode === "list" ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Fan Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Experience</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date/Heure</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Pers.</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Prix Total</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking, idx) => (
                        <tr key={booking.id} className={`${idx !== filteredBookings.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors cursor-pointer`} onClick={() => setShowBookingModal(booking.id)}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00694c] to-[#003d2d] flex items-center justify-center text-white text-xs font-bold">
                                {booking.customer_name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                                <p className="text-xs text-gray-500">ID: #{booking.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-semibold text-gray-900">{expMap[booking.experience_id]?.title || "Experience"}</p>
                              <p className="text-xs text-gray-500">{booking.participants} personne(s)</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-gray-900">{booking.date_time ? new Date(booking.date_time).toLocaleDateString("fr-FR") : "-"}</p>
                            <p className="text-xs text-gray-500">{booking.date_time ? new Date(booking.date_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "-"}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-gray-900">{booking.participants}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-gray-900">{booking.total_price?.toFixed(2) || "0.00"} EUR</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(booking.status)}`}>
                              {statusLabel(booking.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                            Aucune reservation trouvee avec ces filtres.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Affichage de {filteredBookings.length} sur {bookings.length} reservations</p>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 text-lg">Vue Calendrier</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-semibold text-gray-900 text-sm capitalize min-w-[140px] text-center">{monthName}</span>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-1 min-w-[300px]">
                  {weekdays.map((d) => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
                  ))}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px]" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayBookings = calendarBookings[dateStr] || [];
                    return (
                      <div key={day} className={`min-h-[100px] border border-gray-100 rounded-lg p-2 ${dayBookings.length > 0 ? "bg-[#f0faf6]" : "bg-white"}`}>
                        <span className="text-xs font-bold text-gray-400">{day}</span>
                        {dayBookings.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayBookings.slice(0, 2).map((b, j) => (
                              <div key={j} className="text-[10px] bg-[#00694c] text-white rounded px-1.5 py-0.5 truncate cursor-pointer" onClick={() => setShowBookingModal(b.id)}>
                                {b.customer_name}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-[10px] text-[#00694c] font-semibold">+{dayBookings.length - 2} de plus</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-2">Support Prioritaire Club</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Besoin d'aide avec une annulation complexe ou un litige de paiement ? Nos experts Club sont a votre disposition.
                </p>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-black transition-colors">
                  Contacter le support
                </button>
              </div>

              <div className="bg-[#00694c] text-white rounded-2xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">Prochain Versement</h3>
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Prevu pour le 30 Octobre</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-[#d4f5e9] mb-1">Montant securise par Stripe</p>
                  <p className="font-black text-4xl">{totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</p>
                </div>
                <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <span>+</span> Consulter l'historique
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Booking detail modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button onClick={() => setShowBookingModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            {(() => {
              const b = bookings.find((x) => x.id === showBookingModal);
              if (!b) return null;
              return (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Details de la reservation</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-medium text-gray-900">{b.customer_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{b.customer_email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium text-gray-900">{expMap[b.experience_id]?.title || "Experience"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Participants</span><span className="font-medium text-gray-900">{b.participants}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{b.date_time ? new Date(b.date_time).toLocaleString("fr-FR") : "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">{b.total_price?.toFixed(2)} EUR</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Statut</span><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(b.status)}`}>{statusLabel(b.status)}</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
