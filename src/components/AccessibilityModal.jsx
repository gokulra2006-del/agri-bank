import React, { useState } from 'react';
import {
  Volume2,
  Eye,
  Type,
  WifiOff,
  Sparkles,
  Check,
  X,
  VolumeX,
  Settings
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/accessibility';

export default function AccessibilityModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentLang = 'en'
}) {
  if (!isOpen) return null;

  const [textSize, setTextSize] = useState(settings?.textSize || 'normal');
  const [highContrast, setHighContrast] = useState(settings?.highContrast || false);
  const [reducedMotion, setReducedMotion] = useState(settings?.reducedMotion || false);
  const [lowBandwidth, setLowBandwidth] = useState(settings?.lowBandwidthMode || false);
  const [farmerHelpMode, setFarmerHelpMode] = useState(settings?.farmerHelpMode || false);
  const [speechStatus, setSpeechStatus] = useState('');

  const handleSave = () => {
    const updated = {
      ...settings,
      textSize,
      highContrast,
      reducedMotion,
      lowBandwidthMode: lowBandwidth,
      farmerHelpMode
    };
    onUpdateSettings(updated);
    onClose();
  };

  const handleTestSpeech = () => {
    const sample = currentLang === 'kn'
      ? 'ನಮಸ್ಕಾರ, ಅಗ್ರಿಸಹಾಯ್ ಬ್ಯಾಂಕಿಂಗ್ ವ್ಯವಸ್ಥೆಗೆ ಸುಸ್ವಾಗತ.'
      : currentLang === 'hi'
      ? 'नमस्ते, एग्रीसहाय बैंकिंग प्रणाली में आपका स्वागत है।'
      : 'Welcome to AgriSahay Inclusive Rural Banking Platform.';

    speakText(sample, currentLang, (st) => {
      if (st.message) setSpeechStatus(st.message);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', maxWidth: '500px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} style={{ color: '#15803d' }} />
            Accessibility & Farmer Experience Settings
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Text Size (3 levels) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Text Size Scaling
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'normal', label: 'Standard (100%)', sample: 'Aa' },
                { id: 'large', label: 'Large (115%)', sample: 'Aa+' },
                { id: 'extra-large', label: 'Extra Large (130%)', sample: 'Aa++' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTextSize(opt.id)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: '6px',
                    border: textSize === opt.id ? '2px solid #15803d' : '1px solid #cbd5e1',
                    backgroundColor: textSize === opt.id ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: textSize === opt.id ? '#15803d' : '#0f172a' }}>{opt.sample}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>High Contrast Palette</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enhances border lines, high-contrast badges, and black text</div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Low Bandwidth Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Low-Bandwidth / Rural Mode</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Replaces animations and heavy charts with compact data tables</div>
            </div>
            <input
              type="checkbox"
              checked={lowBandwidth}
              onChange={(e) => setLowBandwidth(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Farmer Help Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d' }}>Simplified Farmer Help Mode</div>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>Large interactive touch buttons and simplified plain terms</div>
            </div>
            <input
              type="checkbox"
              checked={farmerHelpMode}
              onChange={(e) => setFarmerHelpMode(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Web Speech API Read-Aloud Demo */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Browser Text-to-Speech (Web Speech API)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleTestSpeech}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} /> Test Read Aloud ({currentLang.toUpperCase()})
              </button>
              <button
                type="button"
                onClick={stopSpeech}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                <VolumeX size={16} /> Stop
              </button>
            </div>
            {speechStatus && (
              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.375rem' }}>{speechStatus}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
