import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  Heart,
  Star,
  Badge
} from 'lucide-react';

interface SponsorshipCardProps {
  opportunity: {
    id: string;
    title: string;
    description: string;
    opportunity_type: string;
    budget_needed: number;
    expected_reach: number;
    event_date?: string;
    is_featured?: boolean;
    is_urgent?: boolean;
    status: string;
    chapters?: {
      id: string;
      chapter_name: string;
      member_count?: number;
      grade?: number;
      instagram_handle?: string;
      instagram_followers?: number;
      cover_photo_url?: string;
      greek_organizations?: {
        name: string;
        greek_letters?: string;
      };
      universities?: {
        name: string;
        state: string;
        city?: string;
      };
    };
  };
  onSave?: () => void;
  isSaved?: boolean;
}

const SponsorshipCard = ({ opportunity, onSave, isSaved = false }: SponsorshipCardProps) => {
  const chapter = opportunity.chapters;

  // Get cover image or fallback
  const coverImage = chapter?.cover_photo_url ||
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'; // College campus default

  // Format budget
  const formatBudget = (budget: number) => {
    if (budget >= 1000) {
      return `$${(budget / 1000).toFixed(budget % 1000 === 0 ? 0 : 1)}k`;
    }
    return `$${budget}`;
  };

  // Format reach
  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(reach % 1000 === 0 ? 0 : 1)}k`;
    }
    return reach.toString();
  };

  // Get opportunity type badge color
  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      event_sponsor: 'bg-blue-100 text-blue-700',
      merchandise_partner: 'bg-purple-100 text-purple-700',
      social_media: 'bg-pink-100 text-pink-700',
      philanthropy: 'bg-green-100 text-green-700',
      long_term: 'bg-orange-100 text-orange-700',
      performance: 'bg-red-100 text-red-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Format opportunity type for display
  const formatType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Link
      to={`/app/sponsorships/${opportunity.id}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative">
        {/* Save Button */}
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
        )}

        {/* Featured/Urgent Badge */}
        {(opportunity.is_featured || opportunity.is_urgent) && (
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {opportunity.is_featured && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                FEATURED
              </span>
            )}
            {opportunity.is_urgent && (
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                URGENT
              </span>
            )}
          </div>
        )}

        {/* Image Section */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <img
            src={coverImage}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Chapter Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              {chapter?.grade && chapter.grade >= 4 && (
                <div className="flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {Array.from({ length: Math.floor(chapter.grade) }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-white text-white" />
                  ))}
                </div>
              )}
              <span className="text-xs font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {formatType(opportunity.opportunity_type)}
              </span>
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2">
              {chapter?.greek_organizations?.name || 'Chapter'} • {chapter?.universities?.name || 'University'}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {opportunity.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {opportunity.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500">Reach</div>
                <div className="font-semibold text-gray-900">
                  {formatReach(opportunity.expected_reach)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Members</div>
                <div className="font-semibold text-gray-900">
                  {chapter?.member_count || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Instagram Stats (if available) */}
          {chapter?.instagram_handle && chapter?.instagram_followers && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">IG</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">@{chapter.instagram_handle}</div>
                  <div className="font-semibold text-gray-900">
                    {formatReach(chapter.instagram_followers)} followers
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location & Event Date */}
          <div className="space-y-2 mb-3">
            {chapter?.universities && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{chapter.universities.city || ''} {chapter.universities.state}</span>
              </div>
            )}
            {opportunity.event_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(opportunity.event_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatBudget(opportunity.budget_needed)}
              </span>
              <span className="text-sm text-gray-500 ml-1">sponsorship</span>
            </div>
            <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SponsorshipCard;
