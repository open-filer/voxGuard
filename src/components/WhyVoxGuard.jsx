import React from 'react';
import { Upload, Cpu, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  { step: '01', title: 'Add a voice sample', subtitle: 'Upload a recording or capture a short live sample.', icon: Upload },
  { step: '02', title: 'Inspect the signal', subtitle: 'VoxGuard checks acoustic patterns associated with synthetic speech.', icon: Cpu },
  { step: '03', title: 'Review the result', subtitle: 'See the model verdict, confidence, and supporting signal details.', icon: CheckCircle2 },
];

export default function WhyVoxGuard() {
  return (
    <section id="why-voxguard" className="process-section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">THE VOXGUARD FLOW</span>
          <h2>From voice sample to <span className="gradient-text">signal check</span></h2>
          <p>Three focused steps. No audio expertise required.</p>
        </div>

        <div className="process-flow">
          <div className="process-orbit process-orbit-one" />
          <div className="process-orbit process-orbit-two" />
          <div className="process-path" />
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.step} className={`process-step process-step-${index + 1}`}>
                <div className="process-step-number">{step.step}</div>
                <div className="process-step-icon"><Icon size={21} /></div>
                <div className="process-step-copy">
                  <span>STEP {step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.subtitle}</p>
                </div>
                {index < STEPS.length - 1 && <ArrowRight className="process-arrow" size={20} />}
              </article>
            );
          })}
        </div>

        <div className="privacy-note">
          <ShieldCheck size={19} color="var(--status-real)" />
          <span><strong>Privacy first:</strong> recordings are processed for analysis and are not kept by VoxGuard.</span>
        </div>
      </div>
    </section>
  );
}
