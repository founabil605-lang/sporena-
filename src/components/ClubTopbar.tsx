import { Search, Bell, CircleHelp as HelpCircle, User } from "lucide-react";

interface ClubTopbarProps {
  userName: string;
  userImage?: string;
  tier?: string;
}

export const ClubTopbar = ({ userName, userImage, tier = "ELITE PARTNER" }: ClubTopbarProps) => {
  return (
    <div className="bg-white border-b border-gray-100 h-16 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une expérience..."
              className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-[#00694c]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors relative">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#d14405] rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors">
          <HelpCircle size={18} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right">
            <p className="font-semibold text-sm text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400 font-medium">{tier}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00694c] to-[#003d2d] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userImage ? <img src={userImage} alt="" className="w-full h-full rounded-full object-cover" /> : userName[0]}
          </div>
        </div>
      </div>
    </div>
  );
};
