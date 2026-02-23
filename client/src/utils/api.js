const BASE = '/api';
const KEY = 'mechgg_token';
export const getToken = () => localStorage.getItem(KEY);
export const setToken = t => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

async function req(url, opts={}) {
  const token = getToken();
  const headers = { ...opts.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + url, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.code = data.code; throw e; }
  return data;
}

export const api = {
  register: b => req('/auth/register', { method:'POST', body:JSON.stringify(b) }),
  login: b => req('/auth/login', { method:'POST', body:JSON.stringify(b) }),
  getMe: () => req('/auth/me'),
  upgrade: plan => req('/auth/upgrade', { method:'POST', body:JSON.stringify({ plan }) }),
  getGames: cat => req('/games' + (cat ? '?category='+cat : '')),
  uploadClip: fd => req('/analysis/upload', { method:'POST', body:fd }),
  getHistory: p => req('/analysis/history' + (p ? '?'+new URLSearchParams(p) : '')),
  getDashboard: () => req('/analysis/stats/dashboard'),
  getAnalysis: id => req('/analysis/' + id),
  deleteAnalysis: id => req('/analysis/' + id, { method:'DELETE' }),
  getFindings: p => req('/community/findings' + (p ? '?'+new URLSearchParams(p) : '')),
  postFinding: b => req('/community/findings', { method:'POST', body:JSON.stringify(b) }),
  upvote: id => req('/community/findings/'+id+'/upvote', { method:'POST' }),
  getComments: id => req('/community/findings/'+id+'/comments'),
  postComment: (id,b) => req('/community/findings/'+id+'/comments', { method:'POST', body:JSON.stringify(b) }),
  getCoaches: () => req('/community/coaches'),
  saveCoach: b => req('/community/coaches', { method:'POST', body:JSON.stringify(b) }),
};

export const DIMENSION_LABELS = {
  targetAcquisition:'Target Acquisition', spreadControl:'Spread Control', onTargetTracking:'On-Target Tracking',
  overshootControl:'Overshoot Control', consistency:'Consistency', sessionMomentum:'Session Momentum',
  brakingConsistency:'Braking Consistency', apexPrecision:'Apex Precision', throttleControl:'Throttle Control',
  oversteerRecovery:'Oversteer Recovery', lapConsistency:'Lap Consistency', hazardReaction:'Hazard Reaction',
  decisionSpeed:'Decision Speed', inputTiming:'Input Timing', executionConsistency:'Execution Consistency',
  pressurePerformance:'Pressure Performance', gameReading:'Game Reading', adaptability:'Adaptability',
  actionsPerMinute:'Actions Per Minute', decisionRhythm:'Decision Rhythm', resourceEfficiency:'Resource Efficiency',
  attentionSwitching:'Attention Switching', buildOrderConsistency:'Build Order', crisisManagement:'Crisis Management',
  inputPrecision:'Input Precision', comboExecution:'Combo Execution', reactionTiming:'Reaction Timing',
  punishAccuracy:'Punish Accuracy', neutralGame:'Neutral Game',
};

export function scoreColor(s) {
  if (s >= 80) return '#4ade80';
  if (s >= 60) return '#6ee7f7';
  if (s >= 40) return '#fbbf24';
  return '#f87171';
}
export function scoreLabel(s) {
  if (s >= 85) return 'Elite';
  if (s >= 70) return 'Strong';
  if (s >= 55) return 'Developing';
  if (s >= 40) return 'Inconsistent';
  return 'Needs Work';
}
export function timeAgo(ts) {
  const d = Date.now()/1000 - ts;
  if (d < 60) return 'Just now';
  if (d < 3600) return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  if (d < 2592000) return Math.floor(d/86400) + 'd ago';
  return new Date(ts*1000).toLocaleDateString();
}

// Messages
Object.assign(api, {
  getInbox: () => req('/messages/inbox'),
  getSent: () => req('/messages/sent'),
  getUnreadCount: () => req('/messages/unread-count'),
  sendMessage: b => req('/messages/send', { method:'POST', body:JSON.stringify(b) }),
  markRead: id => req('/messages/'+id+'/read', { method:'POST' }),
  deleteMessage: id => req('/messages/'+id, { method:'DELETE' }),
  // Forum
  getForumCategories: () => req('/forum/categories'),
  getForumPosts: catId => req('/forum/posts?categoryId='+catId),
  getForumPost: id => req('/forum/posts/'+id),
  createForumPost: b => req('/forum/posts', { method:'POST', body:JSON.stringify(b) }),
  replyForumPost: (id,body) => req('/forum/posts/'+id+'/reply', { method:'POST', body:JSON.stringify({ body }) }),
  upvoteForumPost: id => req('/forum/posts/'+id+'/upvote', { method:'POST' }),
  // Drills
  getDrillPlan: analysisId => req('/drills/'+analysisId),
  completeDrill: (planId,drillId) => req('/drills/'+planId+'/complete', { method:'POST', body:JSON.stringify({ drillId }) }),
});

// MechBot
Object.assign(api, {
  mechbotChat: (message, history) => req('/mechbot/chat', { method:'POST', body:JSON.stringify({ message, history }) }),
  mechbotSuggestCategory: (title, body) => req('/mechbot/suggest-category', { method:'POST', body:JSON.stringify({ title, body }) }),
});
