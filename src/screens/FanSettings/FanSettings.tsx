import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, TriangleAlert as AlertTriangle, Mail, Bell, MessageSquare, Download } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const FanSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [pseudo, setPseudo] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [profileRes, settingsRes] = await Promise.all([
      supabase.from("fan_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("fan_settings").select("*").eq("user_id", user.id).single(),
    ]);
    if (profileRes.data) {
      setPseudo(profileRes.data.pseudo || "Sportif2024");
      setFavoriteSport(profileRes.data.favorite_sport || "Tennis");
      setAvatarUrl(profileRes.data.avatar_url || "");
    }
    if (settingsRes.data) {
      setEmailNotif(settingsRes.data.email_notif ?? true);
      setPushNotif(settingsRes.data.push_notif ?? true);
      setSmsNotif(settingsRes.data.sms_notif ?? false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage("");

    const { data: existingProfile } = await supabase.from("fan_profiles").select("id").eq("user_id", user.id).single();
    if (existingProfile) {
      await supabase.from("fan_profiles").update({ pseudo, favorite_sport: favoriteSport, avatar_url: avatarUrl }).eq("id", existingProfile.id);
    } else {
      await supabase.from("fan_profiles").insert({ user_id: user.id, pseudo, favorite_sport: favoriteSport, avatar_url: avatarUrl });
    }

    const { data: existingSettings } = await supabase.from("fan_settings").select("id").eq("user_id", user.id).single();
    if (existingSettings) {
      await supabase.from("fan_settings").update({ email_notif: emailNotif, push_notif: pushNotif, sms_notif: smsNotif }).eq("id", existingSettings.id);
    } else {
      await supabase.from("fan_settings").insert({ user_id: user.id, email_notif: emailNotif, push_notif: pushNotif, sms_notif: smsNotif });
    }

    setSaving(false);
    setMessage("Modifications enregistrées !");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Cette action est irréversible et supprimera tout votre historique. Êtes-vous sûr ?")) return;
    await supabase.auth.signOut();
    navigate("/");
  };

  const sports = ["Tennis", "Football", "Basketball", "Rugby", "Padel", "Natation", "Running", "Fitness"];

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar />
      <div className="flex-1 flex flex-col">
        <FanTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Paramètres</h1>
              <p className="text-gray-600">Gérez vos informations personnelles et vos préférences de compte.</p>
            </div>

            {message && (
              <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.includes("erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            <div className="space-y-8">
              {/* Profil public */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <h2 className="font-bold text-lg text-gray-900 mb-2">Profil public</h2>
                    <p className="text-sm text-gray-500">Ces informations seront visibles par les autres membres de la communauté.</p>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center relative">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-[#2c3e50] w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                            {pseudo?.[0] || "S"}
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 w-6 h-6 bg-[#00694c] rounded-full flex items-center justify-center text-white">
                          <Camera size={12} />
                        </button>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">Photo de profil</p>
                        <p className="text-xs text-gray-500 mb-2">JPG, GIF ou PNG. Max 2Mo.</p>
                        <div className="flex gap-2">
                          <button className="text-[#00694c] text-xs font-bold hover:underline">MODIFIER</button>
                          <button className="text-[#d14405] text-xs font-bold hover:underline">SUPPRIMER</button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Pseudo</label>
                        <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c]" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Sport favori</label>
                        <select value={favoriteSport} onChange={(e) => setFavoriteSport(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#00694c]">
                          {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <h2 className="font-bold text-lg text-gray-900 mb-2">Notifications</h2>
                    <p className="text-sm text-gray-500">Choisissez comment vous souhaitez être informé de vos réservations.</p>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    {[
                      { label: "Email", desc: "Confirmations et rappels par courriel", icon: Mail, state: emailNotif, set: setEmailNotif },
                      { label: "Push Mobile", desc: "Alertes instantanées sur votre smartphone", icon: Bell, state: pushNotif, set: setPushNotif },
                      { label: "SMS", desc: "Uniquement pour les urgences", icon: MessageSquare, state: smsNotif, set: setSmsNotif },
                    ].map((n) => (
                      <div key={n.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <n.icon size={18} className="text-[#00694c]" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{n.label}</p>
                            <p className="text-xs text-gray-500">{n.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => n.set(!n.state)}
                          className={`w-12 h-7 rounded-full transition-colors relative ${n.state ? "bg-[#00694c]" : "bg-gray-200"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${n.state ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RGPD / Danger zone */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <h2 className="font-bold text-lg text-gray-900 mb-2">Confidentialité & RGPD</h2>
                    <p className="text-sm text-gray-500">Contrôlez vos données personnelles et l'accès à votre compte.</p>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Données personnelles</p>
                        <p className="text-xs text-gray-500">Téléchargez une copie de toutes vos activités et réservations.</p>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-[#e8f0fe] text-[#00694c] text-xs font-bold hover:bg-[#d4e4fc] transition-colors flex items-center gap-2">
                        <Download size={14} />
                        EXPORTER MES DONNÉES
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-red-700">Zone de danger</p>
                        <p className="text-xs text-red-500">Cette action est irréversible et supprimera tout votre historique.</p>
                      </div>
                      <button onClick={handleDeleteAccount} className="px-4 py-2 rounded-lg bg-[#d14405] text-white text-xs font-bold hover:bg-[#b83c04] transition-colors">
                        SUPPRIMER MON COMPTE
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving || loading} className="px-8 py-3 rounded-xl bg-[#00694c] text-white font-semibold hover:bg-[#005a40] transition-colors disabled:opacity-50 flex items-center gap-2">
                  <Save size={16} />
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
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
