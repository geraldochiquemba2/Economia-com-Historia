const fs = require('fs');
const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/^pick /gm, 'reword ');
fs.writeFileSync(file, content);
