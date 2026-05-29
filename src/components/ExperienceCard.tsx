import { Link } from "react-router-dom";
import { MapPin, Star, CircleCheck as CheckCircle } from "lucide-react";

interface ExperienceCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  club: string;
  date: string;
  location: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  spotsLeft?: number;
  certified?: boolean;
}

export const ExperienceCard = ({
  id, image, category, title, club, date, location, price, rating, reviewCount, spotsLeft, certified,
}: ExperienceCardProps) => {
  return (
    <Link to={`/experience/${id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
      <div className="relative overflow-hidden aspect-[16/10]">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="bg-black/70 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">
            {category}
          </span>
        </div>
        {spotsLeft !== undefined && spotsLeft <= 5 && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-[#d14405] text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full uppercase">
              {spotsLeft} places restantes
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#00694c] transition-colors">{title}</h3>
        <div className="flex items-center gap-1 text-[#00694c] text-sm font-medium">
          <span>{club}</span>
          {certified && <CheckCircle size={13} className="text-[#00694c]" />}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <span>📅</span>
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <MapPin size={11} />
              <span>{location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-bold text-gray-900 text-lg">{price}€ <span className="text-xs font-normal text-gray-500">TTC</span></span>
            {rating && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-700">{rating}</span>
                <span>({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
