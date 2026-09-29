const fs = require('fs');
const file = 'frontend/src/pages/app/DashboardPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = 'const completionRate = Math.round((dashboard.today_completion_rate ?? 0) * 100)';
const replacement1 = `const targetTasks = deduplicateTasks([...dashboard.today_tasks, ...dashboard.overdue_tasks])
  const tasksCompletedToday = targetTasks.filter(t => t.status === 'completed').length
  const tasksDueToday = targetTasks.length
  const completionRate = tasksDueToday === 0 ? 0 : Math.round((tasksCompletedToday / tasksDueToday) * 100)`;

const target2 = '{dashboard.tasks_completed_today ?? 0} of {dashboard.tasks_due_today ?? 0} tasks done';
const replacement2 = '{tasksCompletedToday} of {tasksDueToday} tasks done';

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf8');
