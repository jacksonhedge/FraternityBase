import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              <strong>Effective Date:</strong> October 21, 2025 | <strong>Last Updated:</strong> October 21, 2025
            </p>
          </div>

          {/* Back Button */}
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign Up
          </Link>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            {/* Privacy Commitment */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Our Privacy Commitment
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    FraternityBase is committed to protecting your privacy. <strong>We will never sell your personal data</strong> to third parties. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you register for FraternityBase, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Account Information:</strong> Name, email address, company name, phone number</li>
                <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely via Stripe)</li>
                <li><strong>Profile Information:</strong> Job title, industry, company size, partnership goals</li>
                <li><strong>Communications:</strong> Messages, support requests, feedback you send us</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Information We Collect Automatically</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use FraternityBase, we automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Usage Data:</strong> Pages viewed, features used, search queries, unlock history</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Analytics Data:</strong> Session duration, click patterns, navigation paths</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Information from Third Parties</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may receive information from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Payment Processors:</strong> Stripe provides payment confirmation and billing data</li>
                <li><strong>Analytics Services:</strong> Google Analytics, Mixpanel for usage insights</li>
                <li><strong>Authentication Providers:</strong> If you use third-party login (Google, LinkedIn)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Provide Services:</strong> Deliver platform access, chapter data, warm introductions</li>
                <li><strong>Process Payments:</strong> Handle subscriptions, credit purchases, billing</li>
                <li><strong>Communicate:</strong> Send account updates, service announcements, marketing (opt-out available)</li>
                <li><strong>Improve Platform:</strong> Analyze usage patterns, optimize features, fix bugs</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, enforce Terms of Service</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory requirements, respond to legal requests</li>
                <li><strong>Customer Support:</strong> Respond to inquiries, resolve issues, provide assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 We DO Share With:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Service Providers:</strong> Stripe (payments), Supabase (database), Resend (emails), AWS (hosting)</li>
                <li><strong>Analytics Partners:</strong> Google Analytics, Mixpanel (aggregated, anonymized data)</li>
                <li><strong>Legal Authorities:</strong> When required by law, court order, or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (with notice)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 We DO NOT Share With:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li className="font-bold text-red-600">❌ Data Brokers or Marketing Lists</li>
                <li className="font-bold text-red-600">❌ Advertisers (for targeting purposes)</li>
                <li className="font-bold text-red-600">❌ Third-party marketers without your consent</li>
                <li className="font-bold text-red-600">❌ Anyone who will sell your data</li>
              </ul>
            </section>

            <section className="bg-green-50 border-l-4 border-green-500 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-green-600" />
                4. We Will NEVER Sell Your Data
              </h2>
              <p className="text-gray-900 font-semibold mb-4">
                FraternityBase operates on a subscription model. <strong>We will never sell, rent, or license your personal information to third parties for marketing purposes.</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your data is used exclusively to provide you with the best partnership platform. We earn revenue from subscriptions and services, not from selling your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Encryption:</strong> All data transmitted via SSL/TLS encryption (HTTPS)</li>
                <li><strong>Secure Storage:</strong> Data stored in SOC 2 compliant databases (Supabase)</li>
                <li><strong>Payment Security:</strong> PCI-DSS compliant payment processing (Stripe)</li>
                <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for admins</li>
                <li><strong>Regular Audits:</strong> Security reviews, vulnerability scanning, penetration testing</li>
                <li><strong>Incident Response:</strong> Monitoring, logging, breach notification procedures</li>
              </ul>
              <p className="text-gray-600 text-sm italic">
                Note: No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 General Rights</h3>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails (account emails still sent)</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 GDPR Rights (EU Users)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA), you have additional rights under GDPR:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with your local data protection authority</li>
                <li>Right to restrict processing of your data</li>
                <li>Legal basis for processing: Contract performance, legitimate interests, consent</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 CCPA Rights (California Users)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                California residents have specific rights under CCPA:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of sale (Note: We do not sell personal information)</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                To exercise any of these rights, contact us at <a href="mailto:privacy@fraternitybase.com" className="text-blue-600 hover:underline">privacy@fraternitybase.com</a>. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your data as long as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Your account is active</li>
                <li>Needed to provide services you requested</li>
                <li>Required for legal, tax, or accounting purposes</li>
                <li>Necessary to resolve disputes or enforce agreements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                After account deletion, we may retain anonymized data for analytics and aggregated reporting. Personal identifiers are permanently deleted within 90 days of account closure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Types of Cookies We Use</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Essential Cookies:</strong> Required for login, session management, security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences, settings</li>
                <li><strong>Analytics Cookies:</strong> Google Analytics, Mixpanel for usage insights</li>
                <li><strong>Marketing Cookies:</strong> Track campaign effectiveness (opt-out available)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Managing Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. Note that disabling essential cookies may limit platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                FraternityBase may contain links to third-party websites (e.g., university websites, Greek organization social media). We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                FraternityBase is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                FraternityBase is based in the United States. If you access our platform from outside the U.S., your data may be transferred to, stored, and processed in the United States or other countries.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For EEA users, we use Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate data protection when transferring data internationally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Material changes will be communicated via:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Email notification to your registered email address</li>
                <li>Prominent notice on the FraternityBase platform</li>
                <li>In-app notification upon next login</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of FraternityBase after changes indicates acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your privacy rights, contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div>
                  <p className="text-gray-900 font-semibold mb-1">Email:</p>
                  <p className="text-gray-700">
                    <a href="mailto:privacy@fraternitybase.com" className="text-blue-600 hover:underline">privacy@fraternitybase.com</a>
                  </p>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-1">Data Protection Officer:</p>
                  <p className="text-gray-700">
                    <a href="mailto:dpo@fraternitybase.com" className="text-blue-600 hover:underline">dpo@fraternitybase.com</a>
                  </p>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-1">General Inquiries:</p>
                  <p className="text-gray-700">
                    <a href="mailto:support@fraternitybase.com" className="text-blue-600 hover:underline">support@fraternitybase.com</a>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Summary of Key Points</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Transparency:</strong> We are clear about what data we collect and why</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Security:</strong> We use industry-standard encryption and security measures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No Selling:</strong> We will never sell your personal data to third parties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Your Rights:</strong> You can access, correct, delete, or export your data anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Data Usage:</strong> We use your data only to provide and improve our service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Compliance:</strong> We comply with GDPR, CCPA, and other privacy regulations</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
              <p className="text-gray-900 font-semibold mb-2">
                By using FraternityBase, you acknowledge that you have read, understood, and agree to this Privacy Policy.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Last Updated:</strong> October 21, 2025 | <strong>Version:</strong> 1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
