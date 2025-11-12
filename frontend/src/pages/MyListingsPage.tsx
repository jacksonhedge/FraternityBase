/**
 * MyListingsPage
 * Business dashboard for managing marketplace listings
 */

import { Store, Plus, Edit, Eye, EyeOff, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  company_name: string;
  logo_url?: string;
  website?: string;
  description: string;
  industry?: string;
  deal_range?: string;
  target_audience?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/companies/my-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setListings(result.data);
        }
      } else {
        console.error('Failed to fetch listings:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (listingId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/companies/listings/${listingId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        fetchListings();
      }
    } catch (error) {
      console.error('Failed to toggle listing:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            My Listings
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            Manage your marketplace presence and deals visible to fraternities
          </p>
        </div>
        <button
          onClick={() => navigate('/app/marketplace/create')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
          style={{
            backgroundColor: 'var(--brand)',
            color: 'white'
          }}
        >
          <Plus size={20} />
          Create Listing
        </button>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <Store size={64} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            No listings yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            Create your first listing to start connecting with fraternities
          </p>
          <button
            onClick={() => navigate('/app/marketplace/create')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--brand)',
              color: 'white'
            }}
          >
            <Plus size={20} />
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              {/* Listing Header with Logo */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-4">
                  {listing.logo_url ? (
                    <img
                      src={listing.logo_url}
                      alt={listing.company_name}
                      className="w-16 h-16 object-contain rounded-lg border"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <Store size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: 'var(--text)' }}>
                      {listing.company_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign size={14} style={{ color: 'var(--brand)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--brand)' }}>
                        {listing.deal_range}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                  {listing.description}
                </p>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {listing.is_active ? (
                    <>
                      <Eye size={16} style={{ color: 'var(--success)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Hidden
                      </span>
                    </>
                  )}
                </div>

                {/* Updated Date */}
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>Updated {new Date(listing.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => navigate(`/app/marketplace/edit/${listing.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(listing.id, listing.is_active)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: listing.is_active ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: listing.is_active ? 'var(--warning)' : 'var(--success)'
                  }}
                >
                  {listing.is_active ? (
                    <>
                      <EyeOff size={16} />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Show
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
