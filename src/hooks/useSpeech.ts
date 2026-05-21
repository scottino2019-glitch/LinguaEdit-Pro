/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { LanguageCode } from '../types';

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        if (synthRef.current) {
          const v = synthRef.current.getVoices();
          if (v.length > 0) {
            setVoicesLoaded(true);
          }
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stop = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeaking(false);
    setActiveSpeechId(null);
  };

  const speak = (
    text: string, 
    language: LanguageCode, 
    speechId: string, 
    onEndCallback?: () => void
  ) => {
    stop();

    let langCode = 'ja-JP';
    if (language === 'Chinese') langCode = 'zh-CN';
    if (language === 'Korean') langCode = 'ko-KR';

    setActiveSpeechId(speechId);
    setSpeaking(true);

    const fallbackDuration = Math.max(2000, text.length * 150);

    // Trigger Speech Synthesis if supported and has voices
    if (synthRef.current) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        
        // Find matching voice
        const voices = synthRef.current.getVoices();
        const matchedVoice = voices.find(v => 
          v.lang.toLowerCase() === langCode.toLowerCase() || 
          v.lang.toLowerCase().startsWith(langCode.toLowerCase().split('-')[0])
        );
        
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        // Adjust speed slightly to be ideal for learners
        utterance.rate = 0.82; 

        utterance.onend = () => {
          setSpeaking(false);
          setActiveSpeechId(null);
          if (onEndCallback) onEndCallback();
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error, running fallback animation', e);
          // Run simulation fallback if blocked
          runSimulationFallback(fallbackDuration, onEndCallback);
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis exception, running fallback animation', err);
        runSimulationFallback(fallbackDuration, onEndCallback);
      }
    } else {
      // Simulate speaking in sandboxed frames
      runSimulationFallback(fallbackDuration, onEndCallback);
    }
  };

  const runSimulationFallback = (duration: number, onEndCallback?: () => void) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setSpeaking(false);
      setActiveSpeechId(null);
      if (onEndCallback) onEndCallback();
    }, duration);
  };

  return {
    speak,
    stop,
    speaking,
    activeSpeechId,
    voicesAvailable: voicesLoaded || (synthRef.current !== null && synthRef.current.getVoices().length > 0)
  };
}
export type UseSpeechReturn = ReturnType<typeof useSpeech>;
