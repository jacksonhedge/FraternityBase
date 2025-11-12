interface Step2Props {
  formState: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2_BasicInfo = ({ formState, updateForm, onNext, onBack }: Step2Props) => {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Tell us about this opportunity</h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Title</label>
        <input
          type="text"
          value={formState.title}
          onChange={(e) => updateForm({ title: e.target.value })}
          placeholder="e.g., Spring Formal Sponsorship - 300+ Attendees"
          className="w-full px-4 py-3 border rounded-lg"
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Description</label>
        <textarea
          value={formState.description}
          onChange={(e) => updateForm({ description: e.target.value })}
          placeholder="Describe what makes this opportunity special..."
          className="w-full px-4 py-3 border rounded-lg h-32"
          maxLength={2000}
        />
      </div>

      {/* Event Type Specific Fields */}
      {formState.listing_type === 'event' && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Event Name</label>
              <input
                type="text"
                value={formState.event_name || ''}
                onChange={(e) => updateForm({ event_name: e.target.value })}
                placeholder="Spring Formal 2025"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Expected Attendance</label>
              <input
                type="number"
                value={formState.expected_attendance || ''}
                onChange={(e) => updateForm({ expected_attendance: parseInt(e.target.value) })}
                placeholder="250"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!formState.title}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step2_BasicInfo;
