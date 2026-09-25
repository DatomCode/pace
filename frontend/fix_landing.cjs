const fs = require('fs');

const file = 'src/pages/public/LandingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove AI-powered task generation pill
content = content.replace(
  /<div className="inline-flex items-center gap-2 px-3 py-1\.5 rounded-full border border-brand-500\/30 bg-brand-500\/10 text-brand-400 text-xs font-medium mb-6">\s*<Sparkles className="w-3 h-3" \/>\s*AI-powered task generation\s*<\/div>/g,
  ''
);

// 2. Remove AI-assisted planning pill
content = content.replace(
  /<div className="inline-flex items-center gap-2 px-3 py-1\.5 rounded-full border border-purple-500\/30[\s\S]*?AI-assisted planning\s*<\/div>/g,
  ''
);

// 3. Update Stage component
const oldStageRegex = /function Stage\(\{[\s\S]*?\}\s*\)\s*\{\s*return\s*\([\s\S]*?<\/div>\s*\)\s*\}/;

const newStage = `function Stage({
  number,
  label,
  description,
  active,
  className,
}: {
  number: string
  label: string
  description: string
  active?: boolean
  className?: string
}) {
  return (
    <div className={\`card p-6 flex-1 hover:border-brand-500/30 transition-colors text-left \${className || ''}\`}>
      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center mb-4 \${active ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-elevated text-text-muted'}\`}>
        <span className="text-sm font-bold">{number}</span>
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{label}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  )
}`;

content = content.replace(oldStageRegex, newStage);

// 4. Fix ChevronRight alignment
content = content.replace(/<div className="hidden md:flex items-center justify-center pt-9 shrink-0">/g, '<div className="hidden md:flex items-center justify-center shrink-0 self-center">');

fs.writeFileSync(file, content, 'utf8');
console.log("Updated LandingPage.tsx");
