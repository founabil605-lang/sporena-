import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Sparkles, Calendar, ChartBar as BarChart3, Gift, Settings, LogOut, Bell, CircleHelp as HelpCircle, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const ClubSidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: "Vue d'ensemble", icon: LayoutGrid, path: "/club/dashboard" },
    { label: "Mes experiences", icon: Sparkles, path: "/club/experiences" },
    { label: "Reservations", icon: Calendar, path: "/club/bookings" },
    { label: "Analytics", icon: BarChart3, path: "/club/analytics" },
    { label: "Abonnement", icon: Gift, path: "/club/abonnement" },
    { label: "Parametres", icon: Settings, path: "/club/parametres" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const clubName = user?.club_name || "Mon Club";
  const userRole = "Premium Host";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Sidebar — mobile drawer + desktop sidebar */}
      <aside className={`fixed lg:static top-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"
        >
          <X size={16} />
        </button>

        <div className="p-6 border-b border-gray-100">
          <Link to="/club/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-lg bg-[#00694c] flex items-center justify-center text-white font-black">
              S
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">SPORENA</p>
              <p className="text-xs text-gray-400">CLUB SPACE</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-[#f0faf6] text-[#00694c] border-l-4 border-[#00694c]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Club actuel</p>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">{clubName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors border border-gray-200"
          >
            <LogOut size={16} />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
