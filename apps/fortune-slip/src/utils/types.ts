export interface FortuneLang {
  ko: string;
  ja: string;
  en: string;
}

export interface FortuneCategory {
  label: string;
  ja: string;
  en: string;
  ko: string;
}

export interface FortuneSlip {
  number: number;
  character: FortuneLang;
  fortune: FortuneLang;
  title: FortuneLang;
  ability: FortuneLang;
  poem: FortuneLang;
  categories: FortuneCategory[];
  comment: FortuneLang;
  image: string;
}
