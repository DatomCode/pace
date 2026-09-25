const fs = require('fs');

function updateLanding() {
  const filePath = 'src/pages/public/LandingPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  const target = '<DashboardPreview />';
  const replacement = `{/* Illustration */}
        <div className="relative mt-16 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border shadow-strong bg-surface group">
          <img 
            src="/assets/landing_illustration.jpg" 
            alt="Pace Productivity Illustration" 
            className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-[1.01]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/40 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
        </div>`;
        
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated LandingPage.tsx");
  } else {
    console.log("DashboardPreview not found in LandingPage.tsx");
  }
}

updateLanding();
