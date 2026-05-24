/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, LanguageCode } from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  BookMarked,
  Layers, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles,
  Award
} from 'lucide-react';
import { exportBookToHTML } from '../utils/exporter';

interface BookShelfProps {
  books: Book[];
  onSelectBook: (bookId: string, chapterId?: string) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onAddNewBook: (title: string, language: LanguageCode, description: string, level: Book['level']) => void;
  onImportBooks: (importedBooks: Book[]) => void;
  onOpenCopilot: () => void;
}

export function BookShelf({
  books,
  onSelectBook,
  onEditBook,
  onDeleteBook,
  onAddNewBook,
  onImportBooks,
  onOpenCopilot
}: BookShelfProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageCode | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<Book['level'] | 'ALL'>('ALL');

  // New book quick form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState<LanguageCode>('Japanese');
  const [newDesc, setNewDesc] = useState('');
  const [newLevel, setNewLevel] = useState<Book['level']>('Principiante');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLang === 'ALL' || book.language === selectedLang;
    const matchesLevel = selectedLevel === 'ALL' || book.level === selectedLevel;
    return matchesSearch && matchesLang && matchesLevel;
  });

  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "iLibriOrientali_Backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // Very simple validator helper
            const isValid = parsed.every(b => b.id && b.title && b.language && Array.isArray(b.chapters));
            if (isValid) {
              onImportBooks(parsed);
              alert('Meraviglioso! Libri importati correttamente.');
            } else {
              alert('Il file caricato non sembra contenere un catalogo di Libri Orientali valido.');
            }
          } else if (parsed.id && parsed.title && parsed.language) {
            onImportBooks([parsed]);
            alert('Meraviglioso! Il libro è stato importato correttamente.');
          }
        } catch (err) {
          alert('Errore durante la lettura del file JSON.');
        }
      };
    }
  };

  const submitNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddNewBook(newTitle.trim(), newLang, newDesc.trim() || 'Nessuna descrizione.', newLevel);
      setNewTitle('');
      setNewDesc('');
      setShowAddModal(false);
    }
  };

  const getLanguageLabel = (lang: LanguageCode) => {
    switch(lang) {
      case 'Japanese': return '日本語 Giapponese';
      case 'Chinese': return '中文 Cinese (Mandarino)';
      case 'Korean': return '한국어 Coreano';
      case 'Russian': return 'Русский Russo';
      case 'Turkish': return 'Türkçe Turco';
      case 'Arabic': return 'العربية Arabo';
      case 'Thai': return 'ไทย Thai';
      case 'Hindi': return 'हिन्दी Hindi';
    }
  };

  const getLanguageColor = (lang: LanguageCode) => {
    switch(lang) {
      case 'Japanese': return 'from-rose-500/10 to-rose-600/20 text-rose-700 border-rose-200';
      case 'Chinese': return 'from-amber-500/10 to-amber-600/20 text-amber-800 border-amber-200';
      case 'Korean': return 'from-sky-500/10 to-sky-600/20 text-sky-800 border-sky-200';
      case 'Russian': return 'from-red-500/10 to-red-600/20 text-red-800 border-red-200';
      case 'Turkish': return 'from-pink-500/10 to-pink-600/20 text-pink-850 border-pink-200';
      case 'Arabic': return 'from-emerald-500/10 to-emerald-600/20 text-emerald-800 border-emerald-200';
      case 'Thai': return 'from-fuchsia-500/10 to-fuchsia-600/20 text-fuchsia-800 border-fuchsia-200';
      case 'Hindi': return 'from-orange-500/10 to-orange-600/20 text-orange-850 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Jumbotron Header */}
      <div className="relative rounded-md overflow-hidden bg-slate-900 text-white p-8 md:p-10 shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-slate-800/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Studio Libri Orientali Interattivi
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white">
            Crea e Studia Libri delle Lingue Orientali
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Una piattaforma professionale focalizzata sull'apprendimento autentico. Inserisci testi grammaticali, 
            dialoghi audio immersivi con personaggi parlanti sintetizzati, schede di pronuncia, video didattici 
            e divertenti quiz di verifica. Genera istantaneamente nuovi capitoli memorabili grazie al Copilot AI.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              id="btn-ai-portal"
              onClick={onOpenCopilot}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs md:text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Genera Capitolo con AI Copilot
            </button>
            <button
              id="btn-open-create-book"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 rounded text-xs md:text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Crea Libro Vuoto
            </button>
            <button
              id="btn-export-backup"
              onClick={handleExportAll}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs rounded transition-colors flex items-center gap-2 cursor-pointer"
              title="Esporta tutti i libri in JSON per backup"
            >
              <Download className="w-4 h-4" /> Esporta Backup
            </button>
            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-755 text-slate-300 border border-slate-700 text-xs rounded transition-colors flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Importa Libro
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportFile} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-md border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="input-book-search"
            type="text"
            placeholder="Cerca tra i tuoi libri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtra per:</span>
          
          <select
            id="filter-lang-select"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as LanguageCode | 'ALL')}
            className="bg-white border border-slate-200 text-slate-600 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="ALL">Tutte le Lingue</option>
            <option value="Japanese">Giapponese (日本語)</option>
            <option value="Chinese">Cinese (中文)</option>
            <option value="Korean">Coreano (한국어)</option>
            <option value="Russian">Russo (Русский)</option>
            <option value="Turkish">Turco (Türkçe)</option>
            <option value="Arabic">Arabo (العربية)</option>
            <option value="Thai">Thai (ไทย)</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
          </select>

          <select
            id="filter-level-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as Book['level'] | 'ALL')}
            className="bg-white border border-slate-200 text-slate-600 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="ALL">Tutti i Livelli</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzato">Avanzato</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-4">
          <BookMarked className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-600 font-medium">Nessun libro corrisponde ai filtri di ricerca.</p>
          <p className="text-xs text-slate-400">Prova ad azzerare i filtri o premi "Crea Libro" per costruirne uno nuovo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div 
              id={`book-card-${book.id}`}
              key={book.id} 
              className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col group"
            >
              {/* Cover Photo */}
              <div className="relative h-44 overflow-hidden bg-slate-800">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                
                {/* Visual badges over cover */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded text-white ${
                    book.language === 'Japanese' ? 'bg-blue-600' :
                    book.language === 'Chinese' ? 'bg-amber-600' :
                    book.language === 'Korean' ? 'bg-indigo-600' :
                    book.language === 'Russian' ? 'bg-red-650' :
                    book.language === 'Turkish' ? 'bg-pink-650' :
                    book.language === 'Arabic' ? 'bg-emerald-650' :
                    book.language === 'Thai' ? 'bg-fuchsia-650' :
                    'bg-orange-650'
                  }`}>
                    {book.language === 'Japanese' ? 'GIAPPONESE' : 
                     book.language === 'Chinese' ? 'CINESE' : 
                     book.language === 'Korean' ? 'COREANO' :
                     book.language === 'Russian' ? 'RUSSO' :
                     book.language === 'Turkish' ? 'TURCO' :
                     book.language === 'Arabic' ? 'ARABO' :
                     book.language === 'Thai' ? 'THAI' : 'HINDI'}
                  </span>
                  
                  <span className="px-2 py-0.5 text-[9px] bg-slate-900/90 text-slate-100 font-bold tracking-wider uppercase rounded flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> {book.level}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold tracking-tight line-clamp-1">{book.title}</h3>
                </div>
              </div>

              {/* Book Content details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {book.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-y border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    {book.chapters.length} {book.chapters.length === 1 ? 'Capitolo' : 'Capitoli'}
                  </span>
                  
                  <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 font-mono text-[9px] uppercase font-bold text-slate-500">
                    ID: {book.id.substring(0, 8)}
                  </span>
                </div>

                {/* Call to Actions */}
                <div className="flex gap-2">
                  <button
                    id={`btn-read-${book.id}`}
                    onClick={() => {
                      if (book.chapters.length > 0) {
                        onSelectBook(book.id, book.chapters[0].id);
                      } else {
                        onSelectBook(book.id);
                      }
                    }}
                    className="flex-1 py-1.5 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded text-center flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" /> Leggi e Studia
                  </button>
                  <button
                    id={`btn-edit-${book.id}`}
                    onClick={() => onEditBook(book)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors rounded font-medium text-xs cursor-pointer"
                    title="Modifica contenuti, capitoli o parole"
                  >
                    Modifica
                  </button>
                  <button
                    id={`btn-export-html-${book.id}`}
                    onClick={() => exportBookToHTML(book)}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-100 transition-colors rounded focus:outline-none cursor-pointer"
                    title="Esporta libro come singolo file HTML Interattivo (TTE, esercizi, dialoghi)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-${book.id}`}
                    onClick={() => {
                      if(confirm(`Sei assolutamente sicuro di voler cancellare "${book.title}"? Questa operazione è irreversibile.`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 transition-colors rounded focus:outline-none cursor-pointer"
                    title="Elimina libro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-600" /> Crea Nuovo Libro Orientale
              </h2>
              <button 
                id="btn-close-modal"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitNewBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Titolo del Libro</label>
                <input
                  id="modal-book-title"
                  type="text"
                  required
                  placeholder="es. Giapponese per Viaggiatori Curiosi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-750 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Lingua Principale</label>
                  <select
                    id="modal-book-lang"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value as LanguageCode)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-755 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Japanese">Giapponese (日本語)</option>
                    <option value="Chinese">Cinese Mandarino (中文)</option>
                    <option value="Korean">Coreano (한국어)</option>
                    <option value="Russian">Russo (Русский)</option>
                    <option value="Turkish">Turco (Türkçe)</option>
                    <option value="Arabic">Arabo (العربية)</option>
                    <option value="Thai">Thai (ไทย)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Livello</label>
                  <select
                    id="modal-book-level"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as Book['level'])}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-755 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzato">Avanzato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Breve Descrizione</label>
                <textarea
                  id="modal-book-desc"
                  placeholder="Fornisci una breve spiegazione degli obiettivi del corso..."
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-750 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 text-sm">
                <button
                  id="btn-modal-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  id="btn-modal-submit"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Crea Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
