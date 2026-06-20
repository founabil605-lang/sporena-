import { useNavigate } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { Footer } from "../../components/Footer";

export const AuthChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00694c] via-[#00543c] to-[#003d2d] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-16">
            <h1 className="font-black text-5xl text-white mb-4">Bienvenue sur SPORENA</h1>
            <p className="text-[#d4f5e9] text-lg">Choisissez votre rôle pour continuer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => navigate("/auth/club-login")}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 transition-all hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00694c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00694c] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 size={32} className="text-white" />
                </div>
                <h2 className="font-black text-2xl text-gray-900">Club</h2>
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  Gérez vos expériences sportives, suivez vos réservations et analysez vos performances.
                </p>
                <div className="w-full pt-4 mt-2 border-t border-gray-100">
                  <span className="text-[#00694c] font-semibold text-sm">Accéder à l'espace club →</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/fan/login")}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 transition-all hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00694c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00694c] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={32} className="text-white" />
                </div>
                <h2 className="font-black text-2xl text-gray-900">Supporter</h2>
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  Explorez et réservez des expériences sportives exclusives près de chez vous.
                </p>
                <div className="w-full pt-4 mt-2 border-t border-gray-100">
                  <span className="text-[#00694c] font-semibold text-sm">Parcourir les expériences →</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#d4f5e9] text-sm">
              En accédant à la plateforme, vous acceptez nos{" "}
              <button className="underline hover:text-white transition-colors">Conditions d'utilisation</button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
