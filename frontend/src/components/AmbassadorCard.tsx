import { useState } from 'react';
import { User, GraduationCap, Users, Briefcase, Unlock, MessageCircle, Award } from 'lucide-react';

interface AmbassadorCardProps {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePhotoUrl?: string;
  universityName: string;
  universityState?: string;
  isFraternityMember: boolean;
  fraternityName?: string;
  fraternityGreekLetters?: string;
  position?: string;
  previousBrands?: string[];
  openToWork: boolean;
  linkedinProfile?: string;
  isUnlocked: boolean;
  subscriptionTier: string;
  onUnlock: (ambassadorId: string) => Promise<void>;
  onRequestIntro: (ambassadorId: string) => Promise<void>;
}

const AmbassadorCard = ({
  id,
  firstName,
  lastName,
  age,
  profilePhotoUrl,
  universityName,
  universityState,
  isFraternityMember,
  fraternityName,
  fraternityGreekLetters,
  position,
  previousBrands = [],
  openToWork,
  linkedinProfile,
  isUnlocked,
  subscriptionTier,
  onUnlock,
  onRequestIntro
}: AmbassadorCardProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRequestingIntro, setIsRequestingIntro] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      await onUnlock(id);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleRequestIntro = async () => {
    setIsRequestingIntro(true);
    try {
      await onRequestIntro(id);
    } finally {
      setIsRequestingIntro(false);
    }
  };

  const isEnterprise = subscriptionTier === 'enterprise';
  const unlockPrice = isEnterprise ? 'Free (Enterprise)' : '50 credits';
  const introCost = '25 credits';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header with Photo */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          {openToWork && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full border-2 border-white font-semibold">
              Open
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {firstName} {lastName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <span>{age} years old</span>
            {position && (
              <>
                <span>•</span>
                <span className="font-medium">{position}</span>
              </>
            )}
          </div>
        </div>

        {openToWork && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <p className="text-xs font-semibold text-green-700">Open to Work</p>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="space-y-3 mb-4">
        {/* University */}
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span className="text-gray-700">
            <strong>{universityName}</strong>
            {universityState && ` (${universityState})`}
          </span>
        </div>

        {/* Fraternity */}
        {isFraternityMember && fraternityName && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-gray-700">
              <strong>{fraternityGreekLetters || fraternityName}</strong>
              {fraternityGreekLetters && ` (${fraternityName})`}
            </span>
          </div>
        )}

        {/* Previous Brands */}
        {previousBrands.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs mb-1">Previous brands:</p>
              <div className="flex flex-wrap gap-1.5">
                {previousBrands.map((brand, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LinkedIn (only show if unlocked) */}
      {isUnlocked && linkedinProfile && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <a
            href={linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            View LinkedIn Profile
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isUnlocked ? (
          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUnlocking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Unlock Profile - {unlockPrice}
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <Award className="w-4 h-4" />
            <span className="font-medium">Profile Unlocked</span>
          </div>
        )}

        <button
          onClick={handleRequestIntro}
          disabled={isRequestingIntro || !isUnlocked}
          className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-primary-700 border-2 border-primary-600 rounded-lg font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRequestingIntro ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              Requesting...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Warm Introduction - {introCost}
            </>
          )}
        </button>

        {!isUnlocked && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Unlock profile to request introductions and view LinkedIn
          </p>
        )}
      </div>
    </div>
  );
};

export default AmbassadorCard;
