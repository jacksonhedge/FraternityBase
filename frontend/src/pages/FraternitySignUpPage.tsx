import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, Building2, Users, CheckCircle, ArrowRight, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FraternitySignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    college: '',
    fraternityOrSorority: '',
    position: '',
    sponsorshipType: 'event', // 'event' or 'chapter'

    // Step 2: Chapter Info & Payment Details
    instagram: '',
    website: '',
    preferredPaymentMethod: '',
    paymentRecipientName: '',
    paymentVenmo: '',
    paymentZelle: '',
    paymentPaypal: '',
    paymentBankAccount: '',
    paymentRoutingNumber: '',

    // Step 3: Event Info (Optional)
    hasUpcomingEvent: false,
    eventName: '',
    eventDate: '',
    eventType: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const eventTypes = [
    'Charity Run/Walk',
    'Fundraiser Gala',
    'Awareness Campaign',
    'Food Drive',
    'Blood Drive',
    'Community Service Day',
    'Philanthropy Tournament',
    'Other'
  ];

  const positions = [
    'President',
    'Vice President',
    'Philanthropy Chair',
    'Rush Chair',
    'Social Chair',
    'Other'
  ];

  const paymentMethods = [
    'Venmo',
    'Zelle',
    'Bankroll',
    'Bank Payment/Wire',
    'Online donation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
    }
    if (!formData.fraternityOrSorority.trim()) {
      newErrors.fraternityOrSorority = 'Fraternity/Sorority is required';
    }
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // Step 2 is optional, no validation needed
    return true;
  };

  const searchChapters = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/chapters/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.chapters || []);
    } catch (error) {
      console.error('Chapter search error:', error);
      setSearchResults([]);
    }
  };

  const handleChapterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, chapterSearch: query, selectedChapter: null }));
    searchChapters(query);
  };

  const selectChapter = (chapter: any) => {
    setFormData(prev => ({
      ...prev,
      selectedChapter: chapter,
      chapterSearch: `${chapter.greek_organizations?.name} - ${chapter.universities?.name}`
    }));
    setSearchResults([]);
    if (errors.chapter) {
      setErrors(prev => ({ ...prev, chapter: '' }));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      // Create fraternity user account
      const response = await fetch(`${API_URL}/fraternity/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          fraternityOrSorority: formData.fraternityOrSorority,
          position: formData.position,
          sponsorshipType: formData.sponsorshipType,
          instagram: formData.instagram || undefined,
          website: formData.website || undefined,
          preferredPaymentMethod: formData.preferredPaymentMethod || undefined,
          paymentRecipientName: formData.paymentRecipientName || undefined,
          paymentVenmo: formData.paymentVenmo || undefined,
          paymentZelle: formData.paymentZelle || undefined,
          paymentPaypal: formData.paymentPaypal || undefined,
          paymentBankAccount: formData.paymentBankAccount || undefined,
          paymentRoutingNumber: formData.paymentRoutingNumber || undefined,
          hasUpcomingEvent: formData.hasUpcomingEvent,
          eventName: formData.eventName || undefined,
          eventDate: formData.eventDate || undefined,
          eventType: formData.eventType || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success! Redirect to fraternity pending approval page
        navigate('/fraternity/pending-approval');
      } else {
        setErrors({ submit: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: 'Unable to connect. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Get Your Chapter Listed Free
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Connect your chapter with brands looking to sponsor
            </p>
            <p className="text-md text-gray-500">
              ✓ Free to sign up  ✓ Free to list your chapter  ✓ Free forever
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="font-medium">Your Info</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="font-medium">Chapter Info</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="font-medium">Event (Optional)</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about yourself</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Smith"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john.smith@university.edu"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="University of Missouri"
                    />
                    {errors.college && <p className="mt-1 text-sm text-red-600">{errors.college}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fraternity/Sorority
                    </label>
                    <input
                      type="text"
                      name="fraternityOrSorority"
                      value={formData.fraternityOrSorority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Sigma Chi"
                    />
                    {errors.fraternityOrSorority && <p className="mt-1 text-sm text-red-600">{errors.fraternityOrSorority}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Select your position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                    {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                  </div>

                  {/* Sponsorship Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What type of sponsorship are you looking for?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sponsorshipType: 'event' }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.sponsorshipType === 'event'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.sponsorshipType === 'event' ? 'border-purple-600' : 'border-gray-300'
                          }`}>
                            {formData.sponsorshipType === 'event' && (
                              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Event Sponsorship</div>
                            <div className="text-sm text-gray-600 mt-1">
                              One-time event sponsorships
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sponsorshipType: 'chapter' }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.sponsorshipType === 'chapter'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.sponsorshipType === 'chapter' ? 'border-purple-600' : 'border-gray-300'
                          }`}>
                            {formData.sponsorshipType === 'chapter' && (
                              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Chapter Sponsorship</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Ongoing chapter partnerships
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sponsorshipType: 'both' }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.sponsorshipType === 'both'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.sponsorshipType === 'both' ? 'border-purple-600' : 'border-gray-300'
                          }`}>
                            {formData.sponsorshipType === 'both' && (
                              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Both</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Open to both types
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="At least 8 characters"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Chapter Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapter information</h2>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-purple-900">
                      💡 This information helps brands connect with your chapter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram Handle (optional)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        @
                      </span>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="yourchapter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Website (optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://yourchapter.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Payment Method
                    </label>
                    <select
                      name="preferredPaymentMethod"
                      value={formData.preferredPaymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Event Info (Optional) */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Do you have an upcoming event? (Optional)</h2>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-purple-900">
                      💡 You can skip this step and add events later, or tell us about an event now!
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hasUpcomingEvent: true }))}
                      className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                        formData.hasUpcomingEvent
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg font-semibold">Yes, I have an event</div>
                      <div className="text-sm mt-1">I'll enter details now</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hasUpcomingEvent: false }))}
                      className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                        !formData.hasUpcomingEvent
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg font-semibold">Not yet</div>
                      <div className="text-sm mt-1">I'll add one later</div>
                    </button>
                  </div>

                  {formData.hasUpcomingEvent && (
                    <div className="space-y-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Name
                        </label>
                        <input
                          type="text"
                          name="eventName"
                          value={formData.eventName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., Derby Days for St. Jude"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Type
                        </label>
                        <select
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date (approximate)
                        </label>
                        <input
                          type="date"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        'Creating account...'
                      ) : (
                        <>
                          Browse Sponsors
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FraternitySignUpPage;
