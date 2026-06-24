'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { analyticsAPI } from '@/lib/api';
import { ArrowRight, Heart, Users, Building2, Truck, Star, ChevronRight, TrendingUp, Globe, Award, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const defaultStats = [
  { label: 'Meals Saved', value: 0, suffix: '+', color: '#22c55e' },
  { label: 'Active NGOs', value: 0, suffix: '+', color: '#0ea5e9' },
  { label: 'Volunteers', value: 0, suffix: '+', color: '#f97316' },
  { label: 'Total Donations', value: 0, suffix: '+', color: '#a855f7' },
];

const howItWorks = [
  { icon: Heart, title: 'Donors List Items', desc: 'Restaurants, hotels, and individuals post surplus food, clothes, toys, or books with pickup details.', color: '#22c55e', step: '01' },
  { icon: Building2, title: 'NGOs Accept & Assign', desc: 'Verified NGOs browse nearby donations on an interactive map and assign volunteers instantly.', color: '#0ea5e9', step: '02' },
  { icon: Truck, title: 'Volunteers Pick Up', desc: 'Volunteers navigate to the pickup location, collect items, and upload proof of collection.', color: '#f97316', step: '03' },
  { icon: Users, title: 'Beneficiaries Receive', desc: 'Donated items reach those in need. Each delivery is tracked and verified end-to-end.', color: '#a855f7', step: '04' },
];

const categories = [
  { icon: '🍱', label: 'Food', desc: 'Cooked meals, groceries, packaged food', count: '120K+ donations', color: '#22c55e' },
  { icon: '👕', label: 'Clothes', desc: 'All sizes, seasonal wear, accessories', count: '45K+ donations', color: '#0ea5e9' },
  { icon: '🧸', label: 'Toys', desc: 'Educational toys, games, story books', count: '18K+ donations', color: '#f97316' },
  { icon: '📚', label: 'Books', desc: 'Textbooks, novels, reference material', count: '32K+ donations', color: '#a855f7' },
  { icon: '🏠', label: 'Essentials', desc: 'Hygiene kits, blankets, medicine', count: '22K+ donations', color: '#ec4899' },
  { icon: '♻️', label: 'Other Items', desc: 'Electronics, furniture, utensils', count: '15K+ donations', color: '#14b8a6' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Restaurant Owner, Mumbai', text: 'FoodBridge transformed how we handle surplus food. Instead of throwing away perfectly good meals, we now feed 50+ families daily. The process is seamless!', rating: 5, avatar: 'P' },
  { name: 'Joseph Thomas', role: 'Director, HopeLine NGO', text: 'The platform has become our lifeline. We can now view all nearby donations in real-time and coordinate our volunteers efficiently. Impact has tripled!', rating: 5, avatar: 'J' },
  { name: 'Aisha Khan', role: 'Volunteer, Hyderabad', text: 'Being a volunteer on FoodBridge gives me purpose. The app guides me through every pickup and I can see the direct impact I\'m making every day.', rating: 5, avatar: 'A' },
];

const partners = ['Zomato Foundation', 'United Nations WFP', 'Robin Hood Army', 'Akshaya Patra', 'ISKCON Food Relief', 'HelpAge India'];

const heroImages = [
  '/hero_food_donation.png',
  '/hero_community.png',
  '/hero_boxes.png'
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
      {heroImages.map((src, idx) => (
        <div key={src} style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: idx === current ? 1 : 0, transition: 'opacity 1.5s ease-in-out'
        }}>
          <Image src={src} alt="Hero Background" fill style={{ objectFit: 'cover' }} priority={idx === 0} />
          {/* Dark overlay instead of white, so text can be white and highly readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.6)' }} />
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    analyticsAPI.getPlatform().then(({ data }) => {
      const a = data.analytics;
      if (!a) return;
      setStats([
        { label: 'Meals Saved', value: a.totalMealsSaved || 0, suffix: '+', color: '#22c55e' },
        { label: 'Active NGOs', value: a.users?.ngos || 0, suffix: '+', color: '#0ea5e9' },
        { label: 'Volunteers', value: a.users?.volunteers || 0, suffix: '+', color: '#f97316' },
        { label: 'Total Donations', value: a.totalDonations || 0, suffix: '+', color: '#a855f7' },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '160px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>
        <HeroSlider />


        
        {/* Subtle glow behind the glass */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', top: '0', left: '-100px', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', bottom: '0', right: '-100px', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="liquid-glass-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '100px', padding: '8px 20px', marginBottom: '28px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700 }}>250,000+ Meals Saved This Year</span>
          </div>

          <h1 className="section-title animate-fade-up" style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '24px', lineHeight: 1.1, color: 'white' }}>
            Bridge the Gap Between{' '}
            <br />
            <span className="gradient-text" style={{ display: 'inline-block', marginTop: '10px' }}>Surplus & Scarcity</span>
          </h1>

          <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '680px', margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 500 }}>
            FoodBridge connects food donors, NGOs, volunteers, and beneficiaries to eliminate food waste and build a compassionate community.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <Link href="/auth/register?role=donor" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', padding: '14px 36px', 
              borderRadius: '100px', background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(16px)', 
              border: '1px solid rgba(34, 197, 94, 0.6)', color: 'white', fontWeight: 600, textDecoration: 'none', 
              boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)', transition: 'all 0.3s' 
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.4)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'}>
              Start Donating <ArrowRight size={18} />
            </Link>
            <Link href="/about" style={{ 
              display: 'inline-flex', alignItems: 'center', fontSize: '16px', padding: '14px 36px', 
              borderRadius: '100px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600, textDecoration: 'none', 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)', transition: 'all 0.3s' 
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'}>
              Learn How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {stats.map((s) => (
              <div key={s.label} className="liquid-glass-dark" style={{ borderRadius: '20px', padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color, marginBottom: '8px' }}>
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--bg-card2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Simple Process</span>
            <h2 className="section-title" style={{ marginTop: '12px', color: 'var(--text-primary)' }}>How <span className="gradient-text">FoodBridge</span> Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>Four simple steps to transform surplus into smiles</p>
          </div>
          <div className="grid-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '48px', fontWeight: 900, color: 'rgba(0,0,0,0.03)', fontFamily: 'Outfit, sans-serif' }}>{item.step}</div>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <item.icon size={28} color={item.color} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Donation Categories</span>
            <h2 className="section-title" style={{ marginTop: '12px', color: 'var(--text-primary)' }}>What Can You <span className="gradient-text-orange">Donate?</span></h2>
          </div>
          <div className="grid-3">
            {categories.map((cat) => (
              <div key={cat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = cat.color + '60'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
                <div style={{ fontSize: '40px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cat.color}15`, borderRadius: '16px', flexShrink: 0 }}>{cat.icon}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{cat.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{cat.desc}</div>
                  <div style={{ fontSize: '12px', color: cat.color, fontWeight: 600 }}>{cat.count}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/auth/register?role=donor" className="btn-primary" style={{ fontSize: '16px', padding: '14px 36px' }}>
              Start Your First Donation <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: 'var(--bg-card2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Community Voices</span>
            <h2 className="section-title" style={{ marginTop: '12px', color: 'var(--text-primary)' }}>Stories of <span style={{ color: '#0284c7' }}>Impact</span></h2>
          </div>
          <div className="grid-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, flex: 1, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#16a34a,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: 'white' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '40px' }}>Trusted Partners & Collaborators</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            {partners.map((p) => (
              <div key={p} style={{ padding: '10px 24px', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--bg-card2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div className="liquid-glass grid-2" style={{ alignItems: 'center', borderRadius: '32px', overflow: 'hidden', padding: '0' }}>
            <div style={{ padding: '64px 48px' }}>
              <Globe size={48} color="#16a34a" style={{ marginBottom: '24px' }} />
              <h2 className="section-title" style={{ marginBottom: '16px', color: 'var(--text-primary)', textAlign: 'left' }}>Ready to Make a <span className="gradient-text">Difference?</span></h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '36px' }}>Join thousands of donors, NGOs, and volunteers creating real impact every day.</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/auth/register?role=donor" className="btn-primary" style={{ padding: '14px 28px' }}>Donate Now</Link>
                <Link href="/auth/register?role=ngo" className="btn-secondary" style={{ padding: '14px 28px' }}>Register NGO</Link>
              </div>
            </div>
            <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
               <Image src="/volunteer_delivery.png" alt="Volunteer Delivery" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}