export interface Word {
  id: string;
  dutch: string;
  english: string;
  exampleDutch: string;
  exampleEnglish: string;
}

export interface CustomWord extends Word {
  categoryId: string;
  isCustom?: boolean;
}

export interface Category {
  id: string;
  title: string;
  titleDutch: string;
  description: string;
  iconName: any; // Lucide icon name string or component
  words: Word[];
}
