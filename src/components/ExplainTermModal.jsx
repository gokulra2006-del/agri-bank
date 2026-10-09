import React, { useState } from 'react';
import {
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { RURAL_BANKING_TERMS, speakText, stopSpeech } from '../utils/accessibility';

export default function ExplainTermModal({
  termKey,
  isOpen,
  onClose,
  currentLang = 'en'
}) {
  if (!isOpen || !termKey) return null;

  const termData = RURAL_BANKING_TERMS[termKey] || {
    term: termKey.toUpperCase(),
    explanation: 'Agricultural banking term explanation.',
    simpleAnalogy: 'Simplified plain-language guidance for rural borrowers.'
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMsg, setSpeechMsg] = useState('');

  const handleSpeak = () => {
    const textToSpeak = `${termData.term}. ${termData.explanation}. ${termData.simpleAnalogy}`;
    setIsSpeaking(true);
    speakText(textToSpeak, currentLang, (st) => {
      if (st.isSpeaking !== undefined) setIsSpeaking(st.isSpeaking);
      if (st.message) setSpeechMsg(st.message);
    });
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
    setSpeechMsg('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', maxWidth: '460px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} style={{ color: '#15803d' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Explain This Banking Term
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', marginBottom: '0.5rem' }}>
            {termData.term}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>
            {termData.explanation}
          </p>

          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={14} /> Farm Analogy:
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#14532d', lineHeight: 1.5 }}>
              {termData.simpleAnalogy}
            </div>
          </div>
        </div>

        {/* Read Aloud controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSpeak}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Volume2 size={16} /> Listen Aloud
            </button>
            {isSpeaking && (
              <button
                onClick={handleStop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                <VolumeX size={16} /> Stop
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {speechMsg && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
            {speechMsg}
          </div>
        )}
      </div>
    </div>
  );
}
