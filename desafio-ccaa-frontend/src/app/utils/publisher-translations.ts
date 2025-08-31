import { BookPublisher } from '../models/book.model';

export const publisherTranslations: Record<BookPublisher, string> = {
  // Editoras Internacionais Principais
  [BookPublisher.PenguinRandomHouse]: 'Penguin Random House',
  [BookPublisher.HarperCollins]: 'HarperCollins',
  [BookPublisher.SimonSchuster]: 'Simon & Schuster',
  [BookPublisher.HachetteBookGroup]: 'Hachette Book Group',
  [BookPublisher.Macmillan]: 'Macmillan',
  [BookPublisher.Scholastic]: 'Scholastic',
  [BookPublisher.Bloomsbury]: 'Bloomsbury',
  [BookPublisher.FaberFaber]: 'Faber & Faber',
  [BookPublisher.Vintage]: 'Vintage',
  [BookPublisher.Anchor]: 'Anchor',
  [BookPublisher.Doubleday]: 'Doubleday',
  [BookPublisher.Knopf]: 'Knopf',
  [BookPublisher.Crown]: 'Crown',
  [BookPublisher.Ballantine]: 'Ballantine',
  [BookPublisher.Bantam]: 'Bantam',
  [BookPublisher.Dell]: 'Dell',
  
  // Editoras Brasileiras (mantidas em português)
  [BookPublisher.CompanhiaDasLetras]: 'Companhia das Letras',
  [BookPublisher.Record]: 'Record',
  [BookPublisher.Rocco]: 'Rocco',
  [BookPublisher.Globo]: 'Globo',
  [BookPublisher.Sextante]: 'Sextante',
  [BookPublisher.Planeta]: 'Planeta',
  [BookPublisher.Leya]: 'Leya',
  [BookPublisher.Intrinseca]: 'Intrínseca',
  [BookPublisher.Objetiva]: 'Objetiva',
  [BookPublisher.NovaFronteira]: 'Nova Fronteira',
  [BookPublisher.BertrandBrasil]: 'Bertrand Brasil',
  [BookPublisher.Zahar]: 'Zahar',
  [BookPublisher.MartinsFontes]: 'Martins Fontes',
  [BookPublisher.Atual]: 'Atual',
  [BookPublisher.Moderna]: 'Moderna',
  [BookPublisher.FTD]: 'FTD',
  [BookPublisher.Scipione]: 'Scipione',
  [BookPublisher.Saraiva]: 'Saraiva',
  [BookPublisher.Melhoramentos]: 'Melhoramentos',
  [BookPublisher.CirandaCultural]: 'Ciranda Cultural',
  
  // Editoras Internacionais Adicionais
  [BookPublisher.Norton]: 'Norton',
  [BookPublisher.OxfordUniversityPress]: 'Oxford University Press',
  [BookPublisher.CambridgeUniversityPress]: 'Cambridge University Press',
  [BookPublisher.MITPress]: 'MIT Press',
  [BookPublisher.PrincetonUniversityPress]: 'Princeton University Press',
  [BookPublisher.YaleUniversityPress]: 'Yale University Press',
  [BookPublisher.HarvardUniversityPress]: 'Harvard University Press',
  [BookPublisher.StanfordUniversityPress]: 'Stanford University Press',
  [BookPublisher.UniversityOfChicagoPress]: 'University of Chicago Press',
  [BookPublisher.ColumbiaUniversityPress]: 'Columbia University Press',
  [BookPublisher.BasicBooks]: 'Basic Books',
  [BookPublisher.PublicAffairs]: 'PublicAffairs',
  [BookPublisher.GrovePress]: 'Grove Press',
  [BookPublisher.NewDirections]: 'New Directions',
  [BookPublisher.CityLights]: 'City Lights',
  [BookPublisher.GraywolfPress]: 'Graywolf Press',
  [BookPublisher.CoffeeHousePress]: 'Coffee House Press',
  [BookPublisher.TinHouse]: 'Tin House',
  [BookPublisher.McSweeneys]: 'McSweeney\'s',
  [BookPublisher.AkashicBooks]: 'Akashic Books',
  
  // Editoras de Gêneros Específicos
  [BookPublisher.TorBooks]: 'Tor Books',
  [BookPublisher.Orbit]: 'Orbit',
  [BookPublisher.BaenBooks]: 'Baen Books',
  [BookPublisher.DAW]: 'DAW',
  [BookPublisher.Ace]: 'Ace',
  [BookPublisher.Roc]: 'Roc',
  [BookPublisher.DelRey]: 'Del Rey',
  [BookPublisher.Gollancz]: 'Gollancz',
  [BookPublisher.AngryRobot]: 'Angry Robot',
  [BookPublisher.Solaris]: 'Solaris',
  
  // Editoras Acadêmicas e Técnicas
  [BookPublisher.Springer]: 'Springer',
  [BookPublisher.Wiley]: 'Wiley',
  [BookPublisher.Elsevier]: 'Elsevier',
  [BookPublisher.Routledge]: 'Routledge',
  [BookPublisher.Sage]: 'Sage',
  [BookPublisher.PalgraveMacmillan]: 'Palgrave Macmillan',
  [BookPublisher.BloomsburyAcademic]: 'Bloomsbury Academic',
  [BookPublisher.UniversityOfCaliforniaPress]: 'University of California Press',
  [BookPublisher.JohnsHopkinsUniversityPress]: 'Johns Hopkins University Press',
  [BookPublisher.CornellUniversityPress]: 'Cornell University Press',
  
  // Editoras Independentes e Alternativas
  [BookPublisher.SevenStoriesPress]: 'Seven Stories Press',
  [BookPublisher.HaymarketBooks]: 'Haymarket Books',
  [BookPublisher.Verso]: 'Verso',
  [BookPublisher.MonthlyReviewPress]: 'Monthly Review Press',
  [BookPublisher.AKPress]: 'AK Press',
  [BookPublisher.PMPress]: 'PM Press',
  [BookPublisher.MicrocosmPublishing]: 'Microcosm Publishing',
  [BookPublisher.SoftSkullPress]: 'Soft Skull Press',
  [BookPublisher.MelvilleHouse]: 'Melville House',
  [BookPublisher.EuropaEditions]: 'Europa Editions',
  
  // Editoras de Livros Infantis e Juvenis
  [BookPublisher.CandlewickPress]: 'Candlewick Press',
  [BookPublisher.ChronicleBooks]: 'Chronicle Books',
  [BookPublisher.Abrams]: 'Abrams',
  [BookPublisher.Phaidon]: 'Phaidon',
  [BookPublisher.Taschen]: 'Taschen',
  [BookPublisher.ThamesHudson]: 'Thames & Hudson',
  [BookPublisher.Prestel]: 'Prestel',
  [BookPublisher.Rizzoli]: 'Rizzoli',
  [BookPublisher.Assouline]: 'Assouline',
  [BookPublisher.Gestalten]: 'Gestalten',
  
  [BookPublisher.Other]: 'Outra'
};

/**
 * Traduz uma editora do inglês para português
 * @param publisher - A editora em inglês
 * @returns A editora traduzida para português
 */
export function translatePublisher(publisher: BookPublisher): string {
  return publisherTranslations[publisher] || publisher;
}

/**
 * Traduz uma editora do português para inglês (para busca reversa)
 * @param portuguesePublisher - A editora em português
 * @returns A editora em inglês correspondente
 */
export function translatePublisherToEnglish(portuguesePublisher: string): BookPublisher | null {
  const entry = Object.entries(publisherTranslations).find(
    ([_, translation]) => translation.toLowerCase() === portuguesePublisher.toLowerCase()
  );
  return entry ? (entry[0] as BookPublisher) : null;
}
