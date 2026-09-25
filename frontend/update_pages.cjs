const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const startStr = '<div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-surface flex-col justify-between p-12 relative overflow-hidden">';
  const startIndex = content.indexOf(startStr);
  
  const endMatch = content.match(/\{\/\* .*? Right panel/);
  const endIndex = endMatch.index;
  
  const replacement = `      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-surface flex-col justify-between p-12 relative overflow-hidden">
        {/* Background illustration */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/auth_illustration.jpg" 
            alt="Productivity Illustration" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center size-10 rounded-xl gradient-brand shadow-brand">
            <span className="text-white font-bold text-xl leading-none">P</span>
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight bg-surface/50 px-2 py-1 rounded-md backdrop-blur-sm">Pace</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 bg-surface/50 backdrop-blur-md p-8 rounded-2xl border border-border shadow-soft max-w-lg">
          <h1 className="text-4xl font-bold text-text-primary leading-tight mb-4 text-balance">
            Your personal productivity<br />command center.
          </h1>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Plan your work, stick to your schedule, and see real progress every week.
          </p>

          {/* Stage steps */}
          <ol className="flex flex-col gap-4" aria-label="Pace workflow stages">
            {STAGES.map((stage, index) => (
              <li key={stage.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center size-7 rounded-full text-xs font-bold',
                      'bg-brand-500/15 text-brand-500 border border-brand-500/30'
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < STAGES.length - 1 && (
                    <div className="w-px h-5 bg-border mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-sm font-bold text-text-primary">{stage.label}</h3>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>\n\n      `;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('src/pages/public/LoginPage.tsx');
updateFile('src/pages/public/RegisterPage.tsx');
