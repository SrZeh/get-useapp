/**
 * Item categories for the marketplace
 */

export const ITEM_CATEGORIES = [
  // Ferramentas & construção
  "Ferramentas elétricas",
  "Ferramentas manuais",
  "Construção & Reforma",
  "Marcenaria & Carpintaria",
  "Jardinagem",
  // Aventura & lazer
  "Camping & Trilha",
  "Esportes & Lazer",
  "Mobilidade (bike/patinete)",
  // Audiovisual & tech
  "Fotografia & Vídeo",
  "Música & Áudio",
  "Informática & Acessórios",
  // Casa & outros úteis
  "Eletroportáteis",
  "Cozinha & Utensílios",
  "Eventos & Festas",
  "Móveis & Decoração",
  // Veículos
  "Automotivo & Moto",
  // Infantil / pet / saúde
  "Bebê & Infantil",
  "Brinquedos & Jogos",
  "Pet",
  "Saúde & Beleza",
  // fallback (evitar, mas disponível)
  "Outros",
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

