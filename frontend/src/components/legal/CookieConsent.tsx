import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always enabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        applyConsent(saved);
      } catch (e) {
        console.error('Failed to parse cookie consent', e);
      }
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      // Enable Google Analytics or your analytics tool
      // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
      console.log('Analytics cookies enabled');
    } else {
      console.log('Analytics cookies disabled');
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing/advertising cookies
      console.log('Marketing cookies enabled');
    } else {
      console.log('Marketing cookies disabled');
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    applyConsent(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4">
            {/* Cookie Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                We use cookies
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                <Link to="/cookie-policy" className="text-blue-600 hover:underline font-medium">
                  Cookie Policy
                </Link>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Necessary Cookies</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are essential for the website to function properly. They enable basic features like
                    page navigation, secure areas access, and maintaining your session. The website cannot function
                    properly without these cookies.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600">
                    These cookies help us understand how visitors interact with our website by collecting and
                    reporting information anonymously. This helps us improve our website's performance and user experience.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleTogglePreference('analytics')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    } flex items-center ${preferences.analytics ? 'justify-end' : 'justify-start'} px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600">
                    These cookies are used to track visitors across websites. They are used to display ads that are
                    relevant and engaging for individual users, making them more valuable for publishers and third-party advertisers.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleTogglePreference('marketing')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                    } flex items-center ${preferences.marketing ? 'justify-end' : 'justify-start'} px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
