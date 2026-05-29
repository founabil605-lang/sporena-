import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0">
          <span className="font-black text-[#00694c] text-xl tracking-tight">SPORENA</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
            placeholder="Rechercher une expérience..."
          />
        </form>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-[#00694c] transition-colors border-b-2 border-[#00694c] pb-0.5">
            Catégories
          </Link>
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#00694c] transition-colors">
            Connexion
          </Link>
          <Link to="/register" className="bg-[#00694c] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#005a40] transition-colors">
            S'inscrire
          </Link>
        </nav>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
              placeholder="Rechercher une expérience..."
            />
          </form>
          <Link to="/search" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Catégories</Link>
          <Link to="/login" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Connexion</Link>
          <Link to="/register" className="bg-[#00694c] text-white text-sm font-semibold px-5 py-2 rounded-full text-center" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
        </div>
      )}
    </header>
  );
};
