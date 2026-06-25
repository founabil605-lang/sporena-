import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ShoppingCart, User, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export const FanTopbar = ({ onMenuToggle }: { onMenuToggle?: () => void } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadCounts = async () => {
      if (!user?.id) return;
      const [notifRes, cartRes, profileRes] = await Promise.all([
        supabase.from("fan_notifications").select("id", { count: "exact" }).eq("user_id", user.id).eq("read", false),
        supabase.from("fan_cart").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("fan_profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setUnreadCount(notifRes.count || 0);
      setCartCount(cartRes.count || 0);
      if (profileRes.data) setProfile(profileRes.data);
    };
    loadCounts();
  }, [user?.id]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 gap-4 sticky top-0 z-30">
      <button onClick={onMenuToggle} className="lg:hidden w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors">
        <Menu size={20} />
      </button>
      <div className="flex items-center justify-end gap-4 flex-1">
      <button
        onClick={() => navigate("/fan/notifications")}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive("/fan/notifications") ? "bg-[#f0faf6] text-[#00694c]" : "hover:bg-gray-50 text-gray-600"}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#d14405] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <button
        onClick={() => navigate("/fan/cart")}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive("/fan/cart") ? "bg-[#f0faf6] text-[#00694c]" : "hover:bg-gray-50 text-gray-600"}`}
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#d14405] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>

      <button
        onClick={() => navigate("/fan/profile")}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-colors ${isActive("/fan/profile") ? "ring-2 ring-[#00694c]" : "hover:bg-gray-50"}`}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#2c3e50] flex items-center justify-center text-white">
            <User size={18} />
          </div>
        )}
      </button>
      </div>
    </header>
  );
};
