/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Book, Chapter, ContentBlock, BlockType, LanguageCode } from '../types';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  ChevronLeft,
  FileText,
  MessageSquare,
  HelpCircle,
  Film,
  Image as ImageIcon,
  Compass,
  Settings,
  FolderPlus,
  ArrowLeft
} from 'lucide-react';

interface BookEditorProps {
  book: Book;
  onGoBack: () => void;
  onSaveBook: (updatedBook: Book) => void;
}

export function BookEditor({ book, onGoBack, onSaveBook }: BookEditorProps) {
  // Deep clone book to handle local edits
  const [editedBook, setEditedBook] = useState<Book>(JSON.parse(JSON.stringify(book)));
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    editedBook.chapters[0]?.id || ''
  );
  
  // Track active workspace mode: 'blocks' or 'settings' info
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings'>('blocks');

  // Dialog State to replace native blocking alert/confirm/prompt
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'prompt' | 'confirm' | 'alert';
    title: string;
    message: string;
    inputValue?: string;
    onConfirm?: (inputValue?: string) => void;
  }>({
    isOpen: false,
    type: 'prompt',
    title: '',
    message: '',
    inputValue: '',
  });

  // Active selecting chapter object
  const currentChapter = editedBook.chapters.find(c => c.id === selectedChapterId);

  // Trigger global save back to core App container
  const persistChanges = (newBookState: Book) => {
    setEditedBook(newBookState);
    onSaveBook(newBookState);
  };

  // 1. BOOK METADATA EDITORS
  const handleUpdateBookMeta = (field: keyof Book, value: any) => {
    const updated = { ...editedBook, [field]: value };
    persistChanges(updated);
  };

  // 2. CHAPTER MANAGEMENT
  const handleAddChapter = () => {
    setDialog({
      isOpen: true,
      type: 'prompt',
      title: 'Aggiungi Nuovo Capitolo',
      message: 'Digita il titolo del nuovo capitolo:',
      inputValue: 'Nuovo Capitolo',
      onConfirm: (title) => {
        if (!title || !title.trim()) return;

        const newChapter: Chapter = {
          id: `chapter-${Date.now()}`,
          title: title.trim(),
          description: 'Una breve descrizione introduttiva per guidare i tuoi studenti.',
          blocks: []
        };

        const updated = {
          ...editedBook,
          chapters: [...editedBook.chapters, newChapter]
        };
        persistChanges(updated);
        setSelectedChapterId(newChapter.id);
      }
    });
  };

  const handleUpdateChapterMeta = (field: keyof Chapter, value: any) => {
    if (!selectedChapterId) return;
    const updatedChapters = editedBook.chapters.map(ch => {
      if (ch.id === selectedChapterId) {
        return { ...ch, [field]: value };
      }
      return ch;
    });

    persistChanges({ ...editedBook, ...{ chapters: updatedChapters } });
  };

  const handleDeleteChapter = (chId: string) => {
    const chapterName = editedBook.chapters.find(ch => ch.id === chId)?.title || 'questo capitolo';
    setDialog({
      isOpen: true,
      type: 'confirm',
      title: 'Elimina Capitolo',
      message: `Sei sicuro di voler eliminare interamente il capitolo "${chapterName}"? Questa operazione è irreversibile e cancellerà tutti i relativi contenuti didattici.`,
      onConfirm: () => {
        const updatedChapters = editedBook.chapters.filter(ch => ch.id !== chId);
        const nextSelected = updatedChapters[0]?.id || '';
        
        persistChanges({
          ...editedBook,
          chapters: updatedChapters
        });
        setSelectedChapterId(nextSelected);
      }
    });
  };

  // 3. BLOCKS OPERATIONS (UP, DOWN, ADD, DELETE, EDIT)
  const handleAddBlock = (type: BlockType) => {
    if (!selectedChapterId) {
      setDialog({
        isOpen: true,
        type: 'alert',
        title: 'Attenzione',
        message: 'Devi prima selezionare o inserire un capitolo per poter aggiungere contenuti didattici!',
      });
      return;
    }

    const baseBlock: Partial<ContentBlock> = {
      id: `block-${Date.now()}`,
      type
    };

    if (type === 'grammar') {
      baseBlock.grammarTitle = 'Nuova Regola di Grammatica';
      baseBlock.grammarText = 'Scrivi qui la spiegazione grammaticale per i tuoi studenti...';
      baseBlock.grammarTerms = [];
    } else if (type === 'dialogue') {
      baseBlock.dialogueTitle = 'Incontro al Ristorante';
      baseBlock.dialogueCharacters = ['A', 'B'];
      baseBlock.dialogueLines = [
        { character: 'A', text: '', phonetic: '', translation: '' }
      ];
    } else if (type === 'vocabulary') {
      baseBlock.vocabularyList = [
        { term: 'Termine di Base', phonetic: 'Trascrizione', translation: 'Traduzione in Italiano' }
      ];
    } else if (type === 'exercise') {
      baseBlock.exerciseType = 'multiple-choice';
      baseBlock.exerciseQuestion = 'Quanto fa e come si traduce?';
      baseBlock.exerciseNote = 'Suggerimento per gli studenti...';
      baseBlock.mcOptions = ['Risposta A', 'Risposta B', 'Risposta C', 'Risposta D'];
      baseBlock.mcCorrectIndex = 0;
    } else if (type === 'video') {
      baseBlock.videoUrl = 'https://www.youtube.com/embed/rGrMin_UtTo';
      baseBlock.videoCaption = 'Fornisci una breve introduzione o titolo a questo video didattico.';
    } else if (type === 'image') {
      baseBlock.imageUrl = 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800';
      baseBlock.imageCaption = 'Didascalia del luogo illustrato.';
    }

    const updatedChapters = editedBook.chapters.map(ch => {
      if (ch.id === selectedChapterId) {
        return {
          ...ch,
          blocks: [...ch.blocks, baseBlock as ContentBlock]
        };
      }
      return ch;
    });

    persistChanges({ ...editedBook, chapters: updatedChapters });
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedChapters = editedBook.chapters.map(ch => {
      if (ch.id === selectedChapterId) {
        return {
          ...ch,
          blocks: ch.blocks.filter(b => b.id !== blockId)
        };
      }
      return ch;
    });

    persistChanges({ ...editedBook, chapters: updatedChapters });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!currentChapter) return;
    const blocksCopy = [...currentChapter.blocks];
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocksCopy.length) return;

    // Swap positions
    const temp = blocksCopy[index];
    blocksCopy[index] = blocksCopy[targetIdx];
    blocksCopy[targetIdx] = temp;

    const updatedChapters = editedBook.chapters.map(ch => {
      if (ch.id === selectedChapterId) {
        return { ...ch, blocks: blocksCopy };
      }
      return ch;
    });

    persistChanges({ ...editedBook, chapters: updatedChapters });
  };

  const handleUpdateBlockField = (blockId: string, updates: Partial<ContentBlock>) => {
    const updatedChapters = editedBook.chapters.map(ch => {
      if (ch.id === selectedChapterId) {
        return {
          ...ch,
          blocks: ch.blocks.map(b => {
            if (b.id === blockId) {
              return { ...b, ...updates };
            }
            return b;
          })
        };
      }
      return ch;
    });

    persistChanges({ ...editedBook, chapters: updatedChapters });
  };

  // 4. MODULAR BLOCK FORM RENDERER (AVOIDS DEEP BRACE COUPLING)
  const renderBlockEditorForm = (block: ContentBlock, idx: number) => {
    return (
      <div
        id={`editor-block-card-${block.id}`}
        key={block.id}
        className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs relative"
      >
        {/* Block Header Tool Rails */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
            {block.type === 'grammar' && <><FileText className="w-3.5 h-3.5 text-rose-500" /> Grammatica</>}
            {block.type === 'dialogue' && <><MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Dialogo</>}
            {block.type === 'vocabulary' && <><Compass className="w-3.5 h-3.5 text-amber-500" /> Pronuncia & Vocabolario</>}
            {block.type === 'exercise' && <><HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Esercizi</>}
            {block.type === 'video' && <><Film className="w-3.5 h-3.5 text-sky-500" /> Video Lezione</>}
            {block.type === 'image' && <><ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Illustrazione</>}
          </span>

          {/* Move and Delete controllers */}
          <div className="flex items-center gap-1">
            <button
              id={`btn-move-up-${block.id}`}
              disabled={idx === 0}
              onClick={() => handleMoveBlock(idx, 'up')}
              className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
              title="Sposta Su"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              id={`btn-move-down-${block.id}`}
              disabled={currentChapter && idx === currentChapter.blocks.length - 1}
              onClick={() => handleMoveBlock(idx, 'down')}
              className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded cursor-pointer"
              title="Sposta Giù"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-slate-100 mx-1" />
            <button
              id={`btn-delete-block-${block.id}`}
              onClick={() => handleDeleteBlock(block.id)}
              className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
              title="Elimina questo blocco"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic form inputs */}
        <div className="space-y-4 text-xs">
          
          {/* Grammar Edit Section */}
          {block.type === 'grammar' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">TITOLO GRAMMATICA</label>
                <input
                  type="text"
                  value={block.grammarTitle || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { grammarTitle: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">SPIEGAZIONE GRAMMATICALE</label>
                <textarea
                  value={block.grammarText || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { grammarText: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                />
              </div>

              {/* Terms inside Grammar */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>TERMINI DI RIFERIMENTO</span>
                  <button
                    type="button"
                    onClick={() => {
                      const terms = block.grammarTerms || [];
                      handleUpdateBlockField(block.id, {
                        grammarTerms: [...terms, { term: '', phonetic: '', translation: '' }]
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    + Aggiungi Termine
                  </button>
                </div>

                {(block.grammarTerms || []).map((term, tIdx) => (
                  <div key={tIdx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Carattere nativo"
                      value={term.term}
                      onChange={(e) => {
                        const copy = [...(block.grammarTerms || [])];
                        copy[tIdx].term = e.target.value;
                        handleUpdateBlockField(block.id, { grammarTerms: copy });
                      }}
                      className="col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Lettura / Pinyin"
                      value={term.phonetic}
                      onChange={(e) => {
                        const copy = [...(block.grammarTerms || [])];
                        copy[tIdx].phonetic = e.target.value;
                        handleUpdateBlockField(block.id, { grammarTerms: copy });
                      }}
                      className="col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Traduzione italiana"
                      value={term.translation}
                      onChange={(e) => {
                        const copy = [...(block.grammarTerms || [])];
                        copy[tIdx].translation = e.target.value;
                        handleUpdateBlockField(block.id, { grammarTerms: copy });
                      }}
                      className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = (block.grammarTerms || []).filter((_, tx) => tx !== tIdx);
                        handleUpdateBlockField(block.id, { grammarTerms: copy });
                      }}
                      className="col-span-1 text-center text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dialogue Edit Section */}
          {block.type === 'dialogue' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">TITOLO DIALOGO</label>
                <input
                  type="text"
                  value={block.dialogueTitle || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { dialogueTitle: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>BATTUTE DEL DIALOGO</span>
                  <button
                    type="button"
                    onClick={() => {
                      const lines = block.dialogueLines || [];
                      handleUpdateBlockField(block.id, {
                        dialogueLines: [...lines, { character: '', text: '', phonetic: '', translation: '' }]
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    + Aggiungi Battuta
                  </button>
                </div>

                {(block.dialogueLines || []).map((line, lIdx) => (
                  <div key={lIdx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                      <span>BATTUTA N. {lIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const copy = (block.dialogueLines || []).filter((_, lx) => lx !== lIdx);
                          handleUpdateBlockField(block.id, { dialogueLines: copy });
                        }}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Rimuovi Battuta
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <label className="block text-[8px] font-bold text-slate-400">PARLANTE</label>
                        <input
                          type="text"
                          placeholder="es. A"
                          value={line.character}
                          onChange={(e) => {
                            const copy = [...(block.dialogueLines || [])];
                            copy[lIdx].character = e.target.value;
                            handleUpdateBlockField(block.id, { dialogueLines: copy });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded"
                        />
                      </div>
                      <div className="col-span-9">
                        <label className="block text-[8px] font-bold text-slate-400">TESTO NATIVO</label>
                        <input
                          type="text"
                          placeholder="Frase in lingua..."
                          value={line.text}
                          onChange={(e) => {
                            const copy = [...(block.dialogueLines || [])];
                            copy[lIdx].text = e.target.value;
                            handleUpdateBlockField(block.id, { dialogueLines: copy });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-bold text-slate-400">PRONUNCIA FONETICA</label>
                        <input
                          type="text"
                          placeholder="Lettura fonetica..."
                          value={line.phonetic}
                          onChange={(e) => {
                            const copy = [...(block.dialogueLines || [])];
                            copy[lIdx].phonetic = e.target.value;
                            handleUpdateBlockField(block.id, { dialogueLines: copy });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-slate-400">TRADUZIONE ITALIANO</label>
                        <input
                          type="text"
                          placeholder="Significato in italiano..."
                          value={line.translation}
                          onChange={(e) => {
                            const copy = [...(block.dialogueLines || [])];
                            copy[lIdx].translation = e.target.value;
                            handleUpdateBlockField(block.id, { dialogueLines: copy });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Card list Edit Section */}
          {block.type === 'vocabulary' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                <span>CARTOLINE DI PRONUNCIA E VOCABOLI</span>
                <button
                  type="button"
                  onClick={() => {
                    const list = block.vocabularyList || [];
                    handleUpdateBlockField(block.id, {
                      vocabularyList: [...list, { term: '', phonetic: '', translation: '' }]
                    });
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  + Aggiungi Vocabolo
                </button>
              </div>

              {(block.vocabularyList || []).map((vocab, vIdx) => (
                <div key={vIdx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span>VOCABOLO N. {vIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = (block.vocabularyList || []).filter((_, vx) => vx !== vIdx);
                        handleUpdateBlockField(block.id, { vocabularyList: copy });
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Rimuovi
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400">TERMINE NATIVO</label>
                      <input
                        type="text"
                        placeholder="Carattere"
                        value={vocab.term}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].term = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400">LETTURA FONETICA</label>
                      <input
                        type="text"
                        placeholder="Pinyin/Romaji"
                        value={vocab.phonetic}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].phonetic = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400">TRADUZIONE ITALIANO</label>
                      <input
                        type="text"
                        placeholder="Significato"
                        value={vocab.translation}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].translation = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  {/* Optional sentence attributes */}
                  <div className="border-t border-slate-200/50 pt-2 space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">FRASE DI ESEMPIO CORRELATA (Opzionale)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Frase nativa"
                        value={vocab.example || ''}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].example = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Pronuncia frase"
                        value={vocab.examplePhonetic || ''}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].examplePhonetic = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px] font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Traduzione interna"
                        value={vocab.exampleTranslation || ''}
                        onChange={(e) => {
                          const copy = [...(block.vocabularyList || [])];
                          copy[vIdx].exampleTranslation = e.target.value;
                          handleUpdateBlockField(block.id, { vocabularyList: copy });
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercise Settings Edit Section */}
          {block.type === 'exercise' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">TIPO DI VERIFICA</label>
                  <select
                    value={block.exerciseType}
                    onChange={(e) => handleUpdateBlockField(block.id, { 
                      exerciseType: e.target.value as any,
                      mcOptions: e.target.value === 'multiple-choice' ? ['Opzione A', 'Opzione B', 'Opzione C', 'Opzione D'] : undefined,
                      mcCorrectIndex: e.target.value === 'multiple-choice' ? 0 : undefined,
                      fbSentenceBefore: e.target.value === 'fill-blank' ? 'Frase iniziale ' : undefined,
                      fbSentenceAfter: e.target.value === 'fill-blank' ? ' parte finale' : undefined,
                      fbCorrectAnswer: e.target.value === 'fill-blank' ? 'parola' : undefined,
                      reorderWords: e.target.value === 'reorder' ? ['Parola1', 'Parola2', 'Parola3'] : undefined,
                      reorderCorrectOrder: e.target.value === 'reorder' ? 'Parola1 Parola2 Parola3' : undefined
                    })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="multiple-choice">Scelta Multipla (Quiz a 4)</option>
                    <option value="fill-blank">Riempi lo Spazio Vuoto</option>
                    <option value="reorder">Riordino delle Parole disordinate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">DOMANDA / CONSEGNA</label>
                  <input
                    type="text"
                    value={block.exerciseQuestion || ''}
                    onChange={(e) => handleUpdateBlockField(block.id, { exerciseQuestion: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">SUGGERIMENTO DIDATTICO</label>
                <input
                  type="text"
                  placeholder="Scrivi un aiuto o commento di tip..."
                  value={block.exerciseNote || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { exerciseNote: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                />
              </div>

              {/* Sub quiz renderers */}
              {block.exerciseType === 'multiple-choice' && (
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Opzioni Quiz (Spunta il pallino a sinistra della corretta)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <input
                          type="radio"
                          name={`radio-${block.id}`}
                          checked={block.mcCorrectIndex === oIdx}
                          onChange={() => handleUpdateBlockField(block.id, { mcCorrectIndex: oIdx })}
                          className="accent-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder={`Opzione ${oIdx + 1}`}
                          value={block.mcOptions?.[oIdx] || ''}
                          onChange={(e) => {
                            const copy = [...(block.mcOptions || ['', '', '', ''])];
                            copy[oIdx] = e.target.value;
                            handleUpdateBlockField(block.id, { mcOptions: copy });
                          }}
                          className="w-full bg-transparent border-none text-[10px] md:text-xs focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.exerciseType === 'fill-blank' && (
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Frase da riempire</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-400 block font-semibold mb-0.5">PARTE INIZIALE</label>
                      <input
                        type="text"
                        placeholder="Prima dello spazio"
                        value={block.fbSentenceBefore || ''}
                        onChange={(e) => handleUpdateBlockField(block.id, { fbSentenceBefore: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-205 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-400 block font-semibold mb-0.5">PAROLA COMPLETANTE</label>
                      <input
                        type="text"
                        placeholder="Parola corretta"
                        value={block.fbCorrectAnswer || ''}
                        onChange={(e) => handleUpdateBlockField(block.id, { fbCorrectAnswer: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-205 rounded font-semibold text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-400 block font-semibold mb-0.5">PARTE FINALE</label>
                      <input
                        type="text"
                        placeholder="Dopo l'input"
                        value={block.fbSentenceAfter || ''}
                        onChange={(e) => handleUpdateBlockField(block.id, { fbSentenceAfter: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-205 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {block.exerciseType === 'reorder' && (
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Struttura puzzle di riordino</span>
                  <div>
                    <label className="text-[8px] text-slate-400 block font-semibold mb-0.5">PAROLE DISORDINATE (divise da virgola, es: です,私,学生,は)</label>
                    <input
                      type="text"
                      placeholder="Parola1,Parola2..."
                      value={block.reorderWords?.join(',') || ''}
                      onChange={(e) => handleUpdateBlockField(block.id, {
                        reorderWords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-205 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block font-semibold mb-0.5">SINTASSI ESATTA DI CONTROLLO (parole divise da singoli spazi, es: 私 は 学生 です)</label>
                    <input
                      type="text"
                      placeholder="Frase riordinata completa"
                      value={block.reorderCorrectOrder || ''}
                      onChange={(e) => handleUpdateBlockField(block.id, { reorderCorrectOrder: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-205 rounded font-semibold text-indigo-800"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Lesson Edit Section */}
          {block.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">YOUTUBE EMBED CODICE O URL VIDEO</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/..."
                  value={block.videoUrl || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { videoUrl: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">COMMENTO / DIDASCALIA GUIDA</label>
                <input
                  type="text"
                  value={block.videoCaption || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { videoCaption: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>
          )}

          {/* Illustration/Image Edit Section */}
          {block.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">URL DELL'IMMAGINE ILLUSTRATIVA</label>
                <input
                  type="text"
                  placeholder="Immetti URL sorgente immagine..."
                  value={block.imageUrl || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">DIDASCALIA INFORMATIVA CULTURALE</label>
                <input
                  type="text"
                  value={block.imageCaption || ''}
                  onChange={(e) => handleUpdateBlockField(block.id, { imageCaption: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top action and header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="editor-btn-back"
            onClick={onGoBack}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer"
            title="Indietro allo Scaffale"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STUDIO DI CREAZIONE E MODIFICA</span>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Costruendo: <span className="text-indigo-600 font-semibold">{editedBook.title}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
            ● Autosalvato in locale
          </span>
          <button
            id="editor-btn-back-main"
            onClick={onGoBack}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Torna allo Scaffale
          </button>
        </div>
      </div>

      {/* Main Core Columns Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column tools / sections navigator */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-slate-100 rounded-xl p-2 flex gap-1 shadow-xs">
            <button
              id="editor-tab-blocks"
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer ${
                activeTab === 'blocks' ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📚 Capitoli & Blocchi
            </button>
            <button
              id="editor-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer ${
                activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ⚙️ Copertina & Info
            </button>
          </div>

          {/* Chapters Manager Tab 1 */}
          {activeTab === 'blocks' && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">CAPITOLI DISPONIBILI</span>
                <button
                  id="editor-btn-add-chapter"
                  onClick={handleAddChapter}
                  className="p-1 hover:bg-slate-50 text-indigo-600 hover:text-indigo-800 rounded-lg border border-dashed border-indigo-200 transition-all flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi
                </button>
              </div>

              {editedBook.chapters.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <p>Nessun capitolo inserito.</p>
                  <button onClick={handleAddChapter} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-semibold cursor-pointer">Crea Capitolo</button>
                </div>
              ) : (
                <div className="space-y-1">
                  {editedBook.chapters.map((ch, idx) => (
                    <div
                      id={`editor-ch-item-${ch.id}`}
                      key={ch.id}
                      className={`w-full group flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer ${
                        ch.id === selectedChapterId ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedChapterId(ch.id)}
                    >
                      <span className="truncate flex-1">
                        {idx + 1}. {ch.title}
                      </span>
                      <button
                        id={`btn-editor-delete-ch-${ch.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(ch.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-1 rounded transition-opacity cursor-pointer"
                        title="Cancella Capitolo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Book Settings Tab 2 */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4 text-xs select-none">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">IMPOSTAZIONI PRINCIPALI</span>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Titolo Libro</label>
                  <input
                    id="edit-book-title"
                    type="text"
                    value={editedBook.title}
                    onChange={(e) => handleUpdateBookMeta('title', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Livello</label>
                  <select
                    id="edit-book-level"
                    value={editedBook.level}
                    onChange={(e) => handleUpdateBookMeta('level', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzato">Avanzato</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">URL Immagine Copertina</label>
                  <input
                    id="edit-book-cover"
                    type="text"
                    value={editedBook.coverUrl}
                    onChange={(e) => handleUpdateBookMeta('coverUrl', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 text-[10px] font-mono rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  {editedBook.coverUrl && (
                    <img 
                      src={editedBook.coverUrl} 
                      alt="Anteprima copertina" 
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover rounded-lg mt-1 border border-slate-100"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Descrizione Libro</label>
                  <textarea
                    id="edit-book-desc"
                    value={editedBook.description}
                    onChange={(e) => handleUpdateBookMeta('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column editor canvas */}
        <div className="lg:col-span-9 space-y-6">
          
          {!currentChapter ? (
            <div className="text-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
              <FolderPlus className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-600 font-medium">Nessun capitolo selezionato.</p>
              <p className="text-xs text-slate-400">Inserisci o seleziona un capitolo nella lista a sinistra per iniziare.</p>
              <button onClick={handleAddChapter} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer">Crea Capitolo</button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Chapter Meta configuration inside Canvas */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">METADATI CAPITOLO</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Titolo Capitolo</label>
                    <input
                      id="edit-chapter-title"
                      type="text"
                      value={currentChapter.title}
                      onChange={(e) => handleUpdateChapterMeta('title', e.target.value)}
                      className="w-full px-3.5 py-1.5 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Obiettivi / Descrizione</label>
                    <input
                      id="edit-chapter-desc"
                      type="text"
                      value={currentChapter.description}
                      onChange={(e) => handleUpdateChapterMeta('description', e.target.value)}
                      className="w-full px-3.5 py-1.5 border border-slate-200 text-xs rounded-lg text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Chapter Active Content Blocks list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pl-1">
                  <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase">BLOCCHI DEL CAPITOLO ({currentChapter.blocks.length})</h3>
                </div>

                {currentChapter.blocks.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed border-slate-100 rounded-2xl text-xs text-slate-400 space-y-2">
                    <p>Questo capitolo è vuoto. Clicca sui pulsanti sotto per inserire materiale didattico.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentChapter.blocks.map((block, idx) => renderBlockEditorForm(block, idx))}
                  </div>
                )}
              </div>

              {/* Add Block Tool Grid */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">AGGIUNGI CONTENUTI INTERATTIVI</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1.5">
                  <button
                    id="btn-add-grammar"
                    onClick={() => handleAddBlock('grammar')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    <span>+ Grammatica</span>
                  </button>

                  <button
                    id="btn-add-dialogue"
                    onClick={() => handleAddBlock('dialogue')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>+ Dialogo Audio</span>
                  </button>

                  <button
                    id="btn-add-vocabulary"
                    onClick={() => handleAddBlock('vocabulary')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <Compass className="w-4 h-4 text-amber-500" />
                    <span>+ Vocabolario</span>
                  </button>

                  <button
                    id="btn-add-exercise"
                    onClick={() => handleAddBlock('exercise')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <HelpCircle className="w-4 h-4 text-violet-500" />
                    <span>+ Quiz</span>
                  </button>

                  <button
                    id="btn-add-video"
                    onClick={() => handleAddBlock('video')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <Film className="w-4 h-4 text-sky-500" />
                    <span>+ Video Lezione</span>
                  </button>

                  <button
                    id="btn-add-image"
                    onClick={() => handleAddBlock('image')}
                    className="p-3 bg-white hover:bg-slate-100/75 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-800 transition-colors rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer font-sans"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>+ Immagine</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Modern, state-based, non-blocking custom Dialog overlay for iframe support */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-950">{dialog.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{dialog.message}</p>
            </div>

            {dialog.type === 'prompt' && (
              <div className="pt-1">
                <input
                  type="text"
                  autoFocus
                  value={dialog.inputValue || ''}
                  onChange={(e) => setDialog(prev => ({ ...prev, inputValue: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm?.(dialog.inputValue);
                      setDialog(prev => ({ ...prev, isOpen: false }));
                    }
                  }}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  placeholder="Inserisci qui il nome..."
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1 text-xs md:text-sm">
              {dialog.type !== 'alert' && (
                <button
                  type="button"
                  onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer font-medium"
                >
                  Annulla
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  dialog.onConfirm?.(dialog.inputValue);
                  setDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
