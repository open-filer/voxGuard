import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AudioDetector from './components/AudioDetector';
import VoiceClone from './components/VoiceClone';
import WhyVoxGuard from './components/WhyVoxGuard';
import MasonryGrid from './components/MasonryGrid';
import FAQ from './components/FAQ';
import StickyCTA from './components/StickyCTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="voxguard-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Clean Minimal Top Ribbon */}
      <Navbar />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        <Hero />
        <AudioDetector />
        <VoiceClone />
        <WhyVoxGuard />
        <MasonryGrid />
        <FAQ />
      </main>

      {/* Sole Floating CTA in Bottom Right Corner */}
      <StickyCTA />

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
