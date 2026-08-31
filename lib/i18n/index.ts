import type { Dictionary } from './hu';
import { hu } from './hu';
import { en } from './en';
import { de } from './de';

const dictionaries: Record<string, Dictionary> = { hu, en, de };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang] ?? hu;
}

export type { Dictionary };
