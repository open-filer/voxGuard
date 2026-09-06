import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "Can I test a call on speakerphone?",
    answer: "Yes. Put your phone on speaker, click 'Record Live', and capture 3-5 seconds of speech. VoxGuard evaluates the speaker's vocal frequencies in real-time."
  },
  {
    question: "Is my voice recording stored?",
    answer: "Never. Audio is processed ephemerally in RAM and immediately erased. We do not keep or train on your recordings."
  },
  {
    question: "What should I do if a voice is flagged as fake?",
    answer: "Hang up immediately. Call back using an independently known, trusted phone number—never the number they called you from."
  },
  {
    question: "How does VoxGuard spot deepfakes?",
    answer: "AI clones lack natural human vocal cord micro-tremors and biological breathing pauses. Our neural model identifies these mathematical anomalies instantly."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      style={{
        padding: '60px 0 80px',
        position: 'relative',
      }}
    >
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', marginBottom: '8px' }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)' }}>
            Quick answers to common questions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-card"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isOpen ? '1px solid var(--primary-lavender)' : '1px solid var(--border-subtle)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    gap: '16px',
                    background: 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: isOpen ? 'var(--primary-soft-purple-dark)' : 'var(--text-main)',
                    }}
                  >
                    {faq.question}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      color: 'var(--primary-soft-purple)',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 18px',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      borderTop: '1px solid rgba(155, 142, 196, 0.1)',
                      paddingTop: '12px',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
