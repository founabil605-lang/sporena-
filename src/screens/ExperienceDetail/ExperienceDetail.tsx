import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, ChevronDown, Star, CircleCheck as CheckCircle, Users, Shield, ChevronRight } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { experiences } from "../../data/experiences";

export const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const exp = experiences.find((e) => e.id === id) || experiences[3];

  const [selectedDate, setSelectedDate] = useState(exp.date.replace("Sam. ", "2024-11-").replace(" Nov. 2024", "").trim());
  const [selectedTime, setSelectedTime] = useState(exp.time);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const priceHT = Math.round(exp.price / 1.2 * 100) / 100;
  const tva = exp.price - priceHT;

  const handleBook = () => {
    navigate(`/checkout/${exp.id}`);
  };

  const reviews = [
    {
      name: "Marc-Antoine D.",
      date: "Visité en Octobre 2023",
      rating: 5,
      text: "Une expérience absolument mémorable. L'accès au bord de pelouse juste avant l'entrée des joueurs est un moment suspendu. L'organisation Sporena est impeccable du début à la fin.",
    },
    {
      name: "Sophie L.",
      date: "Visité il y a 2 semaines",
      rating: 5,
      text: "Le traiteur dans la loge était exceptionnel. Seul bémol, la visite des vestiaires est passée un peu vite, mais les anecdotes du guide compensent largement !",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[480px] overflow-hidden">
          <div className="relative overflow-hidden cursor-pointer" onClick={() => { setActiveImg(0); setGalleryOpen(true); }}>
            <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover" style={{ maxHeight: 480 }} />
            <div className="absolute bottom-4 left-4 flex gap-2">
              {exp.tags.map((tag) => (
                <span key={tag} className="bg-[#00694c] text-white text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {exp.images.slice(1, 5).map((img, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer" onClick={() => { setActiveImg(i + 1); setGalleryOpen(true); }}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" style={{ maxHeight: 238 }} />
                {i === 3 && exp.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Voir toutes les photos</span>
                  </div>
                )}
                {i === 3 && exp.images.length === 5 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-sm">Voir toutes les photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setGalleryOpen(false)}>
          <img src={exp.images[activeImg]} alt="" className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 text-white text-2xl font-bold">×</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h1 className="font-black text-3xl text-gray-900 mb-3">{exp.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#00694c] font-semibold text-sm">{exp.club}</span>
              {exp.certified && <CheckCircle size={16} className="text-[#00694c]" />}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="font-bold text-xl text-gray-900 mb-4">À propos de l'expérience</h2>
              <div className="text-gray-600 text-sm leading-7 whitespace-pre-line">{exp.description}</div>
            </div>

            {exp.includes.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-base text-gray-900 mb-3">Inclus dans ce pack :</h3>
                <ul className="flex flex-col gap-2">
                  {exp.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-[#00694c] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10">
              <h2 className="font-bold text-xl text-gray-900 mb-4">Localisation</h2>
              <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
                <div className="w-full h-full bg-[#e8f0ed] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={32} className="text-[#00694c] mx-auto mb-2" />
                    <p className="font-semibold text-gray-700 text-sm">{exp.location}</p>
                    <p className="text-gray-500 text-xs mt-1">{exp.address}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm">{exp.location}</p>
                <p className="text-gray-500 text-xs mt-0.5">{exp.address}</p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-gray-900">Avis clients</h2>
                <div className="flex items-center gap-2">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">{exp.rating}</span>
                  <span className="text-gray-500 text-sm">({exp.reviewCount} avis)</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {reviews.map((r, i) => (
                  <div key={i} className="border-b border-gray-100 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                          <p className="text-gray-400 text-xs">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                    <button className="text-[#00694c] text-xs font-semibold mt-2 hover:underline">Répondre</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl shadow-lg p-6">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-black text-3xl text-gray-900">{exp.price}€</span>
                <span className="text-gray-400 text-sm">/ personne</span>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-1.5">Date</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                    <input
                      type="text"
                      value={exp.date}
                      onChange={() => {}}
                      className="bg-transparent text-sm outline-none flex-1 text-gray-800"
                      readOnly
                    />
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-1.5">Créneau</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                    <span className="text-sm text-gray-800 flex-1">{exp.time}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {exp.spotsLeft <= 3 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
                  <Users size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-orange-600 font-medium">Plus que {exp.spotsLeft} places restantes ! (sur {exp.totalSpots})</span>
                </div>
              )}

              <button
                onClick={handleBook}
                className="w-full bg-[#00694c] hover:bg-[#005a40] text-white font-bold py-4 rounded-xl transition-colors text-base mb-4"
              >
                Réserver maintenant
              </button>

              <div className="flex flex-col gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Prix HT</span>
                  <span className="text-gray-800">{priceHT.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span className="text-gray-800">{tva.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 mt-1 text-base">
                  <span>Total TTC</span>
                  <span className="text-[#00694c]">{exp.price.toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-4 text-xs text-gray-400">
                <Shield size={13} className="flex-shrink-0 mt-0.5" />
                <span>Annulation gratuite jusqu'à 72h avant l'événement. Remboursement intégral garanti par SPORENA.</span>
              </div>

              <div className="mt-5 bg-[#f0f4ff] rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Organisé par</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#00694c] text-sm">{exp.organizer}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-gray-600">{exp.organizerRating} • {exp.organizerExperiences} expériences créées</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>

              <button className="w-full mt-4 text-sm text-[#00694c] font-semibold text-center hover:underline">
                Complet sur vos dates ? S'inscrire sur la liste d'attente
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
