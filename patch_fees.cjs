const fs = require('fs');
let content = fs.readFileSync('../OP-CS_CONNECT_-Backend-/src/routes/fees.ts', 'utf8');

const getFeesRoute = `
// GET /api/fees
router.get('/', async (req: Request, res: Response) => {
  try {
    const allFees = await listData('feeRecords');
    res.json(allFees || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fee records' });
  }
});
`;

content = content.replace("const router = Router();", "const router = Router();\n" + getFeesRoute);
fs.writeFileSync('../OP-CS_CONNECT_-Backend-/src/routes/fees.ts', content);
