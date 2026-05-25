import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Titolo in italiano evocativo del capitolo, es: Capitolo: Alla scoperta del Ramen' },
      description: { type: Type.STRING, description: 'Presentazione degli obiettivi didattici e del contesto culturale in italiano' },
      
      // Grammar Block fields
      grammarTitle: { type: Type.STRING, description: 'Titolo della nota grammaticale (es. La particella wa)' },
      grammarText: { type: Type.STRING, description: 'Spiegazione approfondita delle regole in italiano. Supporta formattazione Markdown.' },
      grammarTerms: {
        type: Type.ARRAY,
        description: 'Termini e vocaboli salienti associati alla regola grammaticale',
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: 'Termine originale' },
            phonetic: { type: Type.STRING, description: 'Trascrizione fonetica (Romaji/Pinyin/hangeul pronuncia)' },
            translation: { type: Type.STRING, description: 'Traduzione italiana' }
          },
          required: ['term', 'phonetic', 'translation']
        }
      },

      // Dialogue Block fields
      dialogueTitle: { type: Type.STRING, description: 'Titolo del contesto della conversazione' },
      dialogueCharacters: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Nomi dei personaggi'
      },
      dialogueLines: {
        type: Type.ARRAY,
        description: 'Un flusso di battute alternate tra i personaggi',
        items: {
          type: Type.OBJECT,
          properties: {
            character: { type: Type.STRING, description: 'Nome del parlante' },
            text: { type: Type.STRING, description: 'Frase originale nella lingua nativa' },
            phonetic: { type: Type.STRING, description: 'Fonetica o pronuncia della frase' },
            translation: { type: Type.STRING, description: 'Traduzione in italiano' }
          },
          required: ['character', 'text', 'phonetic', 'translation']
        }
      },

      // Vocabulary Block fields
      vocabularyList: {
        type: Type.ARRAY,
        description: 'Vocaboli chiave legati al tema della lezione',
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: 'Parola originale' },
            phonetic: { type: Type.STRING, description: 'Trascrizione fonetica' },
            translation: { type: Type.STRING, description: 'Traduzione' },
            example: { type: Type.STRING, description: 'Frase di esempio nativa' },
            examplePhonetic: { type: Type.STRING, description: 'Pronuncia dell\'esempio' },
            exampleTranslation: { type: Type.STRING, description: 'Traduzione dell\'esempio' }
          },
          required: ['term', 'phonetic', 'translation', 'example', 'examplePhonetic', 'exampleTranslation']
        }
      },

      // Exercise Block fields
      exerciseType: { 
        type: Type.STRING, 
        description: 'Tipo di esercizio. Valori strettamente ammessi: multiple-choice, fill-blank, reorder' 
      },
      exerciseQuestion: { type: Type.STRING, description: 'Consegna dell\'esercizio o domanda in italiano' },
      exerciseNote: { type: Type.STRING, description: 'Suggerimento didattico in italiano' },
      
      // Multiple-choice options
      mcOptions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: 'Fornire esattamente 4 opzioni di risposta se tipo multiple-choice' 
      },
      mcCorrectIndex: { type: Type.INTEGER, description: 'Indice della risposta corretta (0-3)' },
      
      // Fill in the blanks options
      fbSentenceBefore: { type: Type.STRING, description: 'Testo prima del buco' },
      fbSentenceAfter: { type: Type.STRING, description: 'Testo dopo il buco' },
      fbCorrectAnswer: { type: Type.STRING, description: 'La singola parola nativa corretta che va nel buco' },
      
      // Reorder puzzle options
      reorderWords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Lista di parole native disordinate'
      },
      reorderCorrectOrder: { type: Type.STRING, description: 'Tutta la frase ordinata formata unendo i singoli elementi' }
    },
    required: [
      'title', 'description', 
      'grammarTitle', 'grammarText', 'grammarTerms',
      'dialogueTitle', 'dialogueCharacters', 'dialogueLines',
      'vocabularyList',
      'exerciseType', 'exerciseQuestion', 'exerciseNote'
    ]
  };

  const systemPrompt = `Sei un professore d'eccellenza e madrelingua specializzato nell'insegnamento di Giapponese (Principiante) a studenti italiani.
Crea una lezione estremamente ricca, completa e curata nei dettagli, impostando e completando accuratamente tutti i parametri della risposta.

1. Sezioni della lezione da compilare:
   - Grammatica: Spiega con precisione in italiano una regola d'importazione e fornisci almeno 2 o 3 termini salienti di riferimento in "grammarTerms".
   - Dialogo: Compila "dialogueTitle" e fai parlare i personaggi con almeno 3/4 battute in "dialogueLines".
   - Vocabolario: Configura almeno 4-5 parole chiave in "vocabularyList", completando per ognuna parola, fonetica, traduzione, frase d'esempio, frase d'esempio fonetica e traduzione frase d'esempio.
   - Esercizio: Progetta un ottimo esercizio d'apprendimento ('multiple-choice', 'fill-blank' o 'reorder') riempiendo le proprietà corrispondenti al tipo stabilito.

La risposta deve assolutamente valorizzare tutte le chiavi richieste nel formato JSON specificato. Ogni traduzione, spiegazione, e consegna deve essere in lingua italiana.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Genera una micro-lezione per Giapponese (Principiante) su tema: Al Ristorante di Sushi',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.3
      }
    });
    console.log("RESPONSE FROM GEMINI:");
    console.log(response.text);
  } catch (err) {
    console.error("ERROR IN GEN:", err);
  }
}

run();
