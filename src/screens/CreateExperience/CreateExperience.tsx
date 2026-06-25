import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, ArrowRight, Check, Camera, Clock, MapPin, Star, Users, Shield, ChevronRight, ChevronLeft, Calendar, Image, Upload, X, Lightbulb, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Save } from "lucide-react";
import { ClubSidebar } from "../../components/ClubSidebar";
import { ClubTopbar } from "../../components/ClubTopbar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const STEPS = ["Details", "Media", "Availability", "Pricing", "Preview"];

const CATEGORIES = [
  { id: "premium", label: "Premium", icon: "🎁" },
  { id: "collectif", label: "Collectif", icon: "👥" },
  { id: "masterclass", label: "Masterclass", icon: "🎓" },
  { id: "intense", label: "Intense", icon: "🔥" },
  { id: "outdoor", label: "Outdoor", icon: "🏕" },
  { id: "exclusif", label: "Exclusif", icon: "⭐" },
  { id: "flash", label: "Flash", icon: "⚡" },
  { id: "decouverte", label: "Découverte", icon: "🧭" },
];

const SPORTS = [
  "Football",
  "Basketball",
  "Rugby",
  "Padel",
  "Handball",
  "Tennis",
  "Natation",
  "Yoga",
  "Fitness",
  "Golf",
  "Volleyball",
  "Athlétisme",
  "Autre",
];

const CANCELLATION_OPTIONS = [
  {
    id: "flexible",
    label: "Flexible",
    desc: "Remboursement intégral jusqu'à 24h avant le début de l'expérience.",
  },
  {
    id: "moderate",
    label: "Modérée",
    desc: "Remboursement à 50% jusqu'à 7 jours avant. Recommandé pour l'équilibre.",
  },
  {
    id: "strict",
    label: "Stricte",
    desc: "Aucun remboursement après confirmation de la réservation.",
  },
];

