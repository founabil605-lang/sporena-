import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Footer } from '../../components/Footer';

export const ClubRegister = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    if (!agreed) {
      setError('Veuillez accepter les conditions generales');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, 'club', clubName);
    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Erreur lors de l\'inscription');
    } else {
      navigate('/club/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00694c] via-[#00543c] to-[#003d2d] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Link to="/auth" className="inline-flex items-center gap-2 text-[#d4f5e9] mb-8 hover:gap-3 transition-all">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Retour</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#00694c] flex items-center justify-center text-white mx-auto mb-4">
                <Building2 size={28} />
              </div>
              <h1 className="font-black text-2xl text-gray-900">Inscription Club</h1>
              <p className="text-gray-500 text-sm mt-2">Rejoignez la plateforme SPORENA</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Nom du club</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="Ex: Paris FC, OL, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Email professionnel</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="contact@votreclub.fr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Telephone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="Min. 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 tracking-wider uppercase block mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 cursor-pointer flex items-center justify-center transition-colors ${agreed ? 'bg-[#00694c] border-[#00694c]' : 'border-gray-300'}`}
                >
                  {agreed && <span className="text-white text-xs">&#10003;</span>}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  J'accepte les{' '}
                  <Link to="#" className="text-[#00694c] underline">Conditions Generales d'Utilisation</Link>
                  {' '}et la politique de confidentialite.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00694c] hover:bg-[#005a40] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Inscription...' : 'Creer mon compte club'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Deja inscrit ?{' '}
                <Link to="/auth/club-login" className="text-[#00694c] font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
