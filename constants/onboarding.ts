// ===============================
// File: constants/onboarding.ts
// ===============================
export type OnboardingStep = {
id: string;
title: string;
text: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
{
id: "bemvindo",
title: "Bem‑vindo ao Get & Use",
text: "Juntos, construímos uma comunidade útil, segura e confiável.",
},
{
id: "valor",
title: "Evite itens de alto valor",
text: "Não empreste ou alugue itens de alto valor financeiro ou sentimental.",
},
{
id: "pagamento",
title: "Pagamentos sempre no app",
text: "Nunca pague fora do app. Se é grátis, é grátis. Denuncie tentativas de golpe.",
},
{
id: "avaliacoes",
title: "Avalie ao finalizar",
text: "Depois de cada transação, avalie o outro usuário e, se você alugou, avalie também o item.",
},
{
id: "confianca",
title: "Confiança importa",
text: "Acúmulo de avaliações negativas bloqueia novo acesso com o mesmo CPF, e‑mail ou telefone.",
},
{
id: "emprestimos",
title: "Para pegar emprestado",
text: "Para pedir algo emprestado (grátis), cadastre pelo menos 2 itens para doar/emprestar.",
},
];