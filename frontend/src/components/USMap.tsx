import { useState } from 'react';

interface StateProps {
  id: string;
  name: string;
  path: string;
  collegeCount: number;
  onHover: (state: any) => void;
  onLeave: () => void;
  onClick: (state: any) => void;
}

const StateShape: React.FC<StateProps> = ({ id, name, path, collegeCount, onHover, onLeave, onClick }) => {
  const getColor = () => {
    if (collegeCount === 0) return '#e5e7eb';
    if (collegeCount >= 5) return '#1e40af';
    if (collegeCount >= 3) return '#3b82f6';
    return '#93c5fd';
  };

  return (
    <path
      d={path}
      fill={getColor()}
      stroke="#fff"
      strokeWidth="0.5"
      className={`transition-all duration-200 ${collegeCount > 0 ? 'cursor-pointer hover:opacity-80' : ''}`}
      onMouseEnter={() => onHover({ id, name, collegeCount })}
      onMouseLeave={onLeave}
      onClick={() => collegeCount > 0 && onClick({ id, name })}
    />
  );
};

export const USMap = ({ collegesByState, onStateClick }: any) => {
  const [hoveredState, setHoveredState] = useState<any>(null);

  // Realistic US state paths - AlbersUSA projection style
  const statesPaths = {
    AL: "M 610 340 L 650 340 L 650 390 L 630 400 L 610 390 Z",
    AK: "M 100 380 L 180 380 L 180 450 L 100 450 Z",
    AZ: "M 240 320 L 300 320 L 300 390 L 260 390 L 240 360 Z",
    AR: "M 520 320 L 570 320 L 570 360 L 520 360 Z",
    CA: "M 100 200 L 120 180 L 140 220 L 160 280 L 140 340 L 100 320 L 80 260 L 100 200 Z",
    CO: "M 360 260 L 450 260 L 450 320 L 360 320 Z",
    CT: "M 780 200 L 800 200 L 800 210 L 780 210 Z",
    DE: "M 760 250 L 770 250 L 770 270 L 760 270 Z",
    FL: "M 650 390 L 700 390 L 720 440 L 680 460 L 650 420 Z",
    GA: "M 650 340 L 700 340 L 700 390 L 650 390 Z",
    HI: "M 200 440 L 220 430 L 240 440 L 220 450 Z",
    ID: "M 200 120 L 240 120 L 260 180 L 240 220 L 200 200 L 200 120 Z",
    IL: "M 560 240 L 590 240 L 590 320 L 570 320 L 560 280 Z",
    IN: "M 590 260 L 620 260 L 620 320 L 590 320 Z",
    IA: "M 500 240 L 560 240 L 560 280 L 500 280 Z",
    KS: "M 450 300 L 520 300 L 520 340 L 450 340 Z",
    KY: "M 590 300 L 650 300 L 650 320 L 590 320 Z",
    LA: "M 520 360 L 570 360 L 570 400 L 540 410 L 520 390 Z",
    ME: "M 820 120 L 840 100 L 850 160 L 830 170 L 820 120 Z",
    MD: "M 720 270 L 760 270 L 760 290 L 720 290 Z",
    MA: "M 790 190 L 820 190 L 820 200 L 790 200 Z",
    MI: "M 600 200 L 630 180 L 650 220 L 630 260 L 600 240 Z",
    MN: "M 480 140 L 540 140 L 540 220 L 500 220 L 480 180 Z",
    MS: "M 570 340 L 600 340 L 600 390 L 570 390 Z",
    MO: "M 500 280 L 570 280 L 570 340 L 520 340 L 500 320 Z",
    MT: "M 260 120 L 400 120 L 400 180 L 260 180 Z",
    NE: "M 400 260 L 500 260 L 500 300 L 400 300 Z",
    NV: "M 160 200 L 200 200 L 220 280 L 180 320 L 140 280 L 160 200 Z",
    NH: "M 800 160 L 820 160 L 820 190 L 800 190 Z",
    NJ: "M 760 220 L 780 220 L 780 260 L 760 260 Z",
    NM: "M 300 320 L 380 320 L 380 390 L 300 390 Z",
    NY: "M 720 180 L 780 160 L 800 200 L 760 220 L 720 200 Z",
    NC: "M 680 300 L 760 300 L 760 330 L 680 330 Z",
    ND: "M 420 140 L 500 140 L 500 180 L 420 180 Z",
    OH: "M 640 260 L 680 260 L 680 300 L 640 300 Z",
    OK: "M 380 340 L 520 340 L 520 380 L 380 380 Z",
    OR: "M 100 160 L 180 160 L 180 200 L 100 200 Z",
    PA: "M 680 220 L 760 220 L 760 260 L 680 260 Z",
    RI: "M 810 200 L 820 200 L 820 210 L 810 210 Z",
    SC: "M 700 330 L 750 330 L 750 370 L 700 370 Z",
    SD: "M 420 180 L 500 180 L 500 220 L 420 220 Z",
    TN: "M 570 300 L 680 300 L 680 320 L 570 320 Z",
    TX: "M 380 380 L 520 380 L 540 460 L 420 480 L 360 440 L 380 380 Z",
    UT: "M 240 240 L 320 240 L 320 320 L 240 320 Z",
    VT: "M 790 160 L 800 160 L 800 190 L 790 190 Z",
    VA: "M 680 270 L 760 270 L 760 300 L 680 300 Z",
    WA: "M 100 100 L 180 100 L 180 160 L 100 160 Z",
    WV: "M 680 260 L 720 260 L 720 290 L 680 290 Z",
    WI: "M 540 200 L 580 200 L 580 260 L 540 260 Z",
    WY: "M 320 200 L 400 200 L 400 260 L 320 260 Z",
    DC: "M 740 280 L 745 280 L 745 285 L 740 285 Z"
  };

  const stateNames: { [key: string]: string } = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'Washington D.C.'
  };

  return (
    <div className="relative">
      <svg viewBox="0 0 900 500" className="w-full h-full">
        {/* Background */}
        <rect width="900" height="500" fill="#f9fafb" />

        {/* Continental US Background */}
        <rect x="80" y="100" width="750" height="380" fill="#f3f4f6" rx="4" />

        {/* States */}
        {Object.entries(statesPaths).map(([stateId, path]) => (
          <StateShape
            key={stateId}
            id={stateId}
            name={stateNames[stateId]}
            path={path}
            collegeCount={collegesByState[stateId]?.length || 0}
            onHover={setHoveredState}
            onLeave={() => setHoveredState(null)}
            onClick={onStateClick}
          />
        ))}

        {/* State Labels */}
        {Object.entries(statesPaths).map(([stateId, path]) => {
          // Extract approximate center from path
          const coords = path.match(/\d+/g)?.map(Number) || [];
          if (coords.length < 4) return null;

          // Calculate rough center
          const xCoords = coords.filter((_, i) => i % 2 === 0);
          const yCoords = coords.filter((_, i) => i % 2 === 1);
          const centerX = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
          const centerY = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;

          return (
            <text
              key={`label-${stateId}`}
              x={centerX}
              y={centerY + 3}
              fontSize="9"
              fill={collegesByState[stateId]?.length > 0 ? "#fff" : "#6b7280"}
              fontWeight="600"
              pointerEvents="none"
              textAnchor="middle"
            >
              {stateId}
            </text>
          );
        })}

        {/* Map Legend */}
        <g transform="translate(750, 420)">
          <text x="0" y="0" fontSize="10" fill="#6b7280" fontWeight="600">Colleges</text>
          <rect x="0" y="5" width="15" height="10" fill="#e5e7eb" />
          <text x="20" y="13" fontSize="9" fill="#6b7280">0</text>
          <rect x="0" y="20" width="15" height="10" fill="#93c5fd" />
          <text x="20" y="28" fontSize="9" fill="#6b7280">1-2</text>
          <rect x="0" y="35" width="15" height="10" fill="#3b82f6" />
          <text x="20" y="43" fontSize="9" fill="#6b7280">3-4</text>
          <rect x="0" y="50" width="15" height="10" fill="#1e40af" />
          <text x="20" y="58" fontSize="9" fill="#6b7280">5+</text>
        </g>
      </svg>

      {/* Hover Tooltip */}
      {hoveredState && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-3 pointer-events-none z-10 border border-gray-200">
          <h4 className="font-bold text-gray-900">{hoveredState.name}</h4>
          {hoveredState.collegeCount > 0 ? (
            <p className="text-sm text-gray-600">{hoveredState.collegeCount} college{hoveredState.collegeCount !== 1 ? 's' : ''}</p>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default USMap;