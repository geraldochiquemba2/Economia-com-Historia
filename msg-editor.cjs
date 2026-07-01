const fs = require('fs');
const path = require('path');

// Mensagens na ordem EXATA dos commits do mais antigo para o mais recente
// (mesma ordem que o git rebase apresenta: oldest first)
const messages = [
  'Redesenhei a plataforma com um estilo mais elegante e resolvi os textos brancos do Sabias Que',
  'Tirei os fundos escuros horríveis dos ícones das estatísticas — no modo claro estavam um horror',
  'Tornei a barra de navegação de baixo e os filtros da página Explorar muito mais compactos no telemóvel',
  'Reduzi bastante os cards dos Destaques e dos Recomendados para caberem bem no ecrã do telemóvel',
  'Encolhi os cards, a barra de navegação e o cabeçalho da Explorar para ficarem tudo certos no telemóvel',
  'Limpei os ficheiros temporários de correção que ficaram espalhados pela pasta',
  'Bloqueei o sino de notificações para quem não está logado — agora vai direto ao login',
];

const counterFile = path.join('C:\\Users\\geral\\Desktop\\economia', '.rebase-counter');

let counter = 0;
try { counter = parseInt(fs.readFileSync(counterFile, 'utf8').trim()); } catch(e) {}

const msgFile = process.argv[2];
const content = fs.readFileSync(msgFile, 'utf8');
const comments = content.split('\n').filter(l => l.trimStart().startsWith('#'));
const newMsg = messages[counter] || content.split('\n')[0];

fs.writeFileSync(msgFile, newMsg + '\n\n' + comments.join('\n') + '\n');
fs.writeFileSync(counterFile, String(counter + 1));
