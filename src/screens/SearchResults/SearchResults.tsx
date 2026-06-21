import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, ChevronDown, Map, SlidersHorizontal, X } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ExperienceCard } from "../../components/ExperienceCard";
import { sports } from "../../data/experiences";
import { supabase } from "../../lib/supabase";

const SORT_OPTIONS = ["Pertinence", "Prix croissant", "Prix décroissant", "Mieux notés"];

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [date, setDate] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);
  const [distance, setDistance] = useState("Moins de 5 km");
  const [sort, setSort] = useState("Pertinence");
  const [sortOpen, setSortOpen] = useState(false);
  const [experiencesList, setExperiencesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("club_experiences")
        .select("*, clubs(name, logo_url)")
        .eq("status", "public")
        .order("created_at", { ascending: false });
      if (data) {
        setExperiencesList(data.map((exp: any) => ({
          id: exp.id,
          image: exp.images?.[0] || exp.image_url || DEFAULT_IMAGE,
          category: exp.category,
          title: exp.title,
          club: exp.clubs?.name || "Club",
          date: exp.date || "Date à définir",
          location: exp.location || "Paris",
          price: exp.price || 0,
          rating: exp.rating || 4.5,
          reviewCount: exp.review_count || 0,
          spotsLeft: (exp.slots_total || 0) - (exp.slots_booked || 0),
          certified: exp.certified || false,
          images: exp.images || [],
          description: exp.description || "",
          includes: exp.includes || [],
          tags: exp.tags || [],
          address: exp.address || "",
          time: exp.time || "",
          organizer: exp.organizer || "",
          organizerRating: exp.organizer_rating || 4.5,
          organizerExperiences: exp.organizer_experiences || 0,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleSport = (s: string) => {
    setSelectedSports((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filtered = useMemo(() => {
    let list = experiencesList.filter((e) => e.price >= priceMin && e.price <= priceMax);
    if (selectedSports.length > 0) {
      list = list.filter((e) => selectedSports.some((s) => e.sport?.toLowerCase().includes(s.toLowerCase()) || e.title?.toLowerCase().includes(s.toLowerCase())));
    }
    if (available) list = list.filter((e) => e.spotsLeft > 0);
    if (sort === "Prix croissant") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Prix décroissant") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "Mieux notés") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [priceMin, priceMax, selectedSports, available, sort, experiencesList]);

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex gap-8">
        <aside className="hidden lg:flex flex-col gap-6 w-52 flex-shrink-0">
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3">Filtres</p>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-4">Affinez votre recherche</p>
          </div>

          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-3">Prix</p>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{priceMin}€</span>
              <span>{priceMax}€</span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#00694c]"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-3">Date</p>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm outline-none bg-transparent flex-1 text-gray-500"
                placeholder="Sélectionner..."
              />
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-3">Sport</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSport(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedSports.includes(s)
                      ? "bg-[#00694c] text-white border-[#00694c]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#00694c]"
                  }`}
                >
                  {s}
                  {selectedSports.includes(s) && <span className="ml-1">×</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-3">Disponibilité</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Places disponibles</span>
              <button
                onClick={() => setAvailable(!available)}
                className={`w-11 h-6 rounded-full transition-colors relative ${available ? "bg-[#00694c]" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${available ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-3">Distance</p>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="text-sm outline-none bg-transparent flex-1 text-gray-700"
              >
                <option>Moins de 5 km</option>
                <option>Moins de 10 km</option>
                <option>Moins de 25 km</option>
                <option>Toute la France</option>
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Résultats pour <span className="text-[#00694c]">"{query}"</span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{filtered.length} expériences trouvées à Lyon</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#00694c] transition-colors bg-white">
                <Map size={15} />
                Carte
              </button>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#00694c] transition-colors bg-white"
                >
                  <span className="text-xs text-gray-400 mr-1">TRIER PAR:</span>
                  {sort}
                  <ChevronDown size={14} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSort(opt); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sort === opt ? "text-[#00694c] font-semibold" : "text-gray-700"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:hidden flex flex-wrap gap-2 mb-4">
            {selectedSports.map((s) => (
              <button key={s} onClick={() => toggleSport(s)} className="flex items-center gap-1 bg-[#00694c] text-white text-xs px-3 py-1.5 rounded-full">
                {s} <X size={11} />
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map((exp) => (
                <ExperienceCard key={exp.id} {...exp} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <SlidersHorizontal size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune expérience trouvée</p>
              <p className="text-gray-400 text-sm">Essayez d'élargir vos filtres</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};
