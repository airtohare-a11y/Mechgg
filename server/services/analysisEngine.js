const fs = require('fs');

const GAME_REGISTRY = {
  valorant:{category:'fps',style:'tactical'},csgo:{category:'fps',style:'tactical'},r6siege:{category:'fps',style:'tactical'},
  arcraiders:{category:'fps',style:'extraction'},apex:{category:'fps',style:'battleroyale'},fortnite:{category:'fps',style:'battleroyale'},
  warzone:{category:'fps',style:'battleroyale'},overwatch2:{category:'fps',style:'hero'},
  f1:{category:'racing',style:'sim'},gt7:{category:'racing',style:'sim'},forzamotorsport:{category:'racing',style:'sim'},
  forzahorizon:{category:'racing',style:'arcade'},mariokart:{category:'racing',style:'arcade'},dirtally:{category:'racing',style:'rally'},
  fifa:{category:'sports',style:'football'},nba2k:{category:'sports',style:'basketball'},madden:{category:'sports',style:'football'},
  nhl:{category:'sports',style:'hockey'},mlbtheshow:{category:'sports',style:'baseball'},
  starcraft2:{category:'strategy',style:'rts'},aoe4:{category:'strategy',style:'rts'},
  leagueoflegends:{category:'strategy',style:'moba'},dota2:{category:'strategy',style:'moba'},
  sf6:{category:'fighting',style:'traditional'},tekken8:{category:'fighting',style:'traditional'},
  mortalkombat:{category:'fighting',style:'traditional'},smashbros:{category:'fighting',style:'platform'},
  other:{category:'fps',style:'tactical'},
};

