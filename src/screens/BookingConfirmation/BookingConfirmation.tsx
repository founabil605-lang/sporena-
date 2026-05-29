import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, User, Download, CalendarPlus, Mail, CircleCheck as CheckCircle } from "lucide-react";
import { Footer } from "../../components/Footer";
import { experiences } from "../../data/experiences";

const QRCode = () => (
  <div className="grid grid-cols-8 gap-0.5 w-24 h-24">
    {Array.from({ length: 64 }).map((_, i) => {
      const pattern = [
        0,0,0,0,1,0,1,0,
        0,1,1,0,0,1,0,1,
        1,0,0,1,1,0,0,0,
        0,1,0,0,1,1,0,1,
        1,0,1,1,0,0,1,0,
        0,0,1,0,1,0,0,1,
        1,1,0,0,0,1,1,0,
        0,1,0,1,1,0,1,1,
      ];
      return (
        <div
          key={i}
          className={`w-full aspect-square rounded-sm ${pattern[i] ? "bg-gray-900" : "bg-white"}`}
        />
      );
    })}
  </div>
);

export const BookingConfirmation = () => {
  const { id } = useParams();
  const exp = experiences.find((e) => e.id === id) || experiences[0];

  const reference = `#SP-${Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6)}`;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link to="/">
            <span className="font-black text-[#00694c] text-xl tracking-tight">SPORENA</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#d4f5e9] flex items-center justify-center">
                <CheckCircle size={40} className="text-[#00694c]" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-200" />
              <div className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-blue-200" />
            </div>

            <div>
              <h1 className="font-black text-4xl text-[#00694c] mb-3">C'est confirmé !</h1>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                Votre place est réservée pour cette expérience sportive exclusive. Un e-mail de confirmation vient d'être envoyé à votre adresse.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button className="flex-1 bg-[#00694c] hover:bg-[#005a40] text-white font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Download size={16} />
                Télécharger mon billet PDF
              </button>
              <button className="flex-1 bg-[#eef2ff] hover:bg-[#e0e8ff] text-[#071b39] font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <CalendarPlus size={16} />
                Ajouter au calendrier
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={15} />
              <span>Vous n'avez pas reçu l'email ?{" "}</span>
              <button className="text-[#00694c] font-semibold hover:underline">Renvoyer la confirmation</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="relative h-44 overflow-hidden">
              <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 right-3">
                <span className="bg-[#d14405] text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full uppercase">VIP Access</span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-1">Référence: {reference}</p>
                <h3 className="font-black text-xl text-gray-900">{exp.title}</h3>
              </div>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Date & Heure</p>
                    <p className="text-sm font-semibold text-gray-900">{exp.date} • {exp.time.split(" - ")[1] || exp.time.split("–")[1] || exp.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Lieu</p>
                    <p className="text-sm font-semibold text-gray-900">{exp.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Participant</p>
                    <p className="text-sm font-semibold text-gray-900">Jean-Marc Dupont</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-5 flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <QRCode />
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Présentez ce QR code à l'entrée</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
