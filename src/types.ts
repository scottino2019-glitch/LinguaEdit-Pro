/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'Japanese' | 'Chinese' | 'Korean' | 'Russian' | 'Turkish' | 'Arabic' | 'Thai' | 'Hindi';

export type BlockType = 'grammar' | 'dialogue' | 'vocabulary' | 'exercise' | 'video' | 'image';

export interface GrammarTerm {
  term: string;
  phonetic: string;
  translation: string;
}

export interface DialogueLine {
  character: string;
  text: string;
  phonetic: string;
  translation: string;
}

export interface VocabularyTerm {
  term: string;
  phonetic: string;
  translation: string;
  example?: string;
  examplePhonetic?: string;
  exampleTranslation?: string;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  
  // Grammar block
  grammarTitle?: string;
  grammarText?: string; // markdown supported
  grammarTerms?: GrammarTerm[];

  // Dialogue block
  dialogueTitle?: string;
  dialogueCharacters?: string[];
  dialogueLines?: DialogueLine[];

  // Vocabulary block
  vocabularyList?: VocabularyTerm[];

  // Exercise block
  exerciseType?: 'multiple-choice' | 'fill-blank' | 'reorder';
  exerciseQuestion?: string;
  exerciseNote?: string;
  // Multiple choice custom values
  mcOptions?: string[];
  mcCorrectIndex?: number;
  // Fill in the blanks
  fbSentenceBefore?: string; // e.g. "私のは"
  fbSentenceAfter?: string;  // e.g. "です"
  fbCorrectAnswer?: string;  // e.g. "名前"
  // Reorder words puzzle
  reorderWords?: string[]; // ["이것은", "책", "입니다"]
  reorderCorrectOrder?: string; // "이것은 책 입니다" or sequential check

  // Video block
  videoUrl?: string; // YouTube or other embed link
  videoCaption?: string;

  // Image block
  imageUrl?: string;
  imageCaption?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
}

export interface Book {
  id: string;
  title: string;
  language: LanguageCode;
  coverUrl: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzato';
  chapters: Chapter[];
}
