// Runs data/eval-questions.json against the API and writes docs/eval-report.csv.
// Usage: API_URL=http://localhost:8787 npm run eval:chat
// Target from the plan: 90%+ correct and grounded. Respect the chat rate limit (set CHAT_RATE_PER_HOUR high locally).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const api = process.env.API_URL || 'http://localhost:8787';
const tests = JSON.parse(fs.readFileSync(path.join(root, 'data', 'eval-questions.json'), 'utf8')).filter((t) => !t.question.startsWith('TODO'));

let pass = 0;
const report = ['question,passed,provider,answer'];
for (const t of tests) {
  let ok = false, provider = '', answer = '';
  try {
    const res = await fetch(`${api}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: t.question }) });
    const data = await res.json();
    answer = String(data.answer ?? data.error ?? ''); provider = data.provider ?? `HTTP ${res.status}`;
    ok = t.mustInclude.every((s) => answer.toLowerCase().includes(s.toLowerCase()));
  } catch (e) { answer = `ERROR ${e.message}`; }
  if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'MISS'}  ${t.question}`);
  report.push([JSON.stringify(t.question), ok, provider, JSON.stringify(answer.replace(/\n/g, ' '))].join(','));
}
fs.writeFileSync(path.join(root, 'docs', 'eval-report.csv'), report.join('\n') + '\n');
const pct = tests.length ? Math.round((pass / tests.length) * 100) : 0;
console.log(`\n${pass}/${tests.length} passed (${pct}%). Report: docs/eval-report.csv`);
process.exit(tests.length && pct >= 90 ? 0 : 1);
