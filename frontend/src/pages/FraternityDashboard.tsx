/**
 * FraternityDashboard Page
 * Main fraternity user dashboard with brand discovery
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import TopNav from '../components/fraternity/TopNav';
import BrandGrid from '../components/fraternity/BrandGrid';
import BrandDetailSheet from '../components/fraternity/BrandDetailSheet';
import MessagesPanel from '../components/fraternity/MessagesPanel';
import { Brand } from '../components/fraternity/BrandCard';

type Tab = 'home' | 'all-brands' | 'pre-approved' | 'new' | 'favorites';

export default function FraternityDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId } = useParams();

  // State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bookmarkedBrandIds, setBookmarkedBrandIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // Parse tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as Tab;
    if (tab && ['home', 'all-brands', 'pre-approved', 'new', 'favorites'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
    fetchBookmarks();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);

      // Try to load brands from admin localStorage first
      const savedAdminBrands = localStorage.getItem('adminBrands');
      if (savedAdminBrands) {
        try {
          const parsed = JSON.parse(savedAdminBrands);
          console.log('FraternityDashboard: Loaded brands from admin:', parsed.length);
          setBrands(parsed);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing admin brands:', error);
        }
      }

      // Default brands if no saved data
      const prophetX: Brand = {
        id: 'prophetx-featured',
        name: 'ProphetX',
        brand_industry: 'Sports Betting & Analytics',
        description: 'AI-powered sports betting platform for college students. Get exclusive access to advanced analytics and predictions.',
        logo_url: '', // Add logo URL when available
        is_brand: true,
        approval_status: 'approved',
        is_featured: true
      };

      // Mock additional brands for demo
      const mockBrands: Brand[] = [
        {
          id: 'fanduel',
          name: 'FanDuel',
          brand_industry: 'Sports Betting',
          description: 'Leading sports betting platform',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        },
        {
          id: 'draftkings',
          name: 'DraftKings',
          brand_industry: 'Sports Betting',
          description: 'Daily fantasy sports and betting',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        },
        {
          id: 'sleeper',
          name: 'Sleeper',
          brand_industry: 'Fantasy Sports',
          description: 'Fantasy sports platform for college students',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        },
        {
          id: 'espn',
          name: 'ESPN',
          brand_industry: 'Sports Media',
          description: 'Sports news and streaming',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        },
        {
          id: 'hbo',
          name: 'HBO Max',
          brand_industry: 'Streaming',
          description: 'Premium streaming service',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        },
        {
          id: 'kalshi',
          name: 'Kalshi',
          brand_industry: 'Prediction Markets',
          description: 'Event trading platform',
          logo_url: '',
          is_brand: true,
          approval_status: 'pending'
        },
        {
          id: 'polymarket',
          name: 'Polymarket',
          brand_industry: 'Prediction Markets',
          description: 'Information markets platform',
          logo_url: '',
          is_brand: true,
          approval_status: 'pending'
        },
        {
          id: 'lineleap',
          name: 'LineLeap',
          brand_industry: 'Nightlife',
          description: 'Skip the line at bars and clubs',
          logo_url: '',
          is_brand: true,
          approval_status: 'approved'
        }
      ];

      // Add ProphetX at the beginning of the list
      const allBrands = [prophetX, ...mockBrands];
      setBrands(allBrands);

      // TODO: Uncomment when backend API is ready
      /*
      const token = localStorage.getItem('token');
      const response = await fetch('/api/companies?is_brand=true&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allBrands = [prophetX, ...(data.companies || [])];
        setBrands(allBrands);
      } else {
        // Fallback to mock data
        setBrands([prophetX, ...mockBrands]);
      }
      */
    } catch (error) {
      console.error('Error fetching brands:', error);
      // On error, still show mock brands
      const prophetX: Brand = {
        id: 'prophetx-featured',
        name: 'ProphetX',
        brand_industry: 'Sports Betting & Analytics',
        description: 'AI-powered sports betting platform for college students.',
        logo_url: '',
        is_brand: true,
        approval_status: 'approved',
        is_featured: true
      };
      setBrands([prophetX]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      // TODO: Uncomment when backend API is ready
      /*
      const token = localStorage.getItem('token');

      const response = await fetch('/api/fraternity/interests/brands', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookmarkedIds = new Set(data.interests?.map((i: any) => i.company_id) || []);
        setBookmarkedBrandIds(bookmarkedIds);
      }
      */

      // For now, use local storage for bookmarks
      const savedBookmarks = localStorage.getItem('brandBookmarks');
      if (savedBookmarks) {
        setBookmarkedBrandIds(new Set(JSON.parse(savedBookmarks)));
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async (brandId: string, isBookmarked: boolean) => {
    try {
      let newBookmarks: Set<string>;

      if (isBookmarked) {
        // Add bookmark
        newBookmarks = new Set(bookmarkedBrandIds).add(brandId);
      } else {
        // Remove bookmark
        newBookmarks = new Set(bookmarkedBrandIds);
        newBookmarks.delete(brandId);
      }

      setBookmarkedBrandIds(newBookmarks);

      // Save to local storage
      localStorage.setItem('brandBookmarks', JSON.stringify(Array.from(newBookmarks)));

      // TODO: Uncomment when backend API is ready
      /*
      const token = localStorage.getItem('token');

      if (isBookmarked) {
        await fetch(`/api/fraternity/interests/brands/${brandId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
      } else {
        await fetch(`/api/fraternity/interests/brands/${brandId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      */
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Open brand detail
  const handleOpenBrand = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (brand) {
      setSelectedBrand(brand);
      setIsSheetOpen(true);
      // Update URL without full navigation
      window.history.pushState({}, '', `/fraternity/dashboard/brand/${brandId}?tab=${activeTab}`);
    }
  };

  // Close brand detail
  const handleCloseBrand = () => {
    setIsSheetOpen(false);
    setSelectedBrand(null);
    // Restore URL
    window.history.pushState({}, '', `/fraternity/dashboard?tab=${activeTab}`);
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = location.pathname.split('/');
      const brandIdFromPath = pathParts[pathParts.length - 1];

      if (pathParts.includes('brand') && brandIdFromPath) {
        const brand = brands.find((b) => b.id === brandIdFromPath);
        if (brand) {
          setSelectedBrand(brand);
          setIsSheetOpen(true);
        }
      } else {
        setIsSheetOpen(false);
        setSelectedBrand(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location, brands]);

  // Filter brands based on active tab
  const filteredBrands = useMemo(() => {
    let result = brands;

    // Apply tab filter
    switch (activeTab) {
      case 'pre-approved':
        result = result.filter((b) => b.approval_status === 'approved');
        break;
      case 'favorites':
        result = result.filter((b) => bookmarkedBrandIds.has(b.id));
        break;
      case 'new':
        // Sort by created_at and take recent ones
        result = [...result].sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        }).slice(0, 50); // Show 50 newest
        break;
      case 'home':
        // Show featured/curated brands
        result = result.filter((b) => b.approval_status === 'approved');
        break;
      case 'all-brands':
      default:
        // No filter
        break;
    }

    return result;
  }, [brands, activeTab, bookmarkedBrandIds]);

  // Get user name from token (placeholder)
  const userName = 'John'; // TODO: Parse from JWT

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userName={userName}
        notificationCount={0}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-[var(--max-width-lg)] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Hero Section (Home Tab Only) */}
        {activeTab === 'home' && (
          <div className="mb-12">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: 'var(--text)' }}
            >
              Discover Brand Partnerships
            </h1>
            <p
              className="text-lg max-w-2xl"
              style={{ color: 'var(--text-muted)' }}
            >
              Connect with leading brands that want to partner with your chapter. Browse opportunities, express interest, and unlock exclusive deals.
            </p>
          </div>
        )}

        {/* Tab Title */}
        {activeTab !== 'home' && (
          <div className="mb-8">
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              {activeTab === 'all-brands' && 'All Brands'}
              {activeTab === 'pre-approved' && 'Pre-approved Brands'}
              {activeTab === 'new' && 'New Brands'}
              {activeTab === 'favorites' && 'Your Favorites'}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
            </p>
          </div>
        )}

        {/* Brand Grid */}
        <BrandGrid
          brands={filteredBrands}
          isLoading={isLoading}
          onOpen={handleOpenBrand}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedBrandIds={bookmarkedBrandIds}
          emptyMessage={
            activeTab === 'favorites'
              ? "You haven't favorited any brands yet"
              : 'No brands available'
          }
        />
      </main>

      {/* Brand Detail Sheet */}
      <BrandDetailSheet
        brand={selectedBrand}
        isOpen={isSheetOpen}
        onClose={handleCloseBrand}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={selectedBrand ? bookmarkedBrandIds.has(selectedBrand.id) : false}
      />

      {/* Messages Panel */}
      <MessagesPanel
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />
    </div>
  );
}
