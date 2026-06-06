import { execSync } from 'child_process';

const map = {
  "3c0632f": "Comecei a aventura! Criei toda a estrutura base e o design lindo do nosso Economia com História",
  "d69ba3e": "Dei uma atualizada no ficheiro README para explicar melhor o nosso projeto",
  "1e4bc0e": "Limpei os emojis do README para dar um ar mais sério e profissional ao projeto",
  "d220650": "Preparei as configurações necessárias para conseguirmos pôr o site no ar pelo Render",
  "c1a7383": "Troquei as imagens de exemplo por fotos reais fantásticas, deu outra vida ao site",
  "72bc5e3": "Adicionei o modo claro, a navegação no computador e coloquei os textos finais",
  "468066f": "Ajustei as bordas do pódio para ficarem visíveis e meti os números brancos. Top!",
  "2eb66ee": "Dei os últimos retoques no design e preparei tudo para a nossa publicação",
  "d491317": "Resolvi aquele problema chato no servidor que estava a mandar o site abaixo no Render",
  "f6dca16": "Mudei para que o site abra logo em modo claro por padrão, fica bem melhor",
  "a90c596": "Corrigi a cor da letra na caixa de comentários quando está em modo claro",
  "c57a8aa": "Pintei o texto e as barras de comentários de branco puro para ficar perfeito no claro",
  "213ecdc": "Escureci um pouco o texto no modo claro para não cansar a vista a quem lê",
  "087b4c5": "Tirei aquele efeito de desaparecer na imagem principal para mostrar melhor a foto",
  "ae82db1": "Mudei os textos secundários para branco quando o site está escuro, lê-se bem melhor",
  "f5b3e56": "Criei um truque no servidor para que o nosso site não adormeça e esteja sempre bala",
  "b0965f4": "Agora já dá para as pessoas dizerem se são estudantes ou professores ao criar conta",
  "f158711": "Melhorei o painel de admin para mostrar o nome todo, email e a profissão da malta",
  "bd4cbb8": "Dei um jeito nas cores de fundo do painel de administração no modo claro",
  "c69d8b5": "Pus os textos mais escuros e vermelhos no painel de utilizadores para grande destaque",
  "57ce6fc": "Fiz um super painel de admin para gerir conteúdos, ver estatísticas ao vivo e muito mais",
  "54159cf": "Ensinei o servidor a criar as tabelas da BD sozinho quando liga, adeus erros",
  "801968a": "Removi a criação forçada da base de dados ao publicar para não dar stresses no deploy",
  "bb1b043": "Escondi os administradores da lista de utilizadores para gerirmos apenas os alunos",
  "a255ddb": "Fixei as bordas vermelhas e a barra de pesquisa para estarem sempre visíveis no admin",
  "b3f7d7a": "Tirei a obrigação de escrever tudo em maiúsculas, agora as pessoas escrevem como quiserem",
  "81d0d1d": "Fiz com que o vídeo sirva logo de capa principal, sem precisar de imagens à parte",
  "a899f03": "Administradores já podem carregar os vídeos e imagens diretamente do PC para o site",
  "8f7f2ed": "Liguei o site ao Telegram para guardar lá os nossos vídeos e imagens gratuitamente",
  "8d05504": "O pessoal já pode pôr as suas próprias fotos de perfil que ficam guardadas na nuvem",
  "7d1a1b7": "Corrigi um bug que trocava o tema escuro/claro ao entrar no painel de administração",
  "8d48800": "Melhorei os textos dos cartões do painel de admin para se lerem melhor no modo claro",
  "53cd830": "Garanti que os ícones e fotos ficam brutais e visíveis nos cartões escuros no claro",
  "d09d572": "Corrigi a cor da primeira letra quando alguém não tem foto no modo claro",
  "62e0abb": "Fiz mudança no servidor para enviar as fotos de perfil com a qualidade máxima",
  "3bc8642": "Dei um novo visual ao menu do telemóvel, com ícones a mudar de cor consoante o tema",
  "2457d7c": "Mudei uns ícones no admin e passei a mostrar a foto real de quem se regista",
  "e7876c7": "Fiz várias melhorias nos detalhes, pus dados reais e limpei coisas no painel admin",
  "270fcff": "Impedi que o ecrã do telemóvel faça zoom sem querer e corrigi um campo no admin",
  "bd8d452": "Agora já podemos carregar também episódios de podcasts no painel de admin",
  "0f6137e": "Tornei as estatísticas de debates automáticas para estarem sempre atualizadas",
  "5946f9a": "Pus a aparecer a cara de cada utilizador na lista de malta recente no admin",
  "7d8296b": "Aumentei as fotos de perfil e mostro a profissão de cada um logo de caras",
  "b36d4c7": "Escondi o meu perfil da lista de novos utilizadores porque somos admin",
  "b0bb06a": "Passei a cor do texto para preto no claro na malta recente, lê-se super bem",
  "ffe745e": "Criei uma galeria para ver fotos em grande e corrigi mais textos cinzentos",
  "25ed693": "Reparei um erro escondido que estava a dar cabo da página de administração",
  "d8a1e2d": "Aproveitei o componente de imagens para que o admin possa clicar e ver bem as fotos",
  "1870ccd": "Afinei os parâmetros da imagem do admin para ela abrir direitinha",
  "8f10e8e": "Organizei as etiquetas das fotos com borda vermelha bacana e acertei as cores",
  "88a2e0a": "Pintei o texto que estava cinzento para preto no claro para ter grande contraste",
  "fbd7804": "Mudei o cabeçalho para ele não ficar por cima do vídeo a chatear",
  "e0953ea": "Fiz magia e agora toda a gente pode responder aos comentários dos outros!",
  "c16b1c9": "Arranjei a página que saltava feita doida quando íamos escrever uma resposta",
  "918c142": "Pus as bordas dos comentários à cor de vinho sólido, charme total",
  "5fab678": "Fiz umas linhas de ligação bonitas nos comentários para sabermos quem responde a quem",
  "de810b9": "Reduzi um bocadinho o espaço vazio entre comentários para encher mais a página",
  "8e6e196": "Fiz com que só mostre 2 respostas iniciais, e depois um botão para carregar mais",
  "f3449c4": "Mudei a lógica do código para permitir uma árvore infinita de respostas",
  "0119ae6": "Mas depois limitei as respostas para não ficar demasiada palha e ir ao fundo da página",
  "a993767": "Dei mais um pouco de espaço nas respostas e aumentei o limite das conversas",
  "7e588ab": "Escondi o botão de admin no menu do telemóvel para ficar só para administradores",
  "12586ad": "Criei no painel de admin o poder de escolhermos que aulas queremos destacar",
  "50e806a": "Apanhei e resolvi um erro maroto que impedia a página de conteúdos de abrir",
  "606d41c": "Esqueci-me de uma vírgula ou assim mas vi logo e reparei a página principal",
  "77664f1": "Metemos o botão de login fácil no menu do telemóvel para os visitantes",
  "7f5f7a6": "Ajeitei o design nas páginas de registo e login para ficarem lindas e fluidas",
  "ab91a90": "Avisei a base de dados em produção que agora temos secções de conteúdos em destaque",
  "61485da": "Troquei o texto cinza para preto na zona das recomendações, muito mais legível",
  "3fb99d0": "Corrigi as letras do menu que tinham desaparecido no modo claro no telemóvel",
  "83e73f0": "Dei um jeito ao ícone do sol e lua, e meti o texto a branco na caixa do login",
  "5620060": "Fiz as pazes com o histórico, limpei a sujidade, atualizei os ficheiros todos locais e a casa está arrumada!",
  "06dfd4f": "Pintei o ícone do lixo e do olho de branco para se ver perfeitamente nos comentários ocultos"
};

