'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { donationAPI } from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };
const urgencyColors: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

// Comprehensive world cities list
const WORLD_CITIES = [
  // India
  'Mumbai','Delhi','Bangalore','Hyderabad','Ahmedabad','Chennai','Kolkata','Pune','Jaipur','Surat',
  'Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Ghaziabad',
  'Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Varanasi','Srinagar','Aurangabad','Dhanbad',
  'Amritsar','Allahabad','Ranchi','Howrah','Coimbatore','Jabalpur','Gwalior','Vijayawada','Jodhpur','Madurai',
  // USA
  'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose',
  'Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville',
  'Oklahoma City','El Paso','Washington DC','Boston','Memphis','Portland','Las Vegas','Louisville','Milwaukee','Baltimore',
  // UK
  'London','Birmingham','Manchester','Glasgow','Leeds','Liverpool','Bristol','Sheffield','Edinburgh','Leicester',
  // Europe
  'Paris','Berlin','Madrid','Rome','Barcelona','Amsterdam','Munich','Vienna','Brussels','Stockholm',
  'Oslo','Copenhagen','Zurich','Helsinki','Prague','Warsaw','Budapest','Athens','Lisbon','Dublin',
  // Asia
  'Tokyo','Shanghai','Beijing','Seoul','Jakarta','Bangkok','Kuala Lumpur','Singapore','Osaka','Manila',
  'Ho Chi Minh City','Hanoi','Karachi','Lahore','Dhaka','Colombo','Kathmandu','Kabul','Tehran','Baghdad',
  // Middle East
  'Dubai','Abu Dhabi','Riyadh','Jeddah','Doha','Kuwait City','Muscat','Amman','Beirut','Cairo',
  // Africa
  'Lagos','Cairo','Kinshasa','Johannesburg','Nairobi','Dar es Salaam','Luanda','Khartoum','Accra','Addis Ababa',
  // Australia / NZ
  'Sydney','Melbourne','Brisbane','Perth','Adelaide','Auckland','Wellington','Christchurch',
  // Canada
  'Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Winnipeg','Quebec City',
  // South America
  'São Paulo','Rio de Janeiro','Buenos Aires','Lima','Bogotá','Santiago','Caracas','Quito','La Paz','Montevideo',
  // China
  'Guangzhou','Shenzhen','Chengdu','Tianjin','Wuhan','Chongqing','Hangzhou','Nanjing','Xi\'an','Harbin',
];