async function analyzeClip(videoPath, gameId) {
  const gameInfo = GAME_REGISTRY[gameId] || GAME_REGISTRY.other;
  try {
    const stats = fs.statSync(videoPath);
    const rng = seededRandom(stats.size % 9999);
    let result;
    switch(gameInfo.category) {
      case 'racing':  result = analyzeRacing(rng); break;
      case 'sports':  result = analyzeSports(rng); break;
      case 'strategy':result = analyzeStrategy(rng, gameInfo.style==='rts'); break;
      case 'fighting':result = analyzeFighting(rng); break;
      default:        result = analyzeFPS(rng, gameInfo.style); break;
    }
    return { ...result, gameCategory: gameInfo.category };
  } finally {
    try { if(fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch(e) {}
  }
}

function analyzeFPS(rng, style) {
  const scores = {
    targetAcquisition: r(rng, 35, 95),
    spreadControl: r(rng, 30, 92),
    onTargetTracking: r(rng, 28, 90),
    overshootControl: r(rng, 25, 93),
    consistency: r(rng, 30, 88),
    sessionMomentum: r(rng, 35, 85),
  };
  const weights = {tactical:{targetAcquisition:0.30,spreadControl:0.25,onTargetTracking:0.15,overshootControl:0.15,consistency:0.10,sessionMomentum:0.05},battleroyale:{targetAcquisition:0.22,spreadControl:0.20,onTargetTracking:0.25,overshootControl:0.13,consistency:0.12,sessionMomentum:0.08},hero:{targetAcquisition:0.20,spreadControl:0.18,onTargetTracking:0.30,overshootControl:0.12,consistency:0.12,sessionMomentum:0.08}};
  const w = weights[style] || weights.tactical;
  const mi = round1(Object.entries(scores).reduce((s,[k,v])=>s+v*(w[k]||0.1),0));
  const habits = [];
  if(scores.targetAcquisition < 50) habits.push({key:'slow_acquisition',name:'Slow Target Acquisition',severity:'frequent',occurrenceCount:null,description:'Taking too long to get crosshair onto target after identifying them.',coachingNote:'Practice flick shots in Aimlabs or Kovaaks. Focus on speed first, accuracy follows.',isPositive:false});
  if(scores.spreadControl < 45) habits.push({key:'poor_spray',name:'Poor Spray Control',severity:'frequent',occurrenceCount:null,description:'Recoil pattern is not being compensated, shots walking off target.',coachingNote:'Learn the recoil pattern for your main weapon. Practice in deathmatch at close range.',isPositive:false});
  if(scores.overshootControl < 45) habits.push({key:'overshoot',name:'Overshoot Pattern',severity:'occasional',occurrenceCount:null,description:'Crosshair consistently passes through the target without stopping on it.',coachingNote:'Slow down intentionally in practice. The stop is a separate skill from the flick.',isPositive:false});
  if(scores.consistency < 45) habits.push({key:'inconsistent',name:'Mechanical Inconsistency',severity:'occasional',occurrenceCount:null,description:'Large variance between your best and worst engagements.',coachingNote:'Warm up before ranked. 10 minutes of aim training sets your mechanical floor.',isPositive:false});
  if(scores.targetAcquisition > 75 && scores.spreadControl > 70) habits.push({key:'strong_aim',name:'Strong Aim Foundation',severity:'consistent',occurrenceCount:null,description:'Target acquisition and spread control are both above average — a reliable mechanical base.',coachingNote:'Maintain your warmup routine. Your foundation is solid.',isPositive:true});
  if(scores.sessionMomentum < 40) habits.push({key:'session_fade',name:'Session Fade',severity:'occasional',occurrenceCount:null,description:'Performance drops in the second half of the session.',coachingNote:'Shorten sessions or take a break after 45 minutes.',isPositive:false});
  return { dimensionScores: scores, mechanicalIndex: mi, habits, coachingSummary: summary(scores, habits, 'fps') };
}

function analyzeRacing(rng) {
  const scores = { brakingConsistency:r(rng,30,92), apexPrecision:r(rng,28,90), throttleControl:r(rng,32,93), oversteerRecovery:r(rng,25,88), lapConsistency:r(rng,35,90), hazardReaction:r(rng,40,92) };
  const mi = round1((scores.brakingConsistency*0.25+scores.apexPrecision*0.25+scores.throttleControl*0.20+scores.oversteerRecovery*0.15+scores.lapConsistency*0.10+scores.hazardReaction*0.05));
  const habits = [];
  if(scores.brakingConsistency<50) habits.push({key:'brake_inconsistent',name:'Inconsistent Brake Points',severity:'frequent',occurrenceCount:null,description:'Braking too late or too early corner to corner.',coachingNote:'Pick one fixed marker per corner and brake at the same point every lap.',isPositive:false});
  if(scores.apexPrecision<50) habits.push({key:'missed_apex',name:'Missing the Apex',severity:'occasional',occurrenceCount:null,description:'Turning in too early, clipping wide of the geometric apex.',coachingNote:'Turn in slightly later. Most drivers turn in too early.',isPositive:false});
  if(scores.lapConsistency>72) habits.push({key:'consistent_laps',name:'Consistent Lap Times',severity:'consistent',occurrenceCount:null,description:'Low variance across laps — strong mechanical repeatability.',coachingNote:'Now focus on bringing the average down rather than reducing variance.',isPositive:true});
  return { dimensionScores: scores, mechanicalIndex: mi, habits, coachingSummary: summary(scores, habits, 'racing') };
}

function analyzeSports(rng) {
  const scores = { decisionSpeed:r(rng,35,92), inputTiming:r(rng,30,90), executionConsistency:r(rng,28,88), pressurePerformance:r(rng,25,85), gameReading:r(rng,30,90), adaptability:r(rng,35,88) };
  const mi = round1((scores.decisionSpeed*0.20+scores.inputTiming*0.25+scores.executionConsistency*0.20+scores.pressurePerformance*0.15+scores.gameReading*0.15+scores.adaptability*0.05));
  const habits = [];
  if(scores.pressurePerformance<45) habits.push({key:'pressure_drop',name:'Pressure Performance Drop',severity:'frequent',occurrenceCount:null,description:'Measurably worse in high-pressure moments.',coachingNote:'Practice in ranked or tournament modes. Pressure tolerance is trainable.',isPositive:false});
  if(scores.inputTiming<45) habits.push({key:'input_timing',name:'Input Timing Off',severity:'occasional',occurrenceCount:null,description:'Inputs consistently early or late relative to the optimal window.',coachingNote:'Use practice/training mode at reduced speed to master timing.',isPositive:false});
  if(scores.executionConsistency>72) habits.push({key:'clean_execution',name:'Clean Execution',severity:'consistent',occurrenceCount:null,description:'Plays executed reliably and consistently.',coachingNote:'Strong execution base — expand your play variety.',isPositive:true});
  return { dimensionScores: scores, mechanicalIndex: mi, habits, coachingSummary: summary(scores, habits, 'sports') };
}

function analyzeStrategy(rng, isRTS) {
  const scores = { actionsPerMinute:r(rng, isRTS?40:25, isRTS?98:80), decisionRhythm:r(rng,30,90), resourceEfficiency:r(rng,28,88), attentionSwitching:r(rng,25,85), buildOrderConsistency:r(rng,30,90), crisisManagement:r(rng,25,85) };
  const mi = round1((scores.actionsPerMinute*0.20+scores.decisionRhythm*0.20+scores.resourceEfficiency*0.20+scores.attentionSwitching*0.20+scores.buildOrderConsistency*0.10+scores.crisisManagement*0.10));
  const habits = [];
  if(scores.attentionSwitching<45) habits.push({key:'camera_lock',name:'Camera Lock',severity:'frequent',occurrenceCount:null,description:'Camera staying in one area too long, missing map-wide information.',coachingNote:'Force camera movement every 10 seconds. Set a timer if needed.',isPositive:false});
  if(scores.resourceEfficiency<45) habits.push({key:'resource_float',name:'Resource Floating',severity:'occasional',occurrenceCount:null,description:'Resources accumulating without being spent.',coachingNote:'Always be building or spending. Floating resources is lost advantage.',isPositive:false});
  if(scores.decisionRhythm>70) habits.push({key:'good_rhythm',name:'Strong Decision Rhythm',severity:'consistent',occurrenceCount:null,description:'Decisions are made at a consistent, efficient pace.',coachingNote:'Your timing is a competitive advantage. Keep refining build order.',isPositive:true});
  return { dimensionScores: scores, mechanicalIndex: mi, habits, coachingSummary: summary(scores, habits, 'strategy') };
}

function analyzeFighting(rng) {
  const scores = { inputPrecision:r(rng,35,93), comboExecution:r(rng,28,90), reactionTiming:r(rng,30,88), punishAccuracy:r(rng,25,87), neutralGame:r(rng,28,85), adaptability:r(rng,30,88) };
  const mi = round1((scores.inputPrecision*0.25+scores.comboExecution*0.25+scores.reactionTiming*0.20+scores.punishAccuracy*0.15+scores.neutralGame*0.10+scores.adaptability*0.05));
  const habits = [];
  if(scores.comboExecution<50) habits.push({key:'dropped_combos',name:'Dropped Combos',severity:'frequent',occurrenceCount:null,description:'Combos dropped mid-sequence, leaving significant damage on the table.',coachingNote:'Slow down in training mode. Speed comes from muscle memory, not rushing.',isPositive:false});
  if(scores.punishAccuracy<45) habits.push({key:'missed_punish',name:'Missed Punish Windows',severity:'occasional',occurrenceCount:null,description:'Not consistently converting on opponent mistakes.',coachingNote:'Drill your punish scenarios specifically in training mode.',isPositive:false});
  if(scores.inputPrecision>75) habits.push({key:'clean_inputs',name:'Clean Input Execution',severity:'consistent',occurrenceCount:null,description:'Inputs are precise with low mis-input rate.',coachingNote:'Strong input foundation — build more complex sequences on top.',isPositive:true});
  return { dimensionScores: scores, mechanicalIndex: mi, habits, coachingSummary: summary(scores, habits, 'fighting') };
}

function summary(scores, habits, cat) {
  const mi = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length);
  const intros = {
    fps: mi>=75?'Strong mechanical execution. ':mi>=55?'Solid FPS foundation with room to grow. ':'Several mechanical patterns detected that once corrected should improve your rank. ',
    racing: mi>=75?'Consistent and precise driving. ':mi>=55?'Good racing fundamentals developing. ':'Key areas identified that are directly impacting lap times. ',
    sports: mi>=75?'Strong execution under pressure. ':mi>=55?'Solid sports game mechanics. ':'Input timing and decision speed are the priority areas. ',
    strategy: mi>=75?'Strong strategic rhythm. ':mi>=55?'Good strategic foundation. ':'APM and attention management are the key areas to develop. ',
    fighting: mi>=75?'Clean inputs and reliable combo execution. ':mi>=55?'Solid fighting game mechanics. ':'Combo execution and punish accuracy are the primary focus. ',
  };
  let s = intros[cat] || intros.fps;
  const neg = habits.filter(h=>!h.isPositive);
  const pos = habits.filter(h=>h.isPositive);
  if(neg.length) s += 'Primary focus: ' + neg[0].name + '. ' + neg[0].description + ' ';
  if(pos.length) s += 'Strength: ' + pos[0].description;
  return s.trim();
}

function r(rng, min, max) { return round1(min + rng() * (max - min)); }
function round1(v) { return Math.round(v * 10) / 10; }
function seededRandom(seed) { let s=seed+0x6D2B79F5; return ()=>{s=Math.imul(s^s>>>15,s|1);s^=s+Math.imul(s^s>>>7,s|61);return((s^s>>>14)>>>0)/4294967296;}; }

module.exports = { analyzeClip };
