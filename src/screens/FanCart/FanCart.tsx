import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("fan_cart")
      .select("*, club_experiences(id, title, images, location, price, date_time, clubs(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      const items = data.map((item: any) => ({
        id: item.id,
        expId: item.experience_id,
        title: item.club_experiences?.title || "Experience",
        image: item.club_experiences?.images?.[0] || DEFAULT_IMAGE,
        location: item.club_experiences?.location || "Paris",
        price: item.club_experiences?.price || 0,
        club: item.club_experiences?.clubs?.name || "Club",
        dateTime: item.club_experiences?.date_time,
        quantity: item.quantity || 1,
      }));
      setCartItems(items);
      setTotal(items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleRemove = async (id: string) => {
    await supabase.from("fan_cart").delete().eq("id", id);
    setCartItems(cartItems.filter((item) => item.id !== id));
    setTotal(cartItems.filter((item) => item.id !== id).reduce((sum, item) => sum + item.price * item.quantity, 0));
  };

  const handleQuantity = async (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    await supabase.from("fan_cart").update({ quantity: newQty }).eq("id", id);
    const updated = cartItems.map((i) => i.id === id ? { ...i, quantity: newQty } : i);
    setCartItems(updated);
    setTotal(updated.reduce((sum, i) => sum + i.price * i.quantity, 0));
  };

  const handleCheckout = (expId: string) => {
    navigate(`/checkout/${expId}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <FanTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Mon panier</h1>
              <p className="text-gray-600">Retrouvez ici les expériences que vous avez ajoutées à votre panier.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#f0faf6] flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="text-[#00694c]" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Votre panier est vide</h3>
                <p className="text-gray-500 text-sm mb-6">Découvrez des expériences sportives uniques et ajoutez-les à votre panier.</p>
                <button onClick={() => navigate("/search")} className="px-6 py-3 rounded-xl bg-[#00694c] text-white font-semibold hover:bg-[#005a40] transition-colors">
                  Explorer les expériences
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
                    <img src={item.image} alt="" className="w-24 h-24 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-1">{item.club} • {item.location}</p>
                      <p className="text-xs text-[#00694c] font-semibold">{item.dateTime ? new Date(item.dateTime).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Date à définir"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleQuantity(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-black text-xl text-gray-900">{item.price * item.quantity}€</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemove(item.id)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => handleCheckout(item.expId)} className="px-4 py-2 rounded-lg bg-[#00694c] text-white text-xs font-semibold hover:bg-[#005a40] transition-colors flex items-center gap-1">
                          Réserver <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-black text-2xl text-gray-900">{total}€</span>
                  </div>
                  <button onClick={() => navigate("/search")} className="w-full py-3 rounded-xl bg-[#00694c] text-white font-semibold hover:bg-[#005a40] transition-colors">
                    Continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
