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
              mcOptions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: 'Array di esattamente 4 opzioni di risposta' 
              },
              mcCorrectIndex: { type: Type.INTEGER, description: 'Indice corretto (0-3)' },
              fbSentenceBefore: { type: Type.STRING, description: 'Testo prima del buco' },
              fbSentenceAfter: { type: Type.STRING, description: 'Testo dopo il buco' },
              fbCorrectAnswer: { type: Type.STRING, description: 'Parola nativa esatta da scrivere per riempire' },
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

    const systemPrompt = `Sei un professore d'eccellenza specializzato nell'insegnamento delle lingue orientali (Giapponese, Cinese Mandarino, Coreano) a studenti italiani.
Il tuo compito è creare un capitolo di un libro interattivo per la lingua "${language}" a livello "${level}" incentrato sul tema richiesto: "${topic}".
Fornisci spiegazioni grammaticali chiarissime ed esaustive, dialoghi autentici della vita quotidiana in cui ogni battuta ha la trascrizione fonetica (Pinyin per Cinese, Romaji per Giapponese, Romanizzazione standard per il Coreano) e la traduzione italiana, un elenco di vocaboli utili con esempi, ed esercizi interattivi (scelta multipla, compleatamento spazi o riordino frasi).
TUTTE le parti descrittive, spiegazioni ed esercizi devono essere scritti in ITALIANO.
Assicurati che i caratteri orientali siano corretti (es: Kanji/Kana corretti per il giapponese, caratteri semplificati per il cinese, Han-geul nativo per il coreano).
Includi sempre almeno 1 nota grammaticale, 1 conversazione a più battute, 1 sezione vocaboli e almeno 2 esercizi formativi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Genera un capitolo interattivo completo per studiare la lingua ${language} (${level}) sul tema: ${topic}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.8
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
