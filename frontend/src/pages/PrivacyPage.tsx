import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              FraternityBase Privacy Policy
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
            {/* Key Privacy Commitments */}
            <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Our Privacy Commitment
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>We do NOT sell your personal information.</strong> Your data is used solely to provide our service and improve your experience. We are committed to protecting your privacy and handling your data transparently.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {/* 1. Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to FraternityBase. This Privacy Policy explains how FraternityBase ("we," "us," "our," or "Company") collects, uses, discloses, and protects information about you when you use our Platform (the "Service" or "Platform").
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy applies to information collected through our website, applications, and related services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using FraternityBase, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide to Us</h3>
                <p className="text-gray-700 font-semibold mb-2">Account Registration Information:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Company name and business information</li>
                  <li>Your name, email address, and phone number</li>
                  <li>Job title and position</li>
                  <li>Business address and location</li>
                  <li>Company size and industry</li>
                  <li>Marketing budget and partnership goals</li>
                  <li>Payment information (processed securely by third-party payment processors)</li>
                </ul>

                <p className="text-gray-700 font-semibold mb-2">Profile and Preference Information:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Profile photos and company logos</li>
                  <li>Partnership preferences and interests</li>
                  <li>Target demographics and marketing objectives</li>
                  <li>Communication preferences</li>
                  <li>Saved searches and favorite chapters</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Usage data (pages viewed, features accessed, time spent)</li>
                  <li>Device information (IP address, browser, operating system)</li>
                  <li>Cookies and tracking technologies</li>
                  <li>Analytics and performance metrics</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information about Greek Organizations from public sources, university directories, official Greek life records, and social media. This includes chapter contact information, event details, and organizational data.
                </p>
              </section>

              {/* 3. How We Use Your Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Provide and operate the Platform</li>
                  <li>Process registrations and manage accounts</li>
                  <li>Facilitate partnerships and connections</li>
                  <li>Provide customer support</li>
                  <li>Send service-related notifications</li>
                  <li>Improve and personalize user experience</li>
                  <li>Analyze usage patterns and conduct research</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* 4. How We Share Your Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Information Shared with Greek Organizations</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you contact or partner with Greek Organizations, we share your name, company information, contact details, and partnership inquiry details.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We share information with third-party service providers (cloud hosting, payment processors, email services, analytics) who are contractually obligated to protect your data.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    What We Do NOT Share
                  </h3>
                  <p className="text-gray-700 leading-relaxed font-semibold">
                    We do NOT:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your data with competitors</li>
                    <li>Provide data to marketing lists or data brokers</li>
                    <li>Share data with social media without consent</li>
                  </ul>
                </div>
              </section>

              {/* 5. Data Retention */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your information for as long as necessary to provide the Service and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li><strong>Account Data:</strong> Duration of subscription plus 7 years</li>
                  <li><strong>Payment Information:</strong> As required by law</li>
                  <li><strong>Communications:</strong> 5 years</li>
                  <li><strong>Usage Logs:</strong> 2 years</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can request deletion by contacting privacy@fraternitybase.com. We will delete or anonymize your data within 90 days.
                </p>
              </section>

              {/* 6. Your Rights and Choices */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Access and Correction</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to access, correct, update, and download your personal information through your account settings.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Deletion and Opt-Out</h3>
                <p className="text-gray-700 leading-relaxed mb-4">You can:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Request account deletion</li>
                  <li>Opt out of marketing communications</li>
                  <li>Control cookie preferences</li>
                  <li>Restrict data processing</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 GDPR Rights (EEA/UK Residents)</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to lodge complaints with supervisory authorities</li>
                  <li>Right to not be subject to automated decision-making</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.4 CCPA Rights (California Residents)</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Know what personal information we collect</li>
                  <li>Request deletion of personal information</li>
                  <li>Opt out of sale (we do not sell personal information)</li>
                  <li>Non-discrimination for exercising privacy rights</li>
                </ul>
              </section>

              {/* 7. Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>Encryption of data in transit and at rest (TLS/SSL)</li>
                  <li>Secure authentication with password hashing and 2FA</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a data breach, we will notify you within 72 hours and provide details about the breach and protective measures.
                </p>
              </section>

              {/* 8. International Data Transfers */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  FraternityBase is based in the United States. If you access the Service from outside the U.S., your information will be transferred to, stored, and processed in the United States.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  For transfers from the EEA, we use Standard Contractual Clauses (SCCs) approved by the European Commission to ensure appropriate safeguards.
                </p>
              </section>

              {/* 9. Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  FraternityBase is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. While our Platform provides information about college students (typically 18+), we treat this data with heightened privacy protections and comply with FERPA.
                </p>
              </section>

              {/* 10. Changes to This Privacy Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of material changes by email or prominent notice on the Platform. Your continued use after changes become effective constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              {/* Summary of Key Points */}
              <section className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary of Key Points</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>What information do we collect?</strong> Account information, usage data, partnership details, and information about Greek Organizations.</p>
                  <p><strong>How do we use your information?</strong> To provide the Service, facilitate partnerships, improve the Platform, and communicate with you.</p>
                  <p><strong>Do we share your information?</strong> Only with service providers, Greek Organizations you contact, and as required by law. <strong className="text-red-600">We do NOT sell your information.</strong></p>
                  <p><strong>How do we protect your information?</strong> Through encryption, access controls, security audits, and employee training.</p>
                  <p><strong>What are your rights?</strong> You can access, correct, delete, and control your information. You can opt out of marketing.</p>
                  <p><strong>How long do we keep your information?</strong> As long as necessary to provide the Service, typically 7 years after account closure.</p>
                  <p><strong>How can you contact us?</strong> Email privacy@fraternitybase.com</p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about this Privacy Policy or to exercise your privacy rights, contact:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                  <p className="text-gray-900 font-semibold">FraternityBase Privacy Team</p>
                  <p className="text-gray-700">Email: <a href="mailto:privacy@fraternitybase.com" className="text-blue-600 hover:underline">privacy@fraternitybase.com</a></p>
                  <p className="text-gray-700 mt-4 font-semibold">Data Protection Officer (GDPR inquiries):</p>
                  <p className="text-gray-700">Email: <a href="mailto:dpo@fraternitybase.com" className="text-blue-600 hover:underline">dpo@fraternitybase.com</a></p>
                </div>
              </section>
            </div>

            {/* Final Acknowledgment */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-900 font-semibold mb-2">
                    By using FraternityBase, you acknowledge that you have read and understand this Privacy Policy.
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>Last Updated:</strong> October 21, 2025 | <strong>Version:</strong> 1.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
