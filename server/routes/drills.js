const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const DRILL_LIBRARY = {
  slow_acquisition: [
    { id:'acq1', name:'Flick Shot Warmup', duration:'10 min', frequency:'Daily', description:'In Aimlabs or Kovaaks, run the Gridshot task. Focus on clicking the moment the target appears — not after. Speed first, accuracy follows.', difficulty:'Beginner' },
    { id:'acq2', name:'Target Switch Drill', duration:'8 min', frequency:'Daily', description:'Use a tracking scenario and manually switch targets every 0.5s. Train your eyes to lead your crosshair to new targets.', difficulty:'Intermediate' },
    { id:'acq3', name:'Deathmatch First Contact', duration:'15 min', frequency:'3x/week', description:'In deathmatch, focus only on getting the first shot on target within 0.3s of spotting an enemy. Ignore the kill.', difficulty:'Intermediate' },
  ],
  poor_spray: [
    { id:'spr1', name:'Spray Pattern Trace', duration:'10 min', frequency:'Daily', description:'Pull out your main weapon in the practice range. Fire a full magazine at a wall, study the pattern. Then practice pulling down and left/right to counter it.', difficulty:'Beginner' },
    { id:'spr2', name:'7-bullet Burst Control', duration:'8 min', frequency:'Daily', description:'Fire in 7-round bursts with deliberate pauses. This builds the habit of stopping spray before it becomes uncontrollable.', difficulty:'Beginner' },
    { id:'spr3', name:'Moving Spray Control', duration:'12 min', frequency:'3x/week', description:'Practice counter-strafing: move, stop fully, then fire 5 rounds. The stop must be complete before shooting.', difficulty:'Intermediate' },
  ],
  overshoot: [
    { id:'ov1', name:'Slow Flick Training', duration:'10 min', frequency:'Daily', description:'Set aim trainer to 50% speed. Focus on stopping exactly on target — not past it. The pause is a separate skill from the movement.', difficulty:'Beginner' },
    { id:'ov2', name:'Micro-adjustment Drill', duration:'8 min', frequency:'Daily', description:'Start your crosshair 5 degrees off target and make small corrections to land on it. Builds fine motor control for the last 10% of a flick.', difficulty:'Intermediate' },
  ],
  inconsistent: [
    { id:'inc1', name:'Pre-session Warmup Routine', duration:'15 min', frequency:'Before every session', description:'Do the same 3 aim tasks in order before every ranked game. Consistency in warmup builds consistency in play.', difficulty:'Beginner' },
    { id:'inc2', name:'Session Length Cap', duration:'90 min max', frequency:'Daily', description:'Cut sessions to 90 minutes maximum. Most variance comes from mental fatigue in hour 2+.', difficulty:'Beginner' },
  ],
  session_fade: [
    { id:'sf1', name:'45-minute Break Rule', duration:'5 min break', frequency:'Every 45 min', description:'Set a timer. After 45 minutes of play, take a 5-minute break — stand up, look away from the screen. Return refreshed.', difficulty:'Beginner' },
  ],
  brake_inconsistent: [
    { id:'br1', name:'Marker Braking', duration:'20 min', frequency:'Daily', description:'Pick one track and one corner. Identify a fixed visual marker (sign, patch of grass). Brake at exactly that marker every lap for 20 minutes.', difficulty:'Beginner' },
    { id:'br2', name:'Trail Braking Practice', duration:'15 min', frequency:'3x/week', description:'Practice releasing the brake gradually as you turn in — not all at once. This is the most consistent braking technique at high level.', difficulty:'Intermediate' },
  ],
  missed_apex: [
    { id:'ap1', name:'Late Apex Drill', duration:'20 min', frequency:'Daily', description:'Turn in later than feels natural. Most drivers apex too early. Aim to be still turning at the apex cone, not opening throttle.', difficulty:'Beginner' },
    { id:'ap2', name:'One Corner Focus', duration:'30 min', frequency:'Daily', description:'Pick one difficult corner and run it 50 times in a row. Focus only on that one corner until it is perfect.', difficulty:'Intermediate' },
  ],
  pressure_drop: [
    { id:'pr1', name:'High-Stakes Practice Mode', duration:'15 min', frequency:'Daily', description:'Only play ranked or tournament modes. Pressure tolerance is trained by repeated exposure, not casual play.', difficulty:'Intermediate' },
    { id:'pr2', name:'Pre-performance Routine', duration:'3 min', frequency:'Before important matches', description:'Develop a 3-minute pre-match routine: breathing exercise, review your 3 key focus points, then start. Routine reduces anxiety variance.', difficulty:'Beginner' },
  ],
  input_timing: [
    { id:'it1', name:'Slow Practice Mode', duration:'20 min', frequency:'Daily', description:'Use training/practice mode at 75% speed. Master the timing at reduced speed before returning to full speed.', difficulty:'Beginner' },
    { id:'it2', name:'Input Window Analysis', duration:'10 min', frequency:'Weekly', description:'Record your practice sessions and review frame-by-frame where your inputs land relative to the optimal window.', difficulty:'Advanced' },
  ],
  camera_lock: [
    { id:'cl1', name:'10-second Camera Sweep', duration:'15 min', frequency:'Daily', description:'Set a phone timer to buzz every 10 seconds. Every buzz = move your camera to check the minimap and one other area of the map.', difficulty:'Beginner' },
    { id:'cl2', name:'Minimap-first Rule', duration:'During play', frequency:'Every game', description:'Every time you finish an action (kill unit, cast spell, place building), look at minimap before anything else.', difficulty:'Intermediate' },
  ],
  resource_float: [
    { id:'rf1', name:'Zero Float Challenge', duration:'30 min', frequency:'Daily', description:'Play a practice game with one rule: resources can never exceed 200. This forces constant spending and builds the habit permanently.', difficulty:'Intermediate' },
  ],
  dropped_combos: [
    { id:'dc1', name:'Combo Slow Motion', duration:'20 min', frequency:'Daily', description:'In training mode, set controller input speed to minimum. Execute your BnB combo perfectly at slow speed 50 times before increasing.', difficulty:'Beginner' },
    { id:'dc2', name:'Single Link Focus', duration:'15 min', frequency:'Daily', description:'Pick the one link you drop most often. Drill just that link 100 times per session until it is automatic.', difficulty:'Intermediate' },
  ],
  missed_punish: [
    { id:'mp1', name:'Punish Scenario Drilling', duration:'20 min', frequency:'Daily', description:'Set the CPU to loop a specific unsafe move. Practice punishing it 100 times until the response is completely automatic.', difficulty:'Beginner' },
    { id:'mp2', name:'Frame Data Study', duration:'10 min', frequency:'Weekly', description:'Review the frame data for your 5 most common matchups. Know the exact punish for each unsafe move by heart.', difficulty:'Intermediate' },
  ],
};

