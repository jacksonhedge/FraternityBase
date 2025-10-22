import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { DURATIONS, shouldAnimate } from '../animations/constants';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

interface Activity {
  id: string;
  event_type?: string;
  type?: string;
  college_name?: string;
  chapter_name?: string;
  logo_url?: string;
  grade?: number | null;
  metadata?: {
    universityName?: string;
    greekOrgName?: string;
    insertedCount?: number;
  };
}

interface AnimatedTickertapeProps {
  activities: Activity[];
}

const AnimatedTickertape = ({ activities }: AnimatedTickertapeProps) => {
  const tickertapeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  console.log('[TickerTape] Received activities:', activities);
  console.log('[TickerTape] Activities count:', activities.length);

  useEffect(() => {
    if (!tickertapeRef.current || !shouldAnimate()) return;

    const tickertape = tickertapeRef.current;
    const totalWidth = tickertape.scrollWidth / 2; // Divide by 2 because we duplicate content

    // Create infinite scroll animation (right to left)
    animationRef.current = animate(tickertape, {
      translateX: [0, -totalWidth],
      duration: DURATIONS.tickertape,
      ease: 'linear',
      loop: true,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [activities]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (animationRef.current) {
      animationRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const handleItemHover = (index: number) => {
    setHoveredItem(index);
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
  };

  // Duplicate activities for seamless loop
  const duplicatedActivities = [...activities, ...activities];

  // Don't render if no activities
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg overflow-hidden">
      <div
        className="relative h-12 flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-600 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-purple-600 to-transparent z-10 pointer-events-none" />

        {/* Scrolling content */}
        <div
          ref={tickertapeRef}
          className="flex items-center gap-8 whitespace-nowrap px-4"
          style={{ willChange: shouldAnimate() ? 'transform' : 'auto' }}
        >
          {duplicatedActivities.map((activity, index) => {
            // Get the university name and logo
            const universityName = activity.college_name || activity.metadata?.universityName || 'University';
            const chapterName = activity.chapter_name || activity.metadata?.greekOrgName || 'Chapter';
            const logoUrl = activity.logo_url || getCollegeLogoWithFallback(universityName);
            const grade = activity.grade;

            // Determine the grade display
            let gradeDisplay = '';
            let gradeColor = '';
            let gradeIcon = '';

            if (grade !== null && grade !== undefined) {
              if (grade >= 5.0) {
                gradeDisplay = '5.0⭐ Diamond';
                gradeColor = 'bg-gradient-to-r from-purple-400 to-pink-400';
                gradeIcon = '💎';
              } else if (grade >= 4.5) {
                gradeDisplay = `${grade.toFixed(1)}⭐`;
                gradeColor = 'bg-yellow-400/30';
                gradeIcon = '🔥';
              } else if (grade >= 4.0) {
                gradeDisplay = `${grade.toFixed(1)}⭐`;
                gradeColor = 'bg-blue-400/30';
                gradeIcon = '⭐';
              } else if (grade >= 3.5) {
                gradeDisplay = `${grade.toFixed(1)}⭐`;
                gradeColor = 'bg-green-400/30';
              } else if (grade >= 3.0) {
                gradeDisplay = `${grade.toFixed(1)}⭐`;
                gradeColor = 'bg-white/20';
              } else {
                gradeDisplay = `${grade.toFixed(1)}⭐`;
                gradeColor = 'bg-white/20';
              }
            }

            return (
              <div
                key={`${activity.id}-${index}`}
                className="flex items-center gap-3 text-white transition-all duration-200"
                style={{
                  transform: hoveredItem === index ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => handleItemHover(index)}
                onMouseLeave={handleItemLeave}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={logoUrl}
                    alt={universityName}
                    className="w-8 h-8 object-contain bg-white rounded-full p-1 transition-transform duration-200"
                    style={{
                      transform: hoveredItem === index ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{chapterName}</span>
                    <span className="opacity-75">at</span>
                    <span className="font-medium">{universityName}</span>
                  </div>
                </div>
                {gradeDisplay && (
                  <span className={`px-2 py-1 ${gradeColor} rounded-full text-xs font-bold flex items-center gap-1`}>
                    {gradeIcon && <span>{gradeIcon}</span>}
                    {gradeDisplay}
                  </span>
                )}
                {activity.event_type === 'admin_upload' && activity.metadata?.insertedCount && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    📋 {activity.metadata.insertedCount} members added
                  </span>
                )}
                <span className="text-white/50">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedTickertape;
