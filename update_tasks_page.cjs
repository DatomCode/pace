const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/app/TasksPage.tsx', 'utf8');

// Add date-fns imports
content = content.replace(
  "import { useQuery } from '@tanstack/react-query'",
  "import { useQuery } from '@tanstack/react-query'\nimport { addDays, subDays, format, isSameDay } from 'date-fns'"
);

// Add selectedDate state
content = content.replace(
  "export default function TasksPage() {",
  "export default function TasksPage() {\n  const [selectedDate, setSelectedDate] = useState<Date>(new Date())"
);

// Add date filter logic
content = content.replace(
  "const tasks = data?.results ?? []",
  "const rawTasks = data?.results ?? []\n  const tasks = rawTasks.filter(task => {\n    if (!task.due_date) return false\n    return task.due_date === format(selectedDate, 'yyyy-MM-dd')\n  })"
);

// Let's replace the whole top section from `<div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">` to the status filter
const replacement = `<div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-xl hover:bg-surface-overlay transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-lg font-bold text-text-primary">
            {isSameDay(selectedDate, new Date()) ? "Today's Tasks" : \`\${format(selectedDate, 'MMM d')} Tasks\`}
          </h1>
          <button className="p-2 -mr-2 rounded-xl hover:bg-surface-overlay transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
          </button>
        </div>

        {/* Date Row */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x -mx-4 px-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const date = addDays(subDays(new Date(), 2), i)
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-[24px] transition-all',
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-surface text-text-primary hover:bg-gray-50 dark:hover:bg-surface-overlay'
                )}
              >
                <span className={cn('text-[11px] font-medium mb-1', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'MMM')}</span>
                <span className="text-[22px] font-bold leading-none mb-1">{format(date, 'dd')}</span>
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'EEE')}</span>
              </button>
            )
          })}
        </div>

        {/* Status filter pill tabs */}`;

content = content.replace(/<div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">[\s\S]*?\{\/\* \s*Status filter pill tabs/i, replacement);

// Remove the secondary filters row
content = content.replace(/\{\/\* Secondary filters row \*\/\}[\s\S]*?(?=\{\/\* Task List \*\/\}|\{\/\* Task list)/i, "");

fs.writeFileSync('frontend/src/pages/app/TasksPage.tsx', content);