const author = 'Geraldo Chiquemba <geraldochiquemba@gmail.com>';

function getMsg(hash) {
  for (const key in map) {
    if (hash.startsWith(key)) return map[key];
  }
  return null;
}

try {
  console.log("Iniciando reconstrução de histórico...");
  const hashesOutput = execSync('git log --reverse --format="%h"', { encoding: 'utf-8' });
  const allHashes = hashesOutput.trim().split('\n').map(s => s.trim()).filter(Boolean);
  
  if (allHashes.length === 0) throw new Error("Sem commits");
  
  const firstHash = allHashes[0];
  console.log("Fazendo checkout no primeiro commit: " + firstHash);
  
  try { execSync('git branch -D temp-rewrite', { stdio: 'ignore' }); } catch(e){}
  execSync('git checkout -b temp-rewrite ' + firstHash);
  
  let firstMsg = getMsg(firstHash) || execSync('git log -1 --format="%s"', { encoding: 'utf-8' }).trim();
  execSync('git commit --amend -m "' + firstMsg.replace(/"/g, '\\\\"') + '" --author="' + author + '"', { stdio: 'ignore' });
  
  for (let i = 1; i < allHashes.length; i++) {
    const hash = allHashes[i];
    console.log("Cherry-pick " + hash);
    try {
      execSync('git cherry-pick ' + hash, { stdio: 'ignore' });
    } catch(e) {
      console.log("Erro no cherry pick " + hash + ", possivelmente vazio. Saltando...");
      execSync('git cherry-pick --skip', { stdio: 'ignore' });
      continue;
    }
    
    let msg = getMsg(hash) || execSync('git log -1 --format="%s"', { encoding: 'utf-8' }).trim();
    execSync('git commit --amend -m "' + msg.replace(/"/g, '\\\\"') + '" --author="' + author + '"', { stdio: 'ignore' });
  }
  
  console.log("Substituindo main branch...");
  execSync('git checkout main');
  execSync('git reset --hard temp-rewrite');
  execSync('git branch -D temp-rewrite');
  
  console.log("Histórico reescrito com sucesso! Pronto para dar o git push --force");
} catch (e) {
  console.error("Erro fatal:", e.stdout ? e.stdout.toString() : e.message);
}
