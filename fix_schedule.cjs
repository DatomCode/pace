const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/app/SchedulePage.tsx', 'utf8');

const newSolidColors = `
const EVENT_SOLID_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-cyan-500',
]
`;

content = content.replace(
  "const EVENT_BORDER_COLORS = [",
  newSolidColors + "\nconst EVENT_BORDER_COLORS = ["
);

const oldEventBlock = `              {/* Event cards */}
              {events.map((event, idx) => {
                const startMins = timeToMinutes(event.start_time)
                const endMins = timeToMinutes(event.end_time)
                const top = startMins - dayStartMin
                const height = endMins - startMins
                const safeTop = Math.max(0, top)
                const safeHeight = Math.max(28, height)
                const colorIdx = idx % EVENT_BORDER_COLORS.length

                return (
                  <div
                    key={event.id}
                    onClick={() => openEditModal(event)}
                    className={cn(
                      'absolute left-16 right-4 rounded-xl border-l-4 overflow-hidden cursor-pointer transition-all group',
                      'bg-white dark:bg-surface shadow-sm hover:shadow-md',
                      EVENT_BORDER_COLORS[colorIdx],
                    )}
                    style={{ top: \`\${safeTop}px\`, height: \`\${safeHeight}px\` }}
                  >
                    <div className="px-2.5 py-1.5 h-full flex flex-col justify-center">
                      <div className={cn('text-xs font-bold truncate', EVENT_TEXT_COLORS[colorIdx])}>
                        {event.title}
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {event.start_time} - {event.end_time}
                      </div>
                      {event.task_title && safeHeight >= 50 && (
                        <div className="text-[10px] text-text-disabled truncate mt-1 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full inline-block w-fit">
                          {event.task_title}
                        </div>
                      )}
                    </div>
                    <button
                      className="absolute top-1.5 right-1.5 p-1 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}`;

// If exact match fails, use regex or replace parts
content = content.replace(/className=\{cn\(\s*'absolute left-16 right-4 rounded-xl border-l-4 overflow-hidden cursor-pointer transition-all group',\s*'bg-white dark:bg-surface shadow-sm hover:shadow-md',\s*EVENT_BORDER_COLORS\[colorIdx\],\s*\)\}/,
  "className={cn('absolute left-16 right-4 rounded-md overflow-hidden cursor-pointer transition-all group shadow-sm hover:shadow-md', EVENT_SOLID_COLORS[idx % EVENT_SOLID_COLORS.length])}");

content = content.replace(/<div className="px-2\.5 py-1\.5 h-full flex flex-col justify-center">/g, '<div className="px-3 py-1.5 h-full flex flex-col">');

content = content.replace(/<div className=\{cn\('text-xs font-bold truncate', EVENT_TEXT_COLORS\[colorIdx\]\)\}>/g, '<div className="text-xs font-bold truncate text-white">');

content = content.replace(/<div className="text-\[10px\] text-text-muted mt-0\.5">/g, '<div className="text-[10px] text-white/90 mt-0.5">');

content = content.replace(/bg-gray-100 dark:bg-white\/10/g, 'bg-black/10 text-white/90');

content = content.replace(/text-text-disabled truncate mt-1/g, 'truncate mt-1 text-white/80');

content = content.replace(/text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500\/10/g, 'text-white/70 hover:text-white hover:bg-black/20');

fs.writeFileSync('frontend/src/pages/app/SchedulePage.tsx', content);
