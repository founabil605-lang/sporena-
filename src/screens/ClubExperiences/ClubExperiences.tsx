import React, { useState } from "react";
import { CreditCard as Edit2, Copy, Plus, Eye, ChevronRight } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

export const ClubExperiences = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("Toutes");

  const experiences = [
    {
      id: 1,
      title: "Hatha Yoga Flow & Meditation",
      description: "d'eliness - 90 min",
      image: "🧘",
      status: "PUBLIC",
      slots: 12,
      bookings: 156,
      revenue: "4 680 EUR",
    },
    {
      id: 2,
      title: "HIIT High Performance",
      description: "Fitness - 60 min",
      image: "💪",
      status: "BROUILLON",
      slots: 0,
      bookings: 0,
      revenue: "0 EUR",
    },
    {
      id: 3,
      title: "Perfectionnement Natation",
      description: "Aquatique - 45 min",
      image: "🏊",
      status: "SUSPENDU",
      slots: 4,
      bookings: 42,
      revenue: "1 470 EUR",
    },
    {
      id: 4,
      title: "Trek Alpin: Pic du Midi",
      description: "Outdoor - 1 Day",
      image: "⛰️",
      status: "ARCHIVE",
      slots: 0,
      bookings: 84,
      revenue: "10 080 EUR",
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "PUBLIC":
        return "bg-green-100 text-green-700";
      case "BROUILLON":
        return "bg-blue-100 text-blue-700";
      case "SUSPENDU":
        return "bg-orange-100 text-orange-700";
      case "ARCHIVE":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const clubName = user?.club_name || "Mon Club";

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar />

      <div className="flex-1 flex flex-col">
        <ClubTopbar />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Gestion des activites</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Mes experiences</h1>
              <p className="text-gray-600">Gerez votre catalogue d'activites sportives exclusives.</p>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex gap-2">
                {["Toutes", "Actives", "Archivees"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? "bg-[#00694c] text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-[#00694c]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00694c] text-white hover:bg-[#005a40] font-semibold text-sm transition-colors">
                <Plus size={16} />
                Creer une experience
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Experience</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Creneaux</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Reservations</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">CA Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.map((exp, idx) => (
                    <tr key={exp.id} className={`${idx !== experiences.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{exp.image}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{exp.title}</p>
                            <p className="text-xs text-gray-500">{exp.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(exp.status)}`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{exp.slots}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{exp.bookings}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{exp.revenue}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Editer">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Dupliquer">
                            <Copy size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Voir">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-4">Affichage de 1 a 4 sur 28 experiences</p>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};
