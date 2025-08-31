export interface Book {
  id: number;
  title: string;
  isbn: string;
  genre: BookGenre;
  author: string;
  publisher: BookPublisher;
  synopsis: string;
  
  // Novas propriedades para imagens no banco de dados
  photoUrl?: string; // URL para acessar a imagem via API
  photoBytes?: number[]; // Bytes da imagem (não usado no frontend)
  photoContentType?: string; // Tipo MIME da imagem
  photoDataUrl?: string; // Data URL da imagem (base64 inline)
  
  // Campo legado para compatibilidade
  photoPath?: string;
  
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  userId: string;
  userFullName?: string; // Para exibição no frontend
}

export enum BookGenre {
  Fiction = 'Fiction',
  NonFiction = 'NonFiction',
  Mystery = 'Mystery',
  Romance = 'Romance',
  ScienceFiction = 'ScienceFiction',
  Fantasy = 'Fantasy',
  Horror = 'Horror',
  Thriller = 'Thriller',
  Biography = 'Biography',
  History = 'History',
  Science = 'Science',
  Technology = 'Technology',
  Philosophy = 'Philosophy',
  Religion = 'Religion',
  SelfHelp = 'SelfHelp',
  Business = 'Business',
  Economics = 'Economics',
  Politics = 'Politics',
  Travel = 'Travel',
  Cookbook = 'Cookbook',
  Poetry = 'Poetry',
  Drama = 'Drama',
  Other = 'Other'
}

export enum BookPublisher {
  // Editoras Internacionais Principais
  PenguinRandomHouse = 'PenguinRandomHouse',
  HarperCollins = 'HarperCollins',
  SimonSchuster = 'SimonSchuster',
  HachetteBookGroup = 'HachetteBookGroup',
  Macmillan = 'Macmillan',
  Scholastic = 'Scholastic',
  Bloomsbury = 'Bloomsbury',
  FaberFaber = 'FaberFaber',
  Vintage = 'Vintage',
  Anchor = 'Anchor',
  Doubleday = 'Doubleday',
  Knopf = 'Knopf',
  Crown = 'Crown',
  Ballantine = 'Ballantine',
  Bantam = 'Bantam',
  Dell = 'Dell',
  
  // Editoras Brasileiras
  CompanhiaDasLetras = 'CompanhiaDasLetras',
  Record = 'Record',
  Rocco = 'Rocco',
  Globo = 'Globo',
  Sextante = 'Sextante',
  Planeta = 'Planeta',
  Leya = 'Leya',
  Intrinseca = 'Intrinseca',
  Objetiva = 'Objetiva',
  NovaFronteira = 'NovaFronteira',
  BertrandBrasil = 'BertrandBrasil',
  Zahar = 'Zahar',
  MartinsFontes = 'MartinsFontes',
  Atual = 'Atual',
  Moderna = 'Moderna',
  FTD = 'FTD',
  Scipione = 'Scipione',
  Saraiva = 'Saraiva',
  Melhoramentos = 'Melhoramentos',
  CirandaCultural = 'CirandaCultural',
  
  // Editoras Internacionais Adicionais
  Norton = 'Norton',
  OxfordUniversityPress = 'OxfordUniversityPress',
  CambridgeUniversityPress = 'CambridgeUniversityPress',
  MITPress = 'MITPress',
  PrincetonUniversityPress = 'PrincetonUniversityPress',
  YaleUniversityPress = 'YaleUniversityPress',
  HarvardUniversityPress = 'HarvardUniversityPress',
  StanfordUniversityPress = 'StanfordUniversityPress',
  UniversityOfChicagoPress = 'UniversityOfChicagoPress',
  ColumbiaUniversityPress = 'ColumbiaUniversityPress',
  BasicBooks = 'BasicBooks',
  PublicAffairs = 'PublicAffairs',
  GrovePress = 'GrovePress',
  NewDirections = 'NewDirections',
  CityLights = 'CityLights',
  GraywolfPress = 'GraywolfPress',
  CoffeeHousePress = 'CoffeeHousePress',
  TinHouse = 'TinHouse',
  McSweeneys = 'McSweeneys',
  AkashicBooks = 'AkashicBooks',
  
  // Editoras de Gêneros Específicos
  TorBooks = 'TorBooks',
  Orbit = 'Orbit',
  BaenBooks = 'BaenBooks',
  DAW = 'DAW',
  Ace = 'Ace',
  Roc = 'Roc',
  DelRey = 'DelRey',
  Gollancz = 'Gollancz',
  AngryRobot = 'AngryRobot',
  Solaris = 'Solaris',
  
  // Editoras Acadêmicas e Técnicas
  Springer = 'Springer',
  Wiley = 'Wiley',
  Elsevier = 'Elsevier',
  Routledge = 'Routledge',
  Sage = 'Sage',
  PalgraveMacmillan = 'PalgraveMacmillan',
  BloomsburyAcademic = 'BloomsburyAcademic',
  UniversityOfCaliforniaPress = 'UniversityOfCaliforniaPress',
  JohnsHopkinsUniversityPress = 'JohnsHopkinsUniversityPress',
  CornellUniversityPress = 'CornellUniversityPress',
  
  // Editoras Independentes e Alternativas
  SevenStoriesPress = 'SevenStoriesPress',
  HaymarketBooks = 'HaymarketBooks',
  Verso = 'Verso',
  MonthlyReviewPress = 'MonthlyReviewPress',
  AKPress = 'AKPress',
  PMPress = 'PMPress',
  MicrocosmPublishing = 'MicrocosmPublishing',
  SoftSkullPress = 'SoftSkullPress',
  MelvilleHouse = 'MelvilleHouse',
  EuropaEditions = 'EuropaEditions',
  
  // Editoras de Livros Infantis e Juvenis
  CandlewickPress = 'CandlewickPress',
  ChronicleBooks = 'ChronicleBooks',
  Abrams = 'Abrams',
  Phaidon = 'Phaidon',
  Taschen = 'Taschen',
  ThamesHudson = 'ThamesHudson',
  Prestel = 'Prestel',
  Rizzoli = 'Rizzoli',
  Assouline = 'Assouline',
  Gestalten = 'Gestalten',
  
  Other = 'Other'
}

// Interface para criação de livro (sem ID e timestamps)
export interface CreateBookDto {
  title: string;
  isbn: string;
  genre: BookGenre;
  author: string;
  publisher: BookPublisher;
  synopsis: string;
  photoPath?: string;
}

// Interface para atualização de livro
export interface UpdateBookDto {
  title?: string;
  isbn?: string;
  genre?: BookGenre;
  author?: string;
  publisher?: BookPublisher;
  synopsis?: string;
  photoPath?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
}
