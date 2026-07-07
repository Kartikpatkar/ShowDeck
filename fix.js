const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  // The system probably wrote \` instead of `
  content = content.replace(/\\`/g, '`');
  // It probably wrote \${ instead of ${
  content = content.replace(/\\\$\{/g, '${');
  fs.writeFileSync(path, content, 'utf8');
}

fixFile('js/pages/calendar.js');
fixFile('js/pages/history.js');
console.log('Fixed');
