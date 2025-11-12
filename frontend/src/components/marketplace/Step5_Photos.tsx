import { useState } from 'react';

interface Step5Props {
  formState: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step5_Photos = ({ formState, updateForm, onNext, onBack }: Step5Props) => {
  const handlePhotoUpload = (files: FileList, category: string) => {
    const newPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview_url = URL.createObjectURL(file);
      const photoId = `${Date.now()}-${i}`;

      newPhotos.push({
        id: photoId,
        file,
        preview_url,
        category,
        caption: '',
        is_cover: (formState.photos?.length || 0) === 0 && i === 0
      });
    }

    updateForm({
      photos: [...(formState.photos || []), ...newPhotos]
    });
  };

  const removePhoto = (id: string) => {
    updateForm({
      photos: formState.photos.filter((p: any) => p.id !== id)
    });
  };

  const setCoverPhoto = (id: string) => {
    updateForm({
      photos: formState.photos.map((p: any) => ({
        ...p,
        is_cover: p.id === id
      }))
    });
  };

  const categories = [
    { value: 'house', label: 'Chapter House', icon: '🏛️' },
    { value: 'event', label: 'Past Events', icon: '🎉' },
    { value: 'social', label: 'Social Media', icon: '📱' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">Add photos</h2>
      <p className="text-gray-600 mb-8">Upload at least 5 high-quality photos</p>

      {/* Upload Sections */}
      <div className="space-y-6 mb-8">
        {categories.map(category => (
          <div key={category.value} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center">
                  <span className="text-2xl mr-2">{category.icon}</span>
                  {category.label}
                </h3>
              </div>

              <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
                Upload
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handlePhotoUpload(e.target.files, category.value)}
                />
              </label>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-4 gap-3">
              {formState.photos?.filter((p: any) => p.category === category.value).map((photo: any) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.preview_url}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  {photo.is_cover && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCoverPhoto(photo.id)}
                      className="px-2 py-1 bg-white text-xs rounded"
                    >
                      Set Cover
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Count */}
      <div className="p-4 bg-gray-50 rounded-lg text-center mb-8">
        <p className="text-lg">
          <span className="font-bold text-2xl">{formState.photos?.length || 0}</span>
          <span className="text-gray-600"> / 5 minimum photos uploaded</span>
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!formState.photos || formState.photos.length < 5}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Step5_Photos;
