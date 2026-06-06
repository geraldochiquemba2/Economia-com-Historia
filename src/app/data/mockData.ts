const imgInf = "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgCol = "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgWom = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgMixa = "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgCoins = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgContracts = "https://images.unsplash.com/photo-1450133064473-71024230f91b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgGraduation = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgBooks = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgHandshake = "https://images.unsplash.com/photo-1521791136364-728a16403488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgStore = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgLuanda = "https://images.unsplash.com/photo-1506157786151-b8491531f063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const exploreContents = [
  { 
    id: "1", 
    type: "video", 
    title: "Inflação em Angola", 
    description: "Vídeo sobre inflação com dados históricos e atuais.", 
    thumbnail: imgInf,
    fullText: [
      "A inflação em Angola tem sido um dos maiores desafios macroeconómicos desde a independência. Este vídeo explora as raízes históricas do fenómeno, desde a hiperinflação dos anos 90 até às flutuações cambiais recentes associadas ao preço do barril de crude.",
      "Através de gráficos e entrevistas com especialistas nacionais, analisamos como a dependência das importações e a política monetária do BNA interagem para moldar o poder de compra da população nas principais cidades do país.",
      "Compreender a inflação é o primeiro passo para desenhar estratégias robustas de preservação de capital e planeamento financeiro familiar no contexto angolano."
    ]
  },
  { 
    id: "2", 
    type: "text", 
    title: "Comércio no período colonial", 
    description: "Análise sobre as dinâmicas de trocas antes da independência.", 
    thumbnail: imgCol,
    fullText: [
      "O comércio colonial em Angola baseou-se num modelo extrativista rígido estruturado em torno do pacto colonial. As matérias-primas eram escoadas a baixo custo para a metrópole, enquanto os produtos manufaturados europeus tinham mercado cativo na colónia.",
      "Este estudo analisa os principais eixos desse comércio — desde a exploração agrícola no planalto central até aos portos de Luanda e Lobito —, destacando as desigualdades estruturais criadas por este sistema de trocas assimétricas.",
      "Ao examinar este passado colonial, podemos compreender melhor as origens históricas da dependência de commodities e da fraca industrialização que ainda caracterizam muitas economias africanas contemporâneas."
    ]
  },
  { 
    id: "3", 
    type: "podcast", 
    title: "Mulheres nos negócios", 
    description: "O papel feminino na economia informal e formal de Luanda.", 
    thumbnail: imgWom,
    fullText: [
      "Este podcast debate a força e a resiliência das mulheres angolanas, que formam a espinha dorsal do comércio urbano em Luanda. Analisamos o seu papel histórico na economia de subsistência e a sua transição progressiva para o setor corporativo e empreendedor formal.",
      "Convidamos duas economistas de prestígio para discutir as barreiras de acesso ao crédito formal, as redes de apoio mútuo feminino e o impacto do microcrédito na capacitação financeira de milhares de agregados familiares.",
      "Uma homenagem sonora e uma reflexão económica sobre quem realmente faz a engrenagem do comércio de Luanda girar todos os dias."
    ]
  },
  { 
    id: "4", 
    type: "jindungo", 
    title: "A economia da mixa", 
    description: "Estratégias satíricas e realistas de sobrevivência e pequenos expedientes na economia nacional.", 
    thumbnail: imgMixa,
    fullText: [
      "A 'mixa' é a verdadeira instituição financeira angolana. Enquanto os bancos centrais discutem taxas de juro e rácios de solvabilidade, a economia real sobrevive de pequenos esquemas de 'desrasque' e facilidades diárias.",
      "É a senhora que cobra uma pequena taxa informal para acelerar um processo administrativo, o jovem que cobra para guardar o carro na berma da estrada, ou o amigo que facilita a troca rápida de divisas fora dos canais bancários rígidos.",
      "A mixa não é mera informalidade: é o cimento social e prático que une os tijolos da sobrevivência quotidiana num contexto económico desafiador."
    ]
  },
  { 
    id: "5", 
    type: "video", 
    title: "História da moeda angolana", 
    description: "Da colonização à atualidade da moeda kwanza.", 
    thumbnail: imgCoins,
    fullText: [
      "A moeda é o reflexo da soberania de uma nação. Este documentário em vídeo percorre a evolução histórica dos meios de troca em Angola, desde o uso tradicional do zimbo e das peças de pano até à criação e reformas da moeda nacional, o Kwanza.",
      "Exploramos as várias fases do Kwanza, as sucessivas desvalorizações associadas a choques externos e as recentes tentativas do Banco Nacional de Angola de estabilizar a taxa de câmbio perante as divisas estrangeiras.",
      "Uma viagem visual rica e didática essencial para compreender como a história política e a estabilidade monetária caminham de mãos dadas."
    ]
  },
  { 
    id: "6", 
    type: "jindungo", 
    title: "Adjudicações directas", 
    description: "Uma sátira bem-humorada sobre como contratos públicos são atribuídos sem concurso público.", 
    thumbnail: imgContracts,
    fullText: [
      "Para quê perder tempo com burocracias aborrecidas, concursos públicos internacionais e análises detalhadas de propostas concorrentes, quando se pode simplesmente adjudicar diretamente ao 'parceiro estratégico'?",
      "O concurso público é para amadores; a adjudicação directa é o segredo de quem tem extrema pressa em ver o desenvolvimento nacional acontecer — preferencialmente na conta bancária certa e sem perguntas inconvenientes.",
      "Uma sátira divertida à agilidade administrativa sob a capa de 'urgência nacional' que define a distribuição de grandes obras no país."
    ]
  },
  { 
    id: "7", 
    type: "jindungo", 
    title: "Doutores Matumbos", 
    description: "Crônica social hilariante sobre a obsessão nacional por títulos académicos vazios de competência.", 
    thumbnail: imgGraduation,
    fullText: [
      "Em Angola, o título vale muito mais do que a própria obra. A proliferação de 'Doutores' e 'Engenheiros' com diplomas duvidosos obtidos em universidades de vão de escada ou cursos rápidos online é um fenómeno sociológico fascinante.",
      "O importante não é saber fazer ou resolver problemas reais, mas sim garantir a moldura certa na parede do gabinete luxuoso, ser tratado com a devida vénia e citar teorias rebuscadas que ninguém compreende nas reuniões de conselho.",
      "Uma crónica irónica sobre a meritocracia de fachada e a vaidade académica que por vezes governa grandes gabinetes institucionais."
    ]
  },
  { 
    id: "8", 
    type: "jindungo", 
    title: "Economistas de Manual", 
    description: "Análise afiada das teorias macroeconómicas importadas que falham em entender o mercado informal local.", 
    thumbnail: imgBooks,
    fullText: [
      "Armados com manuais clássicos de Harvard e sofisticados modelos matemáticos concebidos em Paris, os nossos economistas de gabinete tentam aplicar austeridade severa e metas de inflação rígidas ao mercado informal da praça.",
      "O resultado prático é sempre uma surpresa estatística chocante para o gabinete: a inflação sobe, o kwanza cai, mas no manual importado estava escrito que ia correr tudo perfeitamente bem. O povo da praça teima em não ler os manuais académicos.",
      "Uma crítica social bem temperada à desconexão profunda entre a elite tecnocrata planeadora e a vibrante realidade económica das ruas."
    ]
  },
  { 
    id: "9", 
    type: "jindungo", 
    title: "Quem indica", 
    description: "O impacto crítico das relações e conexões pessoais no recrutamento profissional em Luanda.", 
    thumbnail: imgHandshake,
    fullText: [
      "O currículo perfeito em Luanda não tem formação académica em Harvard nem anos de experiência relevante: tem apenas o número de telefone pessoal do padrinho ou tio certo no topo do documento.",
      "O processo de recrutamento e seleção mais competitivo e eficiente do país chama-se informalmente 'Quem Indica'. Se tens o sobrenome certo ou o padrinho influente na administração, a vaga de sonho é instantaneamente tua.",
      "Caso contrário, podes continuar a enviar centenas de PDFs para caixas de correio eletrónico corporativas que nenhum departamento de recursos humanos se dará ao trabalho de abrir."
    ]
  },
  { 
    id: "10", 
    type: "jindungo", 
    title: "Empreendedorismo & Microcrédito", 
    description: "Como o financiamento informal impulsiona e desafia as quitandeiras do mercado urbano.", 
    thumbnail: imgStore,
    fullText: [
      "A jovem quitandeira acorda religiosamente às 4h da manhã para abastecer o seu negócio no mercado grossista. O seu capital inicial de investimento? Um microcrédito concedido com juros que fariam inveja à máfia.",
      "O microcrédito é vendido nas conferências corporativas como a salvação dourada do empreendedorismo feminino informal, mas na prática diária é um teste implacável de sobrevivência financeira extrema contra a fiscalização camarária.",
      "Uma análise honesta e realista da luta diária destas mulheres que, apesar de tudo, sustentam a maior parte das famílias urbanas angolanas."
    ]
  },
  { 
    id: "11", 
    type: "jindungo", 
    title: "Luanda em movimento", 
    description: "Caos, trânsito e as soluções de mobilidade que mantêm ativa a força de trabalho da capital.", 
    thumbnail: imgLuanda,
    fullText: [
      "Luanda move-se a um ritmo frenético porque a sobrevivência diária não permite pausas. Entre engarrafamentos quilométricos na Via Expressa e os candongueiros (táxis azuis e brancos) que desafiam a gravidade e as regras de trânsito.",
      "O trânsito caótico é também o maior shopping center informal do mundo, onde se vende desde carregadores de telemóvel a fruta fresca, provando que o luandense transforma qualquer obstáculo parado em oportunidade comercial ativa.",
      "Uma crônica urbana cativante sobre como as soluções criativas do comércio informal mantêm viva e em movimento a complexa capital do país."
    ]
  },
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

export const forumTopics: any[] = [];


export const rankingData = [
  { id: "1", name: "Mário Alberto Silva", userName: "Luanda", points: 4500, profession: "Docente", email: "mario.silva@email.com", role: "admin" },
  { id: "2", name: "Ana Paula dos Santos", userName: "Benguela", points: 3800, profession: "Estudante", email: "ana.paula@email.com", role: "user" },
  { id: "3", name: "Sofia Margarida Neto", userName: "Cabinda", points: 3200, profession: "Estudante", email: "sofia.neto@email.com", role: "user" },
  { id: "4", name: "Carlos Manuel Gomes", userName: "Lunda Sul", points: 2900, profession: "Trabalhador", email: "carlos.gomes@email.com", role: "user" },
  { id: "5", name: "Maria Isabel Chipenda", userName: "Huambo", points: 2100, profession: "Estudante", email: "maria.chipenda@email.com", role: "user" },
];