function generateDrillPlan(habits, gameCategory) {
  const weeks = [];
  const negHabits = habits.filter(h => !h.isPositive);
  
  // Week 1: Focus on most severe habits
  const week1Habits = negHabits.filter(h => h.severity === 'frequent').slice(0, 2);
  const week2Habits = negHabits.filter(h => h.severity === 'occasional').slice(0, 2);
  const allHabits = negHabits.slice(0, 3);

  const getDrills = (habitKeys) => {
    const drills = [];
    habitKeys.forEach(key => {
      const lib = DRILL_LIBRARY[key];
      if (lib) drills.push(...lib.slice(0, 2));
    });
    return drills;
  };

  weeks.push({
    week: 1,
    focus: 'Foundation — Address Critical Habits',
    theme: week1Habits.length ? week1Habits.map(h=>h.name).join(' + ') : 'General Mechanics',
    drills: getDrills(week1Habits.map(h=>h.key)).slice(0, 4),
    dailyTime: '20-30 min',
    goal: 'Build awareness of your most frequent mechanical errors',
  });

  weeks.push({
    week: 2,
    focus: 'Depth — Secondary Habit Work',
    theme: week2Habits.length ? week2Habits.map(h=>h.name).join(' + ') : 'Consistency Building',
    drills: getDrills([...week1Habits, ...week2Habits].map(h=>h.key)).slice(0, 4),
    dailyTime: '25-35 min',
    goal: 'Reinforce Week 1 improvements while addressing secondary issues',
  });

  weeks.push({
    week: 3,
    focus: 'Integration — Combine all corrections in live play',
    theme: 'Applied Practice',
    drills: getDrills(allHabits.map(h=>h.key)).slice(0, 3),
    dailyTime: '30-40 min',
    goal: 'Apply trained corrections in real matches. Review after each session.',
  });

  weeks.push({
    week: 4,
    focus: 'Measurement — Re-analyze and compare progress',
    theme: 'Progress Evaluation',
    drills: [
      { id:'eval1', name:'Re-analyze a Clip', duration:'Analysis', frequency:'This week', description:'Upload a new clip of the same game. Compare your new Mechanical Index to this session. Focus on whether the targeted habits appear less frequently.', difficulty:'All levels' },
      { id:'eval2', name:'Session Review', duration:'10 min', frequency:'After each session', description:'After each session this week, write down 3 moments where you caught yourself making the old habit and corrected it.', difficulty:'All levels' },
    ],
    dailyTime: '15-20 min',
    goal: 'Measure improvement and identify any habits that need another cycle',
  });

  return {
    totalWeeks: 4,
    estimatedDailyTime: '20-40 min',
    targetHabits: negHabits.map(h => h.name),
    weeks,
  };
}

router.get('/:analysisId', requireAuth, (req, res) => {
  const db = getDb();
  const analysis = db.prepare('SELECT * FROM analyses WHERE id=? AND user_id=?').get(req.params.analysisId, req.user.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  
  let plan = db.prepare('SELECT * FROM drill_plans WHERE analysis_id=?').get(req.params.analysisId);
  if (!plan) {
    const habits = JSON.parse(analysis.habits_json || '[]');
    const game = db.prepare('SELECT category FROM games WHERE id=?').get(analysis.game_id);
    const planData = generateDrillPlan(habits, game?.category || 'fps');
    const id = uuidv4();
    db.prepare('INSERT INTO drill_plans (id,analysis_id,user_id,plan_json) VALUES (?,?,?,?)').run(id, req.params.analysisId, req.user.id, JSON.stringify(planData));
    plan = { id, plan_json: JSON.stringify(planData), completed_drills: '[]' };
  }
  
  res.json({ plan: JSON.parse(plan.plan_json), completedDrills: JSON.parse(plan.completed_drills || '[]'), planId: plan.id });
});

router.post('/:planId/complete', requireAuth, (req, res) => {
  const { drillId } = req.body;
  const plan = getDb().prepare('SELECT * FROM drill_plans WHERE id=? AND user_id=?').get(req.params.planId, req.user.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  const completed = JSON.parse(plan.completed_drills || '[]');
  const idx = completed.indexOf(drillId);
  if (idx === -1) completed.push(drillId); else completed.splice(idx, 1);
  getDb().prepare('UPDATE drill_plans SET completed_drills=? WHERE id=?').run(JSON.stringify(completed), req.params.planId);
  res.json({ completedDrills: completed });
});

module.exports = router;
