// =====================================
// File: constants/coachmarks.ts
// =====================================
export type CoachmarkStep = {
id: string; // identificador único do passo
targetId: string; // id do alvo registrado na tela
text: string; // texto do balão
align?: "top" | "bottom" | "left" | "right"; // preferência de posição
};


export const COACHMARK_STEPS_HOME: CoachmarkStep[] = [
{
id: "home_buscar",
targetId: "home.search",
text: "Use a busca para encontrar itens próximos a você.",
align: "bottom",
},
{
id: "home_publicar",
targetId: "home.publish",
text: "Anuncie seus itens para emprestar ou alugar com segurança.",
align: "top",
},
{
id: "home_chat",
targetId: "home.chat",
text: "Converse pelo chat interno. Evite combinar fora do app.",
align: "left",
},
];