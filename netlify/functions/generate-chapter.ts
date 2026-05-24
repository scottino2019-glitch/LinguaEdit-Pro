import { GoogleGenAI, Type } from '@google/genai';

export const handler = async (event: any) => {
  // Support CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests for generation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Metodo non consentito. Utilizzare POST.' })
    };
  }

  try {
    const { language, topic, level } = JSON.parse(event.body || '{}');

    if (!language || !topic || !level) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Campi obbligatori mancanti: language, topic, level.' })
      };
    }

    // Initialize Gemini SDK with telemetry header
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'La variabile d\'ambiente GEMINI_API_KEY non è configurata su Netlify.' })
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Titolo in italiano evocativo del capitolo, es: Capitolo: Alla scoperta del Ramen' },
        description: { type: Type.STRING, description: 'Presentazione degli obiettivi didattici e del contesto culturale in italiano' },
        blocks: {
          type: Type.ARRAY,
          description: 'Sequenza strutturata di massimo 4 blocchi didattici interattivi',
          items: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING, 
                description: 'Il tipo di blocco. Valori ammessi: grammar, dialogue, vocabulary, exercise, image' 
              },
              
              // Grammar Block fields
              grammarTitle: { type: Type.STRING, description: 'Titolo della nota grammaticale' },
              grammarText: { type: Type.STRING, description: 'Spiegazione sintetica ed efficace in italiano (2 paragrafi max).' },
              grammarTerms: {
                type: Type.ARRAY,
                description: 'Termini salienti (massimo 2 per brevità)',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: 'Termine originale' },
                    phonetic: { type: Type.STRING, description: 'Fonetica' },
                    translation: { type: Type.STRING, description: 'Traduzione' }
                  },
                  required: ['term', 'phonetic', 'translation']
                }
              },

              // Dialogue Block fields
              dialogueTitle: { type: Type.STRING, description: 'Contesto' },
              dialogueCharacters: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              dialogueLines: {
                type: Type.ARRAY,
                description: 'Battute corte (massimo 2-3 battute totali per velocità)',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    character: { type: Type.STRING, description: 'Parlante' },
                    text: { type: Type.STRING, description: 'Frase originale' },
                    phonetic: { type: Type.STRING, description: 'Trascrizione fonetica' },
                    translation: { type: Type.STRING, description: 'Traduzione italiana' }
                  },
                  required: ['character', 'text', 'phonetic', 'translation']
                }
              },

              // Vocabulary Block fields
              vocabularyList: {
                type: Type.ARRAY,
                description: 'Massimo 2-3 vocaboli per rapidità di generazione',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: 'Parola originale' },
                    phonetic: { type: Type.STRING, description: 'Trascrizione fonetica' },
                    translation: { type: Type.STRING, description: 'Traduzione' },
                    example: { type: Type.STRING, description: 'Frase esempio (opzionale)' },
                    examplePhonetic: { type: Type.STRING, description: 'Pronuncia' },
                    exampleTranslation: { type: Type.STRING, description: 'Traduzione esempio' }
                  },
                  required: ['term', 'phonetic', 'translation']
                }
              },

              // Exercise Block fields
              exerciseType: { 
                type: Type.STRING, 
                description: 'Tipo di esercizio. Valori: multiple-choice, fill-blank, reorder' 
              },
              exerciseQuestion: { type: Type.STRING, description: 'Consegna esercizio in italiano' },
              exerciseNote: { type: Type.STRING, description: 'Suggerimento' },
              mcOptions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: 'Esattamente 4 opzioni' 
              },
              mcCorrectIndex: { type: Type.INTEGER, description: 'Indice corretto (0-3)' },
              fbSentenceBefore: { type: Type.STRING, description: 'Prima' },
              fbSentenceAfter: { type: Type.STRING, description: 'Dopo' },
              fbCorrectAnswer: { type: Type.STRING, description: 'Parola corretta' },
              reorderWords: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              reorderCorrectOrder: { type: Type.STRING },

              // Image block fields
              imageUrl: { type: Type.STRING, description: 'Lasciare vuoto' },
              imageCaption: { type: Type.STRING, description: 'Didascalia romantica in italiano' }
            },
            required: ['type']
          }
        }
      },
      required: ['title', 'description', 'blocks']
    };

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
    
    // Fallback images matching server.ts context
    let defaultImageUrl = 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800'; // Japan
    if (language === 'Chinese') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800'; // China
    } else if (language === 'Korean') {
      defaultImageUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800'; // Korea
    }

    if (parsedData.blocks) {
      parsedData.blocks = parsedData.blocks.map((block: any) => {
        if (block.type === 'image' && !block.imageUrl) {
          block.imageUrl = defaultImageUrl;
        }
        return block;
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(parsedData)
    };

  } catch (error: any) {
    console.error('Errore durante la generazione del capitolo su Netlify Functions:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Impossibile generare il capitolo con l\'AI.',
        details: error.message || error 
      })
    };
  }
};
