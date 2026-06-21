const fs = require('fs');
let content = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

content = content.replace("    {\n  admin: [", "  ],\n  admin: [");

fs.writeFileSync('src/lib/nav-config.ts', content);
