const fs = require('fs');

const file = 'src/pages/onboarding/OnboardingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change animations
content = content.replace(/animate-fade-in/g, 'animate-flow-in');

// 2. Increase logo size
content = content.replace(
  /<div className="flex items-center justify-center size-9 rounded-xl gradient-brand shadow-brand">/,
  '<div className="flex items-center justify-center size-12 rounded-2xl gradient-brand shadow-brand">'
);
content = content.replace(
  /<span className="text-white font-bold text-lg leading-none">P<\/span>/,
  '<span className="text-white font-bold text-2xl leading-none">P</span>'
);
content = content.replace(
  /<span className="text-lg font-bold text-text-primary">Pace<\/span>/,
  '<span className="text-2xl font-bold text-text-primary mb-0\.5">Pace</span>'
);

// 3. Remove Box styling and increase wrapper size
content = content.replace(
  /<div className="relative w-full max-w-\[420px\]">/,
  '<div className="relative w-full max-w-lg">'
);
content = content.replace(
  /<div className="bg-surface border border-border rounded-3xl p-8 shadow-strong min-h-\[500px\] flex flex-col">/,
  '<div className="min-h-[500px] flex flex-col w-full">'
);

// 4. Increase image size
content = content.replace(
  /<div className="w-full h-48 bg-surface-overlay rounded-2xl mb-8 overflow-hidden">/,
  '<div className="w-full h-[280px] bg-surface-overlay rounded-3xl mb-8 overflow-hidden shadow-sm">'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated UI");
