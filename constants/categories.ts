/**
 * Item categories for the marketplace
 */

export const ITEM_CATEGORIES = [
  // Agro, indústria e comércio
  "Agro / Indústria / Comércio",
  // Animais & colecionáveis
  "Animais / Pets",
  "Antiguidades / Coleções",
  // Arte, papelaria e hobbies
  "Arte / Papelaria / Armarinho",
  "Brinquedos / Hobbies / Jogos / Vídeo-Games",
  "Livros / Filmes / Música",
  // Moda e cuidados pessoais
  "Bebês / Artigos Infantis",
  "Beleza",
  "Moda / Calçados / Roupas / Bolsas",
  "Saúde / Bem-estar / Cuidados Pessoais",
  // Casa e eventos
  "Casa / Móveis / Decoração / Utensílios Domésticos",
  "Cozinha / Utensílios / Gastronomia",
  "Eventos / Festas / Casamentos",
  // Construção, ferramentas e jardinagem
  "Ferramentas / Construção / Materiais de Construção",
  "Ferramentas elétricas",
  "Ferramentas manuais",
  "Construção & Reforma",
  "Marcenaria & Carpintaria",
  "Jardinagem / Paisagismo",
  // Mobilidade e aventura
  "Camping / Trilha / Aventura",
  "Esportes / Fitness / Exercícios",
  "Mobilidade Urbana (Bike / Patinete)",
  // Veículos
  "Carros / Motos / Veículos / Acessórios",
  // Tecnologia e eletrônicos
  "Câmeras / Drones / Foto & Vídeo",
  "Celulares / Telefonia / Smartphones",
  "Eletrônicos / Áudio / Vídeo",
  "Informática / Computadores / Periféricos",
  "Eletrodomésticos / Eletroportáteis",
  // Serviços e imóveis
  "Serviços / Vagas de Emprego",
  "Imóveis (Venda / Aluguel)",
  // fallback (evitar sempre que possível)
  "Outros / Diversos",
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

