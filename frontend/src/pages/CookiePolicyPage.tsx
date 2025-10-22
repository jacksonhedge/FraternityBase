import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import Navbar from '../components/Navbar';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Cookie className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Cookie Policy
            </h1>
            <p className="text-gray-600">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website.
                  They are widely used to make websites work more efficiently and provide a better user experience.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This Cookie Policy explains how FraternityBase ("we," "us," or "our") uses cookies and similar tracking technologies
                  on our website and platform (collectively, the "Service").
                </p>
              </section>

              {/* Types of Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>

                <div className="space-y-6">
                  {/* Necessary Cookies */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      1. Necessary Cookies (Always Active)
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      These cookies are essential for the website to function properly. They enable basic features like:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>User authentication and login sessions</li>
                      <li>Security and fraud prevention</li>
                      <li>Shopping cart functionality (if applicable)</li>
                      <li>Form submission and data persistence</li>
                      <li>Load balancing and performance optimization</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      <strong>Can you opt out?</strong> No. These cookies are strictly necessary for the website to work.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-green-50 border-l-4 border-green-400 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      2. Analytics Cookies (Optional)
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      These cookies help us understand how visitors use our website by collecting anonymous information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Pages visited and time spent on each page</li>
                      <li>Navigation patterns and user flows</li>
                      <li>Device type, browser, and screen resolution</li>
                      <li>Geographic location (country/region level)</li>
                      <li>Traffic sources and referral information</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      <strong>Tools we use:</strong> Google Analytics, Mixpanel, or similar analytics platforms.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      <strong>Can you opt out?</strong> Yes. You can disable analytics cookies in your cookie preferences.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      3. Marketing/Advertising Cookies (Optional)
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      These cookies track your browsing activity across websites to display relevant advertisements:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Retargeting and remarketing campaigns</li>
                      <li>Measuring ad effectiveness</li>
                      <li>Personalizing ad content</li>
                      <li>Frequency capping (limiting ad displays)</li>
                      <li>Cross-device tracking</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      <strong>Tools we use:</strong> Google Ads, Facebook Pixel, LinkedIn Insight Tag.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      <strong>Can you opt out?</strong> Yes. You can disable marketing cookies in your cookie preferences.
                    </p>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      4. Functional Cookies (Optional)
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      These cookies remember your preferences to provide a personalized experience:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Language preferences</li>
                      <li>Display settings and themes</li>
                      <li>Recently viewed items</li>
                      <li>Saved filters and searches</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      <strong>Can you opt out?</strong> Yes, but some features may not work as intended.
                    </p>
                  </div>
                </div>
              </section>

              {/* First-Party vs Third-Party */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">First-Party vs. Third-Party Cookies</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">First-Party Cookies</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Set directly by FraternityBase when you visit our website.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Session management</li>
                      <li>User preferences</li>
                      <li>Basic analytics</li>
                    </ul>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Cookies</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Set by external services we use (Google, Facebook, etc.).
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Analytics tracking</li>
                      <li>Advertising networks</li>
                      <li>Social media integration</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cookie Duration */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Long Do Cookies Last?</h2>
                <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4">
                  <li>
                    <strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 30 days to 2 years)
                  </li>
                </ul>
              </section>

              {/* Managing Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Manage Cookies</h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Using Our Cookie Preferences</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can manage your cookie preferences at any time by clicking the "Cookie Preferences" button in the footer
                  of our website or by clicking the button below:
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('cookieConsent');
                    window.location.reload();
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-6"
                >
                  Manage Cookie Preferences
                </button>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most browsers allow you to control cookies through their settings:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Opt-Out Tools</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You can opt out of targeted advertising through:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Network Advertising Initiative (NAI)</a></li>
                  <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Digital Advertising Alliance (DAA)</a></li>
                  <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Your Online Choices (EU)</a></li>
                  <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-Out</a></li>
                </ul>
              </section>

              {/* Impact of Disabling */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Impact of Disabling Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you disable cookies, you may experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Inability to stay logged in</li>
                  <li>Loss of saved preferences</li>
                  <li>Reduced website functionality</li>
                  <li>Need to re-enter information repeatedly</li>
                  <li>Less personalized experience</li>
                </ul>
              </section>

              {/* Updates */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons.
                  We will notify you of any material changes by posting the updated policy on this page with a new "Last Updated" date.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about our use of cookies, please contact:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">FraternityBase Privacy Team</p>
                  <p className="text-gray-700">Email: <a href="mailto:privacy@fraternitybase.com" className="text-blue-600 hover:underline">privacy@fraternitybase.com</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
