'use client';
import { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { donationAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Upload, X, MapPin, Clock, Package, ChevronRight, CheckCircle } from 'lucide-react';

const steps = ['Category', 'Details', 'Location', 'Review'];

const categories = [
  { value: 'food', icon: '🍱', label: 'Food', desc: 'Cooked meals, groceries, packaged items' },
  { value: 'clothes', icon: '👕', label: 'Clothes', desc: 'All sizes, seasonal wear, accessories' },
  { value: 'toys', icon: '🧸', label: 'Toys', desc: 'Educational & recreational toys' },
  { value: 'books', icon: '📚', label: 'Books', desc: 'Textbooks, novels, guides' },
  { value: 'other', icon: '♻️', label: 'Other', desc: 'Electronics, furniture, essentials' },
];

const urgencies = [
  { value: 'low', label: 'Low', color: '#22c55e', desc: 'Within a week' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', desc: 'Within 2-3 days' },
  { value: 'high', label: 'High', color: '#f97316', desc: 'Within 24 hours' },
  { value: 'critical', label: 'Critical', color: '#ef4444', desc: 'Pickup ASAP' },
];

export default function DonatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: '', title: '', description: '', quantity: '', unit: 'kg',
    urgency: 'medium', expiryTime: '', specialInstructions: '',
    'pickupLocation.address': '', 'pickupLocation.city': '',
    'pickupLocation.state': '', 'pickupLocation.pincode': '',
    estimatedServings: '',
    currentMobileNo: '',
    alternateMobileNo: '',
  });

  useEffect(() => {
    if (user?.phone && !form.currentMobileNo) {
      setForm(p => ({ ...p, currentMobileNo: user.phone }));
    }
  }, [user]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...images, ...acceptedFiles].slice(0, 5);
    setImages(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true });

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (step === 0 && !form.category) { toast.error('Please select a category'); return; }
    if (step === 1 && (!form.title || !form.quantity || !form.currentMobileNo || !form.alternateMobileNo)) { toast.error('Please fill all required fields including contact numbers'); return; }
    if (step === 2 && !form['pickupLocation.address']) { toast.error('Please enter pickup address'); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await donationAPI.create(fd);
      toast.success('Donation listed successfully! NGOs will be notified.');
      router.push('/dashboard/donor');
    } catch (err: any) {
      console.error("Donation creation error:", err);
      toast.error(err.message || err.response?.data?.message || 'Failed to create donation');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-content" style={{ flex: 1 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>Create Donation</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>Fill in the details to list your donation for NGOs nearby.</p>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', background: i < step ? '#22c55e' : i === step ? 'rgba(34,197,94,0.2)' : 'var(--border)', color: i <= step ? '#22c55e' : 'var(--text-secondary)', border: i === step ? '2px solid #22c55e' : '2px solid transparent', transition: 'all 0.3s' }}>
                    {i < step ? <CheckCircle size={18} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '11px', color: i === step ? '#22c55e' : 'var(--text-secondary)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: i < step ? '#22c55e' : 'var(--border)', margin: '0 12px', marginBottom: '24px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>

          <div className="card">
            {/* STEP 0: Category */}
            {step === 0 && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>What are you donating?</h2>
                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  {categories.map(cat => (
                    <button key={cat.value} onClick={() => setForm(p => ({ ...p, category: cat.value }))} type="button"
                      style={{ padding: '20px 16px', borderRadius: '16px', border: `2px solid ${form.category === cat.value ? '#22c55e' : 'var(--border)'}`, background: form.category === cat.value ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.03)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{cat.icon}</div>
                      <div style={{ fontWeight: 700, color: form.category === cat.value ? '#22c55e' : 'var(--text-primary)', marginBottom: '4px' }}>{cat.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Details */}
            {step === 1 && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>Item Details</h2>
                <div className="form-group">
                  <label className="input-label">Donation Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Freshly cooked biryani for 50 people" className="input" />
                </div>
                <div className="form-group">
                  <label className="input-label">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the items, condition, packaging, etc." className="input" rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="input-label">Quantity *</label>
                    <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 50" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Unit</label>
                    <select name="unit" value={form.unit} onChange={handleChange} className="input">
                      {['kg', 'pieces', 'boxes', 'plates', 'bags', 'liters', 'packets'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                {form.category === 'food' && (
                  <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="input-label">Expiry / Best Before</label>
                      <input name="expiryTime" type="datetime-local" value={form.expiryTime} onChange={handleChange} className="input" />
                    </div>
                    <div className="form-group">
                      <label className="input-label">Estimated Servings</label>
                      <input name="estimatedServings" type="number" value={form.estimatedServings} onChange={handleChange} placeholder="50" className="input" />
                    </div>
                  </div>
                )}

                {/* Urgency */}
                <div className="form-group">
                  <label className="input-label">Urgency Level</label>
                  <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                    {urgencies.map(u => (
                      <button key={u.value} type="button" onClick={() => setForm(p => ({ ...p, urgency: u.value }))}
                        style={{ padding: '12px 8px', borderRadius: '12px', border: `2px solid ${form.urgency === u.value ? u.color : 'var(--border)'}`, background: form.urgency === u.value ? `${u.color}15` : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: form.urgency === u.value ? u.color : 'var(--text-muted)' }}>{u.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{u.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label className="input-label">Upload Images (up to 5)</label>
                  <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? '#22c55e' : 'var(--border)'}`, borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(34,197,94,0.05)' : 'var(--bg-card)', transition: 'all 0.2s' }}>
                    <input {...getInputProps()} />
                    <Upload size={32} color={isDragActive ? '#22c55e' : '#334155'} style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: isDragActive ? '#22c55e' : 'var(--text-secondary)', fontSize: '14px' }}>
                      {isDragActive ? 'Drop images here...' : 'Drag & drop images or click to browse'}
                    </p>
                    <p style={{ color: '#334155', fontSize: '12px', marginTop: '4px' }}>PNG, JPG, WEBP up to 5MB each</p>
                  </div>
                  {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                      {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                          <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="input-label">Current Mobile Number *</label>
                    <input name="currentMobileNo" value={form.currentMobileNo} onChange={handleChange} placeholder="10-digit number" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Alternate Mobile Number *</label>
                    <input name="alternateMobileNo" value={form.alternateMobileNo} onChange={handleChange} placeholder="10-digit number" className="input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Special Instructions</label>
                  <textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange} placeholder="e.g. Please bring containers. Fragile items. Call before arriving." className="input" rows={2} style={{ resize: 'vertical' }} />
                </div>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Pickup Location</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Tell us where to pick up the donation.</p>
                <div className="form-group">
                  <label className="input-label">Street Address *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input name="pickupLocation.address" value={form['pickupLocation.address']} onChange={handleChange} placeholder="123 MG Road, Near City Mall" className="input" style={{ paddingLeft: '44px' }} />
                  </div>
                </div>
                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="input-label">City</label>
                    <input name="pickupLocation.city" value={form['pickupLocation.city']} onChange={handleChange} placeholder="Mumbai" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">State</label>
                    <input name="pickupLocation.state" value={form['pickupLocation.state']} onChange={handleChange} placeholder="Maharashtra" className="input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Pincode</label>
                  <input name="pickupLocation.pincode" value={form['pickupLocation.pincode']} onChange={handleChange} placeholder="400001" className="input" style={{ maxWidth: '200px' }} />
                </div>
                <div style={{ padding: '20px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '14px', marginTop: '8px' }}>
                  <p style={{ color: '#0ea5e9', fontSize: '13px', fontWeight: 500 }}>💡 Tip: Provide a clear landmark to help volunteers find the location easily.</p>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Review & Submit</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Double-check your donation details before submitting.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Category', value: form.category },
                    { label: 'Title', value: form.title },
                    { label: 'Quantity', value: `${form.quantity} ${form.unit}` },
                    { label: 'Urgency', value: form.urgency },
                    { label: 'Pickup Address', value: form['pickupLocation.address'] },
                    form['pickupLocation.city'] ? { label: 'City', value: `${form['pickupLocation.city']}, ${form['pickupLocation.state']} ${form['pickupLocation.pincode']}` } : null,
                    form.expiryTime ? { label: 'Expiry', value: new Date(form.expiryTime).toLocaleString() } : null,
                    form.specialInstructions ? { label: 'Instructions', value: form.specialInstructions } : null,
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} style={{ display: 'flex', gap: '16px', padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, minWidth: '120px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px', textTransform: 'capitalize' }}>{item.value}</span>
                    </div>
                  ))}
                  {previews.length > 0 && (
                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Images ({previews.length})</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {previews.map((src, i) => <img key={i} src={src} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-outline" style={{ opacity: step === 0 ? 0.3 : 1, padding: '12px 24px' }}>
                Back
              </button>
              {step < 3 ? (
                <button onClick={nextStep} className="btn-primary" style={{ padding: '12px 28px' }}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: '12px 28px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting...' : <><CheckCircle size={16} /> Submit Donation</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
