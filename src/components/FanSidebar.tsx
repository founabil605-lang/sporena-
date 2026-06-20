import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MessageSquare, Heart, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const FanSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: "Mes réservations", icon: CalendarDays, path: "/fan/dashboard" },
    { label: "Mes avis", icon: MessageSquare, path: "/fan/reviews" },
    { label: "Mes favoris", icon: Heart, path: "/fan/favorites" },
    { label: "Paramètres", icon: Settings, path: "/fan/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[#00694c] flex items-center justify-center text-white font-black">
            S
          </div>
          <div>
            <p className="font-black text-sm text-gray-900">SPORENA</p>
            <p className="text-xs text-gray-400">FAN SPACE</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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

      <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Membre</p>
          <p className="font-semibold text-gray-900 text-sm mt-0.5">{user?.email || "Fan"}</p>
          <p className="text-xs text-gray-500">SPORENA Fan</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors border border-gray-200"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
