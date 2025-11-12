import { useState } from 'react';

interface Step4Props {
  formState: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4_Deliverables = ({ formState, updateForm, onNext, onBack }: Step4Props) => {
  const commonDeliverables = [
    { type: 'Instagram Feed Post', icon: '📸', default_quantity: 3 },
    { type: 'Instagram Story Mentions', icon: '📱', default_quantity: 10 },
    { type: 'Event Banner (6x6 ft)', icon: '🎪', default_quantity: 1 },
    { type: 'Logo on Digital Flyers', icon: '📋', default_quantity: 1 },
    { type: 'Email Blast', icon: '📧', default_quantity: 1 },
    { type: 'Product Sampling Table', icon: '🎁', default_quantity: 1 },
  ];

  const addDeliverable = (template: any) => {
    const newDeliverable = {
      id: Date.now().toString(),
      deliverable_type: template.type,
      quantity: template.default_quantity,
      description: ''
    };
    updateForm({
      deliverables: [...(formState.deliverables || []), newDeliverable]
    });
  };

  const removeDeliverable = (id: string) => {
    updateForm({
      deliverables: formState.deliverables.filter((d: any) => d.id !== id)
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">What will you provide?</h2>
      <p className="text-gray-600 mb-8">Select deliverables brands will receive</p>

      {/* Common Deliverables */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Quick Add</h3>
        <div className="grid grid-cols-2 gap-3">
          {commonDeliverables.map(template => (
            <button
              key={template.type}
              onClick={() => addDeliverable(template)}
              className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <span className="text-2xl mr-2">{template.icon}</span>
              <span className="font-medium">{template.type}</span>
              <span className="text-sm text-gray-500 ml-2">({template.default_quantity})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Added Deliverables */}
      {formState.deliverables?.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Your Deliverables</h3>
          <div className="space-y-4">
            {formState.deliverables.map((deliverable: any) => (
              <div key={deliverable.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{deliverable.deliverable_type}</h4>
                  <p className="text-sm text-gray-600">Quantity: {deliverable.quantity}</p>
                </div>
                <button
                  onClick={() => removeDeliverable(deliverable.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!formState.deliverables || formState.deliverables.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step4_Deliverables;
