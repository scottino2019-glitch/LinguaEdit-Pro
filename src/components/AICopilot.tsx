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
  defaultBookId?: string;
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

const getLanguageInItalian = (lang: string) => {
  switch (lang) {
    case 'Japanese': return 'Giapponese';
    case 'Chinese': return 'Cinese Mandarino';
    case 'Korean': return 'Coreano';
    case 'Russian': return 'Russo';
    case 'Turkish': return 'Turco';
    case 'Arabic': return 'Arabo';
    case 'Thai': return 'Thai';
    case 'Hindi': return 'Hindi';
    default: return lang;
  }
};

export function AICopilot({ books, onAddGeneratedChapter, onClose, defaultBookId }: AICopilotProps) {
  const [targetBookId, setTargetBookId] = useState(defaultBookId || books[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<Book['level']>('Principiante');
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [statusError, setStatusError] = useState<string | null>(null);

  // States for local API key management (supports direct browser calls to bypass Netlify 504 serverless timeouts)
  const [userApiKey, setUserApiKey] = useState('');
  const [useLocalKey, setUseLocalKey] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Load key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
      setUseLocalKey(true);
    }
  }, []);

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

  const handleSavePersonalKey = (key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem('user_gemini_api_key', trimmed);
      setUserApiKey(trimmed);
      setUseLocalKey(true);
    } else {
      localStorage.removeItem('user_gemini_api_key');
      setUserApiKey('');
      setUseLocalKey(false);
    }
  };

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
      let generatedBlocks: any[] = [];
      let chapterTitle = 'Nuovo Capitolo Autogenerato';
      let chapterDesc = `Studio di livello ${level} sul tema ${topic}`;

      if (useLocalKey && userApiKey.trim()) {
        const apiKey = userApiKey.trim();
        // Flat Response Schema for direct Gemini API calls to bypass timeouts & prevent model confusion
        const responseSchema = {
          type: "object",
          properties: {
            title: { type: "string", description: "Titolo in italiano evocativo del capitolo" },
            description: { type: "string", description: "Presentazione obiettivi didattici in italiano" },
            
            // Grammar Block fields
            grammarTitle: { type: "string", description: "Titolo della nota grammaticale" },
            grammarText: { type: "string", description: "Spiegazione approfondita in italiano. Supporta formattazione Markdown." },
            grammarTerms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  phonetic: { type: "string" },
                  translation: { type: "string" }
                },
                required: ["term", "phonetic", "translation"]
              }
            },

            // Dialogue Block fields
            dialogueTitle: { type: "string" },
            dialogueCharacters: { type: "array", items: { type: "string" } },
            dialogueLines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character: { type: "string" },
                  text: { type: "string" },
                  phonetic: { type: "string" },
                  translation: { type: "string" }
                },
                required: ["character", "text", "phonetic", "translation"]
              }
            },

            // Vocabulary Block fields
            vocabularyList: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  phonetic: { type: "string" },
                  translation: { type: "string" },
                  example: { type: "string" },
                  examplePhonetic: { type: "string" },
                  exampleTranslation: { type: "string" }
                },
                required: ["term", "phonetic", "translation", "example", "examplePhonetic", "exampleTranslation"]
              }
            },

            // Exercise Block fields
            exerciseType: { type: "string", description: "multiple-choice, fill-blank, reorder" },
            exerciseQuestion: { type: "string" },
            exerciseNote: { type: "string" },
            mcOptions: { type: "array", items: { type: "string" } },
            mcCorrectIndex: { type: "integer" },
            fbSentenceBefore: { type: "string" },
            fbSentenceAfter: { type: "string" },
            fbCorrectAnswer: { type: "string" },
            reorderWords: { type: "array", items: { type: "string" } },
            reorderCorrectOrder: { type: "string" }
          },
          required: [
            "title", "description", 
            "grammarTitle", "grammarText", "grammarTerms",
            "dialogueTitle", "dialogueCharacters", "dialogueLines",
            "vocabularyList",
            "exerciseType", "exerciseQuestion", "exerciseNote"
          ]
        };

        const langInItalian = getLanguageInItalian(targetBook.language);
        const systemPrompt = `Sei un professore d'eccellenza e madrelingua specializzato nell'insegnamento di ${langInItalian} (${level}) a studenti italiani.
Crea una lezione estremamente ricca, completa e curata nei dettagli, impostando e completando accuratamente tutti i parametri richiesti nello schema di risposta.

1. Sezioni della lezione da compilare obbligatoriamente:
   - Grammatica: Spiega in italiano una regola con precisione in "grammarText" e compila da 2 a 3 termini in "grammarTerms".
   - Dialogo: Configura "dialogueTitle" ed elabora uno scambio interattivo con almeno 3-4 battute alternate in "dialogueLines".
   - Vocabolario: Configura almeno 4-5 parole chiave in "vocabularyList", completando per ognuna parola, fonetica, traduzione, frase d'esempio, frase d'esempio fonetica e traduzione frase d'esempio.
   - Esercizio: Progetta un ottimo esercizio d'apprendimento ('multiple-choice', 'fill-blank' o 'reorder') compilando le relative proprietà del tipo stabilito.

Tutte le spiegazioni teoriche, le traduzioni, i commenti e le consegne degli esercizi devono essere scritti esclusivamente in lingua italiana.`;

        // We call gemini-3.5-flash-direct for blazing speed and structure compliance
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        const directResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Genera una micro-lezione per ${langInItalian} (${level}) su tema: ${topic}` }
                ]
              }
            ],
            systemInstruction: {
              parts: [
                { text: systemPrompt }
              ]
            },
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.3
            }
          })
        });

        if (!directResponse.ok) {
          const errText = await directResponse.text();
          let errMessage = 'Errore nelle API di Google.';
          try {
            const errJson = JSON.parse(errText);
            errMessage = errJson.error?.message || errText;
          } catch(e) {}
          throw new Error(`Google API Direct Error: ${errMessage}`);
        }

        const resData = await directResponse.json();
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error('Nessun testo generato dalle API di Google Gemini.');
        }

        const parsed = JSON.parse(responseText);
        chapterTitle = parsed.title || 'Nuovo Capitolo Autogenerato';
        chapterDesc = parsed.description || `Studio di livello ${level} sul tema ${topic}`;

        // Map flat fields to standard blocks layout
        generatedBlocks.push({
          type: 'grammar',
          grammarTitle: parsed.grammarTitle || 'Grammatica e Sintassi',
          grammarText: parsed.grammarText || 'Regola grammaticale d\'esempio.',
          grammarTerms: parsed.grammarTerms || []
        });

        generatedBlocks.push({
          type: 'dialogue',
          dialogueTitle: parsed.dialogueTitle || 'Dialogo Conversazionale d\'Esempio',
          dialogueCharacters: parsed.dialogueCharacters || ['Studente', 'Insegnante'],
          dialogueLines: parsed.dialogueLines || []
        });

        generatedBlocks.push({
          type: 'vocabulary',
          vocabularyList: parsed.vocabularyList || []
        });

        generatedBlocks.push({
          type: 'exercise',
          exerciseType: parsed.exerciseType || 'multiple-choice',
          exerciseQuestion: parsed.exerciseQuestion || 'Completa l\'esercizio per verificare cosa hai appreso:',
          exerciseNote: parsed.exerciseNote || 'Rifletti sulla regola indicata e prova a rispondere.',
          mcOptions: parsed.mcOptions || [],
          mcCorrectIndex: typeof parsed.mcCorrectIndex === 'number' ? parsed.mcCorrectIndex : 0,
          fbSentenceBefore: parsed.fbSentenceBefore || '',
          fbSentenceAfter: parsed.fbSentenceAfter || '',
          fbCorrectAnswer: parsed.fbCorrectAnswer || '',
          reorderWords: parsed.reorderWords || [],
          reorderCorrectOrder: parsed.reorderCorrectOrder || ''
        });

      } else {
        // Fall back to serverless api (our Express route)
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
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            throw new Error(
              'Timeout di Netlify (Errore 504). La generazione ha superato i 10 secondi limite del server Netlify. Consigliamo di abilitare l\'opzione "Chiave API Gemini Personale" qui sotto per generare istantaneamente!'
            );
          }
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Errore di rete generico.');
        }

        const parsed = await response.json();
        chapterTitle = parsed.title;
        chapterDesc = parsed.description;
        generatedBlocks = parsed.blocks || [];
      }
      
      // Selected language fallback images
      let defaultImageUrl = 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800'; // Japan
      if (targetBook.language === 'Chinese') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800'; // China
      } else if (targetBook.language === 'Korean') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800'; // Korea
      } else if (targetBook.language === 'Russian') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1512495039889-52a3b799c9bc?auto=format&fit=crop&q=80&w=800'; // Russia
      } else if (targetBook.language === 'Turkish') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800'; // Turkey
      } else if (targetBook.language === 'Arabic') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800'; // Arab Countries
      } else if (targetBook.language === 'Thai') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800'; // Thailand
      } else if (targetBook.language === 'Hindi') {
        defaultImageUrl = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800'; // India
      }

      // Map correctly to Chapter model
      const generatedChapter: Chapter = {
        id: `chapter-ai-${Date.now()}`,
        title: chapterTitle || 'Nuovo Capitolo Autogenerato',
        description: chapterDesc || `Studio di livello ${level} sul tema ${topic}`,
        blocks: [
          // 1. Initial Image Block
          {
            id: `block-ai-${Date.now()}-img`,
            type: 'image',
            imageUrl: defaultImageUrl,
            imageCaption: `Benvenuti in questa nuova entusiasmante esplorazione sul tema: ${topic}`
          },
          // 2. Map other polymorph blocks dynamically
          ...generatedBlocks.map((block: any, idx: number) => {
            const rawType = (block.type || '').split('-')[0].toLowerCase();
            let typeNormalized = rawType;
            if (rawType.startsWith('gram')) typeNormalized = 'grammar';
            else if (rawType.startsWith('dial')) typeNormalized = 'dialogue';
            else if (rawType.startsWith('vocab')) typeNormalized = 'vocabulary';
            else if (rawType.startsWith('exer') || rawType.startsWith('eser') || rawType === 'exercise' || rawType === 'esercizio') typeNormalized = 'exercise';
            else if (rawType.startsWith('imag') || rawType.startsWith('imma') || rawType === 'image' || rawType === 'immagine') typeNormalized = 'image';
            else if (rawType.startsWith('vid')) typeNormalized = 'video';

            const updatedBlock = {
              ...block,
              type: typeNormalized,
              id: `block-ai-${Date.now()}-${idx}`
            };
            if (typeNormalized === 'image' && !updatedBlock.imageUrl) {
              updatedBlock.imageUrl = defaultImageUrl;
            }
            return updatedBlock;
          })
        ]
      };

      onAddGeneratedChapter(targetBookId, generatedChapter);
      setLoading(false);
      onClose();
      alert(`🎉 Fantastico! Il capitolo "${generatedChapter.title}" è stato generato con successo e aggiunto alla fine di "${targetBook.title}".`);
    } catch (err: any) {
      console.error(err);
      setStatusError(
        err.message || 'La connessione con il server Gemini ha fallito. Riprova o imposta una chiave personale per bypassare i limiti.'
      );
      setShowKeyConfig(true);
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
                  {books.map(b => {
                    const langUpper = b.language === 'Japanese' ? 'GIAPPONESE' :
                                      b.language === 'Chinese' ? 'CINESE' :
                                      b.language === 'Korean' ? 'COREANO' :
                                      b.language === 'Russian' ? 'RUSSO' :
                                      b.language === 'Turkish' ? 'TURCO' :
                                      b.language === 'Arabic' ? 'ARABO' :
                                      b.language === 'Thai' ? 'THAI' : 'HINDI';
                    return (
                      <option key={b.id} value={b.id}>
                        {b.title} [{langUpper}]
                      </option>
                    );
                  })}
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
                <span className="leading-normal">{statusError}</span>
              </div>
            )}

            {/* Expandable Advanced API Connection Settings for Netlify stability */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs bg-slate-50 hover:bg-slate-100/80 font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${useLocalKey && userApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span>
                    Connettività AI: {useLocalKey && userApiKey ? 'Connessione Diretta (Bypassa limiti Netlify)' : 'Server Standard (Proxy Netlify)'}
                  </span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {showKeyConfig ? 'Nascondi Opzioni' : 'Configura Chiave Personale'}
                </span>
              </button>

              {showKeyConfig && (
                <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    <b>Nota importante per Netlify:</b> I server di Netlify (free) interrompono i caricamenti se durano più di 10 secondi, causando l'errore 504. Inserendo qui sotto una tua chiave API Gemini gratuita, l'applicazione interrogherà l'AI direttamente dal tuo browser, garantendo una velocità istantanea e scavalcando i limiti di Netlify! La chiave viene memorizzata in modo sicuro e privato solo sul tuo dispositivo.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Chiave API Gemini Personale (AI Studio)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="local-api-key-input"
                        type="password"
                        placeholder="Incolla qui la tua API Key (es. AIzaSy...)"
                        value={userApiKey}
                        onChange={(e) => setUserApiKey(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {userApiKey.trim() ? (
                        <button
                          type="button"
                          onClick={() => handleSavePersonalKey(userApiKey)}
                          className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                        >
                          Salva
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {localStorage.getItem('user_gemini_api_key') && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          id="use-local-key-checkbox"
                          type="checkbox"
                          checked={useLocalKey}
                          onChange={(e) => setUseLocalKey(e.target.checked)}
                          className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Usa chiave personale salvata</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          handleSavePersonalKey('');
                          alert('Chiave API rimossa con successo.');
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Elimina chiave salvata
                      </button>
                    </div>
                  )}
                  
                  <div className="text-[10px] text-indigo-500 font-semibold">
                    💡 Puoi ottenere una chiave Gemini gratuita cliccando su "Get API Key" nel tuo account Google AI Studio.
                  </div>
                </div>
              )}
            </div>

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