const MOCK_IMAGES = [
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export const CreateExperience = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [includes, setIncludes] = useState<string[]>([]);
  const [newInclude, setNewInclude] = useState("");

  // Step 2: Media
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Step 3: Availability
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  const [slots, setSlots] = useState<{ date: string; start: string; end: string; spots: number }[]>([]);
  const [spotCount, setSpotCount] = useState(12);

  // Step 4: Pricing
  const [priceHT, setPriceHT] = useState(100);
  const [tvaRate, setTvaRate] = useState(20);
  const [cancellationPolicy, setCancellationPolicy] = useState("moderate");

  const commissionRate = 15;

  const priceTTC = Math.round(priceHT * (1 + tvaRate / 100));
  const commission = Math.round(priceTTC * (commissionRate / 100));
  const net = priceTTC - commission;

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const addInclude = () => {
    if (newInclude.trim() && !includes.includes(newInclude.trim())) {
      setIncludes([...includes, newInclude.trim()]);
      setNewInclude("");
    }
  };

  const removeInclude = (item: string) => {
    setIncludes(includes.filter((i) => i !== item));
  };

  const addSlot = () => {
    if (!selectedDate) return;
    setSlots([...slots, { date: selectedDate, start: startTime, end: endTime, spots: spotCount }]);
    setSelectedDate("");
  };

  const removeSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const addImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter((i) => i !== url));
  };

  const handleNext = () => {
    setError("");
    if (step === 0) {
      if (!title.trim()) return setError("Veuillez saisir un titre.");
      if (!description.trim()) return setError("Veuillez saisir une description.");
      if (!category) return setError("Veuillez choisir une catégorie.");
      if (!sport) return setError("Veuillez choisir une discipline.");
      if (!location.trim()) return setError("Veuillez saisir un lieu.");
      if (!address.trim()) return setError("Veuillez saisir une adresse.");
      if (!duration.trim()) return setError("Veuillez saisir une durée.");
    }
    if (step === 1 && images.length === 0) {
      return setError("Ajoutez au moins une photo.");
    }
    if (step === 2 && slots.length === 0) {
      return setError("Ajoutez au moins un créneau.");
    }
    if (step === 3 && priceHT <= 0) {
      return setError("Le prix doit être supérieur à 0.");
    }
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setError("");
    setStep(Math.max(step - 1, 0));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      const clubResult = await supabase
        .from("clubs")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (clubResult.error || !clubResult.data) {
        setError("Club non trouvé.");
        setSaving(false);
        return;
      }
      const { error: insertError } = await supabase.from("club_experiences").insert({
        club_id: clubResult.data.id,
        title,
        description,
        category,
        sport,
        location,
        address,
        duration,
        price: priceTTC,
        status: "draft",
        slots_total: maxParticipants,
        images: images.length > 0 ? images : null,
        cancellation_policy: cancellationPolicy,
        includes: includes.length > 0 ? includes : null,
        tags: [category, sport],
      });
      if (insertError) {
        setError(insertError.message);
      } else {
        navigate("/club/experiences");
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError("");
    try {
      const clubResult = await supabase
        .from("clubs")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (clubResult.error || !clubResult.data) {
        setError("Club non trouvé.");
        setSaving(false);
        return;
      }
      const { error: insertError } = await supabase.from("club_experiences").insert({
        club_id: clubResult.data.id,
        title,
        description,
        category,
        sport,
        location,
        address,
        duration,
        price: priceTTC,
        status: "public",
        slots_total: maxParticipants,
        images: images.length > 0 ? images : null,
        cancellation_policy: cancellationPolicy,
        includes: includes.length > 0 ? includes : null,
        tags: [category, sport],
      });
      if (insertError) {
        setError(insertError.message);
      } else {
        navigate("/club/experiences");
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                  Titre de l'expérience
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                  placeholder="Ex: Session de Tennis VIP au Coucher du Soleil"
                  maxLength={60}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{title.length} / 60 caractères</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                  Description détaillée
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors min-h-[120px] resize-y"
                  placeholder="Décrivez le déroulement, ce qui est inclus et l'atmosphère..."
                  maxLength={1200}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{description.length} / 1200 caractères</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-3">
                  Choisissez une catégorie
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        category === cat.id
                          ? "border-[#00694c] bg-[#f0faf6] text-[#00694c]"
                          : "border-gray-200 hover:border-[#00694c] hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                  Discipline sportive
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors bg-white"
                >
                  <option value="">Sélectionnez un sport...</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    Lieu
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                      placeholder="Ex: Stade Charlety"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    Adresse
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="Ex: 99 Boulevard Kellermann, 75013 Paris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    Durée
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                      placeholder="Ex: 120 min"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    Max participants
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                  Ce qui est inclus
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    placeholder="Ex: Accès VIP, Matériel fourni..."
                  />
                  <button
                    type="button"
                    onClick={addInclude}
                    className="bg-[#00694c] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#005a40] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {includes.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 bg-[#f0faf6] text-[#00694c] text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {item}
                      <button onClick={() => removeInclude(item)} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#f6faf8] rounded-2xl p-5 border border-[#e2f0ea]">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-[#00694c]" />
                  <h3 className="font-bold text-gray-900 text-sm">Conseil d'expert</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Un titre percutant contient souvent un bénéfice clair ou un lieu emblématique. Essayez d'être spécifique pour attirer les bons participants.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Aperçu en direct</p>
                <div className="rounded-xl overflow-hidden bg-white border border-gray-100">
                  <div className="aspect-video bg-gradient-to-br from-[#e2f0ea] to-[#d4f5e9] flex items-center justify-center">
                    <Camera size={32} className="text-[#00694c]/40" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-gray-900 truncate">
                      {title || "Titre de l'expérience..."}
                    </h4>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin size={11} />
                      <span>{location || "Paris, France"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#00694c] text-sm">
                        {priceTTC > 0 ? `${priceTTC}€` : "-- €"}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Brouillon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Photos de la galerie</h3>
                <span className="text-xs text-gray-400">Min 1, max 10. JPG, PNG, WEBP</span>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#00694c] transition-colors">
                <Camera size={32} className="text-[#00694c] mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Glissez-déposez vos photos ou parcourez</p>
                <p className="text-xs text-gray-400">Format portrait recommandé pour un meilleur rendu mobile</p>
                <div className="flex justify-center gap-2 mt-4">
                  {MOCK_IMAGES.map((url) => (
                    <button
                      key={url}
                      onClick={() => addImage(url)}
                      className="text-xs bg-[#00694c] text-white px-3 py-1.5 rounded-lg hover:bg-[#005a40] transition-colors"
                    >
                      <Image size={12} className="inline mr-1" />
                      Ajouter photo {images.indexOf(url) >= 0 && "✓"}
                    </button>
                  ))}
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {images.map((url) => (
                    <div key={url} className="relative rounded-xl overflow-hidden group aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(url)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Vidéo de présentation (Optionnel)</h3>
                <span className="text-xs text-gray-400">MP4, max 50MB</span>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#00694c] transition-colors">
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Ajouter une vidéo</p>
                <p className="text-xs text-gray-400 mt-1">Ou collez une URL</p>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-3 w-full max-w-sm mx-auto border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00694c]"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Disponibilités</h3>
              <p className="text-sm text-gray-500 mb-6">Définissez quand vous souhaitez accueillir vos participants.</p>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                      Places
                    </label>
                    <div className="relative">
                      <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={spotCount}
                        onChange={(e) => setSpotCount(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                      Début
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                      Fin
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addSlot}
                  disabled={!selectedDate}
                  className="w-full bg-[#00694c] text-white font-bold py-3 rounded-xl hover:bg-[#005a40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter ce créneau
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3">Créneaux ajoutés</p>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Sélectionnez d'autres dates pour ajouter des créneaux
                  </p>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#d4f5e9] flex items-center justify-center">
                            <Calendar size={16} className="text-[#00694c]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {new Date(slot.date).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                              })},{" "}
                              {slot.start}-{slot.end}
                            </p>
                            <p className="text-xs text-gray-500">{slot.spots} places disponibles</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSlot(idx)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X size={14} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-[#00694c]" />
                <h4 className="font-bold text-sm text-gray-900">Astuce</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Les expériences proposées le week-end et en soirée ont un taux de réservation 35% plus élevé. Pensez à ajouter plusieurs créneaux pour maximiser vos revenus.
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{slots.length} créneau{slots.length > 1 ? "x" : ""} configuré</p>
                    <p className="text-xs text-gray-500">{slots.reduce((sum, s) => sum + s.spots, 0)} places totales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    Prix HT
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={priceHT}
                      onChange={(e) => setPriceHT(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">
                    TVA
                  </label>
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] transition-colors bg-white"
                  >
                    <option value={20}>Taux normal (20%)</option>
                    <option value={10}>Taux intermédiaire (10%)</option>
                    <option value={5.5}>Taux réduit (5.5%)</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Politique d'annulation</h3>
                <p className="text-sm text-gray-500 mb-4">Définissez vos conditions de remboursement pour les clients.</p>
                <div className="space-y-3">
                  {CANCELLATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCancellationPolicy(opt.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                        cancellationPolicy === opt.id
                          ? "border-[#00694c] bg-[#f0faf6]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          cancellationPolicy === opt.id ? "border-[#00694c] bg-[#00694c]" : "border-gray-300"
                        }`}
                      >
                        {cancellationPolicy === opt.id && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <p className="text-[10px] font-bold text-[#00694c] tracking-widest uppercase mb-3">Aperçu direct</p>
                <h4 className="font-bold text-gray-900 mb-4">Estimation de revenus</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votre prix HT</span>
                    <span className="font-medium text-gray-900">{priceHT.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA ({tvaRate}%)</span>
                    <span className="font-medium text-gray-900">{(priceHT * (tvaRate / 100)).toFixed(2)}€</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Prix Public TTC</span>
                    <span className="font-black text-[#00694c] text-lg">{priceTTC.toFixed(2)}€</span>
                  </div>
                  <div className="bg-white rounded-xl border border-red-100 p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-[#d14405] tracking-widest uppercase">Commission SPORENA ({commissionRate}%)</p>
                        <p className="text-xs text-gray-500 mt-0.5">Inclut le marketing, les frais bancaires et le support VIP 24/7.</p>
                      </div>
                      <span className="font-bold text-[#d14405]">-{commission.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#00694c] text-white rounded-xl p-4 mt-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Vous recevrez</p>
                  <p className="font-black text-3xl">{net.toFixed(2)}€</p>
                  <p className="text-xs text-[#d4f5e9] mt-0.5">Par réservation honorée</p>
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Le versement s'effectue 24h après la fin de chaque expérience.</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase mb-2">Étape finale</p>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Presque fini ! Vérifiez votre expérience avant de publier.
              </h2>
              <p className="text-gray-500 text-sm">
                Ceci est exactement ce que vos clients verront sur la plateforme Sporena.
              </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase text-center py-2">
                Aperçu public
              </div>
              <div className="relative aspect-video bg-gray-100">
                {images.length > 0 ? (
                  <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e2f0ea] to-[#d4f5e9]">
                    <Camera size={40} className="text-[#00694c]/30" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-[#00694c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {category || "Premium"}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-black text-white text-xl drop-shadow-lg">{title}</h3>
                  <div className="flex items-center gap-3 text-white/90 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {location}
                    </span>
                    <span>★ Nouvelle expérience</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">À propos de l'expérience</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>

                  {includes.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {includes.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle size={14} className="text-[#00694c] flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="font-bold text-gray-900 mb-3">Le lieu</h4>
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-44 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={24} className="text-[#00694c] mx-auto mb-2" />
                        <p className="font-semibold text-gray-700 text-sm">{location}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">À partir de</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-3xl text-[#00694c]">{priceTTC}€</span>
                      <span className="text-xs text-gray-500">Par personne</span>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">Prochaines dates</p>
                      {slots.slice(0, 2).map((slot, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#d4f5e9] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#00694c]">
                              {new Date(slot.date).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                              <br />
                              {new Date(slot.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {new Date(slot.date).toLocaleDateString("fr-FR", { weekday: "long" })},{" "}
                              {slot.start} - {slot.end}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 ml-auto" />
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-[#00694c] text-white font-bold py-3 rounded-xl mt-2">Vérifier la disponibilité</button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Vous ne serez débité qu'après confirmation.
                    </p>
                  </div>

                  {slots.some((s) => s.spots <= 5) && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={14} className="text-orange-500" />
                        <span className="font-bold text-orange-700 text-xs">Places Limitées</span>
                      </div>
                      <p className="text-xs text-orange-600">
                        Plus que {Math.min(...slots.map((s) => s.spots))} places disponibles pour la prochaine session.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle size={14} />
                <span>Relisez bien les détails avant la publication officielle.</span>
              </div>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Save size={14} className="inline mr-2" />
                  Sauvegarder en brouillon
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="px-6 py-3 bg-[#00694c] text-white rounded-xl text-sm font-semibold hover:bg-[#005a40] transition-colors disabled:opacity-50"
                >
                  {saving ? "Publication..." : "Publier maintenant"}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <ClubSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <div className="flex-1 flex flex-col">
        <ClubTopbar onMenuToggle={() => setMobileMenu(!mobileMenu)} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-[#00694c] tracking-widest uppercase">
                  Étape {step + 1} sur {STEPS.length}
                </p>
                <span className="text-sm font-bold text-[#00694c]">{progress}% complété</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">
                {step === 0 && "Nouvelle Expérience"}
                {step === 1 && "Médias de l'expérience"}
                {step === 2 && "Disponibilités"}
                {step === 3 && "Tarification"}
                {step === 4 && "Vérification finale"}
              </h1>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-[#00694c] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    i === step
                      ? "bg-[#00694c] text-white"
                      : i < step
                      ? "bg-[#f0faf6] text-[#00694c]"
                      : "bg-white text-gray-400 border border-gray-200"
                  }`}
                >
                  {i < step ? (
                    <Check size={14} />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                  {s}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step content */}
            <div className="mb-8">{renderStep()}</div>

            {/* Navigation */}
            {step < 4 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={16} />
                  Précédent
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#00694c] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#005a40] transition-colors"
                >
                  {step === 3 ? "Prévisualiser" : "Étape suivante"}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
