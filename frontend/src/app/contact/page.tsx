'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, ChevronDown, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'How do I start donating food?', a: 'Register as a Donor, go to your dashboard, and click "New Donation". Fill in the category, item details, pickup location and submit. Nearby NGOs will be notified instantly.' },
  { q: 'How are NGOs verified on FoodBridge?', a: 'NGOs submit their registration number during signup. Our admin team manually verifies each NGO before they can accept donations. This ensures all NGOs are legitimate and trustworthy.' },
  { q: 'Can I donate items other than food?', a: 'Absolutely! FoodBridge supports donations of clothes, toys, books, and other reusable items in addition to food.' },
  { q: 'How do I become a volunteer?', a: 'Register on FoodBridge as a Volunteer. Once verified, NGOs in your city will assign you pickup tasks based on your availability.' },
  { q: 'Is my personal information safe?', a: 'Yes. We use industry-standard encryption and never share your data with third parties. Your contact information is only shared with the NGO handling your donation.' },
  { q: 'How quickly will my donation be picked up?', a: 'Most donations are picked up within 2-4 hours for critical urgency items. Standard donations are usually collected within 24-48 hours depending on volunteer availability.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card2)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '140px', paddingBottom: '60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Get In Touch</span>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, color: 'var(--text-primary)', margin: '16px 0 16px' }}>
            Contact & <span className="gradient-text">Support</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px' }}>Have questions? We're here to help. Reach out to our team or browse our FAQs.</p>
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Contact Info Cards */}
        <div className="grid-3" style={{ marginBottom: '48px' }}>
          {[
            { icon: Mail, label: 'Email Us', value: 'smitkh27@gmail.com', sub: 'We reply within 24 hours', color: '#22c55e' },
            { icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon-Sat 9am to 6pm IST', color: '#0ea5e9' },
            { icon: MapPin, label: 'Headquarters', value: 'Vadodara, Gujarat', sub: 'FoodBridge Welfare Platform', color: '#f97316' },
          ].map(c => (
            <div key={c.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <c.icon size={26} color={c.color} />
              </div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{c.label}</h3>
              <div style={{ color: c.color, fontWeight: 600, marginBottom: '4px' }}>{c.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Contact Form + FAQs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Contact Form */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} color="#22c55e" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>Send us a message</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="input-label">Your Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Mehta" className="input" required />
              </div>
              <div className="form-group">
                <label className="input-label">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="arjun@email.com" className="input" required />
              </div>
              <div className="form-group">
                <label className="input-label">Subject</label>
                <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input">
                  <option value="">Select subject...</option>
                  {['General Inquiry', 'Donor Support', 'NGO Registration', 'Volunteer Help', 'Technical Issue', 'Report a Bug', 'Partnership'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us how we can help..." className="input" rows={5} style={{ resize: 'vertical' }} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} color="#0ea5e9" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: `1px solid ${openFaq === i ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: openFaq === i ? '#22c55e' : 'var(--text-primary)', flex: 1, marginRight: '16px' }}>{faq.q}</span>
                    <ChevronDown size={18} color={openFaq === i ? '#22c55e' : 'var(--text-secondary)'} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 18px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
