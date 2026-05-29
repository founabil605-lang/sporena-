import { Download, Calendar, FileText } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";

export const ClubBookings = () => {
  const bookings = [
    {
      id: 1,
      name: "Sophie Laurent",
      initials: "SL",
      experience: "Yoga au Lever du Soleil",
      type: "Premium Pack",
      date: "24 Oct, 2023",
      time: "07:30 - 09:00",
      persons: 2,
      total: "120,00 €",
      status: "Confirmé",
    },
    {
      id: 2,
      name: "Marc Dubois",
      initials: "MD",
      experience: "Masterclass Tennis VIP",
      type: "Session Individuelle",
      date: "25 Oct, 2023",
      time: "14:00 - 16:00",
      persons: 1,
      total: "250,00 €",
      status: "En attente",
    },
    {
      id: 3,
      name: "Jean-Pierre Bernard",
      initials: "JP",
      experience: "Randonnée Alpine",
      type: "Standard",
      date: "26 Oct, 2023",
      time: "09:00 - 17:00",
      persons: 4,
      total: "320,00 €",
      status: "Annulé",
    },
    {
      id: 4,
      name: "Emma Roche",
      initials: "ER",
      experience: "Yoga au Lever du Soleil",
      type: "Pack Découverte",
      date: "27 Oct, 2023",
      time: "07:30 - 09:00",
      persons: 1,
      total: "45,00 €",
      status: "Confirmé",
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "Confirmé":
        return "bg-green-100 text-green-700";
      case "En attente":
        return "bg-blue-100 text-blue-700";
      case "Annulé":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar clubName="Club Elite Paris" userRole="Premium Host" />

      <div className="flex-1 flex flex-col">
        <ClubTopbar userName="Thomas Müller" tier="ELITE PARTNER" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Gestion des flux</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Réservations</h1>
              <p className="text-gray-600">Gérez vos participants, suivez vos revenus et assurez le bon déroulement de chaque session sportive.</p>
            </div>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <Download size={16} />
                Exporter CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00694c] text-white hover:bg-[#005a40] text-sm font-medium transition-colors">
                <Calendar size={16} />
                Vue Calendrier
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Période</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]">
                    <option>7 prochains jours</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Expérience</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]">
                    <option>Toutes les expériences</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Statut</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00694c]">
                    <option>Tous les statuts</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Total Réservations</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#00694c]">124</span>
                    <span className="text-green-600 text-sm">↑</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Fan Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Expérience</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date/Heure</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Pers.</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Prix Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, idx) => (
                    <tr key={booking.id} className={`${idx !== bookings.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00694c] to-[#003d2d] flex items-center justify-center text-white text-xs font-bold">
                            {booking.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{booking.name}</p>
                            <p className="text-xs text-gray-500">ID: #SP-{String(booking.id).padStart(4, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.experience}</p>
                          <p className="text-xs text-gray-500">{booking.type}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{booking.persons}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{booking.total}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-4">Affichage de 1-10 sur 124 réservations</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-2">Support Prioritaire Club</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Besoin d'aide avec une annulation complexe ou un litige de paiement ? Nos experts Club sont à votre disposition.
                </p>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-black transition-colors">
                  Contacter le support
                </button>
              </div>

              <div className="bg-[#00694c] text-white rounded-2xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">Prochain Versement</h3>
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Prévu pour le 30 Octobre</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-[#d4f5e9] mb-1">Montant sécurisé par Stripe</p>
                  <p className="font-black text-4xl">4,280.00 €</p>
                </div>
                <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <span>+</span> Consulter l'historique
                </button>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};
