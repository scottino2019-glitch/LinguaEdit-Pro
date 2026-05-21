/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Chapter, LanguageCode } from '../types';
import { Sparkles, Bot, AlertTriangle, Cpu, Loader2 } from 'lucide-react';

interface AICopilotProps {
  books: Book[];
  onAddGeneratedChapter: (bookId: string, chapter: Chapter) => void;
  onClose: () => void;
}

const LOADING_STEPS = [
  'Inizializzazione connessione neurale...',
  'Interrogando il saggio linguista Gemini...',
  'Strutturando le regole grammaticali in Italiano...',
  'Componendo battute di dialogo originali...',
  'Controllando la fonetica e la trascrizione Romaji/Pinyin...',
  'Impaginando gli esercizi di verifica e compleatamento...',
  'Lucidando la copertina e terminando l\'impaginazione...',
];

export function AICopilot({ books, onAddGeneratedChapter, onClose }: AICopilotProps) {
  const [targetBookId, setTargetBookId] = useState(books[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<Book['level']>('Principiante');
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Cycling through reassuring messages during AI creation
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookId || !topic.trim()) return;

    setLoading(true);
    setStatusError(null);

    const targetBook = books.find(b => b.id === targetBookId);
    if (!targetBook) {
      setStatusError('Libro di destinazione non trovato.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: targetBook.language,
          topic: topic.trim(),
          level,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Errore di rete generico.');
      }

      const parsedChapter = await response.json();
      
      // Map correctly to Chapter model
      const generatedChapter: Chapter = {
        id: `chapter-ai-${Date.now()}`,
        title: parsedChapter.title || 'Nuovo Capitolo Autogenerato',
        description: parsedChapter.description || `Studio di livello ${level} sul tema ${topic}`,
        blocks: (parsedChapter.blocks || []).map((block: any, idx: number) => ({
          ...block,
          id: `block-ai-${Date.now()}-${idx}`
        }))
      };

      onAddGeneratedChapter(targetBookId, generatedChapter);
      setLoading(false);
      onClose();
      alert(`🎉 Fantastico! Il capitolo "${generatedChapter.title}" è stato generato con successo e aggiunto alla fine di "${targetBook.title}".`);
    } catch (err: any) {
      console.error(err);
      setStatusError(
        err.message || 'La connessione con il server Gemini ha fallito. Riprova tra pochi istanti.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 overflow-hidden relative">
        
        {/* Shimmer boundary decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 via-rose-500 to-indigo-600 animate-pulse" />

        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-current animate-spin" style={{ animationDuration: '6s' }} />
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
              Generatore AI Copilot
            </h2>
          </div>
          <button 
            id="copilot-btn-close"
            disabled={loading}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-md cursor-pointer disabled:opacity-20"
          >
            ✕
          </button>
        </div>

        {loading ? (
          // Immersive, calming AI generator status board
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
            </div>

            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider">
                <Cpu className="w-3 h-3 animate-spin" /> Elaborazione Generativa
              </span>
              <p className="text-sm font-bold text-slate-700 transition-all duration-300">
                {LOADING_STEPS[loadingStepIdx]}
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Gemini sta producendo testi, tabelle fonetiche, dialoghi nativi coerenti di alta qualità ed esercizi didattici. Attendere...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex gap-3">
              <Bot className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-950 font-sans leading-relaxed">
                <b>Come funziona?</b> Scegli il libro in cui vuoi inserire la lezione, seleziona il livello e digita l'argomento desiderato in parole semplici (es: <i>"Chiedere indicazioni per il tempio a Kyoto"</i> o <i>"Ordinare Bubble Tea a Pechino"</i>). L'intelligenza artificiale produrrà l'intero capitolo all'istante!
              </p>
            </div>

            {/* Target Book Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Seleziona Libro Destinatario</label>
              {books.length === 0 ? (
                <div className="p-2 border border-rose-100 bg-rose-50 text-rose-700 text-xs rounded-lg">
                  Crea prima un libro standard dallo scaffale per potervi generare capitoli!
                </div>
              ) : (
                <select
                  id="copilot-select-book"
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm focus:outline-none"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} [{b.language === 'Japanese' ? 'GIAPPONESE' : b.language === 'Chinese' ? 'CINESE' : 'COREANO'}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Setting Level option */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Livello Didattico</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Principiante', 'Intermedio', 'Avanzato'] as Book['level'][]).map((lv) => (
                  <button
                    id={`btn-copilot-level-${lv}`}
                    key={lv}
                    type="button"
                    onClick={() => setLevel(lv)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      level === lv 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic query block */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Argomento o Scena Culturale</label>
              <input
                id="copilot-topic-input"
                type="text"
                required
                placeholder="es. Ordinare Takoyaki a Osaka, Fare shopping a Seoul..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Error messaging state */}
            {statusError && (
              <div className="p-3 border border-rose-200 bg-rose-50 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            {/* Modal actions */}
            <div className="pt-3 flex justify-end gap-2 text-xs md:text-sm">
              <button
                id="copilot-btn-cancel"
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                Annulla
              </button>
              <button
                id="copilot-btn-submit"
                type="submit"
                disabled={books.length === 0}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 text-white font-medium rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Genera Capitolo
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
