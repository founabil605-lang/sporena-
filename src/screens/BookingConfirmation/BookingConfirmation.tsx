import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin, User, Download, CalendarPlus, Mail, CircleCheck as CheckCircle, Share2, Chrome as Home, ArrowRight } from "lucide-react";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [exp, setExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();
      if (bookingData) {
        setBooking(bookingData);
        const { data: expData } = await supabase
          .from("club_experiences")
          .select("*, clubs(name, logo_url)")
          .eq("id", bookingData.experience_id)
          .single();
        if (expData) {
          setExp({
            id: expData.id,
            title: expData.title,
            club: expData.clubs?.name || "Club",
            category: expData.category,
            price: expData.price || 0,
            date: expData.date || "Date à définir",
            time: expData.time || "Heure à définir",
            location: expData.location || "Paris",
            address: expData.address || "",
            images: expData.images || [expData.image_url || "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800"],
            description: expData.description || "",
            certified: expData.certified || false,
          });
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleDownloadTicket = () => {
    if (!booking || !exp) return;
    const content = `
╔══════════════════════════════════════════════════════╗
║                SPORENA - TICKET VIP                 ║
╠══════════════════════════════════════════════════════╣
║  Référence: ${booking.id?.slice(0, 8).toUpperCase() || "N/A"}                          ║
║  Expérience: ${exp.title}                            ║
║  Club: ${exp.club}                                   ║
║  Date: ${exp.date}                                   ║
║  Heure: ${exp.time}                                  ║
║  Lieu: ${exp.location}                               ║
║  Adresse: ${exp.address || "-"}                      ║
║  Participant: ${user?.email || booking.customer_email}                           ║
║  Prix: ${exp.price}€                                 ║
║  Statut: CONFIRMÉ                                   ║
╚══════════════════════════════════════════════════════╝
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billet-sporena-${booking.id?.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    if (!exp) return;
    const title = encodeURIComponent(exp.title);
    const location = encodeURIComponent(`${exp.location}, ${exp.address}`);
    const description = encodeURIComponent(`Réservation SPORENA - ${exp.title} avec ${exp.club}`);
    const dateStr = exp.date;
    const timeStr = exp.time.split(" - ")[0] || exp.time;
    const startDate = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${format(startDate)}/${format(endDate)}&details=${description}&location=${location}`;
    window.open(url, "_blank");
  };

  const handleResendEmail = async () => {
    if (!booking || !exp) return;
    await supabase.from("fan_notifications").insert({
      user_id: user?.id,
      title: "Confirmation de réservation",
      message: `Votre réservation pour "${exp.title}" a été confirmée. Référence: ${booking.id?.slice(0, 8).toUpperCase()}`,
      type: "general",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking || !exp) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Réservation non trouvée</p>
          <button onClick={() => navigate("/search")} className="px-6 py-3 rounded-xl bg-[#00694c] text-white font-semibold">
            Explorer les expériences
          </button>
        </div>
      </div>
    );
  }

  const reference = booking.id ? `#SP-${booking.id.slice(0, 6).toUpperCase()}` : "#SP-000000";
  const participantName = user?.user_metadata?.pseudo || user?.email?.split("@")[0] || "Jean-Marc Dupont";

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
              <button
                onClick={handleDownloadTicket}
                className="flex-1 bg-[#00694c] hover:bg-[#005a40] text-white font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                Télécharger mon billet
              </button>
              <button
                onClick={handleAddToCalendar}
                className="flex-1 bg-[#eef2ff] hover:bg-[#e0e8ff] text-[#071b39] font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <CalendarPlus size={16} />
                Ajouter au calendrier
              </button>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={15} />
                <span>Vous n'avez pas reçu l'email ?{" "}</span>
                <button onClick={handleResendEmail} className="text-[#00694c] font-semibold hover:underline">Renvoyer la confirmation</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button
                onClick={() => navigate("/fan/dashboard")}
                className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Home size={16} />
                Mon espace
              </button>
              <button
                onClick={() => navigate("/search")}
                className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight size={16} />
                Continuer
              </button>
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
                    <p className="text-sm font-semibold text-gray-900">{exp.date} • {exp.time}</p>
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
                    <p className="text-sm font-semibold text-gray-900">{participantName}</p>
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
