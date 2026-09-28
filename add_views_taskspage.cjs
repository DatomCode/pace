const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/app/TasksPage.tsx', 'utf8');

// 1. Add AlertCircle, CalendarDays to imports
content = content.replace(
  "import { Plus, Search, CheckCircle2 } from 'lucide-react'",
  "import { Plus, Search, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react'"
);

// 2. Add viewMode state and update selectedDate
content = content.replace(
  "const [selectedDate, setSelectedDate] = useState<Date>(new Date())",
  "const [selectedDate, setSelectedDate] = useState<Date>(new Date())\n  const [viewMode, setViewMode] = useState<'date' | 'overdue' | 'upcoming'>('date')"
);

// 3. Update filter logic
const oldFilterRegex = /const rawTasks = data\?\.results \?\? \[\][\s\S]*?const tasks = rawTasks\.filter\(task => \{[\s\S]*?if \(\!task\.due_date\) return false[\s\S]*?return task\.due_date === format\(selectedDate, 'yyyy-MM-dd'\)[\s\S]*?\}\)/;
const newFilter = `const rawTasks = data?.results ?? []
  const tasks = rawTasks.filter(task => {
    if (!task.due_date) return false
    
    if (viewMode === 'date') {
      return task.due_date === format(selectedDate, 'yyyy-MM-dd')
    } else if (viewMode === 'overdue') {
      return task.due_date < format(new Date(), 'yyyy-MM-dd') && task.status !== 'completed'
    } else if (viewMode === 'upcoming') {
      return task.due_date > format(new Date(), 'yyyy-MM-dd')
    }
    return true
  })`;
content = content.replace(oldFilterRegex, newFilter);

// 4. Update Header Title Logic
content = content.replace(
  '{isSameDay(selectedDate, new Date()) ? "Today\'s Tasks" : `${format(selectedDate, \'MMM d\')} Tasks`}',
  '{viewMode === \'overdue\' ? "Overdue Tasks" : viewMode === \'upcoming\' ? "Later" : isSameDay(selectedDate, new Date()) ? "Today\'s Tasks" : `${format(selectedDate, \'MMM d\')} Tasks`}'
);

// 5. Update Date Row
const oldDateRowRegex = /<div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x -mx-4 px-4">[\s\S]*?(?=\{\/\* Status filter pill tabs \*\/\}|\{\/\* \?"\? Status filter)/i;
const newDateRow = `<div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x -mx-4 px-4">
          {/* Overdue Button */}
          <button
            onClick={() => setViewMode('overdue')}
            className={cn(
              'snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-[24px] transition-all',
              viewMode === 'overdue'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 border border-red-100 dark:border-red-500/20'
            )}
          >
            <AlertCircle className="w-6 h-6 mb-1" />
            <span className="text-[11px] font-bold">Overdue</span>
          </button>

          {Array.from({ length: 14 }).map((_, i) => {
            const date = addDays(subDays(new Date(), 2), i)
            const isSelected = viewMode === 'date' && isSameDay(date, selectedDate)
            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(date)
                  setViewMode('date')
                }}
                className={cn(
                  'snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-[24px] transition-all',
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-surface text-text-primary hover:bg-gray-50 dark:hover:bg-surface-overlay border border-gray-100 dark:border-border'
                )}
              >
                <span className={cn('text-[11px] font-medium mb-1', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'MMM')}</span>
                <span className="text-[22px] font-bold leading-none mb-1">{format(date, 'dd')}</span>
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'EEE')}</span>
              </button>
            )
          })}

          {/* Upcoming Button */}
          <button
            onClick={() => setViewMode('upcoming')}
            className={cn(
              'snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-[24px] transition-all',
              viewMode === 'upcoming'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 border border-blue-100 dark:border-blue-500/20'
            )}
          >
            <CalendarDays className="w-6 h-6 mb-1" />
            <span className="text-[11px] font-bold">Later</span>
          </button>
        </div>\n\n        `;
content = content.replace(oldDateRowRegex, newDateRow);

fs.writeFileSync('frontend/src/pages/app/TasksPage.tsx', content);
