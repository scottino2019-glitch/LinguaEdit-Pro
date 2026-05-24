/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header according to gemini-api guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// AI Chapter generator endpoint
app.post('/api/generate-chapter', async (req, res) => {
  const { language, topic, level } = req.body;

  if (!language || !topic || !level) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti: language, topic, level.' });
  }

  // Define structured JSON schema for textbook output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Titolo in italiano evocativo del capitolo, es: Capitolo: Alla scoperta del Ramen' },
      description: { type: Type.STRING, description: 'Presentazione degli obiettivi didattici e del contesto culturale in italiano' },
      blocks: {
        type: Type.ARRAY,
        description: 'Sequenza strutturata di blocchi educativi interattivi',
        items: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              description: 'Il tipo di blocco. Valori ammessi: grammar, dialogue, vocabulary, exercise, image' 
            },
            
            // Grammar Block fields
            grammarTitle: { type: Type.STRING, description: 'Titolo della nota grammaticale' },
            grammarText: { type: Type.STRING, description: 'Spiegazione approfondita delle regole in italiano, includendo brevi specchietti e paragrafi. Supporta formattazione Markdown.' },
            grammarTerms: {
              type: Type.ARRAY,
              description: 'Termini salienti associati alla regola',
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: 'Termine originale in kanji/kana, caratteri cinesi o hangeul con pronuncia tra parentesi se rilevante' },
                  phonetic: { type: Type.STRING, description: 'Trascrizione fonetica (Pinyin/Rōmaji/Coreano romanizzato)' },
                  translation: { type: Type.STRING, description: 'Traduzione in italiano' }
                },
                required: ['term', 'phonetic', 'translation']
              }
            },

            // Dialogue Block fields
            dialogueTitle: { type: Type.STRING, description: 'Titolo del contesto della conversazione' },
            dialogueCharacters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Nomi dei personaggi coinvolti (massimo 2 per semplicità)'
            },
            dialogueLines: {
              type: Type.ARRAY,
              description: 'Flusso di battute tra i parlanti',
              items: {
                type: Type.OBJECT,
                properties: {
                  character: { type: Type.STRING, description: 'Nome del parlante' },
                  text: { type: Type.STRING, description: 'Battuta nativa autentica nella lingua orientale' },
                  phonetic: { type: Type.STRING, description: 'Pronuncia fonetica accurata (Rōmaji, Pinyin o trascrizione coreana)' },
                  translation: { type: Type.STRING, description: 'Traduzione fedele in italiano' }
                },
                required: ['character', 'text', 'phonetic', 'translation']
              }
            },

            // Vocabulary Block fields
            vocabularyList: {
              type: Type.ARRAY,
              description: 'Sillaboro o carte di pronuncia vocabolario',
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: 'Parola originale' },
                  phonetic: { type: Type.STRING, description: 'Trascrizione fonetica' },
                  translation: { type: Type.STRING, description: 'Traduzione italiana' },
                  example: { type: Type.STRING, description: 'Breve frase di esempio nativa (facoltativa)' },
                  examplePhonetic: { type: Type.STRING, description: 'Pronuncia dell\'esempio (facoltativa)' },
                  exampleTranslation: { type: Type.STRING, description: 'Traduzione dell\'esempio (facoltativa)' }
                },
                required: ['term', 'phonetic', 'translation']
              }
            },

            // Exercise Block fields
            exerciseType: { 
              type: Type.STRING, 
              description: 'Tipo di esercizio. Valori: multiple-choice, fill-blank, reorder' 
            },
            exerciseQuestion: { type: Type.STRING, description: 'Testo dell\'esercizio o consegna in italiano' },
            exerciseNote: { type: Type.STRING, description: 'Suggerimento o commento chiarificatore' },
            // Multiple-choice options
            mcOptions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Array di esattamente 4 opzioni di risposta' 
            },
            mcCorrectIndex: { type: Type.INTEGER, description: 'Indice corretto (0-3)' },
            // Fill in the blanks options
            fbSentenceBefore: { type: Type.STRING, description: 'Testo prima del buco' },
            fbSentenceAfter: { type: Type.STRING, description: 'Testo dopo il buco' },
            fbCorrectAnswer: { type: Type.STRING, description: 'Parola nativa esatta da scrivere per riempire' },
            // Reorder puzzle options
            reorderWords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Lista di parole native disordinate da trascinare/ordinare' 
            },
            reorderCorrectOrder: { type: Type.STRING, description: 'La frase riordinata corretta formata unendo i singoli elementi' },

            // Image block fields
            imageUrl: { type: Type.STRING, description: 'Lasciare vuoto. Verrà selezionato un fallback locale o riempito su richiesta.' },
            imageCaption: { type: Type.STRING, description: 'Didascalia romantica / culturale sull\'immagine in italiano' }
          },
          required: ['type']
        }
      }
    },
    required: ['title', 'description', 'blocks']
  };

  try {
    const systemPrompt = `Sei un professore d'eccellenza specializzato nell'insegnamento di ${language} (${level}) a studenti italiani.
Crea una lezione molto sintetica, focalizzata, di massimo 4 blocchi in totale:
1 Blocco Grammar (spiegazione corta di 1 regola + max 2 termini salienti).
1 Blocco Dialogue (una conversazione vivace di sole 2 o 3 battute totali).
1 Blocco Vocabulary (con soli 2 termini importanti + 1 frase ciascuno).
1 Blocco Exercise (tipo scelta multipla o completa la frase molto semplice).
È fondamentale che la lezione sia breve per generare in meno di 5 secondi. Scrivi spiegazioni e consegne esclusivamente in italiano.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Genera una micro-lezione per ${language} (${level}) su tema: ${topic}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Nessuna risposta ricevuta dal modello Gemini.');
    }

    const parsedData = JSON.parse(outputText);
    
    // Inject beautiful default images based on language & topic to enrich output
    let defaultImageUrl = 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800'; // Japan
    if (language === 'Chinese') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800'; // China
    } else if (language === 'Korean') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800'; // Korea
    } else if (language === 'Russian') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1512495039889-52a3b799c9bc?auto=format&fit=crop&q=80&w=800'; // Russia
    } else if (language === 'Turkish') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800'; // Turkey
    } else if (language === 'Arabic') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800'; // Arab Countries
    } else if (language === 'Thai') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800'; // Thailand
    } else if (language === 'Hindi') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800'; // India
    }

    // Adapt image blocks to have a fallbacks if empty
    if (parsedData.blocks) {
      parsedData.blocks = parsedData.blocks.map((block: any, idx: number) => {
        if (block.type === 'image' && !block.imageUrl) {
          block.imageUrl = defaultImageUrl;
        }
        return block;
      });
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Errore durante la generazione del capitolo:', error);
    return res.status(500).json({ 
      error: 'Impossibile generare il capitolo con l\'AI.',
      details: error.message || error 
    });
  }
});

// Serve static build or mount Vite dev middleware
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server d'apprendimento delle lingue orientali attivo sulla porta ${PORT}`);
  });
}

setupServer();
