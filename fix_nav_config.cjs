const fs = require('fs');
let content = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// Replace the broken end of the object
content = content.replace(
  "    {\n}\n\nexport const roleGradients",
  "  ]\n};\n\nexport const roleGradients"
);

fs.writeFileSync('src/lib/nav-config.ts', content);
