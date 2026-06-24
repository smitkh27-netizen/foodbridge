'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heart, Eye, EyeOff, ArrowRight, ArrowLeft, User, Mail, Phone, Lock, Building2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [ngoLicenseFile, setNgoLicenseFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: searchParams.get('role') || 'donor',
    organization: '', donorType: 'restaurant',
    ngoName: '', ngoRegNumber: '', ngoAddress: '',
    aadharNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.role === 'volunteer' && (!form.aadharNumber || !aadharFile)) {
      toast.error('Aadhar Number and Photo are required for Volunteers');
      return;
    }
    if (form.role === 'ngo' && (!form.ngoName || !form.ngoRegNumber || !ngoLicenseFile)) {
      toast.error('NGO Name, Registration Number, and License Certificate are required');
      return;
    }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    
    setLoading(true);
    try {
      // 1. Create user in Firebase Authentication FIRST
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      let aadharUrl = '';
      let ngoLicenseUrl = '';

      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const img = new window.Image();
            img.src = reader.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              let scaleSize = 1;
              if (img.width > MAX_WIDTH) {
                 scaleSize = MAX_WIDTH / img.width;
              }
              canvas.width = img.width * scaleSize;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = error => reject(error);
          };
          reader.onerror = error => reject(error);
        });
      };

      // 2. Bypass Firebase Storage to avoid permission lockouts and use Base64 compressed images in Firestore
      if (form.role === 'volunteer' && aadharFile) {
        try { aadharUrl = await fileToBase64(aadharFile); } catch(e) { console.error(e); }
      }
      if (form.role === 'ngo' && ngoLicenseFile) {
        try { ngoLicenseUrl = await fileToBase64(ngoLicenseFile); } catch(e) { console.error(e); }
      }

      // 2. Save additional user details in Firestore
      const userData = {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        organization: form.organization,
        donorType: form.donorType,
        ngoName: form.ngoName,
        ngoRegNumber: form.ngoRegNumber,
        ngoAddress: form.ngoAddress,
        ngoLicenseUrl,
        aadharNumber: form.aadharNumber,
        aadharUrl,
        createdAt: serverTimestamp(),
        isVerified: form.role === 'donor' // Only donors are auto-verified. NGOs and Volunteers need admin approval.
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // 3. Store local session
      localStorage.setItem('foodbridge_token', await user.getIdToken());
      localStorage.setItem('foodbridge_user', JSON.stringify({ _id: user.uid, ...userData }));
      
      if (form.role === 'volunteer' || form.role === 'ngo') {
        toast.success('Registration successful! Your account is pending admin approval.');
      } else {
        toast.success('Registration successful! Welcome to FoodBridge.');
      }
      router.push(`/dashboard/${form.role}`);
      
    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      // Format Firebase error messages nicely
      const msg = err.code?.replace('auth/', '').replace(/-/g, ' ') || err.message || 'Registration failed';
      toast.error(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally { 
      setLoading(false); 
    }
  };

  const roles = [
    { value: 'donor', label: 'Food Donor', desc: 'Share surplus food & items', icon: '🍱' },
    { value: 'ngo', label: 'NGO', desc: 'Manage and distribute donations', icon: '🏢' },
    { value: 'volunteer', label: 'Volunteer', desc: 'Help with pickup & delivery', icon: '🚗' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(14,165,233,0.08) 0%, transparent 60%), var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', top: '-40px', left: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }} className="hover-text-primary">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '8px' }}>
            <Image src="/logo.png" alt="FoodBridge Logo" width={48} height={48} style={{ borderRadius: '14px' }} />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '24px', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FoodBridge</span>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Join the movement. Make a difference today.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '36px' }}>
          {/* Role Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label className="input-label">I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {roles.map(r => (
                <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  style={{ padding: '14px 8px', borderRadius: '14px', border: `2px solid ${form.role === r.value ? '#22c55e' : 'var(--border)'}`, background: form.role === r.value ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.03)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{r.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: form.role === r.value ? '#22c55e' : 'var(--text-secondary)' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="input-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Arjun Mehta" className="input" style={{ paddingLeft: '44px' }} required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="input-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="arjun@example.com" className="input" style={{ paddingLeft: '44px' }} required />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="input-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input" style={{ paddingLeft: '44px' }} required />
              </div>
            </div>

            {/* Role-specific fields */}
            {form.role === 'donor' && (
              <div className="form-group">
                <label className="input-label">Organization (Optional)</label>
                <input name="organization" value={form.organization} onChange={handleChange} placeholder="Restaurant / Hotel name" className="input" />
              </div>
            )}
            {form.role === 'ngo' && (
              <>
                <div className="form-group">
                  <label className="input-label">NGO Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input name="ngoName" value={form.ngoName} onChange={handleChange} placeholder="Hope Foundation" className="input" style={{ paddingLeft: '44px' }} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">NGO Registration Number *</label>
                  <input name="ngoRegNumber" value={form.ngoRegNumber} onChange={handleChange} placeholder="REG/2024/001234" className="input" required />
                </div>
                <div className="form-group">
                  <label className="input-label">NGO License Certificate *</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setNgoLicenseFile(e.target.files?.[0] || null)} className="input" required style={{ paddingTop: '10px' }} />
                </div>
                <div className="form-group">
                  <label className="input-label">NGO Registered Address</label>
                  <input name="ngoAddress" value={form.ngoAddress} onChange={handleChange} placeholder="123 Hope Lane, City Center" className="input" />
                </div>
              </>
            )}

            {/* Password */}
            <div className="form-group">
              <label className="input-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="At least 6 characters" className="input" style={{ paddingLeft: '44px', paddingRight: '44px' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {form.role === 'volunteer' && (
              <>
                <div className="form-group">
                  <label className="input-label">Aadhar Card Number *</label>
                  <input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} placeholder="1234 5678 9012" className="input" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Aadhar Card Photo *</label>
                  <input type="file" accept="image/*" onChange={(e) => setAadharFile(e.target.files?.[0] || null)} className="input" required style={{ paddingTop: '10px' }} />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating Account...' : <><span>Create Account</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
