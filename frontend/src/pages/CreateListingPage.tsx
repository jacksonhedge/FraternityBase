import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_ListingType from '../components/marketplace/Step1_ListingType';
import Step2_BasicInfo from '../components/marketplace/Step2_BasicInfo';
import Step3_Pricing from '../components/marketplace/Step3_Pricing';
import Step4_Deliverables from '../components/marketplace/Step4_Deliverables';
import Step5_Photos from '../components/marketplace/Step5_Photos';
import Step6_Review from '../components/marketplace/Step6_Review';

interface ListingFormState {
  // Step 1
  listing_type: 'event' | 'semester' | 'annual' | 'performance' | null;

  // Step 2 - Basic Info
  title: string;
  description: string;

  // Event fields
  event_name?: string;
  event_type?: string;
  event_date?: string;
  event_venue?: string;
  expected_attendance?: number;

  // Semester/Annual fields
  partnership_start_date?: string;
  partnership_end_date?: string;
  posts_per_month?: number;
  stories_per_month?: number;
  events_included?: number;
  category_exclusive?: boolean;
  exclusive_category?: string;

  // Performance fields
  cpa_rate?: number;
  cpa_type?: string;
  estimated_conversions?: number;
  preferred_industries?: string[];

  // Step 3 - Pricing
  price: number;
  suggested_price?: { min: number; max: number; suggested: number };

  // Step 4 - Deliverables
  deliverables: Array<{
    id: string;
    deliverable_type: string;
    quantity: number;
    description: string;
  }>;

  // Step 5 - Photos
  photos: Array<{
    id: string;
    file?: File;
    preview_url: string;
    category: string;
    caption: string;
    is_cover: boolean;
  }>;

  // Step 6 - Location
  location_address: string;
  location_lat?: number;
  location_lng?: number;

  // Meta
  current_step: number;
  is_submitting: boolean;
  errors: Record<string, string>;
  chapter_id?: string;
}

const CreateListingPage = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<ListingFormState>({
    listing_type: null,
    title: '',
    description: '',
    price: 0,
    deliverables: [],
    photos: [],
    location_address: '',
    current_step: 1,
    is_submitting: false,
    errors: {}
  });

  const updateForm = (updates: Partial<ListingFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setFormState(prev => ({ ...prev, current_step: prev.current_step + 1 }));
  };

  const prevStep = () => {
    setFormState(prev => ({ ...prev, current_step: prev.current_step - 1 }));
  };

  const handleSubmit = async () => {
    try {
      updateForm({ is_submitting: true });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Create listing
      const response = await fetch(`${API_URL}/api/marketplace/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapter_id: formState.chapter_id,
          listing_type: formState.listing_type,
          title: formState.title,
          description: formState.description,
          price: formState.price,
          event_name: formState.event_name,
          event_type: formState.event_type,
          event_date: formState.event_date,
          event_venue: formState.event_venue,
          expected_attendance: formState.expected_attendance,
          partnership_start_date: formState.partnership_start_date,
          partnership_end_date: formState.partnership_end_date,
          posts_per_month: formState.posts_per_month,
          stories_per_month: formState.stories_per_month,
          events_included: formState.events_included,
          category_exclusive: formState.category_exclusive,
          exclusive_category: formState.exclusive_category,
          cpa_rate: formState.cpa_rate,
          cpa_type: formState.cpa_type,
          estimated_conversions: formState.estimated_conversions,
          preferred_industries: formState.preferred_industries,
          location_address: formState.location_address,
          location_lat: formState.location_lat,
          location_lng: formState.location_lng,
          deliverables: formState.deliverables
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const { listing_id } = await response.json();

      // Upload photos
      for (const photo of formState.photos) {
        if (photo.file) {
          const photoFormData = new FormData();
          photoFormData.append('photos', photo.file);

          await fetch(
            `${API_URL}/api/marketplace/listings/${listing_id}/photos?category=${photo.category}&is_cover=${photo.is_cover}`,
            {
              method: 'POST',
              body: photoFormData
            }
          );
        }
      }

      // Publish for review
      await fetch(`${API_URL}/api/marketplace/listings/${listing_id}/publish`, {
        method: 'POST'
      });

      // Navigate to success page
      navigate(`/marketplace/listing/${listing_id}/success`);
    } catch (error) {
      console.error('Error creating listing:', error);
      updateForm({
        is_submitting: false,
        errors: { submit: 'Failed to create listing. Please try again.' }
      });
    }
  };

  const renderStep = () => {
    switch (formState.current_step) {
      case 1:
        return <Step1_ListingType formState={formState} updateForm={updateForm} onNext={nextStep} />;
      case 2:
        return <Step2_BasicInfo formState={formState} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <Step3_Pricing formState={formState} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <Step4_Deliverables formState={formState} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <Step5_Photos formState={formState} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <Step6_Review formState={formState} onSubmit={handleSubmit} onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8 px-4">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  step === formState.current_step
                    ? 'bg-blue-600 text-white'
                    : step < formState.current_step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step < formState.current_step ? '✓' : step}
              </div>
              <div className="text-xs mt-2 text-gray-600">
                {step === 1 && 'Type'}
                {step === 2 && 'Info'}
                {step === 3 && 'Price'}
                {step === 4 && 'Deliverables'}
                {step === 5 && 'Photos'}
                {step === 6 && 'Review'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(formState.current_step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateListingPage;
