import { Search, Bell, CircleHelp as HelpCircle, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const ClubTopbar = ({ onMenuToggle }: { onMenuToggle?: () => void } = {}) => {
  const { user } = useAuth();

  const userName = user?.email?.split('@')[0] || "Utilisateur";
  const tier = "ELITE PARTNER";

  return (
    <div className="bg-white border-b border-gray-100 h-16 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
      <button onClick={onMenuToggle} className="lg:hidden w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une experience..."
              className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-[#00694c]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors relative">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#d14405] rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors">
          <HelpCircle size={18} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400 font-medium">{tier}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00694c] to-[#003d2d] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userName[0].toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
