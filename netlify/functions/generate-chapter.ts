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
        
        // Grammar Block fields
        grammarTitle: { type: Type.STRING, description: 'Titolo della nota grammaticale (es. La particella wa in Giapponese)' },
        grammarText: { type: Type.STRING, description: 'Spiegazione approfondita della regola grammaticale in italiano con esempi. Supporta formattazione Markdown.' },
        grammarTerms: {
          type: Type.ARRAY,
          description: 'Termini e vocaboli salienti associati alla regola grammaticale',
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING, description: 'Termine originale' },
              phonetic: { type: Type.STRING, description: 'Trascrizione fonetica (Pinyin/Rōmaji/Coreano romanizzato)' },
              translation: { type: Type.STRING, description: 'Traduzione in italiano' }
            },
            required: ['term', 'phonetic', 'translation']
          }
        },

        // Dialogue Block fields
        dialogueTitle: { type: Type.STRING, description: 'Titolo del contesto della conversazione (es: Ordinare al ristorante di sushi)' },
        dialogueCharacters: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Nomi dei personaggi'
        },
        dialogueLines: {
          type: Type.ARRAY,
          description: 'Un flusso di battute alternate tra i personaggi (almeno 3-4 battute)',
          items: {
            type: Type.OBJECT,
            properties: {
              character: { type: Type.STRING, description: 'Nome del parlante' },
              text: { type: Type.STRING, description: 'Battuta nativa autentica nella lingua orientale' },
              phonetic: { type: Type.STRING, description: 'Pronuncia fonetica accurata' },
              translation: { type: Type.STRING, description: 'Traduzione fedele in italiano' }
            },
            required: ['character', 'text', 'phonetic', 'translation']
          }
        },

        // Vocabulary Block fields
        vocabularyList: {
          type: Type.ARRAY,
          description: 'Sillaboro o carte di pronuncia vocabolario (almeno 4-5 termini)',
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
          description: 'Tipo di esercizio. Valori ammessi: multiple-choice, fill-blank, reorder' 
        },
        exerciseQuestion: { type: Type.STRING, description: 'Testo dell\'esercizio o consegna in italiano' },
        exerciseNote: { type: Type.STRING, description: 'Suggerimento o commento chiarificatore' },
        
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
        fbCorrectAnswer: { type: Type.STRING, description: 'Parola nativa esatta da scrivere per riempire' },
        
        // Reorder puzzle options
        reorderWords: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: 'Lista di parole native disordinate'
        },
        reorderCorrectOrder: { type: Type.STRING, description: 'La frase riordinata corretta formata unendo i singoli elementi' }
      },
      required: [
        'title', 'description', 
        'grammarTitle', 'grammarText', 'grammarTerms',
        'dialogueTitle', 'dialogueCharacters', 'dialogueLines',
        'vocabularyList',
        'exerciseType', 'exerciseQuestion', 'exerciseNote'
      ]
    };

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

    const langInItalian = getLanguageInItalian(language);

    const systemPrompt = `Sei un professore d'eccellenza e madrelingua specializzato nell'insegnamento di ${langInItalian} (${level}) a studenti italiani.
Crea una lezione estremamente ricca, completa e curata nei dettagli, impostando e completando accuratamente tutti i parametri richiesti nello schema di risposta.

1. Sezioni della lezione da compilare obbligatoriamente:
   - Grammatica: Spiega in italiano una regola con precisione in "grammarText" e compila da 2 a 3 termini in "grammarTerms".
   - Dialogo: Configura "dialogueTitle" ed elabora uno scambio interattivo con almeno 3-4 battute alternate in "dialogueLines".
   - Vocabolario: Configura almeno 4-5 parole chiave in "vocabularyList", completando per ognuna parola, fonetica, traduzione, frase d'esempio, frase d'esempio fonetica e traduzione frase d'esempio.
   - Esercizio: Progetta un ottimo esercizio d'apprendimento ('multiple-choice', 'fill-blank' o 'reorder') compilando le relative proprietà del tipo stabilito.

Tutte le spiegazioni teoriche, le traduzioni, i commenti e le consegne degli esercizi devono essere scritti esclusivamente in lingua italiana.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Genera una micro-lezione per ${langInItalian} (${level}) su tema: ${topic}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.3
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Nessuna risposta ricevuta dal modello Gemini.');
    }

    const parsed = JSON.parse(outputText);
    
    // Fallback images matching server.ts context
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

    // Convert flat fields to the standard polymorphism blocks format
    const blocks: any[] = [];
    
    // 1. Image block
    blocks.push({
      type: 'image',
      imageUrl: defaultImageUrl,
      imageCaption: `Foto culturale evocativa del paese per il tema: ${topic}`
    });

    // 2. Grammar Block
    blocks.push({
      type: 'grammar',
      grammarTitle: parsed.grammarTitle || 'Grammatica e Sintassi',
      grammarText: parsed.grammarText || 'Regola grammaticale d\'esempio.',
      grammarTerms: parsed.grammarTerms || []
    });

    // 3. Dialogue Block
    blocks.push({
      type: 'dialogue',
      dialogueTitle: parsed.dialogueTitle || 'Dialogo Conversazionale d\'Esempio',
      dialogueCharacters: parsed.dialogueCharacters || ['Studente', 'Insegnante'],
      dialogueLines: parsed.dialogueLines || []
    });

    // 4. Vocabulary Block
    blocks.push({
      type: 'vocabulary',
      vocabularyList: parsed.vocabularyList || []
    });

    // 5. Exercise Block
    blocks.push({
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

    const parsedData = {
      title: parsed.title || 'Nuovo Capitolo',
      description: parsed.description || '',
      blocks: blocks
    };

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
    
    let errorDetails = error.message || String(error);
    const msg = String(error.message || '');
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
      errorDetails = "La quota giornaliera gratuita di test della chiave API del server è attualmente esaurita. Per continuare a generare subito e senza alcun limite, ti invitiamo ad attivare l'opzione 'Chiave API Gemini Personale' in basso nel pannello del Copilot e inserire una tua chiave API gratuita (creabile in 10 secondi su Google AI Studio)!";
    } else {
      try {
        if (msg.trim().startsWith('{')) {
          const parsed = JSON.parse(msg);
          if (parsed.error?.message) {
            const pMsg = parsed.error.message;
            if (pMsg.includes('quota') || parsed.error.status === 'RESOURCE_EXHAUSTED' || parsed.error.code === 429) {
              errorDetails = "La quota giornaliera gratuita di test della chiave API del server è attualmente esaurita. Per continuare a generare subito e senza alcun limite, ti invitiamo ad attivare l'opzione 'Chiave API Gemini Personale' in basso nel pannello del Copilot e inserisci una tua chiave API gratuita (creabile in 10 secondi su Google AI Studio)!";
            } else {
              errorDetails = pMsg;
            }
          }
        }
      } catch (e) {}
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Impossibile generare il capitolo con l\'AI.',
        details: errorDetails
      })
    };
  }
};
