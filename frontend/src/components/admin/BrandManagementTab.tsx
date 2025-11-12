/**
 * Brand Management Tab
 * Control which brands fraternities see
 */

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Star, Edit, Trash2, Check, X, Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  description?: string;
  brand_industry?: string;
  logo_url?: string;
  is_brand: boolean;
  is_featured?: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  partnership_type?: string; // e.g., "Sponsored Event", "Affiliate Deal", "Group Discount"
  platform_type?: string; // e.g., "Mobile App", "Web Platform", "In-Person"
  deal_amount?: string; // e.g., "$500/month", "$2,000 event", "20% off"
}

export default function BrandManagementTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'featured'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [logoUploadMethod, setLogoUploadMethod] = useState<'url' | 'file'>('url');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    brand_industry: '',
    logo_url: '',
    partnership_type: '',
    platform_type: '',
    deal_amount: ''
  });

  // Initialize with mock data or load from localStorage
  useEffect(() => {
    // Try to load from localStorage first
    const savedBrands = localStorage.getItem('adminBrands');
    if (savedBrands) {
      try {
        const parsed = JSON.parse(savedBrands);
        setBrands(parsed);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing saved brands:', error);
      }
    }

    // Default brands if no saved data
    const initialBrands: Brand[] = [
      {
        id: 'prophetx',
        name: 'ProphetX',
        description: 'AI-powered sports betting platform for college students. Get exclusive access to advanced analytics and predictions powered by machine learning.',
        brand_industry: 'Sports Betting & Analytics',
        logo_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop',
        partnership_type: 'Affiliate Partnership',
        platform_type: 'Mobile App',
        deal_amount: '$500/signup',
        is_brand: true,
        is_featured: true,
        approval_status: 'approved'
      },
      {
        id: 'fanduel',
        name: 'FanDuel',
        description: 'America\'s #1 sportsbook. Bet on all your favorite sports with competitive odds, live betting, and same-game parlays. Get exclusive chapter-wide promotions and bonuses.',
        brand_industry: 'Sports Betting',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/FanDuel_logo.svg/2560px-FanDuel_logo.svg.png',
        partnership_type: 'Sponsored Events',
        platform_type: 'Mobile & Web',
        deal_amount: '$2,500/event',
        is_brand: true,
        is_featured: true,
        approval_status: 'approved'
      },
      {
        id: 'draftkings',
        name: 'DraftKings',
        description: 'The premier destination for daily fantasy sports, sports betting, and online casino. Offering exclusive group promotions, competitive odds, and instant payouts for college chapters.',
        brand_industry: 'Sports Betting',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/DraftKings_logo.svg/2560px-DraftKings_logo.svg.png',
        partnership_type: 'Sponsored Events',
        platform_type: 'Mobile & Web',
        deal_amount: '$3,000/event',
        is_brand: true,
        is_featured: true,
        approval_status: 'approved'
      },
      {
        id: 'sleeper',
        name: 'Sleeper',
        description: 'The social home for your fantasy leagues. Perfect for chapter-wide fantasy football, basketball, and more. Create custom leagues with friends, track stats in real-time.',
        brand_industry: 'Fantasy Sports',
        logo_url: 'https://pbs.twimg.com/profile_images/1678481602281590785/XzmJ9Fug_400x400.jpg',
        partnership_type: 'Group Discount',
        platform_type: 'Mobile App',
        deal_amount: 'Free Premium',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'espn',
        name: 'ESPN',
        description: 'Your source for live sports scores, news, highlights, and streaming. Access ESPN+ for exclusive games, UFC fights, and original shows. Special student pricing available.',
        brand_industry: 'Sports Media',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/2560px-ESPN_wordmark.svg.png',
        partnership_type: 'Subscription Discount',
        platform_type: 'Streaming Service',
        deal_amount: '$5.99/month',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'max',
        name: 'Max (HBO Max)',
        description: 'Stream HBO originals, blockbuster movies, and exclusive series. Get group discounts for your chapter. Includes HBO, Discovery+, and Max Originals.',
        brand_industry: 'Streaming',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Max_logo.svg/2560px-Max_logo.svg.png',
        partnership_type: 'Group Discount',
        platform_type: 'Streaming Service',
        deal_amount: '$9.99/month',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'kalshi',
        name: 'Kalshi',
        description: 'The first CFTC-regulated exchange for event contracts. Trade on real-world events from elections to weather. Perfect for politically engaged chapters.',
        brand_industry: 'Prediction Markets',
        logo_url: 'https://pbs.twimg.com/profile_images/1583566064883523585/lkSj4aAw_400x400.jpg',
        partnership_type: 'Affiliate Partnership',
        platform_type: 'Web Platform',
        deal_amount: '$100 bonus',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'polymarket',
        name: 'Polymarket',
        description: 'The world\'s largest prediction market. Bet on politics, crypto, sports, and culture with real money. Discover what the world thinks will happen.',
        brand_industry: 'Prediction Markets',
        logo_url: 'https://pbs.twimg.com/profile_images/1635368149147111425/5iI6LShR_400x400.jpg',
        partnership_type: 'Affiliate Partnership',
        platform_type: 'Web Platform',
        deal_amount: '$50 bonus',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'lineleap',
        name: 'LineLeap',
        description: 'Skip the line at bars and clubs near your campus. Reserve your spot ahead of time with exclusive chapter pricing. Available at 200+ venues nationwide.',
        brand_industry: 'Nightlife',
        logo_url: 'https://pbs.twimg.com/profile_images/1485336421073113091/8WJUeTTe_400x400.jpg',
        partnership_type: 'Group Discount',
        platform_type: 'Mobile App',
        deal_amount: '25% off',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'spotify',
        name: 'Spotify',
        description: 'Stream millions of songs and podcasts for free, or upgrade to Premium for ad-free listening. Get exclusive fraternity playlists and chapter group discounts.',
        brand_industry: 'Music Streaming',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png',
        partnership_type: 'Subscription Discount',
        platform_type: 'Mobile & Web',
        deal_amount: '$4.99/month',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'uber',
        name: 'Uber',
        description: 'Ride with Uber for safe, reliable transportation. Get chapter-wide promo codes and discounts. Perfect for game days, formals, and late-night rides home.',
        brand_industry: 'Rideshare',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/2560px-Uber_logo_2018.svg.png',
        partnership_type: 'Promo Codes',
        platform_type: 'Mobile App',
        deal_amount: '$50 in credits',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      },
      {
        id: 'doordash',
        name: 'DoorDash',
        description: 'Food delivery from your favorite restaurants. Get exclusive chapter deals and group ordering for meetings and events. Save on delivery fees with DashPass.',
        brand_industry: 'Food Delivery',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/DoorDash_logo.svg/2560px-DoorDash_logo.svg.png',
        partnership_type: 'Group Discount',
        platform_type: 'Mobile & Web',
        deal_amount: '$200/month credit',
        is_brand: true,
        is_featured: false,
        approval_status: 'approved'
      }
    ];

    setBrands(initialBrands);
    setIsLoading(false);
  }, []);

  // Save brands to localStorage whenever they change
  useEffect(() => {
    if (brands.length > 0 && !isLoading) {
      localStorage.setItem('adminBrands', JSON.stringify(brands));
    }
  }, [brands, isLoading]);

  const toggleApproval = (brandId: string) => {
    setBrands(brands.map(b => {
      if (b.id === brandId) {
        const newStatus = b.approval_status === 'approved' ? 'pending' : 'approved';
        return { ...b, approval_status: newStatus };
      }
      return b;
    }));
  };

  const toggleFeatured = (brandId: string) => {
    setBrands(brands.map(b => {
      if (b.id === brandId) {
        return { ...b, is_featured: !b.is_featured };
      }
      return b;
    }));
  };

  const deleteBrand = (brandId: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      setBrands(brands.filter(b => b.id !== brandId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setNewBrand({ ...newBrand, logo_url: base64String });
    };
    reader.readAsDataURL(file);
  };

  const addBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const brand: Brand = {
      id: `brand-${Date.now()}`,
      name: newBrand.name,
      description: newBrand.description,
      brand_industry: newBrand.brand_industry,
      logo_url: newBrand.logo_url,
      partnership_type: newBrand.partnership_type,
      platform_type: newBrand.platform_type,
      deal_amount: newBrand.deal_amount,
      is_brand: true,
      is_featured: false,
      approval_status: 'approved',
      created_at: new Date().toISOString()
    };
    setBrands([brand, ...brands]);
    setNewBrand({ name: '', description: '', brand_industry: '', logo_url: '', partnership_type: '', platform_type: '', deal_amount: '' });
    setLogoPreview('');
    setLogoUploadMethod('url');
    setShowAddForm(false);

    // Show success message
    setSuccessMessage(`${brand.name} has been added and is now visible to fraternities!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const updateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    setBrands(brands.map(b =>
      b.id === editingBrand.id ? editingBrand : b
    ));

    setEditingBrand(null);
    setLogoPreview('');
    setLogoUploadMethod('url');

    // Show success message
    setSuccessMessage(`${editingBrand.name} has been updated successfully!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const filteredBrands = brands.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'featured') return b.is_featured;
    return b.approval_status === filter;
  });

  const stats = {
    total: brands.length,
    approved: brands.filter(b => b.approval_status === 'approved').length,
    pending: brands.filter(b => b.approval_status === 'pending').length,
    featured: brands.filter(b => b.is_featured).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading brands...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Brand Added Successfully!</h4>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Brand Management</h3>
          <p className="text-sm text-gray-600 mt-1">Add and manage brands that fraternities can discover</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add New Brand
        </button>
      </div>

      {/* Add Brand Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Brand</h3>
            <form onSubmit={addBrand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Nike"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <input
                  type="text"
                  required
                  value={newBrand.brand_industry}
                  onChange={(e) => setNewBrand({ ...newBrand, brand_industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sports Apparel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newBrand.description}
                  onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the brand..."
                  rows={3}
                />
              </div>

              {/* Airbnb-style Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Type</label>
                  <input
                    type="text"
                    value={newBrand.partnership_type}
                    onChange={(e) => setNewBrand({ ...newBrand, partnership_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Sponsored Events"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Type</label>
                  <input
                    type="text"
                    value={newBrand.platform_type}
                    onChange={(e) => setNewBrand({ ...newBrand, platform_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Mobile App"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Amount</label>
                <input
                  type="text"
                  value={newBrand.deal_amount}
                  onChange={(e) => setNewBrand({ ...newBrand, deal_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., $2,500/event or 20% off"
                />
              </div>

              {/* Logo Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>

                {/* Toggle between URL and File */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUploadMethod('url');
                      setLogoPreview('');
                      setNewBrand({ ...newBrand, logo_url: '' });
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      logoUploadMethod === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUploadMethod('file');
                      setNewBrand({ ...newBrand, logo_url: '' });
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      logoUploadMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload size={16} className="inline mr-1" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {logoUploadMethod === 'url' && (
                  <input
                    type="url"
                    value={newBrand.logo_url}
                    onChange={(e) => {
                      setNewBrand({ ...newBrand, logo_url: e.target.value });
                      setLogoPreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                )}

                {/* File Input */}
                {logoUploadMethod === 'file' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </label>
                  </div>
                )}

                {/* Logo Preview */}
                {(logoPreview || newBrand.logo_url) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <div className="flex items-center justify-center bg-white rounded border border-gray-200 p-4">
                      <img
                        src={logoPreview || newBrand.logo_url}
                        alt="Logo preview"
                        className="max-h-24 max-w-full object-contain"
                        onError={() => {
                          setLogoPreview('');
                          if (logoUploadMethod === 'url') {
                            alert('Failed to load image from URL');
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Add Brand
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewBrand({ name: '', description: '', brand_industry: '', logo_url: '', partnership_type: '', platform_type: '', deal_amount: '' });
                    setLogoPreview('');
                    setLogoUploadMethod('url');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Form Modal */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Brand</h3>
            <form onSubmit={updateBrand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Nike"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.brand_industry || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, brand_industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sports Apparel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the brand..."
                  rows={3}
                />
              </div>

              {/* Logo Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>

                {/* Toggle between URL and File */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUploadMethod('url');
                      setLogoPreview('');
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      logoUploadMethod === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoUploadMethod('file')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      logoUploadMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload size={16} className="inline mr-1" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {logoUploadMethod === 'url' && (
                  <input
                    type="url"
                    value={editingBrand.logo_url || ''}
                    onChange={(e) => {
                      setEditingBrand({ ...editingBrand, logo_url: e.target.value });
                      setLogoPreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                )}

                {/* File Input */}
                {logoUploadMethod === 'file' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file');
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          alert('File size must be less than 2MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setLogoPreview(base64String);
                          setEditingBrand({ ...editingBrand, logo_url: base64String });
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                      id="edit-logo-upload"
                    />
                    <label htmlFor="edit-logo-upload" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </label>
                  </div>
                )}

                {/* Logo Preview */}
                {(logoPreview || editingBrand.logo_url) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <div className="flex items-center justify-center bg-white rounded border border-gray-200 p-4">
                      <img
                        src={logoPreview || editingBrand.logo_url}
                        alt="Logo preview"
                        className="max-h-24 max-w-full object-contain"
                        onError={() => {
                          setLogoPreview('');
                          if (logoUploadMethod === 'url') {
                            alert('Failed to load image from URL');
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Update Brand
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBrand(null);
                    setLogoPreview('');
                    setLogoUploadMethod('url');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Brands</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-700">Visible to Fraternities</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-sm text-yellow-700">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-700">Featured Brands</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.featured}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {(['all', 'approved', 'pending', 'rejected', 'featured'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs text-gray-500">
              ({f === 'all' ? stats.total : f === 'featured' ? stats.featured : f === 'approved' ? stats.approved : f === 'pending' ? stats.pending : brands.filter(b => b.approval_status === 'rejected').length})
            </span>
          </button>
        ))}
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Logo */}
            <div className="mb-3">
              <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #30B3BC 0%, #4AB54E 100%)',
                      color: 'white'
                    }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Airbnb-style Top Info: Partnership Type • Platform Type */}
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <span className="font-medium">{brand.partnership_type || 'Partnership'}</span>
              <span>•</span>
              <span>{brand.platform_type || 'Platform'}</span>
            </div>

            {/* Brand Name */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{brand.name}</h3>
              {brand.is_featured && (
                <Star size={14} fill="#FDB022" color="#FDB022" className="flex-shrink-0" />
              )}
            </div>

            {/* Description */}
            {brand.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>
            )}

            {/* Airbnb-style Bottom Amount */}
            {brand.deal_amount && (
              <div className="mb-3">
                <span className="font-semibold text-gray-900">{brand.deal_amount}</span>
                <span className="text-sm text-gray-600"> deal value</span>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  brand.approval_status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : brand.approval_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {brand.approval_status}
              </span>
              {brand.is_featured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  Featured
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleApproval(brand.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  brand.approval_status === 'approved'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title={brand.approval_status === 'approved' ? 'Hide from fraternities' : 'Show to fraternities'}
              >
                {brand.approval_status === 'approved' ? <EyeOff size={14} /> : <Eye size={14} />}
                {brand.approval_status === 'approved' ? 'Hide' : 'Approve'}
              </button>

              <button
                onClick={() => toggleFeatured(brand.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  brand.is_featured
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={brand.is_featured ? 'Unfeature' : 'Mark as featured'}
              >
                <Star size={14} fill={brand.is_featured ? 'currentColor' : 'none'} />
                {brand.is_featured ? 'Featured' : 'Feature'}
              </button>

              <button
                onClick={() => setEditingBrand(brand)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit brand"
              >
                <Edit size={14} />
              </button>

              <button
                onClick={() => deleteBrand(brand.id)}
                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete brand"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No brands found</p>
        </div>
      )}

      {/* Add Brand Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-2xl z-40"
      >
        +
      </button>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Brand Visibility Control</h4>
            <p className="text-sm text-blue-700">
              Only <strong>approved</strong> brands are visible to fraternities. Toggle the eye icon to show/hide brands instantly.
              Featured brands appear first with a special badge on the fraternity dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
