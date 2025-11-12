interface Step3Props {
  formState: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3_Pricing = ({ formState, updateForm, onNext, onBack }: Step3Props) => {
  // Simple pricing suggestion
  const suggestedPrice = formState.listing_type === 'event' ? 2500 :
                         formState.listing_type === 'semester' ? 8000 :
                         formState.listing_type === 'annual' ? 15000 : 5000;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Set your price</h2>

      {/* Pricing Suggestion */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-8">
        <h3 className="text-xl font-bold mb-4">💡 Suggested Pricing</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Minimum</p>
            <p className="text-2xl font-bold">${Math.round(suggestedPrice * 0.8).toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border-2 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Suggested</p>
            <p className="text-2xl font-bold text-blue-600">${suggestedPrice.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Maximum</p>
            <p className="text-2xl font-bold">${Math.round(suggestedPrice * 1.2).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Manual Price Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Your Price</label>
        <div className="relative">
          <span className="absolute left-4 top-4 text-gray-500 text-xl">$</span>
          <input
            type="number"
            step="100"
            value={formState.price || ''}
            onChange={(e) => updateForm({ price: parseFloat(e.target.value) })}
            placeholder={suggestedPrice.toString()}
            className="w-full pl-10 pr-4 py-4 border-2 rounded-lg text-2xl font-bold"
          />
        </div>

        {formState.price && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold mb-2">What the brand pays:</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Partnership amount</span>
              <span className="font-semibold">${formState.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Platform fee (15%)</span>
              <span className="font-semibold">${(formState.price * 0.15).toFixed(0)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">${(formState.price * 1.15).toFixed(0)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">You receive the full ${formState.price.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!formState.price || formState.price <= 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step3_Pricing;
