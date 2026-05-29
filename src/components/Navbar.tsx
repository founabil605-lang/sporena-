import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
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
            placeholder="Rechercher une experience..."
          />
        </form>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-[#00694c] transition-colors border-b-2 border-[#00694c] pb-0.5">
            Categories
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#00694c] flex items-center justify-center text-white font-bold text-sm">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                  {user.role === 'club' ? user.club_name || 'Club' : 'Supporter'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[200px] py-2 z-50">
                  {user.role === 'club' && (
                    <Link
                      to="/club/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Tableau de bord
                    </Link>
                  )}
                  <Link
                    to="#"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={16} />
                    Mon profil
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    Deconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-gray-700 hover:text-[#00694c] transition-colors">
                Connexion
              </Link>
              <Link to="/auth" className="bg-[#00694c] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#005a40] transition-colors">
                S'inscrire
              </Link>
            </>
          )}
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
              placeholder="Rechercher une experience..."
            />
          </form>
          <Link to="/search" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Categories</Link>

          {user ? (
            <>
              {user.role === 'club' && (
                <Link to="/club/dashboard" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  Tableau de bord
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 text-left"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Connexion</Link>
              <Link to="/auth" className="bg-[#00694c] text-white text-sm font-semibold px-5 py-2 rounded-full text-center" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
