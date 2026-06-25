import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CircleCheck as CheckCircle, CalendarDays, MapPin, Trash2 } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const FanNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    // Check for upcoming bookings within 1 day and create notifications
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, club_experiences(id, title, location, date_time)")
      .eq("customer_email", user.email)
      .gte("date_time", now.toISOString())
      .lte("date_time", tomorrow.toISOString())
      .eq("status", "confirmed");

    if (bookings) {
      for (const b of bookings) {
        const { data: existing } = await supabase
          .from("fan_notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("experience_id", b.club_experiences?.id)
          .eq("type", "reminder")
          .single();
        if (!existing) {
          await supabase.from("fan_notifications").insert({
            user_id: user.id,
            title: "Votre expérience commence bientôt !",
            message: `"${b.club_experiences?.title}" commence demain à ${b.club_experiences?.location || "votre lieu de réservation"}. Préparez-vous !`,
            type: "reminder",
            experience_id: b.club_experiences?.id,
          });
        }
      }
    }

    const { data } = await supabase
      .from("fan_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        experienceId: n.experience_id,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    await supabase.from("fan_notifications").update({ read: true }).eq("id", id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await supabase.from("fan_notifications").update({ read: true }).eq("user_id", user?.id);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("fan_notifications").delete().eq("id", id);
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filtered = activeTab === "all"
    ? notifications
    : activeTab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <FanTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Restez informé de vos réservations et de vos expériences à venir.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-6">
              {[
                { key: "all", label: "Toutes" },
                { key: "unread", label: `Non lues (${unreadCount})` },
                { key: "reminder", label: "Rappels" },
                { key: "general", label: "Général" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#00694c] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="ml-auto text-[#00694c] text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCircle size={14} /> Tout marquer comme lu
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${n.read ? "border-gray-100" : "border-[#00694c] bg-[#f0faf6]"}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "reminder" ? "bg-[#d14405]" : "bg-[#00694c]"}`}>
                      <Bell size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold text-sm ${n.read ? "text-gray-700" : "text-gray-900"}`}>{n.title}</h3>
                        <span className="text-xs text-gray-400">{n.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                      <div className="flex items-center gap-3">
                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[#00694c] text-xs font-semibold hover:underline flex items-center gap-1"
                          >
                            <CheckCircle size={12} /> Marquer comme lu
                          </button>
                        )}
                        {n.experienceId && (
                          <button
                            onClick={() => navigate(`/experience/${n.experienceId}`)}
                            className="text-[#00694c] text-xs font-semibold hover:underline flex items-center gap-1"
                          >
                            <CalendarDays size={12} /> Voir l'expérience
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="text-gray-400 text-xs hover:text-red-500 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f0faf6] flex items-center justify-center mx-auto mb-4">
                      <Bell size={24} className="text-[#00694c]" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Aucune notification</h3>
                    <p className="text-gray-500 text-sm">Vous n'avez pas de notifications dans cette catégorie.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
