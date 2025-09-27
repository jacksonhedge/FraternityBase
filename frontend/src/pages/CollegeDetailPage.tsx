import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building2, MapPin, Calendar, TrendingUp, Award, Star, ExternalLink, ChevronRight, Mail, Phone } from 'lucide-react';

const CollegeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'fraternities' | 'sororities' | 'events' | 'partnerships'>('overview');

  // Sample detailed college data
  const college = {
    id: 1,
    name: 'University of Alabama',
    location: 'Tuscaloosa, AL',
    state: 'AL',
    division: 'Division I',
    conference: 'SEC',
    students: 38563,
    founded: 1831,
    mascot: 'Crimson Tide',
    greekLife: 68,
    greekPercentage: 36,
    image: 'https://ui-avatars.com/api/?name=UA&background=9e1b32&color=fff&size=400',
    website: 'www.ua.edu',
    greekWebsite: 'ofsl.sa.ua.edu',
    greekContact: {
      name: 'Dr. Matthew M. Levitt',
      title: 'Director of Fraternity and Sorority Life',
      email: 'mlevitt@ua.edu',
      phone: '(205) 348-2693'
    },
    stats: {
      totalMembers: 12450,
      avgChapterSize: 183,
      avgGPA: 3.42,
      philanthropyRaised: '$2.3M',
      communityHours: 145000
    },
    fraternities: [
      { name: 'Alpha Tau Omega', founded: 1885, members: 195, house: 'Yes', gpa: 3.38 },
      { name: 'Beta Theta Pi', founded: 1879, members: 178, house: 'Yes', gpa: 3.45 },
      { name: 'Delta Chi', founded: 1889, members: 165, house: 'Yes', gpa: 3.35 },
      { name: 'Delta Kappa Epsilon', founded: 1847, members: 182, house: 'Yes', gpa: 3.28 },
      { name: 'Delta Tau Delta', founded: 1881, members: 172, house: 'Yes', gpa: 3.41 },
      { name: 'Kappa Alpha Order', founded: 1883, members: 201, house: 'Yes', gpa: 3.33 },
      { name: 'Kappa Sigma', founded: 1894, members: 189, house: 'Yes', gpa: 3.39 },
      { name: 'Lambda Chi Alpha', founded: 1916, members: 176, house: 'Yes', gpa: 3.44 },
      { name: 'Phi Delta Theta', founded: 1877, members: 188, house: 'Yes', gpa: 3.52 },
      { name: 'Phi Gamma Delta', founded: 1855, members: 194, house: 'Yes', gpa: 3.37 },
      { name: 'Phi Kappa Psi', founded: 1904, members: 167, house: 'Yes', gpa: 3.31 },
      { name: 'Pi Kappa Alpha', founded: 1904, members: 205, house: 'Yes', gpa: 3.29 },
      { name: 'Pi Kappa Phi', founded: 1904, members: 183, house: 'Yes', gpa: 3.36 },
      { name: 'Sigma Alpha Epsilon', founded: 1856, members: 212, house: 'Yes', gpa: 3.34 },
      { name: 'Sigma Chi', founded: 1876, members: 198, house: 'Yes', gpa: 3.48 },
      { name: 'Sigma Nu', founded: 1874, members: 191, house: 'Yes', gpa: 3.40 },
      { name: 'Sigma Phi Epsilon', founded: 1907, members: 186, house: 'Yes', gpa: 3.46 },
      { name: 'Theta Chi', founded: 1885, members: 174, house: 'Yes', gpa: 3.35 },
      { name: 'Zeta Beta Tau', founded: 1916, members: 168, house: 'Yes', gpa: 3.43 },
      // NPHC Fraternities
      { name: 'Alpha Phi Alpha', founded: 1974, members: 28, house: 'No', gpa: 3.25 },
      { name: 'Kappa Alpha Psi', founded: 1976, members: 32, house: 'No', gpa: 3.22 },
      { name: 'Omega Psi Phi', founded: 1975, members: 25, house: 'No', gpa: 3.18 },
      { name: 'Phi Beta Sigma', founded: 1980, members: 22, house: 'No', gpa: 3.20 },
    ],
    sororities: [
      { name: 'Alpha Chi Omega', founded: 1912, members: 425, house: 'Yes', gpa: 3.58 },
      { name: 'Alpha Delta Pi', founded: 1904, members: 418, house: 'Yes', gpa: 3.62 },
      { name: 'Alpha Gamma Delta', founded: 1922, members: 402, house: 'Yes', gpa: 3.55 },
      { name: 'Alpha Omicron Pi', founded: 1924, members: 395, house: 'Yes', gpa: 3.51 },
      { name: 'Alpha Phi', founded: 2011, members: 412, house: 'Yes', gpa: 3.59 },
      { name: 'Chi Omega', founded: 1922, members: 428, house: 'Yes', gpa: 3.64 },
      { name: 'Delta Delta Delta', founded: 1914, members: 435, house: 'Yes', gpa: 3.61 },
      { name: 'Delta Gamma', founded: 1951, members: 421, house: 'Yes', gpa: 3.57 },
      { name: 'Delta Zeta', founded: 1912, members: 408, house: 'Yes', gpa: 3.54 },
      { name: 'Gamma Phi Beta', founded: 1960, members: 398, house: 'Yes', gpa: 3.52 },
      { name: 'Kappa Alpha Theta', founded: 1914, members: 415, house: 'Yes', gpa: 3.60 },
      { name: 'Kappa Delta', founded: 1903, members: 423, house: 'Yes', gpa: 3.56 },
      { name: 'Kappa Kappa Gamma', founded: 1978, members: 430, house: 'Yes', gpa: 3.63 },
      { name: 'Phi Mu', founded: 1960, members: 410, house: 'Yes', gpa: 3.58 },
      { name: 'Pi Beta Phi', founded: 1946, members: 426, house: 'Yes', gpa: 3.65 },
      { name: 'Zeta Tau Alpha', founded: 1929, members: 419, house: 'Yes', gpa: 3.59 },
      // NPHC Sororities
      { name: 'Alpha Kappa Alpha', founded: 1974, members: 45, house: 'No', gpa: 3.48 },
      { name: 'Delta Sigma Theta', founded: 1974, members: 52, house: 'No', gpa: 3.45 },
      { name: 'Zeta Phi Beta', founded: 1980, members: 28, house: 'No', gpa: 3.42 },
      { name: 'Sigma Gamma Rho', founded: 1992, members: 24, house: 'No', gpa: 3.38 },
    ],
    upcomingEvents: [
      { name: 'Greek Week', date: 'April 10-17', type: 'Competition' },
      { name: 'Derby Days', date: 'March 20-25', type: 'Philanthropy' },
      { name: 'Bid Day', date: 'August 20', type: 'Recruitment' },
      { name: 'Homecoming', date: 'October 14', type: 'Alumni' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Animation */}
      <div className="relative h-80 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute -inset-40 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/20 rounded-full animate-pulse"
                style={{
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-8">
            <img
              src={college.image}
              alt={college.name}
              className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-white/20 animate-fadeIn"
            />
            <div className="text-white animate-slideInRight">
              <h1 className="text-5xl font-bold mb-2">{college.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {college.location}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {college.division}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {college.conference}
                </span>
              </div>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-3xl font-bold">{college.greekLife}</p>
                  <p className="text-sm text-white/80">Greek Organizations</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{college.greekPercentage}%</p>
                  <p className="text-sm text-white/80">Greek Life Participation</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{college.students.toLocaleString()}</p>
                  <p className="text-sm text-white/80">Total Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {['overview', 'fraternities', 'sororities', 'events', 'partnerships'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.totalMembers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Greek Members</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.avgChapterSize}</p>
                <p className="text-sm text-gray-600">Avg Chapter Size</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.avgGPA}</p>
                <p className="text-sm text-gray-600">Greek Avg GPA</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.philanthropyRaised}</p>
                <p className="text-sm text-gray-600">Philanthropy Raised</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.communityHours.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Service Hours</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Greek Life Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-900">{college.greekContact.name}</p>
                  <p className="text-gray-600">{college.greekContact.title}</p>
                  <div className="mt-3 space-y-2">
                    <a href={`mailto:${college.greekContact.email}`} className="flex items-center text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      {college.greekContact.email}
                    </a>
                    <a href={`tel:${college.greekContact.phone}`} className="flex items-center text-blue-600 hover:text-blue-700">
                      <Phone className="w-4 h-4 mr-2" />
                      {college.greekContact.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Greek Life Website</p>
                  <a href={`https://${college.greekWebsite}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {college.greekWebsite}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraternities Tab */}
        {activeTab === 'fraternities' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fraternities ({college.fraternities.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Founded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        House
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {college.fraternities
                      .sort((a, b) => b.members - a.members)
                      .map((frat, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold text-sm">
                                {frat.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{frat.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {frat.founded}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{frat.members}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            frat.house === 'Yes'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {frat.house}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            frat.gpa >= 3.5 ? 'text-green-600' :
                            frat.gpa >= 3.3 ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {frat.gpa}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Connect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sororities Tab */}
        {activeTab === 'sororities' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sororities ({college.sororities.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Founded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        House
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {college.sororities
                      .sort((a, b) => b.members - a.members)
                      .map((sorority, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-pink-600 font-bold text-sm">
                                {sorority.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{sorority.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sorority.founded}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{sorority.members}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            sorority.house === 'Yes'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sorority.house}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            sorority.gpa >= 3.5 ? 'text-green-600' :
                            sorority.gpa >= 3.3 ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {sorority.gpa}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Connect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CollegeDetailPage;