/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Book, Chapter, ContentBlock, LanguageCode } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { AnimatedWave } from './AnimatedWave';
import { 
  BookOpen, 
  ArrowLeft, 
  Play, 
  Volume2, 
  VolumeX,
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Film, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  FileText,
  MessageSquare,
  Compass,
  Download
} from 'lucide-react';
import { exportBookToHTML } from '../utils/exporter';

interface BookReaderProps {
  book: Book;
  activeChapterId?: string;
  onGoBack: () => void;
  onSelectChapter: (chapterId: string) => void;
  onOpenEditor: () => void;
}

export function BookReader({
  book,
  activeChapterId,
  onGoBack,
  onSelectChapter,
  onOpenEditor
}: BookReaderProps) {
  const { speak, stop, speaking, activeSpeechId } = useSpeech();
  
  // Track selected chapter
  const currentChapter = book.chapters.find(c => c.id === activeChapterId) || book.chapters[0];

  // Exercises states: keyed by block.id
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Record<string, number>>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<string, string>>({});
  const [fillBlankChecked, setFillBlankChecked] = useState<Record<string, boolean>>({});
  const [reorderSelectedWords, setReorderSelectedWords] = useState<Record<string, string[]>>({});
  const [reorderChecked, setReorderChecked] = useState<Record<string, boolean>>({});

  // Dialogue sequential auto-play state
  const [autoPlayTargetBlockId, setAutoPlayTargetBlockId] = useState<string | null>(null);
  const [autoPlayLineIdx, setAutoPlayLineIdx] = useState<number | null>(null);

  // Initialize and clean up speech when switching chapters
  useEffect(() => {
    stop();
    setAutoPlayTargetBlockId(null);
    setAutoPlayLineIdx(null);
  }, [currentChapter?.id]);

  // Handle auto-playing dialogues line by line
  useEffect(() => {
    if (autoPlayTargetBlockId && autoPlayLineIdx !== null) {
      const block = currentChapter?.blocks.find(b => b.id === autoPlayTargetBlockId);
      if (block && block.dialogueLines && autoPlayLineIdx < block.dialogueLines.length) {
        const line = block.dialogueLines[autoPlayLineIdx];
        const speechKey = `${block.id}-line-${autoPlayLineIdx}`;
        
        speak(line.text, book.language, speechKey, () => {
          // Play the next line after a little delay
          setTimeout(() => {
            setAutoPlayLineIdx(prev => (prev !== null ? prev + 1 : null));
          }, 600);
        });
      } else {
        // Dialogue ended or not found
        setAutoPlayTargetBlockId(null);
        setAutoPlayLineIdx(null);
      }
    }
  }, [autoPlayTargetBlockId, autoPlayLineIdx]);

  if (!currentChapter) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Questo libro è ancora vuoto!</h3>
        <p className="text-slate-500 text-xs">Premi il pulsante "Modifica" per aggiungere dei capitoli.</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={onGoBack} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Torna allo Scaffale
          </button>
          <button onClick={onOpenEditor} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Crea il Primo Capitolo
          </button>
        </div>
      </div>
    );
  }

  // Auto play helper
  const handleAutoPlayDialogue = (blockId: string) => {
    if (autoPlayTargetBlockId === blockId) {
      // Toggle off
      stop();
      setAutoPlayTargetBlockId(null);
      setAutoPlayLineIdx(null);
    } else {
      stop();
      setAutoPlayTargetBlockId(blockId);
      setAutoPlayLineIdx(0);
    }
  };

  // Reorder word click helper
  const handleToggleReorderWord = (blockId: string, word: string, totalCount: number) => {
    const current = reorderSelectedWords[blockId] || [];
    if (reorderChecked[blockId]) return; // locked once checked

    if (current.includes(word)) {
      setReorderSelectedWords({
        ...reorderSelectedWords,
        [blockId]: current.filter(w => w !== word)
      });
    } else {
      setReorderSelectedWords({
        ...reorderSelectedWords,
        [blockId]: [...current, word]
      });
    }
  };

  // Reset exercise helper
  const handleResetExercise = (blockId: string, type: 'mc' | 'fb' | 'reorder') => {
    if (type === 'mc') {
      const updated = { ...multipleChoiceAnswers };
      delete updated[blockId];
      setMultipleChoiceAnswers(updated);
    } else if (type === 'fb') {
      const updatedVals = { ...fillBlankAnswers };
      const updatedChecked = { ...fillBlankChecked };
      delete updatedVals[blockId];
      delete updatedChecked[blockId];
      setFillBlankAnswers(updatedVals);
      setFillBlankChecked(updatedChecked);
    } else if (type === 'reorder') {
      const updatedVals = { ...reorderSelectedWords };
      const updatedChecked = { ...reorderChecked };
      delete updatedVals[blockId];
      delete updatedChecked[blockId];
      setReorderSelectedWords(updatedVals);
      setReorderChecked(updatedChecked);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Sidebar Navigation - Book chapters Index */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-4">
        {/* Navigation Head */}
        <button
          id="btn-back-shelf"
          onClick={onGoBack}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Torna allo Scaffale
        </button>

        {/* Book Overview Block */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded space-y-2">
          <span className={`px-2 py-0.5 text-[8px] font-bold tracking-wider rounded text-white uppercase ${
            book.language === 'Japanese' ? 'bg-blue-600' :
            book.language === 'Chinese' ? 'bg-amber-600' :
            book.language === 'Korean' ? 'bg-indigo-605' :
            book.language === 'Russian' ? 'bg-red-650' :
            book.language === 'Turkish' ? 'bg-pink-650' :
            book.language === 'Arabic' ? 'bg-emerald-650' :
            book.language === 'Thai' ? 'bg-fuchsia-650' :
            'bg-orange-650'
          }`}>
            {book.language === 'Japanese' ? 'Giapponese' : 
             book.language === 'Chinese' ? 'Cinese' : 
             book.language === 'Korean' ? 'Coreano' :
             book.language === 'Russian' ? 'Russo' :
             book.language === 'Turkish' ? 'Turco' :
             book.language === 'Arabic' ? 'Arabo' :
             book.language === 'Thai' ? 'Thai' : 'Hindi'}
          </span>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">{book.title}</h2>
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{book.description}</p>
        </div>

        {/* Chapters Index Loop */}
        <div className="space-y-1">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">INDICE CAPITOLI</span>
          {book.chapters.map((ch, idx) => (
            <button
              id={`nav-chapter-${ch.id}`}
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`w-full flex items-center justify-between text-left px-3 py-2 rounded text-xs font-medium transition-all cursor-pointer ${
                ch.id === currentChapter.id 
                  ? 'bg-blue-50 text-blue-700 rounded-md border border-blue-105 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
              }`}
            >
              <span className="truncate pr-2">
                {idx + 1}. {ch.title.replace(/^Capitolo\s+\d+:\s*/i, '')}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 ${ch.id === currentChapter.id ? 'text-blue-600' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>

        {/* Quick Customize button */}
        <div className="space-y-2">
          <button
            id="btn-jump-editor"
            onClick={onOpenEditor}
            className="w-full text-center py-2 bg-slate-900 hover:bg-slate-805 text-white rounded text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>✏️ Modifica Capitoli</span>
          </button>
          
          <button
            id="btn-export-reader"
            onClick={() => exportBookToHTML(book)}
            className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Scarica questo intero libro in un file HTML statico e autonomo"
          >
            <Download className="w-3.5 h-3.5 text-blue-650" /> Esporta in HTML
          </button>
        </div>
      </div>

      {/* Main Core Textbook Pane */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Textbook page cover block */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-mono font-bold uppercase text-blue-600 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Capitolo Corrente
            </span>
            {speaking && (
              <AnimatedWave isActive={speaking} color="bg-blue-600" />
            )}
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-slate-900">
              {currentChapter.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentChapter.description}
            </p>
          </div>
        </div>

        {/* Content Blocks Loop */}
        <div className="space-y-6">
          {currentChapter.blocks.map((block) => {
            
            // -------------------------------------------------------------
            // IMAGE BLOCK
            // -------------------------------------------------------------
            if (block.type === 'image' && block.imageUrl) {
              return (
                <div 
                  id={`block-card-${block.id}`}
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs space-y-2 group"
                >
                  <div className="relative h-60 md:h-80 w-full overflow-hidden bg-slate-100">
                    <img
                      src={block.imageUrl}
                      alt={block.imageCaption || 'Cultural illustration'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <p className="text-sm font-medium italic text-slate-100">
                        {block.imageCaption || 'Un frammento evocativo dell\'Estremo Oriente.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // -------------------------------------------------------------
            // GRAMMAR BLOCK (testo di grammatica)
            // -------------------------------------------------------------
            if (block.type === 'grammar') {
              return (
                <div 
                  id={`block-card-${block.id}`}
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-blue-600">
                    <div className="p-2 bg-blue-50 rounded">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">SPIEGAZIONE GRAMMATICALE</span>
                      <h3 className="text-base font-bold text-slate-900">{block.grammarTitle || 'Grammatica Corrente'}</h3>
                    </div>
                  </div>

                  {/* Grammar text markdown */}
                  <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded border border-slate-150 font-sans whitespace-pre-wrap">
                    {block.grammarText}
                  </div>

                  {/* Pronunciation Terms Table inside grammar */}
                  {block.grammarTerms && block.grammarTerms.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 block pl-0.5 uppercase tracking-wider">TERMINI DI RIFERIMENTO (Premi per l'audio)</span>
                      
                      <div className="border border-slate-200 rounded overflow-hidden text-xs">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 bg-slate-100 px-4 py-2 font-semibold text-slate-600 border-b border-slate-200">
                          <div className="col-span-5">Carattere Originale</div>
                          <div className="col-span-3">Trascrizione / Fonetica</div>
                          <div className="col-span-4">Traduzione</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-100 bg-white">
                          {block.grammarTerms.map((term, tIdx) => {
                            const speechKey = `${block.id}-term-${tIdx}`;
                            const isSpoken = activeSpeechId === speechKey;

                            return (
                              <div
                                key={tIdx}
                                onClick={() => speak(term.term, book.language, speechKey)}
                                className={`grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50 cursor-pointer transition-colors ${
                                  isSpoken ? 'bg-blue-50/45 font-medium text-blue-950 border-l-2 border-blue-600' : 'text-slate-700'
                                }`}
                              >
                                <div className="col-span-5 font-sans font-bold text-sm tracking-wide flex items-center gap-2">
                                  <Volume2 className={`w-4 h-4 shrink-0 transition-all ${isSpoken ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`} />
                                  <span>{term.term}</span>
                                </div>
                                <div className="col-span-3 font-mono text-slate-400 font-medium">{term.phonetic}</div>
                                <div className="col-span-4 text-slate-500">{term.translation}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // -------------------------------------------------------------
            // DIALOGUE BLOCK (dialoghi con audio)
            // -------------------------------------------------------------
            if (block.type === 'dialogue') {
              const isBlockAutoPlaying = autoPlayTargetBlockId === block.id;

              return (
                <div 
                  id={`block-card-${block.id}`}
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5 text-blue-600">
                      <div className="p-2 bg-blue-50 rounded">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">DIALOGO INTERATTIVO (Ascolta e Ripeti)</span>
                        <h3 className="text-base font-bold text-slate-900">{block.dialogueTitle || 'Dialogo'}</h3>
                      </div>
                    </div>

                    {/* Auto play controls */}
                    <button
                      id={`btn-play-dialogue-${block.id}`}
                      onClick={() => handleAutoPlayDialogue(block.id)}
                      className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs border cursor-pointer ${
                        isBlockAutoPlaying 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-105'
                      }`}
                    >
                      {isBlockAutoPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" /> Interrompi Riproduzione
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Leggi Intero Dialogo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Conversation Chat Layout */}
                  <div className="space-y-4 max-w-2xl mx-auto py-2">
                    {block.dialogueLines?.map((line, lIdx) => {
                      const speechKey = `${block.id}-line-${lIdx}`;
                      const isSpoken = activeSpeechId === speechKey;
                      
                      // Alternate bubble sides or styles based on speaker name
                      const speakerIdx = block.dialogueCharacters?.indexOf(line.character) ?? 0;
                      const isRightSide = speakerIdx % 2 !== 0;

                      return (
                        <div
                          key={lIdx}
                          onClick={() => {
                            // If auto play is running, stop it and play single
                            setAutoPlayTargetBlockId(null);
                            setAutoPlayLineIdx(null);
                            speak(line.text, book.language, speechKey);
                          }}
                          className={`flex gap-3 max-w-[85%] items-start cursor-pointer transition-all ${
                            isRightSide ? 'ml-auto flex-row-reverse' : 'mr-auto'
                          }`}
                        >
                          {/* Miniature avatar initials */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs border ${
                            isRightSide 
                              ? 'bg-slate-100 text-slate-800 border-slate-200' 
                              : 'bg-blue-50 text-blue-800 border-blue-150'
                          }`}>
                            {line.character.trim().charAt(0)}
                          </div>

                          {/* Chat bubble body */}
                          <div className={`rounded-md p-3.5 space-y-1 group relative transition-all border ${
                            isSpoken 
                              ? 'shadow-xs border-blue-400 bg-blue-50/50 scale-[1.01]' 
                              : isRightSide 
                                ? 'bg-slate-50/30 border-slate-200/60 rounded-tr-none' 
                                : 'bg-slate-50/50 border-slate-200/60 rounded-tl-none'
                          }`}>
                            {/* Dialogue details */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                {line.character}
                              </span>
                              <Volume2 className={`w-3.5 h-3.5 transition-all ${isSpoken ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
                            </div>

                            <p className={`font-sans text-sm tracking-wide ${
                              isSpoken ? 'text-blue-950 font-semibold' : 'text-slate-800'
                            }`}>
                              {line.text}
                            </p>

                            <p className="font-mono text-[10px] text-slate-400 pt-0.5 font-medium leading-none">
                              {line.phonetic}
                            </p>

                            <p className="text-xs text-slate-500 border-t border-slate-100/60 pt-1 mt-1 font-sans italic">
                              {line.translation}
                            </p>

                            {/* Glowing active speak wave overlay */}
                            {isSpoken && (
                              <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.5s' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // -------------------------------------------------------------
            // VOCABULARY BLOCK (pronuncia audio singoli termini)
            // -------------------------------------------------------------
            if (block.type === 'vocabulary') {
              return (
                <div 
                  id={`block-card-${block.id}`}
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-amber-600 border-b border-slate-100 pb-3">
                    <div className="p-2 bg-amber-50 rounded">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">CARTE DI PRONUNCIA & VOCABOLI</span>
                      <h3 className="text-base font-bold text-slate-900">Parole Nuove del Giorno</h3>
                    </div>
                  </div>

                  {/* Vocabulary Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {block.vocabularyList?.map((vocab, vIdx) => {
                      const speechKey = `${block.id}-vocab-${vIdx}`;
                      const isSpoken = activeSpeechId === speechKey;

                      const speechExKey = `${block.id}-vocab-ex-${vIdx}`;
                      const isExSpoken = activeSpeechId === speechExKey;

                      return (
                        <div
                          key={vIdx}
                          className={`border rounded-md p-4 flex flex-col justify-between space-y-3.5 hover:shadow-xs transition-all ${
                            isSpoken || isExSpoken ? 'bg-blue-50/20 border-blue-200' : 'bg-slate-50/30 border-slate-200'
                          }`}
                        >
                          {/* Top row with Term and sound button */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-lg font-bold text-slate-800 tracking-wide font-sans">{vocab.term}</span>
                              <div className="font-mono text-xs text-slate-400 font-medium">{vocab.phonetic}</div>
                            </div>

                            <button
                              id={`btn-pronounce-${block.id}-${vIdx}`}
                              onClick={() => speak(vocab.term, book.language, speechKey)}
                              className={`p-2 rounded-full cursor-pointer transition-colors ${
                                isSpoken ? 'bg-blue-100 text-blue-700' : 'bg-white hover:bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                              title="Ascolta pronuncia"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Translation block */}
                          <div className="bg-white rounded px-3 py-1.5 border border-slate-200 text-xs">
                            <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">Traduzione</span>
                            <span className="text-slate-700 font-medium font-sans">{vocab.translation}</span>
                          </div>

                          {/* Example sentence if included */}
                          {vocab.example && (
                            <div className="border-t border-slate-200 pt-2 space-y-1">
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Frase di Esempio</span>
                              
                              <div className="flex justify-between items-center bg-white/70 rounded p-2 border border-slate-200">
                                <div className="text-[11px] space-y-0.5 flex-1 pr-1.5">
                                  <div className="font-bold text-slate-800">{vocab.example}</div>
                                  <div className="font-mono text-[10px] text-slate-400 font-medium leading-none">{vocab.examplePhonetic}</div>
                                  <div className="text-slate-500 italic mt-0.5">{vocab.exampleTranslation}</div>
                                </div>

                                <button
                                  id={`btn-pronounce-ex-${block.id}-${vIdx}`}
                                  onClick={() => speak(vocab.example!, book.language, speechExKey)}
                                  className={`p-1.5 rounded-full cursor-pointer shrink-0 transition-colors ${
                                    isExSpoken ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-400'
                                  }`}
                                  title="Ascolta Frase di Esempio"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // -------------------------------------------------------------
            // EXERCISE BLOCK (esercizi di verifica)
            // -------------------------------------------------------------
            if (block.type === 'exercise') {
              
              // 1. MULTIPLE CHOICE
              if (block.exerciseType === 'multiple-choice') {
                const selectedAnsIdx = multipleChoiceAnswers[block.id];
                const isCorrect = selectedAnsIdx === block.mcCorrectIndex;
                const hasAnswered = selectedAnsIdx !== undefined;

                return (
                  <div 
                    id={`block-card-${block.id}`}
                    key={block.id} 
                    className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
                      <div className="flex items-center gap-2.5 text-blue-600">
                        <div className="p-2 bg-blue-50 rounded">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - SCELTA MULTIPLA</span>
                          <h4 className="text-sm font-bold text-slate-900">{block.exerciseQuestion}</h4>
                        </div>
                      </div>

                      {hasAnswered && (
                        <button
                          id={`btn-reset-mc-${block.id}`}
                          onClick={() => handleResetExercise(block.id, 'mc')}
                          className="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Riponi
                        </button>
                      )}
                    </div>

                    {block.exerciseNote && (
                      <p className="text-xs text-slate-505 bg-slate-50 p-2.5 rounded border border-slate-150">
                        💡 {block.exerciseNote}
                      </p>
                    )}

                    {/* Answer Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {block.mcOptions?.map((opt, oIdx) => {
                        const isThisSelected = selectedAnsIdx === oIdx;
                        const isThisCorrectOption = oIdx === block.mcCorrectIndex;

                        let buttonStyles = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350';
                        if (hasAnswered) {
                          if (isThisSelected) {
                            buttonStyles = isCorrect 
                              ? 'bg-emerald-600 border-emerald-600 text-white font-bold' 
                              : 'bg-rose-600 border-rose-600 text-white font-bold';
                          } else if (isThisCorrectOption) {
                            // Highlight correct answer if they missed it
                            buttonStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
                          } else {
                            buttonStyles = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            id={`option-${block.id}-${oIdx}`}
                            key={oIdx}
                            disabled={hasAnswered}
                            onClick={() => {
                              setMultipleChoiceAnswers({
                                ...multipleChoiceAnswers,
                                [block.id]: oIdx
                              });
                            }}
                            className={`px-4 py-3 tracking-wide text-left text-xs sm:text-sm border rounded flex items-center justify-between transition-all font-sans ${buttonStyles} ${!hasAnswered ? 'cursor-pointer' : ''}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isThisSelected && (
                              isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback row */}
                    {hasAnswered && (
                      <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                        isCorrect ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-rose-50 text-rose-805 border-l-4 border-rose-500'
                      }`}>
                        {isCorrect ? (
                          <span>🎉 Risposta corretta! Eccellente spirito d'osservazione.</span>
                        ) : (
                          <span>😢 Oh no! Risposta errata. Riprova o ripassa la grammatica per comprendere.</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // 2. FILL IN THE BLANKS
              if (block.exerciseType === 'fill-blank') {
                const textValue = fillBlankAnswers[block.id] || '';
                const isChecked = fillBlankChecked[block.id] || false;
                const isCorrect = textValue.trim().toLowerCase() === block.fbCorrectAnswer?.trim().toLowerCase();

                return (
                  <div 
                    id={`block-card-${block.id}`}
                    key={block.id} 
                    className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
                      <div className="flex items-center gap-2.5 text-blue-600">
                        <div className="p-2 bg-blue-50 rounded">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - COMPLETA LA FRASE</span>
                          <h4 className="text-sm font-bold text-slate-900">{block.exerciseQuestion}</h4>
                        </div>
                      </div>

                      {isChecked && (
                        <button
                          id={`btn-reset-fb-${block.id}`}
                          onClick={() => handleResetExercise(block.id, 'fb')}
                          className="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Riponi
                        </button>
                      )}
                    </div>

                    {block.exerciseNote && (
                      <p className="text-xs text-slate-505 bg-slate-50 p-2.5 rounded border border-slate-150">
                        💡 {block.exerciseNote}
                      </p>
                    )}

                    {/* Sentence builder view with slot in the middle */}
                    <div className="py-4 px-6 bg-slate-50 rounded flex flex-wrap items-center justify-center gap-2 text-md border border-slate-200 font-sans">
                      <span className="text-slate-600 font-bold tracking-wide">{block.fbSentenceBefore}</span>
                      
                      <input
                        id={`input-fb-${block.id}`}
                        type="text"
                        placeholder="...scrivi la parola..."
                        disabled={isChecked}
                        value={textValue}
                        onChange={(e) => setFillBlankAnswers({ ...fillBlankAnswers, [block.id]: e.target.value })}
                        className={`px-3 py-1 text-center w-40 text-sm font-bold rounded border-2 focus:outline-none transition-all ${
                          isChecked
                            ? isCorrect
                              ? 'bg-emerald-650 border-emerald-650 text-white font-bold'
                              : 'bg-rose-650 border-rose-650 text-white font-bold'
                            : 'bg-white border-blue-200 text-blue-800 focus:ring-1 focus:ring-blue-600 focus:border-blue-605'
                        }`}
                      />

                      <span className="text-slate-600 font-bold tracking-wide">{block.fbSentenceAfter}</span>
                    </div>

                    {/* Submit Button */}
                    {!isChecked && (
                      <button
                        id={`btn-verify-fb-${block.id}`}
                        onClick={() => setFillBlankChecked({ ...fillBlankChecked, [block.id]: true })}
                        className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-xs"
                      >
                        Verifica Soluzione
                      </button>
                    )}

                    {isChecked && (
                      <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                        isCorrect ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-rose-50 text-rose-805 border-l-4 border-rose-500'
                      }`}>
                        {isCorrect ? (
                          <span>🎉 Risposta corretta! Ottimo lavoro con i caratteri!</span>
                        ) : (
                          <span>😢 Errato. La parola corretta è: <b>{block.fbCorrectAnswer}</b>. Riprova!</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // 3. REORDER SENTENCE PUZZLE
              if (block.exerciseType === 'reorder') {
                const activeSelection = reorderSelectedWords[block.id] || [];
                const isChecked = reorderChecked[block.id] || false;

                const joined = activeSelection.join(' ');
                const isCorrect = joined.trim() === block.reorderCorrectOrder?.trim();

                const remainingWords = (block.reorderWords || []).filter(
                  word => !activeSelection.includes(word)
                );

                return (
                  <div 
                    id={`block-card-${block.id}`}
                    key={block.id} 
                    className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
                      <div className="flex items-center gap-2.5 text-blue-600">
                        <div className="p-2 bg-blue-50 rounded">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - FRASI INTERATTIVE</span>
                          <h4 className="text-sm font-bold text-slate-900">{block.exerciseQuestion}</h4>
                        </div>
                      </div>

                      {(activeSelection.length > 0 || isChecked) && (
                        <button
                          id={`btn-reset-reorder-${block.id}`}
                          onClick={() => handleResetExercise(block.id, 'reorder')}
                          className="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Riponi
                        </button>
                      )}
                    </div>

                    {block.exerciseNote && (
                      <p className="text-xs text-slate-505 bg-slate-50 p-2.5 rounded border border-slate-150">
                        💡 {block.exerciseNote}
                      </p>
                    )}

                    {/* Word Assemble board */}
                    <div className="min-h-14 p-4 bg-slate-50 border border-slate-150 rounded flex flex-wrap gap-2 items-center justify-center">
                      {activeSelection.length === 0 ? (
                        <span className="text-xs text-slate-400 select-none italic">Seleziona le bolle in ordine logico per comporre la frase giapponese/cinese/coreana</span>
                      ) : (
                        activeSelection.map((word, wIdx) => (
                           <button
                             id={`bubble-selected-${block.id}-${wIdx}`}
                             key={wIdx}
                             disabled={isChecked}
                             onClick={() => handleToggleReorderWord(block.id, word, block.reorderWords?.length || 0)}
                             className={`px-3 py-1.5 text-sm font-bold rounded border font-sans cursor-pointer ${
                               isChecked
                                 ? isCorrect
                                   ? 'bg-emerald-600 border-emerald-600 text-white'
                                   : 'bg-rose-600 border-rose-600 text-white'
                                 : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                             }`}
                           >
                             {word}
                           </button>
                        ))
                      )}
                    </div>

                    {/* Word pool block */}
                    {!isChecked && (
                      <div className="flex flex-wrap gap-2 items-center justify-center py-2.5">
                        {block.reorderWords?.map((word, wIdx) => {
                          const isUsed = activeSelection.includes(word);
                          return (
                            <button
                              id={`bubble-pool-${block.id}-${wIdx}`}
                              key={wIdx}
                              disabled={isUsed}
                              onClick={() => handleToggleReorderWord(block.id, word, block.reorderWords?.length || 0)}
                              className={`px-3 py-1.5 text-sm font-semibold rounded border transition-all cursor-pointer ${
                                isUsed
                                  ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-45 cursor-not-allowed'
                                  : 'bg-white border-slate-200 hover:border-blue-400 shadow-xs'
                              }`}
                            >
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Compile verification action */}
                    {!isChecked && activeSelection.length > 0 && (
                      <button
                        id={`btn-verify-reorder-${block.id}`}
                        onClick={() => setReorderChecked({ ...reorderChecked, [block.id]: true })}
                        className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-xs"
                      >
                        Verifica Ordine
                      </button>
                    )}

                    {isChecked && (
                      <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                        isCorrect ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-rose-50 text-rose-805 border-l-4 border-rose-500'
                      }`}>
                        {isCorrect ? (
                          <span>🎉 Risposta corretta! Un posizionamento impeccabile della sintassi.</span>
                        ) : (
                          <span>😢 Ordine errato. La soluzione corretta è: <b className="font-sans underline">{block.reorderCorrectOrder}</b>. Riprova!</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            }

            // -------------------------------------------------------------
            // VIDEO BLOCK (video)
            // -------------------------------------------------------------
            if (block.type === 'video' && block.videoUrl) {
              const embedUrl = block.videoUrl.includes('youtube.com/embed') 
                ? block.videoUrl 
                : block.videoUrl.replace('watch?v=', 'embed/');

              return (
                <div 
                  id={`block-card-${block.id}`}
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-blue-600 border-b border-slate-100 pb-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <Film className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">VIDEO DI APPROFONDIMENTO</span>
                      <h3 className="text-base font-bold text-slate-900">{block.videoCaption || 'Approfondimento Video'}</h3>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="relative rounded overflow-hidden aspect-video bg-black shadow-inner border border-slate-200">
                    <iframe
                      src={embedUrl}
                      title={block.videoCaption || 'Video Player'}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Quick Chapter transition block */}
        <div className="pt-4 flex justify-between">
          <button
            id="btn-bottom-prev"
            onClick={onGoBack}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            ← Torna allo Scaffale
          </button>
          
          <button
            id="btn-bottom-edit"
            onClick={onOpenEditor}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            ✏️ Modifica Libro
          </button>
        </div>

      </div>
    </div>
  );
}
