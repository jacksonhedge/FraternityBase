import { Users, Clock, GraduationCap, Star, TrendingUp } from 'lucide-react';

const SororitiesPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-12 h-12 text-purple-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sororities
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-6">
          <Clock className="w-4 h-4" />
          <span className="font-semibold">Coming Soon</span>
        </div>

        <p className="text-lg text-gray-600 mb-8">
          We're expanding our database to include sorority chapters across the country.
          Soon you'll be able to browse, connect, and partner with sororities just like fraternities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-gray-50 rounded-lg">
            <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Chapter Data</h3>
            <p className="text-sm text-gray-600">Comprehensive sorority information</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <Star className="w-6 h-6 text-pink-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Member Insights</h3>
            <p className="text-sm text-gray-600">Connect with chapter leaders</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Partnership Opps</h3>
            <p className="text-sm text-gray-600">Unlock sponsorship opportunities</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Want early access? Contact <a href="mailto:support@fraternitybase.com" className="text-primary-600 hover:text-primary-700 underline">support@fraternitybase.com</a>
        </p>
      </div>
    </div>
  );
};

export default SororitiesPage;
