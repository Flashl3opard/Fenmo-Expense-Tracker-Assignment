const fs = require('fs');

function processFile(path, modifier) {
  let content = fs.readFileSync(path, 'utf8');
  let newline = content.includes('\r\n') ? '\r\n' : '\n';
  let lines = content.split(newline);
  lines = modifier(lines);
  fs.writeFileSync(path, lines.join(newline));
}

processFile('app/page.tsx', (lines) => {
  // Add import
  lines.splice(27, 0, "import { fetchLocalExpenses } from '@/lib/localDb'");
  
  // Replace fetch block. Original fetch is at 66, if is 67-69, return is 71. But adding a line shifts them by 1.
  // Instead of hardcoding, find the line.
  let fetchIdx = lines.findIndex(l => l.includes('const response = await fetch(`/api/expenses'));
  if (fetchIdx !== -1) {
    lines[fetchIdx] = "  return fetchLocalExpenses(category, sort)";
    lines.splice(fetchIdx + 1, 6); // remove the if block and return statement
  }
  return lines;
});

processFile('components/ExpenseForm.tsx', (lines) => {
  // Add import
  let importIdx = lines.findIndex(l => l.includes("import { ExpenseCreateSchema }"));
  if (importIdx !== -1) {
    lines.splice(importIdx + 1, 0, "import { createLocalExpense } from '@/lib/localDb'");
  }

  // Replace first fetch block
  let fetchIdx1 = lines.findIndex(l => l.includes("const response = await fetch('/api/expenses'"));
  if (fetchIdx1 !== -1) {
    lines[fetchIdx1] = "      return createLocalExpense(values as any)";
    lines.splice(fetchIdx1 + 1, 11); // remove the rest of the fetch block
  }

  // Replace second fetch block
  let fetchIdx2 = lines.findIndex(l => l.includes("const response = await fetch('/api/expenses'"));
  if (fetchIdx2 !== -1) {
    lines[fetchIdx2] = "        await createLocalExpense(parsed.data as any)";
    lines.splice(fetchIdx2 + 1, 9); // remove the rest of the fetch block
  }

  return lines;
});

console.log('Update complete');
