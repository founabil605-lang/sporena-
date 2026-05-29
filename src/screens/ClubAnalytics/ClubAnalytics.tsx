import { TrendingUp, ChartBar as BarChart3, Star, Users } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";

export const ClubAnalytics = () => {
  const stats = [
    { label: "Monthly Revenue", value: "€24,450", change: "+12.4%", icon: "💰" },
    { label: "Booking Growth %", value: "64.5%", change: "+8.2%", icon: "📈" },
    { label: "Average Rating", value: "4.92 /5", change: "Steady", icon: "⭐" },
  ];

  const bookingsBySport = [
    { sport: "TENNIS & PADEL", percent: 42, width: "42%" },
    { sport: "GOLF SESSIONS", percent: 28, width: "28%" },
    { sport: "FITNESS TRAINING", percent: 18, width: "18%" },
    { sport: "OTHERS", percent: 12, width: "12%" },
  ];

  const demographics = [
    { age: "18-24 YEARS", percent: "24%" },
    { age: "25-45 YEARS", percent: "56%" },
    { age: "45+ YEARS", percent: "20%" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar clubName="Club Elite Paris" userRole="Premium Host" />

      <div className="flex-1 flex flex-col">
        <ClubTopbar userName="Alexandre Durand" tier="ELITE PARTNER" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Performance Overview</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Analytics Dashboard</h1>
              <div className="flex gap-3 mt-6">
                {["Monthly", "Quarterly", "Yearly"].map((range) => (
                  <button
                    key={range}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      range === "Monthly"
                        ? "bg-white border border-gray-200 text-gray-700"
                        : "bg-transparent hover:bg-gray-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, i) => (
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
                  {[25, 30, 35, 40, 42, 45, 50].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-lg transition-colors ${
                          i === 6 ? "bg-[#00694c]" : "bg-[#d4f5e9]"
                        }`}
                        style={{ height: `${(h / 50) * 250}px` }}
                      />
                      <span className="text-xs text-gray-500 font-medium">
                        {["JAN", "FEB", "MAR", "APR", "MAY", "JUN"][i] || ""}
                      </span>
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
                <div className="bg-[#00694c] text-white rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-bold bg-[#d14405] px-3 py-1 rounded-full">TRENDING</span>
                  </div>
                  <h3 className="font-black text-xl mb-1">Top Performing</h3>
                  <p className="text-[#d4f5e9] text-sm mb-3">Master Padel Class</p>
                  <p className="text-xs text-[#d4f5e9] leading-relaxed mb-4">
                    "Tennis activities are peaking. Consider offering more afternoon slots during weekdays."
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Bookings by Sport</h3>
                  <div className="space-y-3">
                    {bookingsBySport.map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600">{item.sport}</span>
                          <span className="text-xs font-bold text-gray-900">{item.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00694c] rounded-full transition-all"
                            style={{ width: item.width }}
                          />
                        </div>
                      </div>
                    ))}
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
                    Most of your members are aged between 24-38 and prefer evening bookings.
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
                        +2.4k
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
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};
