import { Utensils, Clock, MapPin, Star } from 'lucide-react';

const BarsPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-12 h-12 text-orange-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bars & Restaurants
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-6">
          <Clock className="w-4 h-4" />
          <span className="font-semibold">Coming Soon</span>
        </div>

        <p className="text-lg text-gray-600 mb-8">
          We're building a comprehensive database of bars and restaurants near Greek Life chapters.
          Soon you'll be able to find and connect with venues for sponsorships and partnerships.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-gray-50 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Location Data</h3>
            <p className="text-sm text-gray-600">Venues mapped near every chapter</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Ratings & Reviews</h3>
            <p className="text-sm text-gray-600">Chapter feedback on venues</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <Utensils className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Partnership Opps</h3>
            <p className="text-sm text-gray-600">Connect directly with venues</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Want early access? Contact <a href="mailto:support@fraternitybase.com" className="text-primary-600 hover:text-primary-700 underline">support@fraternitybase.com</a>
        </p>
      </div>
    </div>
  );
};

export default BarsPage;
