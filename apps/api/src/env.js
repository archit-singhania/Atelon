export function validateEnv(env = process.env) {
  const numeric = ['PORT', 'CHAT_RATE_PER_HOUR', 'DAILY_CHAT_CAP'];
  for (const key of numeric) if (env[key] && (!Number.isFinite(Number(env[key])) || Number(env[key]) < 0)) throw new Error(`${key} must be a non-negative number.`);
  for (const key of ['SUPABASE_URL','VISION_API_URL']) if (env[key] && !/^https:\/\//.test(env[key])) throw new Error(`${key} must be an HTTPS URL.`);
  const paired = [Boolean(env.SUPABASE_URL), Boolean(env.SUPABASE_SERVICE_ROLE_KEY)]; if (paired[0] !== paired[1]) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together.');
  const vision=['VISION_API_URL','VISION_API_KEY','VISION_MODEL'].map(key=>Boolean(env[key]));if(vision.some(Boolean)&&!vision.every(Boolean))throw new Error('VISION_API_URL, VISION_API_KEY and VISION_MODEL must be configured together.');
  return env;
}
