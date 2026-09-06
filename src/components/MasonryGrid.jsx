import React from 'react';
import { AlertCircle, ArrowUpRight, Building2, Landmark, PhoneCall } from 'lucide-react';

const CASES = [
  {
    id: 'uk-direct-debit',
    icon: PhoneCall,
    tag: 'UK • FEB 2026',
    title: 'Cloned voices used to authorise payments',
    summary: 'National Trading Standards reported AI-generated voice clones being used to simulate consent for unauthorised direct debits after scam calls collected personal data.',
    source: 'National Trading Standards',
    url: 'https://www.nationaltradingstandards.uk/news/phone-scams-take-sinister-twist-as-victims-voices-cloned/',
    color: '#7c6daa',
  },
  {
    id: 'italy-minister',
    icon: Landmark,
    tag: 'ITALY • FEB 2025',
    title: 'A minister’s voice impersonated in calls',
    summary: 'Business leaders were targeted by calls mimicking Italy’s defence minister and requesting money; reporting documented a victim transferring €1 million.',
    source: 'The Guardian',
    url: 'https://www.theguardian.com/world/2025/feb/10/ai-phone-scam-targets-italian-business-leaders-including-giorgio-armani',
    color: '#e66a73',
  },
  {
    id: 'india-family',
    icon: Building2,
    tag: 'INDIA • MAY 2025',
    title: 'A family emergency call made with AI',
    summary: 'A reported family-emergency scam used a cloned relative’s voice and a fake police story to pressure victims into sending money.',
    source: 'The Indian Express',
    url: 'https://indianexpress.com/article/technology/tech-news-technology/the-safe-side-ai-voice-cloning-scams-10023971/',
    color: '#c2921f',
  },
];

export default function MasonryGrid() {
  return (
    <section id="threat-intel" className="threat-section">
      <div className="container">
        <div className="section-heading threat-heading">
          <span className="eyebrow"><AlertCircle size={14} /> REAL-WORLD REPORTS</span>
          <h2>AI voice scams are already <span className="gradient-text">happening</span></h2>
          <p>Recent reporting and consumer-protection evidence—not hypothetical scenarios.</p>
        </div>

        <div className="case-grid">
          {CASES.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="case-card">
                <div className="case-card-top">
                  <span className="case-tag" style={{ color: item.color }}>{item.tag}</span>
                  <span className="case-icon" style={{ color: item.color }}><Icon size={19} /></span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="case-source">
                  <span>Read the report · {item.source}</span>
                  <ArrowUpRight size={17} />
                </a>
              </article>
            );
          })}
        </div>

        <p className="source-note">Sources open in a new tab. Reported cases illustrate a growing risk; they do not establish that every suspicious call is AI-generated.</p>
      </div>
    </section>
  );
}
