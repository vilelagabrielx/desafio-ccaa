import { BookGenre } from '../models/book.model';

export const genreTranslations: Record<BookGenre, string> = {
  [BookGenre.Fiction]: 'Ficção',
  [BookGenre.NonFiction]: 'Não Ficção',
  [BookGenre.Mystery]: 'Mistério',
  [BookGenre.Romance]: 'Romance',
  [BookGenre.ScienceFiction]: 'Ficção Científica',
  [BookGenre.Fantasy]: 'Fantasia',
  [BookGenre.Horror]: 'Terror',
  [BookGenre.Thriller]: 'Suspense',
  [BookGenre.Biography]: 'Biografia',
  [BookGenre.History]: 'História',
  [BookGenre.Science]: 'Ciência',
  [BookGenre.Technology]: 'Tecnologia',
  [BookGenre.Philosophy]: 'Filosofia',
  [BookGenre.Religion]: 'Religião',
  [BookGenre.SelfHelp]: 'Autoajuda',
  [BookGenre.Business]: 'Negócios',
  [BookGenre.Economics]: 'Economia',
  [BookGenre.Politics]: 'Política',
  [BookGenre.Travel]: 'Viagem',
  [BookGenre.Cookbook]: 'Culinária',
  [BookGenre.Poetry]: 'Poesia',
  [BookGenre.Drama]: 'Drama',
  [BookGenre.Other]: 'Outro'
};

/**
 * Traduz um gênero do inglês para português
 * @param genre - O gênero em inglês
 * @returns O gênero traduzido para português
 */
export function translateGenre(genre: BookGenre): string {
  return genreTranslations[genre] || genre;
}

/**
 * Traduz um gênero do português para inglês (para busca reversa)
 * @param portugueseGenre - O gênero em português
 * @returns O gênero em inglês correspondente
 */
export function translateGenreToEnglish(portugueseGenre: string): BookGenre | null {
  const entry = Object.entries(genreTranslations).find(
    ([_, translation]) => translation.toLowerCase() === portugueseGenre.toLowerCase()
  );
  return entry ? (entry[0] as BookGenre) : null;
}
