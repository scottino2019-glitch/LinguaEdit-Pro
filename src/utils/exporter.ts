/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Chapter, ContentBlock, LanguageCode } from '../types';

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  // Basic markdown translator
  let html = escapeHtml(text);
  
  // Replace newlines with breaks
  html = html.replace(/\r\n|\r|\n/g, '<br>');
  
  // Replace bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace backticks `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-blue-700">$1</code>');
  
  return html;
}

export function exportBookToHTML(book: Book) {
  const languageLabel = book.language === 'Japanese' ? 'GIAPPONESE' : 
                        book.language === 'Chinese' ? 'CINESE' : 
                        book.language === 'Korean' ? 'COREANO' :
                        book.language === 'Russian' ? 'RUSSO' :
                        book.language === 'Turkish' ? 'TURCO' :
                        book.language === 'Arabic' ? 'ARABO' :
                        book.language === 'Thai' ? 'THAI' : 'HINDI';
  const languageColorClass = book.language === 'Japanese' ? 'bg-rose-600' : 
                             book.language === 'Chinese' ? 'bg-amber-600' : 
                             book.language === 'Korean' ? 'bg-indigo-600' :
                             book.language === 'Russian' ? 'bg-red-600' :
                             book.language === 'Turkish' ? 'bg-pink-600' :
                             book.language === 'Arabic' ? 'bg-emerald-600' :
                             book.language === 'Thai' ? 'bg-fuchsia-600' : 'bg-orange-600';
  const displayDifficulty = book.level ? book.level.toUpperCase() : 'PRINCIPIANTE';
  
  // Start compiling chapters
  let chaptersIndexHtml = '';
  let chaptersContentHtml = '';
  
  book.chapters.forEach((chapter, index) => {
    const isFirst = index === 0;
    const cleanId = `chapter-${chapter.id}`;
    
    // Chapter selector item
    chaptersIndexHtml += `
      <button 
        id="nav-${cleanId}"
        onclick="showChapter('${cleanId}')" 
        class="chapter-nav-btn w-full flex items-center justify-between text-left px-3 py-2 rounded text-xs font-medium transition-all duration-150 cursor-pointer ${
          isFirst 
            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-105' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent'
        }"
      >
        <span class="truncate pr-2">${index + 1}. ${escapeHtml(chapter.title.replace(/^Capitolo\s+\d+:\s*/i, ''))}</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
      </button>
    `;
    
    // Chapter content panel
    chaptersContentHtml += `
      <div id="${cleanId}" class="chapter-content-panel space-y-6 ${isFirst ? '' : 'hidden'}">
        <!-- Chapter Header -->
        <div class="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-3">
          <span class="text-xs font-mono font-bold uppercase text-blue-600 flex items-center gap-1">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Capitolo ${index + 1}
          </span>
          <div class="space-y-1.5">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              ${escapeHtml(chapter.title)}
            </h1>
            <p class="text-sm text-slate-600 leading-relaxed">
              ${escapeHtml(chapter.description)}
            </p>
          </div>
        </div>
        
        <!-- Chapter Blocks -->
        <div class="space-y-6">
          ${chapter.blocks.map(block => renderBlockHtml(block, book.language)).join('')}
        </div>
      </div>
    `;
  });

  const finalHtmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(book.title)} - Lettore Interattivo</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Custom theme settings -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          borderWidth: {
            '105': '1.05pxpx'
          }
        }
      }
    }
  </script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
    }
    .speech-highlight {
      background-color: #f0fdf4 !important;
      border-color: #4ade80 !important;
      transform: scale(1.005);
    }
    .term-highlight {
      border-left: 2px solid #2563eb !important;
      background-color: #eff6ff !important;
    }
  </style>
