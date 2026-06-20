import { useState, useEffect } from "react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const ClubAnalytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("Monthly");
  const [stats, setStats] = useState({
    revenue: 0,
    bookingCount: 0,
    avgRating: 0,
    fillRate: 0,
  });
  const [bookingsBySport, setBookingsBySport] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [topExperience, setTopExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.club_id) return;
    const load = async () => {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const currentMonth = new Date().getMonth();

      const [bookingsResult, expResult, analyticsResult] = await Promise.all([
        supabase.from("bookings").select("*").eq("club_id", user.club_id),
        supabase.from("club_experiences").select("*").eq("club_id", user.club_id).eq("status", "public"),
        supabase.from("analytics").select("*").eq("club_id", user.club_id).order("month", { ascending: true }),
      ]);

      const bookings = bookingsResult.data || [];
      const experiences = expResult.data || [];
      const analytics = analyticsResult.data || [];

      const revenue = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
      const bookingCount = bookings.length;
      const avgRating = experiences.length > 0
        ? Math.round((experiences.reduce((s, e) => s + (e.rating || 0), 0) / experiences.length) * 10) / 10
        : 0;
      const totalSlots = experiences.reduce((s, e) => s + (e.slots_total || 0), 0);
      const bookedSlots = experiences.reduce((s, e) => s + (e.slots_booked || 0), 0);
      const fillRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

      setStats({ revenue, bookingCount, avgRating, fillRate });

      // Bookings by sport
      const sportMap: Record<string, number> = {};
      const expIds = experiences.map((e) => e.id);
      const { data: sportBookings } = await supabase
        .from("bookings")
        .select("experience_id, total_price")
        .eq("club_id", user.club_id)
        .in("experience_id", expIds.length > 0 ? expIds : ["00000000-0000-0000-0000-000000000000"]);

      const bookingsCount = sportBookings?.length || 0;
      experiences.forEach((e) => {
        const count = (sportBookings || []).filter((b) => b.experience_id === e.id).length;
        sportMap[e.sport || "Autre"] = (sportMap[e.sport || "Autre"] || 0) + count;
      });
      const sportEntries = Object.entries(sportMap).map(([sport, count]) => ({
        sport: sport.toUpperCase(),
        percent: bookingsCount > 0 ? Math.round((count / bookingsCount) * 100) : 0,
        count,
      })).sort((a, b) => b.count - a.count);
      setBookingsBySport(sportEntries);

      // Revenue data for chart
      const monthData = new Array(6).fill(0);
      analytics.forEach((a) => {
        const monthIdx = months.indexOf(a.month);
        if (monthIdx >= 0 && monthIdx < 6) {
          monthData[monthIdx] = Math.round(a.revenue || 0);
        }
      });
      // If no analytics data, compute from bookings
      if (analytics.length === 0) {
        bookings.forEach((b) => {
          const bMonth = new Date(b.date_time || b.created_at).getMonth();
          if (bMonth >= 0 && bMonth < 6) {
            monthData[bMonth] = Math.round((monthData[bMonth] || 0) + (b.total_price || 0));
          }
        });
      }
      const maxRev = Math.max(...monthData, 1);
      setRevenueData(monthData.map((r) => Math.round((r / maxRev) * 45)));

      // Top experience
      const best = experiences.reduce((best, e) => {
        if (!best || (e.slots_booked || 0) > (best.slots_booked || 0)) return e;
        return best;
      }, null);
      setTopExperience(best);
      setLoading(false);
    };
    load();
  }, [user?.club_id, period]);

  const displayStats = [
    {
      label: "Monthly Revenue",
      value: `${stats.revenue.toLocaleString("fr-FR")} EUR`,
      change: "+12.4%",
      icon: "💰",
    },
    {
      label: "Booking Growth %",
      value: `${stats.fillRate}%`,
      change: "+8.2%",
      icon: "📈",
    },
    {
      label: "Average Rating",
      value: `${stats.avgRating} /5`,
      change: "Steady",
      icon: "⭐",
    },
  ];

  const demographics = [
    { age: "18-24 YEARS", percent: "24%" },
    { age: "25-45 YEARS", percent: "56%" },
    { age: "45+ YEARS", percent: "20%" },
  ];

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar />
      <div className="flex-1 flex flex-col">
        <ClubTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Performance Overview</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Analytics Dashboard</h1>
              <div className="flex gap-3 mt-6">
                {["Monthly", "Quarterly", "Yearly"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setPeriod(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      period === range
                        ? "bg-white border border-gray-200 text-gray-700"
                        : "bg-transparent hover:bg-gray-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {displayStats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          stat.change.includes("+") ? "bg-green-100 text-green-700" : "text-gray-600 bg-gray-100"
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                      <p className="font-black text-3xl text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-6">Revenue Growth & Projections</h2>
                    <div className="h-80 flex items-end gap-2">
                      {revenueData.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t-lg transition-colors ${
                              i === revenueData.length - 1 ? "bg-[#00694c]" : "bg-[#d4f5e9]"
                            }`}
                            style={{ height: `${(h / 50) * 250}px` }}
                          />
                          <span className="text-xs text-gray-500 font-medium">{months[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00694c]" />
                        <span className="text-xs text-gray-600">Revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#d4f5e9]" />
                        <span className="text-xs text-gray-600">Target</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {topExperience && (
                      <div className="bg-[#00694c] text-white rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">🏆</span>
                          <span className="text-xs font-bold bg-[#d14405] px-3 py-1 rounded-full">TRENDING</span>
                        </div>
                        <h3 className="font-black text-xl mb-1">Top Performing</h3>
                        <p className="text-[#d4f5e9] text-sm mb-3">{topExperience.title}</p>
                        <p className="text-xs text-[#d4f5e9] leading-relaxed mb-4">
                          {topExperience.slots_booked} reservations sur {topExperience.slots_total} places.
                        </p>
                      </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Bookings by Sport</h3>
                      <div className="space-y-3">
                        {bookingsBySport.length > 0 ? (
                          bookingsBySport.map((item, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-600">{item.sport}</span>
                                <span className="text-xs font-bold text-gray-900">{item.percent}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#00694c] rounded-full transition-all"
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">Aucune donnee disponible</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 flex gap-6">
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white text-6xl flex-shrink-0">
                      ⚽
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Member Profile</p>
                      <h3 className="font-black text-xl text-gray-900 mb-2">Active Enthusiasts</h3>
                      <p className="text-xs text-gray-600 mb-4">
                        <span className="font-bold">SPORTS COMMUNITY</span><br />
                        {stats.bookingCount} reservations total. Taux de remplissage: {stats.fillRate}%.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Fan Demographics</h3>
                    <p className="text-sm text-gray-600 mb-6">Audience breakdown by age and location engagement.</p>
                    <div className="flex items-center gap-12">
                      <div className="space-y-4">
                        {demographics.map((d, i) => (
                          <div key={i} className="text-center">
                            <p className="font-black text-3xl text-[#00694c]">{d.percent}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">{d.age}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                            +{stats.bookingCount}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            +
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          <span className="text-[#00694c] font-semibold">DETAILED REPORT →</span>
                        </p>
                      </div>
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
