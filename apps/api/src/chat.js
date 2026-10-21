import { findForQuestion } from './data.js';
import { askChain } from './providers.js';

export const MAX_INPUT = 500;

const TIER_NOTE = {
  full: 'exact 3D model',
  reference: 'REFERENCE 3D model (approximate, not the exact vehicle)',
  'specs-only': 'no 3D model'
};

export const SYSTEM_PROMPT = [
  'You are the Atelon vehicle assistant.',
  'Answer ONLY from the DATA block provided. If the data does not contain the answer, say "I don\'t have that data."',
  'Never invent specifications. Never present a Reference 3D model as the exact vehicle.',
  'Cite the source URL for a figure if the user asks where it came from.',
  'Decline legal, safety-critical or purchase-guarantee advice.',
  'Keep answers short (under 120 words).'
].join(' ');

export function formatContext(vehicles) {
  return vehicles
    .map((v) => {
      const specs = v.specs.map((s) => `- ${s.key}: ${s.value}${s.unit ? ' ' + s.unit : ''} (source: ${s.source})`).join('\n');
      return `# ${v.make} ${v.model} (${v.years[0]}-${v.years[1] ?? 'present'}, ${TIER_NOTE[v.tier]})\n${v.summary}\n${specs || '- no verified specs yet'}`;
    })
    .join('\n\n');
}

const REQUESTED_KEYS = ['power', 'torque', 'engine', 'transmission', 'top speed', 'weight', 'wheelbase', 'dimensions', 'fuel', 'chassis', 'debut', 'layout', 'ground clearance', 'water wading'];
function missingRequestedData(vehicles, question) {
  const requested = REQUESTED_KEYS.find((key) => question.toLowerCase().includes(key));
  return requested && !vehicles.some((vehicle) => vehicle.specs.some((spec) => spec.key.toLowerCase().includes(requested))) ? requested : null;
}

export function noAiAnswer(vehicles, question) {
  if (!vehicles.length) return "AI is resting, and I couldn't match a vehicle in your question. Try a make and model, e.g. a name from the Garage.";
  const requested = missingRequestedData(vehicles, question);
  if (requested) {
    return `I don't have that ${requested} data for ${vehicles.map((vehicle) => `${vehicle.make} ${vehicle.model}`).join(' or ')}.`;
  }
  const body = vehicles
    .map((v) => {
      const specs = v.specs.length ? v.specs.map((s) => `${s.key}: ${s.value}${s.unit ? ' ' + s.unit : ''}`).join('; ') : 'no verified specs yet';
      return `${v.make} ${v.model} - 3D tier: ${v.tier}. ${specs}`;
    })
    .join('\n');
  return `AI is resting, here are the facts:\n${body}`;
}

let day = new Date().toISOString().slice(0, 10);
let count = 0;
function underDailyCap(env) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    count = 0;
  }
  return count++ < Number(env.DAILY_CHAT_CAP || 300);
}

function grounded(text, context) {
  const clean = String(text).trim().slice(0, 2000);
  if (!clean) return null;
  const numbers = (value) => (value.match(/\b\d+(?:[.,]\d+)?\b/g) || []).map((item) => item.replace(',', '.'));
  const allowed = new Set(numbers(context));
  return numbers(clean).every((value) => allowed.has(value)) ? clean : null;
}

export async function answerQuestion({ vehicles, chain, question, log, env = process.env, signal }) {
  const matches = findForQuestion(vehicles, question);
  const sources = missingRequestedData(matches, question) ? [] : [...new Set(matches.flatMap((v) => v.specs.map((s) => s.source)))];

  if (!matches.length) return { answer: "I don't have that data. Try naming a make and model from the Garage.", provider: 'none', sources: [], matchedVehicles: [], fallback: true, fallbackReason: 'no-matching-vehicle', retryable: false, attemptedProviders: [] };

  if (chain.length && underDailyCap(env)) {
    const context = formatContext(matches);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `DATA:\n${context}\n\nQUESTION: ${question}` }
    ];
    const r = await askChain(chain, messages, log, { signal });
    const safeAnswer = r.text && grounded(r.text, context);
    if (safeAnswer) return { answer: safeAnswer, provider: r.provider, sources, matchedVehicles: matches.map((v) => v.slug), fallback: false, fallbackReason: null, retryable: false, attemptedProviders: r.attemptedProviders };
    return { answer: noAiAnswer(matches, question), provider: 'no-ai', sources, matchedVehicles: matches.map((v) => v.slug), fallback: true, fallbackReason: 'providers-unavailable', retryable: true, attemptedProviders: r.attemptedProviders };
  }
  return { answer: noAiAnswer(matches, question), provider: 'no-ai', sources, matchedVehicles: matches.map((v) => v.slug), fallback: true, fallbackReason: chain.length ? 'daily-cap-reached' : 'no-provider-configured', retryable: chain.length > 0, attemptedProviders: [] };
}