export default function MarketplacePage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    donationAPI.getAll({ status: 'pending', category: category || undefined, urgency: urgency || undefined })
      .then(({ data }) => setDonations(data.donations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, urgency]);

  // Extract unique cities from actual donation data
  const dbCities = useMemo(() => {
    const cities = new Set<string>();
    donations.forEach(d => {
      const city = d.pickupLocation?.city;
      if (city && city.trim()) cities.add(city.trim());
    });
    return Array.from(cities).sort();
  }, [donations]);

  // Merge DB cities with world cities, DB cities first
  const allCities = useMemo(() => {
    const worldSet = new Set(WORLD_CITIES);
    dbCities.forEach(c => worldSet.delete(c));
    return [...dbCities, ...Array.from(worldSet).sort()];
  }, [dbCities]);

  const filteredCities = useMemo(() =>
    citySearch.trim() ? allCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 20) : [],
    [citySearch, allCities]
  );

  const filtered = donations.filter(d => {
    const matchSearch =
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.foodType?.toLowerCase().includes(search.toLowerCase()) ||
      d.pickupLocation?.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter ? (d.pickupLocation?.city?.toLowerCase() === cityFilter.toLowerCase()) : true;
    return matchSearch && matchCity;
  });

  const safeDate = (val: any) => {
    if (!val) return null;
    if (val?.toDate) return val.toDate();
    if (val?.seconds) return new Date(val.seconds * 1000);
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <div style={{ background: 'var(--bg-card2)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '100px', maxWidth: '1280px', margin: '0 auto', padding: '100px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Live Listings</span>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0 12px' }}>
            NGO <span className="gradient-text">Marketplace</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Browse all available donations near you. Accept and coordinate pickups with your volunteers.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', padding: '20px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          {/* Main search */}
          <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, donor..." className="input" style={{ paddingLeft: '44px' }} />
          </div>

          {/* City search dropdown */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none', zIndex: 2 }} />
            <input
              value={cityFilter ? cityFilter : citySearch}
              onChange={e => {
                setCitySearch(e.target.value);
                setCityFilter('');
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder="Filter by city..."
              className="input"
              style={{ paddingLeft: '40px', paddingRight: cityFilter ? '36px' : '14px' }}
            />
            {cityFilter && (
              <button onClick={() => { setCityFilter(''); setCitySearch(''); }} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1 }}>✕</button>
            )}
            {showCityDropdown && filteredCities.length > 0 && !cityFilter && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: '260px', overflowY: 'auto' }}>
                {dbCities.length > 0 && (
                  <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Cities with Donations
                  </div>
                )}
                {filteredCities.map(city => (
                  <button key={city} onMouseDown={() => { setCityFilter(city); setCitySearch(city); setShowCityDropdown(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <MapPin size={13} color={dbCities.includes(city) ? '#22c55e' : 'var(--text-secondary)'} />
                    {city}
                    {dbCities.includes(city) && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>has donations</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select value={category} onChange={e => setCategory(e.target.value)} className="input" style={{ width: 'auto', minWidth: '150px' }}>
            <option value="">All Categories</option>
            {['food','clothes','toys','books','other'].map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={urgency} onChange={e => setUrgency(e.target.value)} className="input" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="">All Urgency</option>
            {['low','medium','high','critical'].map(u => <option key={u} value={u} style={{ textTransform: 'capitalize' }}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Showing <span style={{ color: '#22c55e', fontWeight: 700 }}>{filtered.length}</span> available donations{cityFilter ? ` in ${cityFilter}` : ''}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>● Live</span>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <p>Loading available donations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }} className="card">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '8px' }}>No donations found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Try adjusting your filters or check back soon.</p>
            <Link href="/auth/register?role=donor" className="btn-primary" style={{ padding: '12px 28px' }}>Be the first to donate</Link>
          </div>
        ) : (
          <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(d => {
              const date = safeDate(d.createdAt);
              return (
                <div key={d._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ height: '140px', background: 'var(--bg-card)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative', overflow: 'hidden' }}>
                    {d.images?.[0] ? (
                      <img src={d.images[0]} alt={d.foodType || d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (categoryIcon[d.category] || '📦')}
                    {d.urgency && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: `${urgencyColors[d.urgency]}20`, color: urgencyColors[d.urgency], border: `1px solid ${urgencyColors[d.urgency]}40`, backdropFilter: 'blur(4px)' }}>
                        {d.urgency.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px', flex: 1, marginRight: '8px' }}>{d.foodType || d.title}</h3>
                      <span style={{ padding: '2px 10px', background: 'var(--border)', borderRadius: '100px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{d.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 10px', lineHeight: 1.6 }}>{(d.description || d.additionalInfo || 'No description provided').slice(0, 80)}...</p>
                  </div>

                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <MapPin size={13} /> {d.pickupLocation?.city || d.pickupLocation?.address || 'Location TBD'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <Clock size={13} /> {date ? formatDistanceToNow(date, { addSuffix: true }) : 'Recently added'}
                    </div>
                    <div style={{ fontWeight: 600, color: '#22c55e', fontSize: '14px' }}>Qty: {d.quantity} {d.unit || 'items'}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '13px' }}>{d.donor?.name?.[0] || '?'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.donor?.name || 'Anonymous Donor'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.donor?.organization || 'Individual'}</div>
                    </div>
                    <Link href="/auth/login" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      Accept <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
