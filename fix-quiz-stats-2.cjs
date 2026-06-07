const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Quiz.tsx', 'utf8');

c = c.replace(
  /bg-white dark:bg-white\/5 border-2 border-\[#3A0310\] dark:border-white\/10 rounded-\[1\.5rem\] p-5 flex items-center gap-4 shadow-sm hover:bg-black\/90 dark:bg-white\/10\/5 transition-all/g,
  'bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:bg-[#3A0310]/5 dark:hover:bg-white/10 transition-all'
);

c = c.replace(
  /p-3 bg-black\/90 dark:bg-white\/10\/5 dark:bg-black\/90 dark:bg-white\/10\/30 rounded-xl/g,
  'p-3 bg-[#3A0310]/10 dark:bg-white/10 rounded-xl'
);

fs.writeFileSync('src/app/pages/Quiz.tsx', c);
console.log('Fixed Quiz.tsx stats containers with regex');
