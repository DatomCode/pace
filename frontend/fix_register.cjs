const fs = require('fs');

const filePath = 'src/pages/public/RegisterPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { cn }')) {
  content = content.replace("import { Input } from '@/components/ui/Input'", "import { Input } from '@/components/ui/Input'\nimport { cn } from '@/lib/utils'");
}

if (!content.includes('const STAGES = [')) {
  const stagesStr = `\n// ── Stage steps displayed on the left panel ──────────────────────────────────
const STAGES = [
  { label: 'Plan', description: 'Capture tasks & set priorities' },
  { label: 'Schedule', description: 'Block time for focused work' },
  { label: 'Execute', description: 'Work through your list' },
  { label: 'Review', description: 'Reflect and improve weekly' },
]\n`;
  content = content.replace('type RegisterFormValues = z.infer<typeof registerSchema>', 'type RegisterFormValues = z.infer<typeof registerSchema>\n' + stagesStr);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed RegisterPage.tsx");
