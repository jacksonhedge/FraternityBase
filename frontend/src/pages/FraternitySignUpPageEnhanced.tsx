import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  User,
  Mail,
  Lock,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  Instagram,
  TrendingUp,
  Award,
  Camera,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Target,
  BarChart3,
  Star,
  Upload,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FraternitySignUpPageEnhanced = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    // Step 1: Personal & Chapter Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    college: '',
    fraternityOrSorority: '',
    position: '',
    phoneNumber: '',
    chapterSize: '',

    // Step 2: Social Media & Audience Metrics
    instagramHandle: '',
    instagramFollowers: '',
    instagramEngagementRate: '',
    tiktokHandle: '',
    tiktokFollowers: '',
    facebookPage: '',
    linkedinPage: '',
    websiteUrl: '',
    averagePostReach: '',
    averageStoryViews: '',
    memberCount: '',

    // Step 3: Chapter Achievements & Credentials
    chapterGPA: '',
    nationalRanking: '',
    campusRanking: '',
    awardsReceived: [] as string[],
    philanthropyName: '',
    philanthropyAmountRaised: '',
    philanthropyHoursVolunteered: '',
    majorEvents: [] as string[],
    yearsEstablished: '',
    chapterDescription: '',

    // Step 4: Sponsorship Preferences
    interestedPartnershipTypes: [] as string[],
    minSponsorshipBudget: '',
    maxSponsorshipBudget: '',
    deliverables: [] as string[],
    exclusivityPreference: 'flexible', // 'exclusive', 'non-exclusive', 'flexible'
    targetAudience: '',
    pastSponsorships: [] as { brandName: string; amount: string; type: string }[],
    sponsorshipGoal: '',

    // Step 5: Photos & Media
    coverPhoto: null as File | null,
    chapterPhotos: [] as File[],
    eventPhotos: [] as File[],
    pastPartnershipPhotos: [] as File[],

    // Step 6: Payment & Verification
    preferredPaymentMethod: '',
    paymentRecipientName: '',
    paymentEmail: '',
    venmoHandle: '',
    zelleEmail: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    taxId: '',
    officialEmail: '',
    verificationDocuments: [] as File[],
    agreeToTerms: false,
    agreeToBackgroundCheck: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 6;

  const positions = [
    'President',
    'Vice President',
    'Philanthropy Chair',
    'Social Chair',
    'Rush Chair',
    'Public Relations Chair',
    'Treasurer',
    'Other'
  ];

  const partnershipTypes = [
    'Event Sponsorship',
    'Social Media Promotion',
    'Brand Ambassadorship',
    'Product Placement',
    'Merchandise Collaboration',
    'Bar/Restaurant Partnership',
    'Campus Activation',
    'Fundraising Event',
    'Performance Marketing',
    'Semester-Long Partnership',
    'Annual Partnership'
  ];

  const deliverableOptions = [
    'Instagram Posts',
    'Instagram Stories',
    'TikTok Videos',
    'Event Banner Placement',
    'Product Distribution',
    'Event Booth/Table',
    'Email Blast to Members',
    'Logo on T-Shirts/Merchandise',
    'Flyers/Posters in Chapter House',
    'Website Feature',
    'Exclusive Event Activation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (files) {
      if (field === 'coverPhoto') {
        setFormData(prev => ({ ...prev, coverPhoto: files[0] }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field as keyof typeof prev] as File[]), ...Array.from(files)]
        }));
      }
    }
  };

  const removePhoto = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as File[]).filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.college.trim()) newErrors.college = 'College is required';
    if (!formData.fraternityOrSorority.trim()) newErrors.fraternityOrSorority = 'Organization name is required';
    if (!formData.position) newErrors.position = 'Position is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.instagramHandle.trim()) {
      newErrors.instagramHandle = 'Instagram handle is required (most important for sponsors)';
    }
    if (!formData.memberCount) {
      newErrors.memberCount = 'Member count helps sponsors understand your reach';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.interestedPartnershipTypes.length === 0) {
      newErrors.interestedPartnershipTypes = 'Select at least one partnership type';
    }
    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'Select at least one deliverable you can offer';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep6 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = true;
    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    else if (step === 4) isValid = validateStep4();

    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep6()) return;

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      // Create FormData for file uploads
      const submitData = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.length > 0 && value[0] instanceof File) {
            value.forEach((file) => submitData.append(key, file));
          } else {
            submitData.append(key, JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_URL}/fraternity/signup/enhanced`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        navigate('/fraternity/pending-approval', {
          state: { message: 'Your comprehensive profile has been submitted for review!' }
        });
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Get Your Chapter Sponsored
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Complete your comprehensive profile to attract premium sponsors
            </p>
            <p className="text-md text-gray-500">
              ✓ Takes 10-15 minutes  ✓ Get discovered by brands  ✓ Earn $500-$5,000+ per partnership
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step === stepNum
                        ? 'bg-purple-600 text-white scale-110 shadow-lg'
                        : step > stepNum
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step > stepNum ? <CheckCircle className="w-6 h-6" /> : stepNum}
                  </div>
                  <div className="text-xs mt-2 text-gray-600 text-center hidden md:block">
                    {stepNum === 1 && 'Basic Info'}
                    {stepNum === 2 && 'Social Media'}
                    {stepNum === 3 && 'Achievements'}
                    {stepNum === 4 && 'Sponsorships'}
                    {stepNum === 5 && 'Photos'}
                    {stepNum === 6 && 'Payment'}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal & Chapter Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Your Information</h2>
                      <p className="text-gray-600">Let's start with the basics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Smith"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="john.smith@university.edu"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">Chapter Information</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          University/College *
                        </label>
                        <input
                          type="text"
                          name="college"
                          value={formData.college}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="University of Missouri"
                        />
                        {errors.college && <p className="mt-1 text-sm text-red-600">{errors.college}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fraternity/Sorority Name *
                        </label>
                        <input
                          type="text"
                          name="fraternityOrSorority"
                          value={formData.fraternityOrSorority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="Sigma Chi"
                        />
                        {errors.fraternityOrSorority && <p className="mt-1 text-sm text-red-600">{errors.fraternityOrSorority}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Position *
                          </label>
                          <select
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition"
                          >
                            <option value="">Select position</option>
                            {positions.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
                          {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Chapter Size (Members)
                          </label>
                          <input
                            type="number"
                            name="chapterSize"
                            value={formData.chapterSize}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="e.g., 85"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Continue to Social Media
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Step 2: Social Media & Audience Metrics */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Social Media & Reach</h2>
                      <p className="text-gray-600">Help sponsors understand your audience</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-purple-900">
                          💡 Pro Tip: The more metrics you provide, the better sponsorship offers you'll receive!
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                          Brands want to know your reach and engagement. Be honest - transparency builds trust.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Instagram Handle * (Most Important)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-medium">
                          @
                        </span>
                        <input
                          type="text"
                          name="instagramHandle"
                          value={formData.instagramHandle}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="yourchapter"
                        />
                      </div>
                      {errors.instagramHandle && <p className="mt-1 text-sm text-red-600">{errors.instagramHandle}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Instagram Followers
                        </label>
                        <input
                          type="number"
                          name="instagramFollowers"
                          value={formData.instagramFollowers}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., 5000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Engagement Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="instagramEngagementRate"
                          value={formData.instagramEngagementRate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., 4.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">Average likes/comments ÷ followers × 100</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Average Post Reach
                        </label>
                        <input
                          type="number"
                          name="averagePostReach"
                          value={formData.averagePostReach}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., 3500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Average Story Views
                        </label>
                        <input
                          type="number"
                          name="averageStoryViews"
                          value={formData.averageStoryViews}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., 1200"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Other Social Platforms (Optional)</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            TikTok Handle
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-medium">
                              @
                            </span>
                            <input
                              type="text"
                              name="tiktokHandle"
                              value={formData.tiktokHandle}
                              onChange={handleInputChange}
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                              placeholder="yourchapter"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            TikTok Followers
                          </label>
                          <input
                            type="number"
                            name="tiktokFollowers"
                            value={formData.tiktokFollowers}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="e.g., 2500"
                          />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Facebook Page
                          </label>
                          <input
                            type="url"
                            name="facebookPage"
                            value={formData.facebookPage}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="https://facebook.com/yourchapter"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Chapter Website
                          </label>
                          <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="https://yourchapter.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Active Member Count *
                      </label>
                      <input
                        type="number"
                        name="memberCount"
                        value={formData.memberCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="e.g., 85"
                      />
                      {errors.memberCount && <p className="mt-1 text-sm text-red-600">{errors.memberCount}</p>}
                      <p className="text-xs text-gray-500 mt-1">Helps sponsors gauge your direct reach</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      Continue to Achievements
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Chapter Achievements & Credentials */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Chapter Achievements</h2>
                      <p className="text-gray-600">Showcase what makes your chapter special</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">
                        <span className="font-semibold">Make your chapter stand out!</span> Sponsors love chapters with strong credentials and proven track records.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chapter Description
                      </label>
                      <textarea
                        name="chapterDescription"
                        value={formData.chapterDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                        placeholder="Tell sponsors about your chapter's values, culture, and what makes you unique..."
                      />
                      <p className="text-xs text-gray-500 mt-1">This will appear on your profile</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chapter GPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="chapterGPA"
                          value={formData.chapterGPA}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., 3.45"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          National Ranking
                        </label>
                        <input
                          type="text"
                          name="nationalRanking"
                          value={formData.nationalRanking}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., Top 10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Campus Ranking
                        </label>
                        <input
                          type="text"
                          name="campusRanking"
                          value={formData.campusRanking}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., #1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Years Established on Campus
                      </label>
                      <input
                        type="number"
                        name="yearsEstablished"
                        value={formData.yearsEstablished}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="e.g., 15"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Philanthropy Impact
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Primary Philanthropy
                          </label>
                          <input
                            type="text"
                            name="philanthropyName"
                            value={formData.philanthropyName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="e.g., St. Jude Children's Research Hospital"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Amount Raised (This Year)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="number"
                                name="philanthropyAmountRaised"
                                value={formData.philanthropyAmountRaised}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="e.g., 15000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Volunteer Hours (This Year)
                            </label>
                            <input
                              type="number"
                              name="philanthropyHoursVolunteered"
                              value={formData.philanthropyHoursVolunteered}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                              placeholder="e.g., 500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      Continue to Sponsorships
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Sponsorship Preferences */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Sponsorship Preferences</h2>
                      <p className="text-gray-600">Tell us what you're looking for</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-900">
                        <span className="font-semibold">Be clear about what you offer!</span> This helps brands find the perfect partnership match.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Partnership Types You're Interested In * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {partnershipTypes.map((type) => (
                          <label
                            key={type}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.interestedPartnershipTypes.includes(type)
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.interestedPartnershipTypes.includes(type)}
                              onChange={() => handleCheckboxChange('interestedPartnershipTypes', type)}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="font-medium text-gray-900">{type}</span>
                          </label>
                        ))}
                      </div>
                      {errors.interestedPartnershipTypes && (
                        <p className="mt-2 text-sm text-red-600">{errors.interestedPartnershipTypes}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Deliverables You Can Offer * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {deliverableOptions.map((deliverable) => (
                          <label
                            key={deliverable}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.deliverables.includes(deliverable)
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.deliverables.includes(deliverable)}
                              onChange={() => handleCheckboxChange('deliverables', deliverable)}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="font-medium text-gray-900">{deliverable}</span>
                          </label>
                        ))}
                      </div>
                      {errors.deliverables && (
                        <p className="mt-2 text-sm text-red-600">{errors.deliverables}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Budget Range You're Looking For
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Minimum Budget</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="minSponsorshipBudget"
                              value={formData.minSponsorshipBudget}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                              placeholder="500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Maximum Budget</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="maxSponsorshipBudget"
                              value={formData.maxSponsorshipBudget}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                              placeholder="5000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sponsorship Goal
                      </label>
                      <textarea
                        name="sponsorshipGoal"
                        value={formData.sponsorshipGoal}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                        placeholder="e.g., We're looking to partner with brands that align with our values to fund our philanthropy events and chapter activities..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Target Audience Description
                      </label>
                      <textarea
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                        placeholder="e.g., College students aged 18-22, primarily juniors and seniors, interested in fitness, fashion, and social events..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      Continue to Photos
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Photos & Media */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Photos & Media</h2>
                      <p className="text-gray-600">Show sponsors what makes your chapter great</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Camera className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">High-quality photos attract better sponsors!</span> Upload photos of your chapter house, events, and past partnerships.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cover Photo (This will be your profile picture)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'coverPhoto')}
                          className="hidden"
                          id="coverPhoto"
                        />
                        <label htmlFor="coverPhoto" className="cursor-pointer">
                          {formData.coverPhoto ? (
                            <div className="space-y-2">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">{formData.coverPhoto.name}</p>
                              <p className="text-xs text-gray-500">Click to change</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">Click to upload cover photo</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Chapter Photos (Optional - Add 3-10 photos)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'chapterPhotos')}
                          className="hidden"
                          id="chapterPhotos"
                        />
                        <label htmlFor="chapterPhotos" className="cursor-pointer block text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Upload chapter photos</p>
                          <p className="text-xs text-gray-500">Members, house, chapter events</p>
                        </label>
                        {formData.chapterPhotos.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {formData.chapterPhotos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <p className="text-xs p-2 truncate">{photo.name}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePhoto('chapterPhotos', index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Event Photos (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'eventPhotos')}
                          className="hidden"
                          id="eventPhotos"
                        />
                        <label htmlFor="eventPhotos" className="cursor-pointer block text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Upload event photos</p>
                          <p className="text-xs text-gray-500">Philanthropy events, formals, etc.</p>
                        </label>
                        {formData.eventPhotos.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {formData.eventPhotos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <p className="text-xs p-2 truncate">{photo.name}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePhoto('eventPhotos', index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Payment & Verification */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Payment & Verification</h2>
                      <p className="text-gray-600">How you'll receive sponsorship payments</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          🔒 Your payment information is encrypted and secure
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          We use bank-level encryption to protect your financial data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preferred Payment Method
                      </label>
                      <select
                        name="preferredPaymentMethod"
                        value={formData.preferredPaymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition"
                      >
                        <option value="">Select payment method</option>
                        <option value="bank">Bank Transfer (ACH)</option>
                        <option value="venmo">Venmo</option>
                        <option value="zelle">Zelle</option>
                        <option value="paypal">PayPal</option>
                        <option value="check">Check</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Recipient Name
                      </label>
                      <input
                        type="text"
                        name="paymentRecipientName"
                        value={formData.paymentRecipientName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="e.g., Sigma Chi Fraternity at University of Missouri"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Contact Email
                      </label>
                      <input
                        type="email"
                        name="paymentEmail"
                        value={formData.paymentEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="treasurer@yourchapter.com"
                      />
                    </div>

                    {formData.preferredPaymentMethod === 'venmo' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Venmo Handle
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-medium">
                            @
                          </span>
                          <input
                            type="text"
                            name="venmoHandle"
                            value={formData.venmoHandle}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="yourchapter"
                          />
                        </div>
                      </div>
                    )}

                    {formData.preferredPaymentMethod === 'zelle' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zelle Email/Phone
                        </label>
                        <input
                          type="text"
                          name="zelleEmail"
                          value={formData.zelleEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="treasurer@yourchapter.com or phone number"
                        />
                      </div>
                    )}

                    {formData.preferredPaymentMethod === 'bank' && (
                      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                        <p className="text-sm text-gray-600 mb-4">
                          <ShieldCheck className="w-4 h-4 inline mr-1" />
                          Bank details are encrypted and only shared with approved sponsors
                        </p>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            name="bankAccountHolder"
                            value={formData.bankAccountHolder}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            name="bankRoutingNumber"
                            value={formData.bankRoutingNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Verification (Optional)</h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Official Chapter Email
                        </label>
                        <input
                          type="email"
                          name="officialEmail"
                          value={formData.officialEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="chapter@university.edu"
                        />
                        <p className="text-xs text-gray-500 mt-1">Helps verify your chapter's legitimacy</p>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms" className="text-purple-600 hover:underline font-medium" target="_blank">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-purple-600 hover:underline font-medium" target="_blank">
                            Privacy Policy
                          </Link>{' '}
                          *
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                      )}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeToBackgroundCheck}
                          onChange={(e) => setFormData(prev => ({ ...prev, agreeToBackgroundCheck: e.target.checked }))}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          I authorize FraternityBase to verify our chapter's information and status
                        </span>
                      </label>
                    </div>

                    {errors.submit && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{errors.submit}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        'Submitting...'
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          Complete Sign Up
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
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

export default FraternitySignUpPageEnhanced;
