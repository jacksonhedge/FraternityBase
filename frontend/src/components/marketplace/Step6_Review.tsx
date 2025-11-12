interface Step6Props {
  formState: any;
  onSubmit: () => void;
  onBack: () => void;
}

const Step6_Review = ({ formState, onSubmit, onBack }: Step6Props) => {
  const coverPhoto = formState.photos?.find((p: any) => p.is_cover);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Review your listing</h2>

      {/* Listing Preview */}
      <div className="border rounded-xl overflow-hidden mb-8">
        {/* Cover Photo */}
        {coverPhoto && (
          <div className="relative h-64">
            <img
              src={coverPhoto.preview_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg">
              <h3 className="text-2xl font-bold">{formState.title}</h3>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-semibold capitalize">{formState.listing_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="font-semibold text-2xl">${formState.price?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-800">{formState.description}</p>
          </div>

          {formState.deliverables?.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Deliverables</p>
              <ul className="space-y-2">
                {formState.deliverables.map((d: any) => (
                  <li key={d.id} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>{d.quantity}x</strong> {d.deliverable_type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Photos</p>
            <p className="text-gray-800">{formState.photos?.length || 0} photos uploaded</p>
          </div>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="mb-8">
        <label className="flex items-start">
          <input type="checkbox" className="mt-1 mr-3" required />
          <span className="text-sm text-gray-700">
            I confirm that all information is accurate and I agree to the Marketplace Terms.
            Once approved, I will fulfill all deliverables as described.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={formState.is_submitting}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {formState.is_submitting ? 'Submitting...' : 'Submit for Review →'}
        </button>
      </div>
    </div>
  );
};

export default Step6_Review;
