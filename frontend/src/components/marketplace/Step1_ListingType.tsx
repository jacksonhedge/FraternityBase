interface Step1Props {
  formState: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
}

const Step1_ListingType = ({ formState, updateForm, onNext }: Step1Props) => {
  const listingTypes = [
    {
      type: 'event',
      icon: '🎉',
      title: 'Event Sponsorship',
      description: 'One-time event like formal, tailgate, or philanthropy',
      typical: '$500-$10K'
    },
    {
      type: 'semester',
      icon: '📅',
      title: 'Semester Partnership',
      description: '4-month partnership with monthly content',
      typical: '$3K-$15K'
    },
    {
      type: 'annual',
      icon: '🏆',
      title: 'Annual Partnership',
      description: 'Full academic year commitment',
      typical: '$6K-$30K'
    },
    {
      type: 'performance',
      icon: '🎯',
      title: 'Performance Campaign',
      description: 'Get paid per download, signup, or conversion',
      typical: '$3-$200 per action'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">What do you want to offer?</h2>
      <p className="text-gray-600 mb-8">Choose the type of sponsorship opportunity</p>

      <div className="grid grid-cols-2 gap-6">
        {listingTypes.map((option) => (
          <button
            key={option.type}
            onClick={() => {
              updateForm({ listing_type: option.type });
              setTimeout(onNext, 300);
            }}
            className={`p-6 border-2 rounded-xl text-left hover:border-blue-500 transition transform hover:scale-105 ${
              formState.listing_type === option.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="text-4xl mb-3">{option.icon}</div>
            <h3 className="text-xl font-bold mb-2">{option.title}</h3>
            <p className="text-gray-600 mb-3">{option.description}</p>
            <p className="text-sm text-gray-500">Typical: {option.typical}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step1_ListingType;
