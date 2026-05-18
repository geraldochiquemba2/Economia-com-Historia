const imgInf = "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgCol = "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgWom = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgMixa = "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgCoins = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const exploreContents = [
  { id: "1", type: "video", title: "Inflação em Angola", description: "Vídeo sobre inflação com dados históricos e atuais.", thumbnail: imgInf },
  { id: "2", type: "text", title: "Comércio no período colonial", description: "Análise sobre as dinâmicas de trocas antes da independência.", thumbnail: imgCol },
  { id: "3", type: "podcast", title: "Mulheres nos negócios", description: "O papel feminino na economia informal e formal de Luanda.", thumbnail: imgWom },
  { id: "4", type: "text", title: "A economia da mixa", description: "Estratégias de sobrevivência económica em Angola.", thumbnail: imgMixa },
  { id: "5", type: "video", title: "História da moeda angolana", description: "Da colonização à atualidade.", thumbnail: imgCoins },
];

export const quizQuestions = [
  {
    id: "q1",
    question: "Qual foi o impacto da reforma monetária de 1999 em Angola?",
    options: [
      "Redução da inflação para menos de 5%",
      "Substituição do Kwanza por uma nova moeda",
      "Aumento do salário mínimo em 300%",
      "Criação do Banco Central Africano"
    ],
    correctAnswer: 1,
    feedback: "A reforma monetária de 1999 substituiu o Kwanza antigo por uma nova moeda, buscando estabilizar a economia."
  },
  {
    id: "q2",
    question: "Que sector liderou o crescimento económico angolano entre 2005 e 2014?",
    options: [
      "Agricultura",
      "Petróleo e gás",
      "Turismo",
      "Tecnologia"
    ],
    correctAnswer: 1,
    feedback: "Petróleo e gás."
  },
  {
    id: "q3",
    question: "Que condição não fazia parte do pacto colonial implementado em Angola?",
    options: [
      "Extração de produtos primários a custo reduzido",
      "Utilização exclusiva da marinha mercante colonial para o transporte de mercadorias",
      "Mercado da colónia cativo para os produtos coloniais",
      "Utilização de mão-de-obra escrava"
    ],
    correctAnswer: 3,
    feedback: "Utilização de mão-de-obra escrava. A escravatura já tinha sido abolida quando o modelo colonial de exploração foi implementado em Angola."
  }
];

export const forumTopics = [
  { id: "t1", title: "Exportação de petróleo", author: "Carlos", comments: 12, date: "Hoje" },
  { id: "t2", title: "Inflação e o custo de vida", author: "Maria", comments: 34, date: "Ontem" },
  { id: "t3", title: "Empreendedorismo jovem", author: "Ana", comments: 8, date: "2 dias atrás" },
];

export const rankingData = [
  { id: "1", name: "Mário Alberto Silva", userName: "Luanda", points: 4500 },
  { id: "2", name: "Ana Paula dos Santos", userName: "Benguela", points: 3800 },
  { id: "3", name: "Sofia Margarida Neto", userName: "Cabinda", points: 3200 },
  { id: "4", name: "Carlos Manuel Gomes", userName: "Lunda Sul", points: 2900 },
  { id: "5", name: "Maria Isabel Chipenda", userName: "Huambo", points: 2100 },
];
