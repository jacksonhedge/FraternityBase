import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using FraternityBase ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                FraternityBase provides a platform for companies to connect with Greek organizations and access verified contact information for recruitment, marketing, and partnership opportunities.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of our Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Send unsolicited or unauthorized advertising or spam</li>
                <li>Collect or harvest personal information without consent</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Use automated systems or software to extract data ("scraping")</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Credits and Payments</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                FraternityBase operates on a credit-based system:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Credits can be purchased through our platform</li>
                <li>Credits are non-refundable once purchased</li>
                <li>Credits expire 12 months after purchase if unused</li>
                <li>Pricing for credits and unlocks may change with notice</li>
                <li>All payments are processed securely through third-party payment processors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Use and Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Contact information accessed through our Service must be used in compliance with applicable privacy laws, including but not limited to CAN-SPAM, GDPR, and CCPA. You agree to use the information responsibly and only for legitimate business purposes. Please refer to our Privacy Policy for details on how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by FraternityBase and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our content without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                IN NO EVENT SHALL FRATERNITYBASE, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> <a href="mailto:support@fraternitybase.com" className="text-blue-600 hover:underline">support@fraternitybase.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
