const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminAnalytics.tsx', 'utf8');

content = content.replace(
  /\.then\(r => \{ if \(\!r\.ok\).*?return r\.json\(\); \}\)\s*\.then\(data => \{ setAnalytics\(data\); setLoading\(false\); \}\)/s,
  ".then((data: any) => { setAnalytics(data.analytics || data); setLoading(false); })"
);

fs.writeFileSync('src/pages/admin/AdminAnalytics.tsx', content);
