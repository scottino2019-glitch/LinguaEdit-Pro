/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book } from './types';

export const preloadedBooks: Book[] = [
  {
    id: 'jp-survival-1',
    title: 'Giapponese di Sopravvivenza',
    language: 'Japanese',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
    description: 'Impara l\'essenziale per muoverti a Tokyo, ordinare ramen e fare amicizia con eleganza e rispetto.',
    level: 'Principiante',
    chapters: [
      {
        id: 'jp-ch-1',
        title: 'Capitolo 1: Primi Incontri e Presentazioni',
        description: 'Impara a salutare, presentarti e dare il benvenuto agli amici in giapponese.',
        blocks: [
          {
            id: 'jp-block-img-intro',
            type: 'image',
            imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
            imageCaption: 'Il quartiere di Asakusa a Tokyo, connubio perfetto tra tradizione antica e avanguardia.'
          },
          {
            id: 'jp-block-gram-1',
            type: 'grammar',
            grammarTitle: 'La Struttura della Frase Base: A wa B desu',
            grammarText: `In giapponese, la particella **は (wa)** viene posta dopo il tema principale del discorso.
Il verbo ausiliare **です (desu)** significa "essere" e viene sempre posizionato alla fine della frase.

**Formula fondamentale:**
` + "`" + `[Soggetto] は [Identità/Qualità] です` + "`" + ` (Io sono...)

*Nota bene:* Sebbene si scriva con l'hiragana **ha (は)**, questa particella viene pronunciata semplicemente come **wa**!`,
            grammarTerms: [
              { term: '私 (わたし - watashi)', phonetic: 'watashi', translation: 'Io / Me stesso' },
              { term: '名前 (なまえ - namae)', phonetic: 'namae', translation: 'Nome' },
              { term: '日本人 (にほんじん - nihonjin)', phonetic: 'nihonjin', translation: 'Persona giapponese' },
              { term: 'イタリア人 (いたーりあじん)', phonetic: 'itariajin', translation: 'Persona italiana' }
            ]
          },
          {
            id: 'jp-block-dial-1',
            type: 'dialogue',
            dialogueTitle: 'Un Incontro Casual alla Stazione di Shibuya',
            dialogueCharacters: ['Yuki (ゆき)', 'Marco (マルコ)'],
            dialogueLines: [
              { character: 'Yuki (ゆき)', text: 'こんにちは！私はゆきです。はじめまして！', phonetic: 'Konnichiwa! Watashi wa Yuki desu. Hajimemashite!', translation: 'Ciao! Io sono Yuki. Piacere di conoscerti!' },
              { character: 'Marco (マルコ)', text: 'こんにちは！わたしはマルコです。はじめまして！よろしくおねがいします。', phonetic: 'Konnichiwa! Watashi wa Maruko desu. Hajimemashite! Yoroshiku onegai shimasu.', translation: 'Ciao! Io sono Marco. Piacere di conoscerti! Trattami con riguardo.' },
              { character: 'Yuki (ゆき)', text: 'イタリア人ですか？', phonetic: 'Itariajin desu ka?', translation: 'Sei italiano?' },
              { character: 'Marco (マルコ)', text: 'はい、イタリア人です。', phonetic: 'Hai, Itariajin desu.', translation: 'Sì, sono italiano.' }
            ]
          },
          {
            id: 'jp-block-vocab-1',
            type: 'vocabulary',
            vocabularyList: [
              { term: 'はじめまして', phonetic: 'Hajimemashite', translation: 'Piacere di conoscerti (letteralmente: è la prima volta)', example: 'はじめまして、お名前は？', examplePhonetic: 'Hajimemashite, o-namae wa?', exampleTranslation: 'Piacere, qual è il tuo nome?' },
              { term: 'よろしくおねがいします', phonetic: 'Yoroshiku onegai shimasu', translation: 'Confido nella tua gentilezza / Piacere di collaborare', example: '今日からよろしく！', examplePhonetic: 'Kyou kara yoroshiku!', exampleTranslation: 'Piacere di lavorare con te da oggi!' },
              { term: 'はい', phonetic: 'Hai', translation: 'Sì (formale)', example: 'はい、そうです。', examplePhonetic: 'Hai, sou desu.', exampleTranslation: 'Sì, è così.' },
              { term: 'いいえ', phonetic: 'Iie', translation: 'No / Di nulla', example: 'いいえ、日本人ではありません。', examplePhonetic: 'Iie, nihonjin dewa arimasen.', exampleTranslation: 'No, non sono giapponese.' }
            ]
          },
          {
            id: 'jp-block-ex-1',
            type: 'exercise',
            exerciseType: 'multiple-choice',
            exerciseQuestion: 'Quale particella si usa per indicare il "soggetto/tema" della frase giapponese?',
            exerciseNote: 'Fai attenzione alla scrittura ed alla pronuncia!',
            mcOptions: ['の (no)', 'は (wa)', 'を (o)', 'に (ni)'],
            mcCorrectIndex: 1
          },
          {
            id: 'jp-block-ex-2',
            type: 'exercise',
            exerciseType: 'reorder',
            exerciseQuestion: 'Riordina i termini per dire: "Io sono giapponese" (私 = Io, 日本人 = Giapponese, は, です)',
            exerciseNote: 'Tieni a mente l\'ordine: Soggetto + wa + Predicato + desu',
            reorderWords: ['です', '日本人', 'は', '私'],
            reorderCorrectOrder: '私 は 日本人 です'
          },
          {
            id: 'jp-block-video-1',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/rGrMin_UtTo',
            videoCaption: 'Ripassa la corretta pronuncia dell\'alfabeto Hiragana di base con questa video-guida interattiva.'
          }
        ]
      },
      {
        id: 'jp-ch-2',
        title: 'Capitolo 2: Ordinare delizioso cibo e bere',
        description: 'Supera l\'ansia di ordinare in un tipico ristorante Izakaya o Ramen-ya a Shinjuku.',
        blocks: [
          {
            id: 'jp-block-gram-2',
            type: 'grammar',
            grammarTitle: 'Richiedere Cose: "...o kudasai" e "...o onegai shimasu"',
            grammarText: `Per chiedere un oggetto in un ristorante, agguanta l'attenzione del cameriere dicendo **すみません (Sumimasen)**.
Quindi utilizza questa semplice espressione:

` + "`" + `[Oggetto] を ください (o kudasai)` + "`" + ` oppure ` + "`" + `[Oggetto] を おねがいします (o onegai shimasu)` + "`" + `.

*Esempio:* **水 (mizu - acqua) をください** = Acqua, per favore.`,
            grammarTerms: [
              { term: 'ラーメン (raamen)', phonetic: 'ramen', translation: 'Zuppa Ramen' },
              { term: 'ビール (biiru)', phonetic: 'biiru', translation: 'Birra' },
              { term: '水 (みず)', phonetic: 'mizu', translation: 'Acqua' },
              { term: 'これ (kore)', phonetic: 'kore', translation: 'Questo' }
            ]
          },
          {
            id: 'jp-block-dial-2',
            type: 'dialogue',
            dialogueTitle: 'Ordinando in un Ramen Shop sotterraneo',
            dialogueCharacters: ['Cameriere (店員)', 'Marco (マルコ)'],
            dialogueLines: [
              { character: 'Marco (マルコ)', text: 'すみません！メニューをお願いします。', phonetic: 'Sumimasen! Menyuu o onegai shimasu.', translation: 'Scusi! Il menu, per favore.' },
              { character: 'Cameriere (店員)', text: 'はい、どうぞ。ご注文はお決まりですか？', phonetic: 'Hai, douzo. Go-chuumon wa o-kimari desu ka?', translation: 'Sì, ecco a lei. Ha già scelto cosa ordinare?' },
              { character: 'Marco (マルコ)', text: 'これをください。あ、それとビールもお願いします。', phonetic: 'Kore o kudasai. A, sore to biiru mo onegai shimasu.', translation: 'Questo per favore. Ah, e anche una birra, grazie.' },
              { character: 'Cameriere (店員)', text: 'かしこまりました。少々お待ちください。', phonetic: 'Kashikomarimashita. Shou-shou omachi kudasai.', translation: 'Ricevuto. Prego, attenda solo un attimo.' }
            ]
          },
          {
            id: 'jp-block-ex-3',
            type: 'exercise',
            exerciseType: 'fill-blank',
            fbSentenceBefore: '水',
            fbSentenceAfter: 'ください (Acqua per favore - inserisci la particella corretta)',
            fbCorrectAnswer: 'を',
            exerciseQuestion: 'Inserisci la particella che connette l\'oggetto "Acqua (水)" alla richiesta "kudasai":',
            exerciseNote: 'È la particella del complemento oggetto.'
          }
        ]
      }
    ]
  },
  {
    id: 'zh-tones-1',
    title: 'Cinese Mandarino Passaporto',
    language: 'Chinese',
    coverUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800',
    description: 'Afferra il ritmo della lingua più parlata al mondo padroneggiando la magia dei 4 toni fonetici.',
    level: 'Principiante',
    chapters: [
      {
        id: 'zh-ch-1',
        title: 'Capitolo 1: I 4 Toni Fondamentali e i Saluti',
        description: 'La melodia del Cinese risiede nei toni. Scopri come una singola sillaba "ma" può assumere quattro significati diversi.',
        blocks: [
          {
            id: 'zh-block-gram-1',
            type: 'grammar',
            grammarTitle: 'La Magia dei Toni Mandarini',
            grammarText: `Il Cinese Mandarino è una lingua tonale. Ci sono **4 toni principales** più un tono neutro:

1. **Primo Tono (─)**: Alto e costante (es. _mā_ - mamma).
2. **Secondo Tono (↗)**: Ascendente, come quando fai una domanda stupito (es. _má_ - canapa).
3. **Terzo Tono (v)**: Discendente e poi leggermente ascendente (es. _mǎ_ - cavallo).
4. **Quarto Tono (↘)**: Deciso e discendente, come un ordine (es. _mà_ - rimproverare).

Pronunciare il tono errato può creare divertenti malintesi! Salutiamo sempre con **你好 (nǐ hǎo)** (Terzo tono + Terzo tono, che per combinazione fonetica si legge come Secondo + Terzo!).`,
            grammarTerms: [
              { term: '你好 (nǐ hǎo)', phonetic: 'ni3 hao3', translation: 'Ciao / Ciao a te' },
              { term: '老师 (lǎoshī)', phonetic: 'lao3 shi1', translation: 'Maestro / Insegnante' },
              { term: '您好 (nín hǎo)', phonetic: 'nin2 hao3', translation: 'Buongiorno / Salve (formale)' },
              { term: '再见 (zàijiàn)', phonetic: 'zai4 jian4', translation: 'Arrivederci / Ciao' }
            ]
          },
          {
            id: 'zh-block-dial-1',
            type: 'dialogue',
            dialogueTitle: 'Salutare un collega a Pechino',
            dialogueCharacters: ['Lin (林)', 'Sarah (莎拉)'],
            dialogueLines: [
              { character: 'Lin (林)', text: '你好！你是莎拉吗？', phonetic: 'Nǐ hǎo! Nǐ shì Shālā ma?', translation: 'Ciao! Tu sei Sarah?' },
              { character: 'Sarah (莎拉)', text: '你好！对，我是莎拉。你是林老师吗？', phonetic: 'Nǐ hǎo! Duì, wǒ shì Shālā. Nǐ shì Lín lǎoshī ma?', translation: 'Ciao! Sì, esatto, io sono Sarah. Tu sei il Maestro Lin?' },
              { character: 'Lin (林)', text: '是的，我是林。欢迎你来到中国！', phonetic: 'Shì de, wǒ shì Lín. Huānyíng nǐ lái dào Zhōngguó!', translation: 'Sì, io sono Lin. Benvenuta in Cina!' },
              { character: 'Sarah (莎拉)', text: '谢谢你，林老师！再见。', phonetic: 'Xièxie nǐ, Lín lǎoshī! Zàijiàn.', translation: 'Grazie mille, Maestro Lin! Arrivederci.' }
            ]
          },
          {
            id: 'zh-block-ex-1',
            type: 'exercise',
            exerciseType: 'multiple-choice',
            exerciseQuestion: 'Cosa succede quando due "Terzi toni" (come nǐ hǎo) si incontrano uno di seguito all\'altro?',
            exerciseNote: 'Questa regola è denominata "Sabbia Tonica" o Tone Sandhi.',
            mcOptions: [
              'Il primo tono si trasforma in Secondo Tono',
              'Entrambi diventano quarti toni',
              'Il secondo tono viene eliminato',
              'Non succede nulla, restano invariati'
            ],
            mcCorrectIndex: 0
          },
          {
            id: 'zh-block-ex-2',
            type: 'exercise',
            exerciseType: 'fill-blank',
            fbSentenceBefore: '谢谢你 (Grazie) - Come si risponde? ',
            fbSentenceAfter: '客气 (Prego / Non essere formale)',
            fbCorrectAnswer: '不用',
            exerciseQuestion: 'Inserisci le parole mancanti prima di "Kèqi" per dire "Non c\'è di che":',
            exerciseNote: 'Significa letteralmente "Non usare cortesie"!'
          }
        ]
      }
    ]
  },
  {
    id: 'ko-hangul-1',
    title: 'Coreano Espresso',
    language: 'Korean',
    coverUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&q=80&w=800',
    description: 'Impara il monumentale alfabeto Hangul inventato dal Re Sejong e le espressioni dei K-Drama di tendenza.',
    level: 'Principiante',
    chapters: [
      {
        id: 'ko-ch-1',
        title: 'Capitolo 1: Saluti in Società e Cortesia',
        description: 'Impara il saluto coreano di portata nazionale ed il funzionamento del linguaggio onorifico.',
        blocks: [
          {
            id: 'ko-block-img-1',
            type: 'image',
            imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800',
            imageCaption: 'Il palazzo Gyeongbokgung a Seoul, un maestoso simbolo storico protetto dallo skyline moderno.'
          },
          {
            id: 'ko-block-gram-1',
            type: 'grammar',
            grammarTitle: 'La Cortesia Coreana: 안녕하세요 (Annyeonghaseyo)',
            grammarText: `Il coreano possiede un sistema elaborato di livelli di formalità.
L'espressione di saluto più comune, educata ed universale è **안녕하세요 (Annyeonghaseyo)**.

Per presentarsi in modo formale ed elegante, utilizziamo la formula:

` + "`" + `[Nome] + 입니다 (imnida)` + "`" + ` (che funge da copula "essere" formale).

*Esempio:* **소피아 입니다 (Sofia imnida)** = Sono Sofia.`,
            grammarTerms: [
              { term: '안녕하세요 (annyeonghaseyo)', phonetic: 'An-nyeong-ha-se-yo', translation: 'Salve / Buongiorno' },
              { term: '감사합니다 (gamsahamnida)', phonetic: 'Gam-sa-ham-ni-da', translation: 'Grazie mille (formale)' },
              { term: '저 (jeo)', phonetic: 'Jeo', translation: 'Io (polito / umile)' },
              { term: '친구 (chingu)', phonetic: 'Chingu', translation: 'Amico / Amica' }
            ]
          },
          {
            id: 'ko-block-dial-1',
            type: 'dialogue',
            dialogueTitle: 'Salutare il Barista in un Coffee Shop in Corea',
            dialogueCharacters: ['Barista (직원)', 'Min-ho (민호)'],
            dialogueLines: [
              { character: 'Barista (직원)', text: '안녕하세요! 주문하시겠어요?', phonetic: 'Annyeonghaseyo! Jumon-hasigesseoyo?', translation: 'Buongiorno! Desidera ordinare?' },
              { character: 'Min-ho (민호)', text: '안녕하세요. 아이스 아메리카노 한 잔 주세요.', phonetic: 'Annyeonghaseyo. Aisu Amerikano han jan juseyo.', translation: 'Salve. Per favore, un Americano Ghiacciato.' },
              { character: 'Barista (직원)', text: '네, 알겠습니다. 오천원입니다.', phonetic: 'Ne, Algetseumnida. O-cheon-won imnida.', translation: 'Sì, ho capito. Sono 5.000 Won.' },
              { character: 'Min-ho (민호)', text: '여기 있습니다. 감사합니다!', phonetic: 'Yeogi itseumnida. Gamsahamnida!', translation: 'Ecco a lei. Grazie mille!' }
            ]
          },
          {
            id: 'ko-block-ex-1',
            type: 'exercise',
            exerciseType: 'multiple-choice',
            exerciseQuestion: 'Quale delle seguenti risposte esprime cordialmente "Per favore dammelo" (usato per ordinare cibo/oggetti)?',
            exerciseNote: 'È formata dal verbo "dare" inserito in modo cortese imperativo.',
            mcOptions: ['감사합니다 (Gamsahamnida)', '안녕하세요 (Annyeonghaseyo)', '주세요 (Juseyo)', '친구 (Chingu)'],
            mcCorrectIndex: 2
          }
        ]
      }
    ]
  }
];
