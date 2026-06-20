import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanFavorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("fan_favorites")
      .select("id, experience_id, club_experiences(id, title, images, sport, location, price, clubs(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setFavorites(data.map((f: any) => ({
        id: f.id,
        expId: f.experience_id,
        title: f.club_experiences?.title || "Experience",
        image: f.club_experiences?.images?.[0] || f.club_experiences?.image_url || DEFAULT_IMAGE,
        sport: f.club_experiences?.sport || "Sport",
        location: f.club_experiences?.location || "Paris",
        price: f.club_experiences?.price || 0,
        club: f.club_experiences?.clubs?.name || "Club",
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleRemove = async (id: string) => {
    await supabase.from("fan_favorites").delete().eq("id", id);
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Mes favoris</h1>
              <p className="text-gray-600">Retrouvez ici toutes vos expériences sportives préférées. Des sessions VIP aux accès exclusifs, gardez vos coups de cœur à portée de main.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((f) => (
                  <div key={f.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button onClick={() => handleRemove(f.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Heart size={16} className="fill-red-500 text-red-500" />
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-[#d14405] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{f.price <= 100 ? "Plus que 2 places" : "Exclusivité membre"}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-[#00694c] uppercase tracking-wider mb-1">{f.sport} • {f.location}</p>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{f.title}</h3>
                      <p className="font-black text-xl text-gray-900">{f.price}€ <span className="text-xs font-normal text-gray-500">/ session</span></p>
                    </div>
                  </div>
                ))}
                <div onClick={() => navigate("/search")} className="bg-white rounded-2xl border border-gray-100 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">Explorer plus</p>
                  <p className="text-xs text-gray-500">Ajoutez de nouvelles expériences à vos favoris lors de votre prochaine recherche.</p>
                </div>
                {favorites.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <p className="text-gray-500 text-sm">Aucun favori. <button onClick={() => navigate("/search")} className="text-[#00694c] font-semibold hover:underline">Découvrir les expériences</button></p>
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
