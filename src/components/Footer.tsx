import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <span className="font-black text-[#00694c] text-lg tracking-tight">SPORENA</span>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">
            La première plateforme de réservation d'expériences sportives exclusives.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
          <Link to="#" className="hover:text-[#00694c] transition-colors">RGPD</Link>
          <Link to="#" className="hover:text-[#00694c] transition-colors">Contacts</Link>
          <Link to="#" className="hover:text-[#00694c] transition-colors">Mentions Légales</Link>
          <Link to="#" className="hover:text-[#00694c] transition-colors">CGU</Link>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">© 2024 SPORENA. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
};
