import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Copy, Eye, ChevronRight, Plus, Trash2, Pause, Play, MoveHorizontal as MoreHorizontal, X, TriangleAlert as AlertTriangle } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const ClubExperiences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadExperiences = async () => {
    if (!user?.club_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("club_experiences")
      .select("*")
      .eq("club_id", user.club_id)
      .order("created_at", { ascending: false });
    if (data) setExperiences(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExperiences();
  }, [user?.club_id]);

  const filteredExperiences = experiences.filter((exp) => {
    if (filter === "Toutes") return true;
    if (filter === "Actives") return exp.status === "public" || exp.status === "active";
    if (filter === "Archivees") return exp.status === "archive" || exp.status === "draft" || exp.status === "suspended";
    return true;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "public":
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-blue-100 text-blue-700";
      case "suspended":
        return "bg-orange-100 text-orange-700";
      case "archive":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "public": return "Public";
      case "active": return "Actif";
      case "draft": return "Brouillon";
      case "suspended": return "Suspendu";
      case "archive": return "Archive";
      default: return status;
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("club_experiences").delete().eq("id", id);
    if (!error) {
      setExperiences(experiences.filter((e) => e.id !== id));
      setConfirmDelete(null);
      setActionMenu(null);
    }
  };

  const handleDuplicate = async (exp: any) => {
    const { data: club } = await supabase.from("clubs").select("id").eq("user_id", user?.id).maybeSingle();
    if (!club?.id) return;
    const { data, error } = await supabase.from("club_experiences").insert({
      club_id: club.id,
      title: exp.title + " (Copie)",
      description: exp.description,
      category: exp.category,
      sport: exp.sport,
      location: exp.location,
      address: exp.address,
      duration: exp.duration,
      price: exp.price,
      status: "draft",
      slots_total: exp.slots_total,
      images: exp.images,
      cancellation_policy: exp.cancellation_policy,
      includes: exp.includes,
      tags: exp.tags,
    }).select("*").single();
    if (!error && data) {
      setExperiences([data, ...experiences]);
    }
    setActionMenu(null);
  };

  const handleChangeStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("club_experiences").update({ status }).eq("id", id);
    if (!error) {
      setExperiences(experiences.map((e) => e.id === id ? { ...e, status } : e));
    }
    setActionMenu(null);
  };

  const clubName = user?.club_name || "Mon Club";

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <ClubTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Gestion des activites</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Mes experiences</h1>
              <p className="text-gray-600">Gerez votre catalogue d'activites sportives exclusives.</p>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
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
              <button
                onClick={() => navigate("/club/experiences/create")}
                className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00694c] text-white hover:bg-[#005a40] font-semibold text-sm transition-colors"
              >
                <Plus size={16} />
                Creer une experience
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#00694c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
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
                    {filteredExperiences.map((exp, idx) => (
                      <tr key={exp.id} className={`${idx !== filteredExperiences.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={exp.images?.[0] || "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=200"}
                              alt={exp.title}
                              className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{exp.title}</p>
                              <p className="text-xs text-gray-500">{exp.category} - {exp.sport}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(exp.status)}`}>
                            {statusLabel(exp.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">{exp.slots_total}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">{exp.slots_booked}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-gray-900">{exp.price} EUR</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 relative">
                            <button onClick={() => navigate(`/experience/${exp.id}`)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Voir">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => navigate(`/club/experiences/create?edit=${exp.id}`)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Editer">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDuplicate(exp)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Dupliquer">
                              <Copy size={16} />
                            </button>
                            <button onClick={() => setActionMenu(actionMenu === idx ? null : idx)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
                              <MoreHorizontal size={16} />
                            </button>

                            {actionMenu === idx && (
                              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 w-48 py-2">
                                {exp.status === "public" && (
                                  <button onClick={() => handleChangeStatus(exp.id, "suspended")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Pause size={14} /> Suspendre
                                  </button>
                                )}
                                {(exp.status === "suspended" || exp.status === "draft") && (
                                  <button onClick={() => handleChangeStatus(exp.id, "public")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Play size={14} /> Publier
                                  </button>
                                )}
                                <button onClick={() => handleChangeStatus(exp.id, "archive")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <AlertTriangle size={14} /> Archiver
                                </button>
                                <button onClick={() => { setConfirmDelete(exp.id); setActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 size={14} /> Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredExperiences.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                          Aucune experience trouvee. <button onClick={() => navigate("/club/experiences/create")} className="text-[#00694c] font-semibold hover:underline">Creez votre premiere !</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">Affichage de {filteredExperiences.length} sur {experiences.length} experiences</p>
          </div>
          <Footer />
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Supprimer cette experience ?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Cette action est irreversible. Toutes les donnees associees seront supprimees.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
