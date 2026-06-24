import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Heart, Target, Globe, Users, Award, Linkedin, Twitter } from 'lucide-react';

const team = [
  { name: 'Arjun Mehta', role: 'Founder & CEO', desc: 'Former food tech entrepreneur passionate about zero hunger.', avatar: 'A', color: '#22c55e' },
  { name: 'Priya Sharma', role: 'Head of NGO Relations', desc: '10+ years working with social impact organizations across India.', avatar: 'P', color: '#0ea5e9' },
  { name: 'Kiran Rao', role: 'CTO', desc: 'Built scalable platforms for millions of users in food & logistics.', avatar: 'K', color: '#f97316' },
  { name: 'Meena Joseph', role: 'Volunteer Operations', desc: 'Coordinates 1000+ volunteers across 45 cities every month.', avatar: 'M', color: '#a855f7' },
];

const values = [
  { icon: Heart, title: 'Compassion First', desc: 'Every decision we make is guided by empathy and a desire to reduce suffering.', color: '#22c55e' },
  { icon: Globe, title: 'Transparency', desc: 'We build trust through complete visibility into how donations flow from donor to beneficiary.', color: '#0ea5e9' },
  { icon: Target, title: 'Zero Waste', desc: 'Our mission is a world where no food, clothes, or usable item goes to waste.', color: '#f97316' },
  { icon: Users, title: 'Community Power', desc: 'We believe communities are most resilient when they support each other.', color: '#a855f7' },
];



export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-card2)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '160px', paddingBottom: '120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <Image src="/hero_community.png" alt="Community Hero" fill style={{ objectFit: 'cover' }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)' }} />
        </div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
          <div className="liquid-glass-dark" style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>A Vadodara-Based Startup</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, color: 'white', margin: '0 0 20px', lineHeight: 1.1 }}>
            About <span className="gradient-text">FoodBridge</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', lineHeight: 1.8, fontWeight: 500 }}>
            We are a fast-growing, technology-driven startup born in Vadodara. We aren't a legacy organization—we are a modern tech platform built from the ground up to solve food scarcity and eliminate waste through dynamic routing and real-time community networking.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))', borderColor: 'rgba(34,197,94,0.2)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Heart size={26} color="#22c55e" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '12px' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>To create a world where every surplus meal, garment, and resource reaches those who need them — using technology to make giving as frictionless as possible. We empower donors, empower NGOs, and celebrate volunteers who make it happen.</p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.03))', borderColor: 'rgba(14,165,233,0.2)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Globe size={26} color="#0ea5e9" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '12px' }}>Our Vision</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>A zero-hunger, zero-waste India by 2030. We envision a country where every city has an active FoodBridge network, where any surplus item can find a beneficiary within hours, and where communities thrive through a culture of giving.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '40px', textAlign: 'center' }}>What We Stand For</h2>
        <div className="grid-4">
          {values.map(v => (
            <div key={v.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${v.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <v.icon size={28} color={v.color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '10px' }}>{v.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Team */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '48px', textAlign: 'center' }}>Meet the Team</h2>
        <div className="grid-4">
          {team.map(t => (
            <div key={t.name} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 auto 16px' }}>{t.avatar}</div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>{t.name}</h3>
              <div style={{ fontSize: '13px', color: t.color, fontWeight: 600, marginBottom: '12px' }}>{t.role}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