</head>
<body class="min-h-screen text-slate-905 flex flex-col font-sans">

  <!-- Desktop Sticky Header -->
  <header class="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shrink-0 px-6 shadow-xs">
    <div class="max-w-7xl w-full mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
          L
        </div>
        <div>
          <span class="font-semibold text-sm sm:text-base tracking-tight text-slate-900">${escapeHtml(book.title)}</span>
          <span class="text-[10px] text-slate-400 font-mono ml-2 hidden sm:inline">Offline Reader</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 text-[9px] font-bold text-slate-100 ${languageColorClass} rounded uppercase">
          ${languageLabel}
        </span>
        <span class="px-2 py-0.5 text-[9px] bg-slate-900 text-white font-bold rounded uppercase">
          ${displayDifficulty}
        </span>
      </div>
    </div>
  </header>

  <!-- Interactive Sandbox Workspace Grid -->
  <main class="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Sidebar navigation (Chapters) -->
      <aside class="lg:col-span-3 bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-4">
        <div class="p-3 bg-slate-50 border border-slate-100 rounded space-y-1">
          <span class="text-[9px] text-blue-600 font-bold tracking-widest block uppercase">STUDIO OFFLINE</span>
          <h4 class="text-xs font-bold text-slate-800 leading-tight">${escapeHtml(book.title)}</h4>
          <p class="text-[10px] text-slate-400 leading-relaxed">${escapeHtml(book.description)}</p>
        </div>
        
        <div class="space-y-1">
          <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Capitoli Libro</span>
          <nav class="space-y-1" id="chapters-nav-list">
            ${chaptersIndexHtml}
          </nav>
        </div>
        
        <div class="pt-2 border-t border-slate-100 text-center">
          <span class="text-[9px] font-mono text-slate-400">Esportato con LinguaEdit Pro</span>
        </div>
      </aside>
      
      <!-- Chapter Core Reading Pane -->
      <section class="lg:col-span-9 space-y-6" id="chapters-content-container">
        ${chaptersContentHtml}
      </section>

    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
    <p>© ${new Date().getFullYear()} Generato da LinguaEdit Pro. Tutti i diritti riservati.</p>
    <p class="font-mono text-[10px] text-slate-300 mt-1">Sintesi vocale ed esercitazioni interattive realizzate in client puramente statico.</p>
  </footer>

  <!-- Vanilla Speech synthesis engine & interactives script -->
  <script>
    // System TTS Voice Selector
    let speechActiveElementId = null;

    function speakText(text, langName, elId) {
      if (!window.speechSynthesis) {
        alert("Sintesi vocale non supportata.");
        return;
      }
      
      window.speechSynthesis.cancel();
      
      // Select best culture
      let targetLang = 'ja-JP';
      if (langName === 'Chinese') targetLang = 'zh-CN';
      else if (langName === 'Korean') targetLang = 'ko-KR';
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      
      // Manage visual highlights
      if (speechActiveElementId) {
        const prev = document.getElementById(speechActiveElementId);
        if (prev) prev.classList.remove('speech-highlight', 'term-highlight');
      }
      
      if (elId) {
        speechActiveElementId = elId;
        const currentEl = document.getElementById(elId);
        if (currentEl) {
          if (currentEl.classList.contains('dialogue-row-bubble')) {
            currentEl.classList.add('speech-highlight');
          } else {
            currentEl.classList.add('term-highlight');
          }
        }
      }
      
      utterance.onend = () => {
        if (speechActiveElementId && elId === speechActiveElementId) {
          const currentEl = document.getElementById(elId);
          if (currentEl) currentEl.classList.remove('speech-highlight', 'term-highlight');
          speechActiveElementId = null;
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
    
    // Auto Dialogue autoplay
    let dialogueTimers = {};
    
    function playDialogueSpeech(blockId, langName) {
      const container = document.getElementById(blockId);
      const rows = container.querySelectorAll('.dialogue-row-bubble');
      const actionBtn = container.querySelector('.dialogue-play-btn');
      
      if (dialogueTimers[blockId]) {
        // Stop current
        clearInterval(dialogueTimers[blockId]);
        delete dialogueTimers[blockId];
        rows.forEach(r => r.classList.remove('speech-highlight'));
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        actionBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i> Ascolta Dialogo';
        lucide.createIcons();
        return;
      }
      
      actionBtn.innerHTML = '<i data-lucide="square" class="w-3.5 h-3.5"></i> Stop';
      lucide.createIcons();
      
      let cursor = 0;
      
      function readRow() {
        if (cursor >= rows.length) {
          delete dialogueTimers[blockId];
          rows.forEach(r => r.classList.remove('speech-highlight'));
          actionBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i> Ascolta Dialogo';
          lucide.createIcons();
          return;
        }
        
        rows.forEach((r, idx) => {
          if (idx === cursor) {
            r.classList.add('speech-highlight');
            // Scroll to view if out of screen
            r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            r.classList.remove('speech-highlight');
          }
        });
        
        const phrase = rows[cursor].getAttribute('data-phrase');
        speakText(phrase, langName, null);
        
        // Dynamic wait proportional to size
        const charactersCount = phrase.length;
        const delay = Math.max(2100, charactersCount * 220 + 900);
        
        cursor++;
        dialogueTimers[blockId] = setTimeout(readRow, delay);
      }
      
      readRow();
    }

    // Tab chapter switcher
    function showChapter(chapterId) {
      // Hide all chapters
      const panels = document.querySelectorAll('.chapter-content-panel');
      panels.forEach(p => p.classList.add('hidden'));
      
      // Show selected panel
      const targetPanel = document.getElementById(chapterId);
      if (targetPanel) targetPanel.classList.remove('hidden');
      
      // Select navbar button
      const navButtons = document.querySelectorAll('.chapter-nav-btn');
      navButtons.forEach(btn => {
        if (btn.id === 'nav-' + chapterId) {
          btn.className = "chapter-nav-btn w-full flex items-center justify-between text-left px-3 py-2 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-105 cursor-pointer";
        } else {
          btn.className = "chapter-nav-btn w-full flex items-center justify-between text-left px-3 py-2 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent cursor-pointer";
        }
      });
      
      // Scroll core screen back to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // MULTIPLE CHOICE EXERCISE HANDLERS
    function checkMC(btn, idx) {
      const parent = btn.closest('.exercise-mc-block');
      const correctIdx = parseInt(parent.getAttribute('data-correct-idx'));
      const options = parent.querySelectorAll('.mc-option-btn');
      const feedback = parent.querySelector('.feedback-msg');
      
      options.forEach((optBtn, oIdx) => {
        optBtn.disabled = true;
        if (oIdx === correctIdx) {
          optBtn.className = "mc-option-btn px-4 py-3 text-left text-xs sm:text-sm border rounded bg-emerald-600 border-emerald-600 text-white font-bold w-full flex justify-between items-center";
          optBtn.innerHTML += ' <i data-lucide="check-circle" class="w-4 h-4 text-emerald-100"></i>';
        } else if (oIdx === idx) {
          optBtn.className = "mc-option-btn px-4 py-3 text-left text-xs sm:text-sm border rounded bg-rose-600 border-rose-600 text-white font-bold w-full flex justify-between items-center";
          optBtn.innerHTML += ' <i data-lucide="x-circle" class="w-4 h-4 text-rose-100"></i>';
        } else {
          optBtn.className = "mc-option-btn px-4 py-3 text-left text-xs sm:text-sm border rounded text-slate-400 border-slate-100 opacity-60 w-full";
        }
      });
      
      feedback.classList.remove('hidden');
      if (idx === correctIdx) {
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500";
        feedback.innerText = "🎉 Risposta corretta! Ottimo lavoro.";
      } else {
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-rose-50 text-rose-800 border-l-4 border-rose-500";
        feedback.innerText = "❌ Risposta non corretta. No problem, vedi la risposta giusta selezionata in verde!";
      }
      lucide.createIcons();
    }

    function resetMC(btn) {
      const parent = btn.closest('.exercise-mc-block');
      const options = parent.querySelectorAll('.mc-option-btn');
      const feedback = parent.querySelector('.feedback-msg');
      feedback.classList.add('hidden');
      
      options.forEach((optBtn, oIdx) => {
        optBtn.disabled = false;
        optBtn.className = "mc-option-btn px-4 py-3 text-left text-xs sm:text-sm border border-slate-200 rounded hover:bg-slate-50 transition-colors w-full";
        optBtn.innerHTML = optBtn.getAttribute('data-raw-text') || optBtn.innerText;
      });
    }

    // FILL IN THE BLANKS HANDLERS
    function checkFB(btn) {
      const parent = btn.closest('.exercise-fb-block');
      const correctText = parent.getAttribute('data-correct-answer').trim().toLowerCase();
      const input = parent.querySelector('.fb-input');
      const userText = input.value.trim().toLowerCase();
      const feedback = parent.querySelector('.feedback-msg');
      
      input.disabled = true;
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      
      feedback.classList.remove('hidden');
      const isCorrect = userText === correctText;
      
      if (isCorrect) {
        input.className = "fb-input px-3 py-1 text-center w-40 text-sm font-bold rounded border-2 bg-emerald-600 border-emerald-600 text-white font-bold";
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500";
        feedback.innerText = "🎉 Risposta corretta! Eccellente trascrizione.";
      } else {
        input.className = "fb-input px-3 py-1 text-center w-40 text-sm font-bold rounded border-2 bg-rose-600 border-rose-600 text-white font-bold";
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-rose-50 text-rose-800 border-l-4 border-rose-500";
        feedback.innerText = '❌ Risposta errata. Hai immesso "' + input.value + '", ma la soluzione corretta era "' + parent.getAttribute('data-correct-answer') + '".';
      }
    }

    function resetFB(btn) {
      const parent = btn.closest('.exercise-fb-block');
      const input = parent.querySelector('.fb-input');
      const verifyBtn = parent.querySelector('.fb-verify-btn');
      const feedback = parent.querySelector('.feedback-msg');
      
      feedback.classList.add('hidden');
      input.disabled = false;
      input.value = '';
      input.className = "fb-input px-3 py-1 text-center w-40 text-sm font-bold rounded border-2 border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-800";
      verifyBtn.disabled = false;
      verifyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // WORD REORDER INTERACTIVE HANDLERS
    function toggleReorderWord(btn, word) {
      if (btn.classList.contains('opacity-45')) return; // Already clicked
      
      const parent = btn.closest('.exercise-reorder-block');
      const target = parent.querySelector('.reorder-target-container');
      const placeholder = target.querySelector('.placeholder-text');
      
      if (placeholder) placeholder.remove();
      
      // Make source look inactive
      btn.classList.add('opacity-45', 'bg-slate-50', 'text-slate-300', 'cursor-not-allowed');
      btn.disabled = true;
      
      // Add bubble to target
      const span = document.createElement('span');
      span.className = "target-bubble px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded border border-blue-500 font-sans cursor-pointer flex items-center";
      span.innerText = word;
      target.appendChild(span);
    }

    function checkReorder(btn) {
      const parent = btn.closest('.exercise-reorder-block');
      const target = parent.querySelector('.reorder-target-container');
      const feedback = parent.querySelector('.feedback-msg');
      const bubbles = target.querySelectorAll('.target-bubble');
      
      const selectedArr = Array.from(bubbles).map(b => b.innerText);
      const userSentence = selectedArr.join(' ');
      const correctSentence = parent.getAttribute('data-correct-sentence').trim();
      
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      feedback.classList.remove('hidden');
      
      const isCorrect = userSentence.replace(/\\s+/g, '') === correctSentence.replace(/\\s+/g, '');
      
      if (isCorrect) {
        bubbles.forEach(b => {
          b.className = "target-bubble px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded border border-emerald-500 font-sans";
        });
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500";
        feedback.innerText = "🎉 Risposta corretta! Sintassi logica impeccabile.";
      } else {
        bubbles.forEach(b => {
          b.className = "target-bubble px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded border border-rose-500 font-sans";
        });
        feedback.className = "feedback-msg p-3 rounded text-xs font-semibold bg-rose-50 text-rose-800 border-l-4 border-rose-500";
        feedback.innerText = '❌ Ordine errato. Hai composto "' + (userSentence || '[Frase vuota]') + '". La soluzione corretta è: "' + correctSentence + '"';
      }
    }

    function resetReorder(btn) {
      const parent = btn.closest('.exercise-reorder-block');
      const target = parent.querySelector('.reorder-target-container');
      const sources = parent.querySelectorAll('.reorder-source-btn');
      const verifyBtn = parent.querySelector('.reorder-verify-btn');
      const feedback = parent.querySelector('.feedback-msg');
      
      feedback.classList.add('hidden');
      verifyBtn.disabled = false;
      verifyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      
      target.innerHTML = '<span class="placeholder-text text-xs text-slate-400 select-none italic">Seleziona le parole in ordine logico per comporre la frase</span>';
      
      sources.forEach(sBtn => {
        sBtn.disabled = false;
        sBtn.className = "reorder-source-btn px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 rounded hover:border-blue-400 shadow-xs transition-all cursor-pointer";
      });
    }

    // Initialize Lucide
    window.addEventListener('load', () => {
      lucide.createIcons();
    });
  </script>
</body>
</html>`;

  // Start download anchor flow
  const blob = new Blob([finalHtmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", url);
  
  // Create safe filename (remove accents and symbols)
  const cleanFilename = book.title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéeêë]/g, "e")
    .replace(/[iìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9_.-]+/g, "_") + "_interactive_book.html";
    
  downloadAnchor.setAttribute("download", cleanFilename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

function renderBlockHtml(block: ContentBlock, language: LanguageCode): string {
  switch (block.type) {
    case 'image':
      return `
        <!-- Image block -->
        <div id="block-card-${block.id}" class="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs space-y-2 group">
          <div class="relative h-60 md:h-80 w-full overflow-hidden bg-slate-100">
            <img 
              src="${escapeHtml(block.imageUrl || '')}" 
              alt="${escapeHtml(block.imageCaption || '')}"
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <p class="text-sm font-medium italic text-slate-100">
                ${escapeHtml(block.imageCaption || 'Un frammento evocativo dell Estremo Oriente.')}
              </p>
            </div>
          </div>
        </div>
      `;
      
    case 'grammar':
      return `
        <!-- Grammar explanatory block -->
        <div id="block-card-${block.id}" class="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4">
          <div class="flex items-center gap-2.5 text-blue-600">
            <div class="p-2 bg-blue-50 rounded">
              <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i>
            </div>
            <div>
              <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">SPIEGAZIONE GRAMMATICALE</span>
              <h3 class="text-base font-bold text-slate-900">${escapeHtml(block.grammarTitle || 'Grammatica Corrente')}</h3>
            </div>
          </div>
          
          <div class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded border border-slate-150 font-sans whitespace-pre-wrap">
            ${renderMarkdown(block.grammarText || '')}
          </div>
          
          ${block.grammarTerms && block.grammarTerms.length > 0 ? `
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-400 block pl-0.5 uppercase tracking-wider">TERMINI DI RIFERIMENTO (Premi per l'audio)</span>
              
              <div class="border border-slate-200 rounded overflow-hidden text-xs">
                <!-- Table Header -->
                <div class="grid grid-cols-12 bg-slate-100 px-4 py-2 font-semibold text-slate-600 border-b border-slate-200">
                  <div class="col-span-5">Carattere Originale</div>
                  <div class="col-span-3">Trascrizione / Fonetica</div>
                  <div class="col-span-4">Traduzione</div>
                </div>
                
                <!-- Table Rows -->
                <div class="divide-y divide-slate-100 bg-white">
                  ${block.grammarTerms.map((term, tIdx) => {
                    const elId = `${block.id}-term-${tIdx}`;
                    return `
                      <div 
                        id="${elId}"
                        onclick="speakText('${escapeHtml(term.term)}', '${language}', '${elId}')"
                        class="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50 cursor-pointer transition-colors text-slate-705 border-l-2 border-l-transparent"
                      >
                        <div class="col-span-5 font-bold text-sm tracking-wide flex items-center gap-2">
                          <i data-lucide="volume-2" class="w-4 h-4 shrink-0 text-slate-300"></i>
                          <span>${escapeHtml(term.term)}</span>
                        </div>
                        <div class="col-span-3 font-mono text-slate-400 font-medium">${escapeHtml(term.phonetic)}</div>
                        <div class="col-span-4 text-slate-600">${escapeHtml(term.translation)}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
      
    case 'dialogue':
      return `
        <!-- Dialogue dialogue block -->
        <div id="block-card-${block.id}" class="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-2.5 text-blue-600">
              <div class="p-2 bg-blue-50 rounded">
                <i data-lucide="message-square" class="w-5 h-5 text-blue-600"></i>
              </div>
              <div>
                <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">DIALOGO INTERATTIVO (Ascolta e Ripeti)</span>
                <h3 class="text-base font-bold text-slate-900">${escapeHtml(block.dialogueTitle || 'Dialogo')}</h3>
              </div>
            </div>
            
            <button 
              id="btn-play-dialogue-${block.id}"
              onclick="playDialogueSpeech('${block.id}', '${language}')"
              class="dialogue-play-btn px-4 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs border bg-blue-50 text-blue-700 border-blue-105"
            >
              <i data-lucide="play" class="w-3.5 h-3.5"></i> Ascolta Dialogo
            </button>
          </div>
          
          <div class="space-y-3.5">
            ${(block.dialogueLines || []).map((line, lIdx) => {
              const isRightSide = lIdx % 2 !== 0;
              const elId = `${block.id}-dialogue-line-${lIdx}`;
              return `
                <div class="flex items-start gap-3 ${isRightSide ? 'flex-row-reverse' : ''}">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs border bg-slate-100 text-slate-800 border-slate-200">
                    ${escapeHtml(line.character.trim().charAt(0))}
                  </div>
                  
                  <div 
                    id="${elId}"
                    onclick="speakText('${escapeHtml(line.text)}', '${language}', '${elId}')"
                    data-phrase="${escapeHtml(line.text)}"
                    class="dialogue-row-bubble rounded-md p-3.5 space-y-1 group relative transition-all border cursor-pointer max-w-sm hover:bg-slate-50/50 border-slate-200 bg-white"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        ${escapeHtml(line.character)}
                      </span>
                      <i data-lucide="volume-2" class="w-3.5 h-3.5 text-slate-300"></i>
                    </div>
                    
                    <p class="font-sans text-sm tracking-wide text-slate-800">
                      ${escapeHtml(line.text)}
                    </p>
                    
                    <p class="font-mono text-[10px] text-slate-400 pt-0.5 font-medium leading-none">
                      ${escapeHtml(line.phonetic)}
                    </p>
                    
                    <div class="border-t border-slate-100 pt-1.5 mt-1.5">
                      <p class="text-xs text-slate-500 italic">
                        ${escapeHtml(line.translation)}
                      </p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
    case 'vocabulary':
      return `
        <!-- Vocabulary List blocks -->
        <div id="block-card-${block.id}" class="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4">
          <div class="flex items-center gap-2.5 text-amber-600 border-b border-slate-100 pb-3">
            <div class="p-2 bg-amber-50 rounded">
              <i data-lucide="compass" class="w-5 h-5 text-amber-600"></i>
            </div>
            <div>
              <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">CARTE DI PRONUNCIA & VOCABOLI</span>
              <h3 class="text-base font-bold text-slate-900">Parole Nuove del Giorno</h3>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(block.vocabularyList || []).map((vocab, vIdx) => {
              const elId = `${block.id}-vocab-${vIdx}`;
              const elExId = `${block.id}-vocab-ex-${vIdx}`;
              return `
                <div 
                  class="border rounded-md p-4 flex flex-col justify-between space-y-3.5 hover:shadow-xs transition-all bg-slate-50/30 border-slate-200"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-1">
                      <h4 class="text-lg font-bold text-slate-900 leading-tight">${escapeHtml(vocab.term)}</h4>
                      <p class="font-mono text-xs text-slate-400 font-semibold">${escapeHtml(vocab.phonetic)}</p>
                    </div>
                    
                    <button 
                      onclick="speakText('${escapeHtml(vocab.term)}', '${language}', '${elId}')"
                      id="${elId}"
                      class="p-2 rounded-full cursor-pointer transition-colors bg-white hover:bg-slate-100 text-slate-400 border border-slate-200"
                      title="Ascolta pronuncia"
                    >
                      <i data-lucide="volume-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  
                  <div class="bg-white rounded px-3 py-1.5 border border-slate-200 text-xs">
                    <span class="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">Traduzione</span>
                    <span class="text-slate-700 font-medium font-sans">${escapeHtml(vocab.translation)}</span>
                  </div>
                  
                  ${vocab.example ? `
                    <div class="border-t border-slate-200 pt-2 space-y-1">
                      <span class="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Frase di Esempio</span>
                      
                      <div class="flex justify-between items-center bg-white/70 rounded p-2 border border-slate-200">
                        <div class="text-[11px] space-y-0.5 flex-1 pr-1.5">
                          <div class="font-bold text-slate-800">${escapeHtml(vocab.example)}</div>
                          <div class="font-mono text-[10px] text-slate-400 font-medium leading-none">${escapeHtml(vocab.examplePhonetic || '')}</div>
                          <p class="text-slate-500 italic mt-1 leading-normal">${escapeHtml(vocab.exampleTranslation || '')}</p>
                        </div>
                        
                        <button 
                          onclick="speakText('${escapeHtml(vocab.example)}', '${language}', '${elExId}')"
                          id="${elExId}"
                          class="p-1.5 rounded-full cursor-pointer shrink-0 transition-colors hover:bg-slate-100 text-slate-400"
                          title="Ascolta Frase di Esempio"
                        >
                          <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
    case 'exercise':
      if (block.exerciseType === 'multiple-choice') {
        return `
          <!-- Exercise Multiple Choice -->
          <div id="block-card-${block.id}" class="exercise-mc-block bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4" data-correct-idx="${block.mcCorrectIndex || 0}">
            <div class="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
              <div class="flex items-center gap-2.5 text-blue-600">
                <div class="p-2 bg-blue-50 rounded">
                  <i data-lucide="help-circle" class="w-5 h-5 text-blue-600"></i>
                </div>
                <div>
                  <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - SCELTA MULTIPLA</span>
                  <h4 class="text-sm font-bold text-slate-900">${escapeHtml(block.exerciseQuestion || '')}</h4>
                </div>
              </div>
              
              <button 
                onclick="resetMC(this)"
                class="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Ripristina
              </button>
            </div>
            
            ${block.exerciseNote ? `
              <p class="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-150">
                💡 ${escapeHtml(block.exerciseNote)}
              </p>
            ` : ''}
            
            <div class="grid gap-2">
              ${(block.mcOptions || []).map((opt, oIdx) => `
                <button 
                  onclick="checkMC(this, ${oIdx})"
                  data-raw-text="${escapeHtml(opt)}"
                  class="mc-option-btn px-4 py-3 text-left text-xs sm:text-sm border border-slate-200 rounded hover:bg-slate-50 transition-colors w-full"
                >
                  ${escapeHtml(opt)}
                </button>
              `).join('')}
            </div>
            
            <div class="feedback-msg hidden p-3 rounded text-xs font-semibold"></div>
          </div>
        `;
      } else if (block.exerciseType === 'fill-blank') {
        return `
          <!-- Exercise Fill-in-the-gap -->
          <div id="block-card-${block.id}" class="exercise-fb-block bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4" data-correct-answer="${escapeHtml(block.fbCorrectAnswer || '')}">
            <div class="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
              <div class="flex items-center gap-2.5 text-blue-600">
                <div class="p-2 bg-blue-50 rounded">
                  <i data-lucide="help-circle" class="w-5 h-5 text-blue-600"></i>
                </div>
                <div>
                  <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - COMPLETA LA FRASE</span>
                  <h4 class="text-sm font-bold text-slate-900">${escapeHtml(block.exerciseQuestion || '')}</h4>
                </div>
              </div>
              
              <button 
                onclick="resetFB(this)"
                class="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Ripristina
              </button>
            </div>
            
            ${block.exerciseNote ? `
              <p class="text-xs text-slate-505 bg-slate-50 p-2.5 rounded border border-slate-150">
                💡 ${escapeHtml(block.exerciseNote)}
              </p>
            ` : ''}
            
            <div class="py-4 px-6 bg-slate-50 rounded flex flex-wrap items-center justify-center gap-2 text-md border border-slate-200 font-sans">
              <span class="text-slate-605 font-bold tracking-wide">${escapeHtml(block.fbSentenceBefore || '')}</span>
              
              <input 
                type="text"
                class="fb-input px-3 py-1 text-center w-40 text-sm font-bold rounded border bg-white border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="..."
              />
              
              <span class="text-slate-605 font-bold tracking-wide">${escapeHtml(block.fbSentenceAfter || '')}</span>
            </div>
            
            <div class="flex gap-2 justify-end">
              <button 
                onclick="checkFB(this)"
                class="fb-verify-btn px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Verifica Soluzione
              </button>
            </div>
            
            <div class="feedback-msg hidden p-3 rounded text-xs font-semibold"></div>
          </div>
        `;
      } else {
        // Reorder word puzzle
        const originalWords = block.reorderWords || [];
        // Just simple shuffle logic by index for visual random order
        const shuffledWords = [...originalWords].sort(() => 0.5 - Math.random());
        
        return `
          <!-- Exercise Word order puzzle -->
          <div id="block-card-${block.id}" class="exercise-reorder-block bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4" data-correct-sentence="${escapeHtml(block.reorderCorrectOrder || '')}">
            <div class="flex justify-between items-start gap-4 border-b border-slate-150 pb-3">
              <div class="flex items-center gap-2.5 text-blue-600">
                <div class="p-2 bg-blue-50 rounded">
                  <i data-lucide="help-circle" class="w-5 h-5 text-blue-600"></i>
                </div>
                <div>
                  <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">ESERCIZIO - COMBINA LE PAROLE</span>
                  <h4 class="text-sm font-bold text-slate-900">${escapeHtml(block.exerciseQuestion || '')}</h4>
                </div>
              </div>
              
              <button 
                onclick="resetReorder(this)"
                class="text-blue-600 hover:text-blue-750 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Ripristina
              </button>
            </div>
            
            ${block.exerciseNote ? `
              <p class="text-xs text-slate-505 bg-slate-50 p-2.5 rounded border border-slate-150">
                💡 ${escapeHtml(block.exerciseNote)}
              </p>
            ` : ''}
            
            <!-- target bubbles assembly area -->
            <div class="reorder-target-container min-h-14 p-4 bg-slate-50 border border-slate-150 rounded flex flex-wrap gap-2 items-center justify-center">
              <span class="placeholder-text text-xs text-slate-400 select-none italic">Seleziona le parole in basso in ordine logico per ordinare la frase</span>
            </div>
            
            <!-- Source items row -->
            <div class="flex flex-wrap gap-1.5 justify-center py-2">
              ${shuffledWords.map((word, wIdx) => `
                <button 
                  onclick="toggleReorderWord(this, '${escapeHtml(word).replace(/'/g, "\\'")}')"
                  class="reorder-source-btn px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 rounded hover:border-blue-400 shadow-xs transition-all cursor-pointer"
                >
                  ${escapeHtml(word)}
                </button>
              `).join('')}
            </div>
            
            <div class="flex justify-end pt-1">
              <button 
                onclick="checkReorder(this)"
                class="reorder-verify-btn px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Verifica Ordine
              </button>
            </div>
            
            <div class="feedback-msg hidden p-3 rounded text-xs font-semibold"></div>
          </div>
        `;
      }
      
    case 'video':
      // Extract code or compute safe youtube embed code
      let embedUrl = block.videoUrl || '';
      if (embedUrl.includes('youtube.com/watch?v=')) {
        const vCode = embedUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${vCode}`;
      } else if (embedUrl.includes('youtu.be/')) {
        const vCode = embedUrl.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${vCode}`;
      }
      
      return `
        <!-- Reference Video Block -->
        <div id="block-card-${block.id}" class="bg-white border border-slate-200 rounded-md p-6 shadow-xs space-y-4">
          <div class="flex items-center gap-2.5 text-blue-600 border-b border-slate-100 pb-3">
            <div class="p-2 bg-blue-50 rounded">
              <i data-lucide="film" class="w-5 h-5 text-blue-600"></i>
            </div>
            <div>
              <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400">VIDEO DI APPROFONDIMENTO</span>
              <h3 class="text-base font-bold text-slate-900">${escapeHtml(block.videoCaption || 'Approfondimento Video')}</h3>
            </div>
          </div>
          
          <div class="relative rounded overflow-hidden aspect-video bg-black shadow-inner border border-slate-200">
            <iframe 
              class="absolute inset-0 w-full h-full"
              src="${escapeHtml(embedUrl)}" 
              title="Video Player"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </div>
      `;
      
    default:
      return '';
  }
}
