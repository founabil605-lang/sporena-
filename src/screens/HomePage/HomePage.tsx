import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, ChevronRight, ChevronLeft, TrendingUp } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ExperienceCard } from "../../components/ExperienceCard";
import { experiences, categories, partners } from "../../data/experiences";

export const HomePage = () => {
  const navigate = useNavigate();
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featured = experiences.slice(0, 3);
  const trending = experiences.slice(6, 10);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (sport) params.set("q", sport);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>
        <img
          src="https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Stadium"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 min-h-[480px]">
          <h1 className="text-white font-black text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight uppercase mb-10">
            Vivez le sport de<br />l'intérieur
          </h1>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 max-w-3xl w-full overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <Search size={18} className="text-[#00694c] flex-shrink-0" />
              <input
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder-gray-400 text-gray-800"
                placeholder="Quel sport ?"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <MapPin size={18} className="text-[#00694c] flex-shrink-0" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder-gray-400 text-gray-800"
                placeholder="Quelle ville ?"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <Calendar size={18} className="text-[#00694c] flex-shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder-gray-400 text-gray-800"
                placeholder="Quand ?"
              />
            </div>
            <div className="px-3 py-2.5 sm:py-0">
              <button type="submit" className="w-full sm:w-auto bg-[#00694c] hover:bg-[#005a40] text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Search size={16} />
                Explorer
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-1">Exclusivités</p>
            <h2 className="text-2xl font-black text-gray-900">Expériences en vedette</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFeaturedIndex(Math.max(0, featuredIndex - 1))}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
              disabled={featuredIndex === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setFeaturedIndex(Math.min(featured.length - 1, featuredIndex + 1))}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
              disabled={featuredIndex >= featured.length - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((exp) => (
            <ExperienceCard key={exp.id} {...exp} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Explorez par catégorie</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Chaque passion mérite son expérience sur mesure. Découvrez notre sélection exclusive.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-gray-100 hover:border-[#00694c] hover:bg-[#f0faf6] transition-all group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#00694c] transition-colors">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-[#d14405]" />
          <h2 className="text-2xl font-black text-gray-900">Trending cette semaine</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => navigate(`/experience/${trending[0]?.id}`)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ minHeight: 360 }}
          >
            <img
              src={trending[0]?.image}
              alt={trending[0]?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-[#d14405] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">Populaire</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="font-black text-xl mb-1">{trending[0]?.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-2">{trending[0]?.description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {trending.slice(1, 3).map((exp) => (
              <div
                key={exp.id}
                onClick={() => navigate(`/experience/${exp.id}`)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group flex-1"
                style={{ minHeight: 168 }}
              >
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#d14405] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">Populaire</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-sm">{exp.title}</h3>
                  <p className="text-xs text-gray-300">A partir de {exp.price}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase text-center mb-6">Ils nous font confiance</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {partners.map((p) => (
              <span key={p} className="text-lg font-black text-gray-300 tracking-widest hover:text-gray-400 transition-colors cursor-default">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Le sport comme vous ne l'avez jamais vu</h2>
          <p className="text-gray-500 text-sm mb-12">En trois étapes simples, accédez à l'exceptionnel.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Cherchez",
                desc: "Explorez des centaines d'expériences uniques filtrées par sport, date et localisation.",
              },
              {
                icon: "📅",
                title: "Réservez",
                desc: "Paiement sécurisé et confirmation immédiate. Votre accès VIP est garanti par Sporena.",
              },
              {
                icon: "🏆",
                title: "Vivez",
                desc: "Présentez-vous le jour J et vivez un moment inoubliable au cœur de votre passion.",
              },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00694c] flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
