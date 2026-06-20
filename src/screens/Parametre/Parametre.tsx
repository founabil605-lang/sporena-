import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Bell, Shield, Check, Upload, Save, TriangleAlert as AlertTriangle, Eye, Globe, MapPin, FileText } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const SECTIONS = [
  { id: "profile", label: "Profil du Club", icon: Building2 },
  { id: "team", label: "Gestion d'Équipe", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
];

export const Parametre = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Profile
  const [clubName, setClubName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Notifications
  const [notifReservations, setNotifReservations] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Team (mock)
  const [teamMembers] = useState([
    { id: 1, name: "Marc Lefebvre", email: "m.lefebvre@example.com", role: "Administrateur", avatar: "ML" },
    { id: 2, name: "Sophie Martin", email: "s.martin@example.com", role: "Coach Principal", avatar: "SM" },
  ]);

  useEffect(() => {
    if (!user?.club_id) return;
    const load = async () => {
      const { data: club } = await supabase.from("clubs").select("*").eq("id", user.club_id).single();
      const { data: settings } = await supabase.from("club_settings").select("*").eq("club_id", user.club_id).single();
      if (club) {
        setClubName(club.name || "");
        setDescription(club.description || "");
      }
      if (settings) {
        setWebsite(settings.website || "");
        setAddress(settings.address || "");
        setPhone(settings.phone || "");
        setLogoUrl(settings.logo_url || "");
        setNotifReservations(settings.notification_reservations ?? true);
        setNotifReviews(settings.notification_reviews ?? true);
        setNotifMarketing(settings.notification_marketing ?? false);
      }
      setLoading(false);
    };
    load();
  }, [user?.club_id]);

  const handleSaveProfile = async () => {
    if (!user?.club_id) return;
    setSaving(true);
    setMessage("");
    await supabase.from("clubs").update({ name: clubName, description }).eq("id", user.club_id);
    const { data: existing } = await supabase.from("club_settings").select("id").eq("club_id", user.club_id).single();
    if (existing) {
      await supabase.from("club_settings").update({
        website, address, phone, logo_url: logoUrl, description,
        notification_reservations: notifReservations,
        notification_reviews: notifReviews,
        notification_marketing: notifMarketing,
      }).eq("id", existing.id);
    } else {
      await supabase.from("club_settings").insert({
        club_id: user.club_id, website, address, phone, logo_url: logoUrl, description,
        notification_reservations: notifReservations,
        notification_reviews: notifReviews,
        notification_marketing: notifMarketing,
      });
    }
    setSaving(false);
    setMessage("Modifications enregistrées !");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      setMessage("Veuillez saisir un mot de passe de 6 caractères minimum.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else {
      setOldPassword("");
      setNewPassword("");
      setMessage("Mot de passe mis à jour !");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver votre compte ?")) return;
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar />
      <div className="flex-1 flex flex-col">
        <ClubTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">Paramètres</p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Paramètres</h1>
              <p className="text-gray-600">Gérez votre profil de club, votre équipe et vos préférences de sécurité.</p>
            </div>

            {message && (
              <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.includes("erreur") || message.includes("Veuillez") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar nav */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Sections</p>
                  <div className="space-y-1">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          activeSection === s.id ? "bg-[#f0faf6] text-[#00694c]" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <s.icon size={18} />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#00694c] to-[#004a35] rounded-2xl text-white p-6">
                  <p className="text-xs font-bold text-[#d4f5e9] tracking-widest uppercase mb-2">Statut du Club</p>
                  <h3 className="font-black text-xl mb-3">Vérifié Premium</h3>
                  <p className="text-xs text-[#d4f5e9] mb-4">Votre club bénéficie de toutes les fonctionnalités Sporena Club Space.</p>
                  <button className="bg-white text-[#00694c] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                    Voir mon profil public
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                {activeSection === "profile" && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Profil du Club</h2>
                    <p className="text-sm text-gray-500 mb-6">Ces informations seront visibles par les membres et clients.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Nom du Club</label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={clubName} onChange={(e) => setClubName(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Site Web</label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c]" placeholder="https://" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Description</label>
                        <div className="relative">
                          <FileText size={16} className="absolute left-4 top-3 text-gray-400" />
                          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] min-h-[100px] resize-y" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Adresse</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
                      <button onClick={handleSaveProfile} disabled={saving || loading} className="px-6 py-2.5 rounded-xl bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors disabled:opacity-50 flex items-center gap-2">
                        <Save size={16} />
                        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === "team" && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg mb-1">Gestion d'Équipe</h2>
                        <p className="text-sm text-gray-500">Invitez et gérez les rôles de vos collaborateurs.</p>
                      </div>
                      <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Users size={16} />
                        Ajouter un membre
                      </button>
                    </div>
                    <div className="space-y-3">
                      {teamMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00694c] to-[#003d2d] flex items-center justify-center text-white text-xs font-bold">
                              {m.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500">{m.email}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${m.role === "Administrateur" ? "bg-[#d4f5e9] text-[#00694c]" : "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-6">Notifications</h2>
                    <div className="space-y-6">
                      {[
                        { label: "Réservations", desc: "Nouvelle séance réservée", state: notifReservations, set: setNotifReservations },
                        { label: "Avis clients", desc: "Nouveau commentaire reçu", state: notifReviews, set: setNotifReviews },
                        { label: "Marketing", desc: "Nouveautés Sporena", state: notifMarketing, set: setNotifMarketing },
                      ].map((n) => (
                        <div key={n.label} className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{n.label}</p>
                            <p className="text-xs text-gray-500">{n.desc}</p>
                          </div>
                          <button
                            onClick={() => n.set(!n.state)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${n.state ? "bg-[#00694c]" : "bg-gray-200"}`}
                          >
                            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${n.state ? "translate-x-5" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors disabled:opacity-50 flex items-center gap-2">
                        <Save size={16} />
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-6">Sécurité</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Ancien mot de passe</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c]" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Nouveau mot de passe</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c]" />
                      </div>
                    </div>
                    <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors">
                      Changer le mot de passe
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-3">Dernière modification : il y a 3 mois</p>

                    <div className="mt-8 border border-red-200 rounded-xl p-6 bg-red-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertTriangle size={18} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-700 text-sm">Désactiver le compte Club</p>
                          <p className="text-xs text-red-500">Toutes vos données seront archivées pendant 30 jours avant suppression.</p>
                        </div>
                      </div>
                      <button onClick={handleDeactivate} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                        Désactiver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
