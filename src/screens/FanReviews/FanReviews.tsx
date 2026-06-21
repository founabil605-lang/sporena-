import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Star, CreditCard as Edit3, Trash2, ArrowUpDown, Filter, ChevronRight } from "lucide-react";
import { FanSidebar } from "../../components/FanSidebar";
import { FanTopbar } from "../../components/FanTopbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800";

export const FanReviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingReview, setEditingReview] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const [reviewsRes, bookingsRes] = await Promise.all([
      supabase.from("fan_reviews").select("*, club_experiences(id, title, images, category, sport, clubs(name))").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, club_experiences(id, title, images, category, sport)").eq("customer_email", user.email).order("date_time", { ascending: false }),
    ]);

    if (reviewsRes.data) {
      setReviews(reviewsRes.data.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        experience: r.club_experiences?.title || "Experience",
        image: r.club_experiences?.images?.[0] || DEFAULT_IMAGE,
        category: r.club_experiences?.category,
        date: new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      })));
    }

    // Pending reviews: past bookings without a review
    const now = new Date();
    const pastBookings = (bookingsRes.data || []).filter((b: any) => b.date_time && new Date(b.date_time) < now);
    const reviewedIds = (reviewsRes.data || []).map((r: any) => r.experience_id);
    const pending = pastBookings.filter((b: any) => !reviewedIds.includes(b.club_experiences?.id)).slice(0, 3);
    setPendingReviews(pending.map((b: any) => ({
      id: b.club_experiences?.id,
      title: b.club_experiences?.title,
      image: b.club_experiences?.images?.[0] || DEFAULT_IMAGE,
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSubmitReview = async (experienceId: string) => {
    if (!user?.id) return;
    const { data, error } = await supabase.from("fan_reviews").insert({
      user_id: user.id,
      experience_id: experienceId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    }).select("*").single();
    if (!error && data) {
      setShowReviewModal(null);
      setReviewForm({ rating: 5, comment: "" });
      loadData();
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    const { error } = await supabase.from("fan_reviews").update({
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    }).eq("id", reviewId);
    if (!error) {
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: "" });
      loadData();
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("fan_reviews").delete().eq("id", id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <FanSidebar />
      <div className="flex-1 flex flex-col">
        <FanTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Mes avis</h1>
              <p className="text-gray-600">Partagez votre expérience et aidez la communauté.</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <ArrowUpDown size={14} /> Plus récents
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter size={14} /> Filtrer
              </button>
            </div>

            {/* My reviews */}
            <div className="space-y-6 mb-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <img src={review.image} alt="" className="w-32 h-32 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#00694c] uppercase tracking-wider">{review.category}</span>
                      <span className="bg-[#2ecc71] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        {review.rating} <Star size={10} className="fill-white" />
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{review.experience}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1 text-xs">
                        <CalendarFallback size={12} /> Publié le {review.date}
                      </span>
                      <div className="ml-auto flex items-center gap-3">
                        <button onClick={() => { setEditingReview(review.id); setReviewForm({ rating: review.rating, comment: review.comment }); }} className="text-[#00694c] text-xs font-semibold hover:underline">Modifier</button>
                        <button onClick={() => handleDeleteReview(review.id)} className="text-gray-500 text-xs font-semibold hover:underline">Supprimer</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">Aucun avis publié. Réservez une expérience et partagez votre retour !</p>
                </div>
              )}
            </div>

            {/* Pending reviews */}
            {pendingReviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-4 flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#f0faf6] flex items-center justify-center text-[#00694c]">
                  <MessageSquare size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">{pendingReviews[0].title}</p>
                  <p className="text-xs text-gray-500">Votre expérience s'est terminée il y a 2 jours.</p>
                </div>
                <button onClick={() => { setShowReviewModal(pendingReviews[0].id); setReviewForm({ rating: 5, comment: "" }); }} className="px-4 py-2 rounded-lg bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors">
                  Donner mon avis
                </button>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl text-gray-900">Prochainement pour vous</h2>
                <button onClick={() => navigate("/search")} className="text-[#00694c] text-sm font-semibold hover:underline">Voir tout</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} onClick={() => navigate("/search")} className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group">
                    <div className="relative">
                      <img src={i === 1 ? "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600" : "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600"} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="bg-[#d14405] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">{i === 1 ? "Populaire" : "Nouveau"}</span>
                        <h3 className="font-bold text-white text-base mt-1 drop-shadow">{i === 1 ? "Coaching Marathon" : "Tour du Mont Ventoux"}</h3>
                        <p className="text-xs text-white/80">{i === 1 ? "Par un athlète olympique" : "Accompagné par un guide pro"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{i === 1 ? "4.9" : "NEW"}</span>
                          <span className="font-bold text-white text-sm">{i === 1 ? "120" : "85"}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Review modal */}
      {(showReviewModal || editingReview) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg text-gray-900 mb-4">{editingReview ? "Modifier l'avis" : "Donner mon avis"}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Note</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })} className="transition-colors">
                      <Star size={24} className={s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 tracking-widest uppercase block mb-2">Commentaire</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00694c] min-h-[100px] resize-y" placeholder="Partagez votre expérience..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowReviewModal(null); setEditingReview(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => editingReview ? handleUpdateReview(editingReview) : handleSubmitReview(showReviewModal!)} className="flex-1 py-2.5 rounded-xl bg-[#00694c] text-white text-sm font-semibold hover:bg-[#005a40] transition-colors">
                Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CalendarFallback({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
