(function(){

/* ============ DATA ============ */
const SNIPPETS = {
  javascript: [
`function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
`class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
}`,
`const fetchUser = async (id) => {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("not found");
  return res.json();
};`,
`function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`
  ],
  python: [
`def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
`class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

    def __repr__(self):
        return f"Node({self.value})"`,
`def memoize(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper`,
`import json

def load_config(path):
    with open(path, "r") as f:
        data = json.load(f)
    return data.get("settings", {})`
  ],
  cpp: [
`int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
`class Vector2D {
public:
    float x, y;
    Vector2D(float x, float y) : x(x), y(y) {}
    float length() const {
        return sqrt(x * x + y * y);
    }
};`,
`template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}`,
`#include <vector>
void reverseArray(std::vector<int>& arr) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        std::swap(arr[left++], arr[right--]);
    }
}`
  ],
  java: [
`public class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}`,
`public int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}`,
`public class Pair<K, V> {
    private K key;
    private V value;
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
}`,
`import java.util.*;

public List<Integer> filterEven(List<Integer> nums) {
    List<Integer> result = new ArrayList<>();
    for (int n : nums) {
        if (n % 2 == 0) result.add(n);
    }
    return result;
}`
  ]
};

const PLAIN_SENTENCES = [
"Practicing a little every single day compounds into serious typing speed over time.",
"The quick brown fox jumps over the lazy dog near the riverbank.",
"Patience and steady effort over time almost always lead to success.",
"Practice does not make perfect, only perfect practice makes perfect.",
"Becoming a great programmer requires a consistent habit of writing code every day.",
"Consistency and focus are the two pillars of mastering any new skill.",
"Reading books calms the mind and helps you absorb new knowledge.",
"Every expert was once a beginner who refused to give up on their dreams."
];

const CHALLENGES = [
  {id:"wpm60", title:"Break 60 WPM", desc:"Reach 60+ WPM in any single test", check:r=>r.wpm>=60},
  {id:"acc100", title:"Perfect Accuracy", desc:"Finish a test with 100% accuracy", check:r=>r.accuracy>=100},
  {id:"wpm40code", title:"Code Master", desc:"Reach 40+ WPM in code mode", check:r=>r.wpm>=40 && r.mode==="code"},
  {id:"clean30", title:"Clean Run", desc:"Fewer than 5 errors in a 30-second test", check:r=>r.duration_target===30 && r.errors<5}
];

const ACHIEVEMENTS = [
  {id:"first", title:"First Step", check:(r,best,total)=>total===1},
  {id:"wpm50", title:"50 WPM Club", check:(r)=>r.wpm>=50},
  {id:"wpm100", title:"100 WPM Club", check:(r)=>r.wpm>=100},
  {id:"perfect", title:"Perfect Accuracy", check:(r)=>r.accuracy>=100},
  {id:"streak3", title:"3-Day Streak", check:(r,best,total,streak)=>streak>=3},
  {id:"streak7", title:"Week Warrior", check:(r,best,total,streak)=>streak>=7}
];

const THEME_COLORS = {amber:"#f2b544", terminal:"#4ee08a", dusk:"#c792ea", paper:"#a8551d", navy:"#2f8cff"};

/* ============ TOKENIZER (basic syntax highlighting) ============ */
function tokenize(text, lang){
  // returns array of {ch, type} for every character
  const types = new Array(text.length).fill("plain");
  if(lang === "plain"){ return text.split("").map(ch=>({ch,type:"plain"})); }

  const KEYWORDS = {
    javascript: ["const","let","var","function","return","if","else","for","while","class","new","this","async","await","import","export","from","default","extends","constructor","true","false","null","undefined","try","catch","throw","typeof"],
    python: ["def","return","if","elif","else","for","while","class","import","from","as","self","True","False","None","try","except","with","in","not","and","or","lambda","yield","raise"],
    cpp: ["int","float","double","char","void","class","public","private","protected","return","if","else","for","while","template","typename","const","static","struct","new","delete","true","false","include","namespace","using"],
    java: ["public","private","protected","class","static","void","int","float","double","boolean","return","if","else","for","while","new","this","extends","implements","import","true","false","null","try","catch"]
  };
  const kwList = KEYWORDS[lang] || [];
  const kwSet = new Set(kwList);

  let i = 0;
  const n = text.length;
  while(i < n){
    const ch = text[i];
    // line comment
    if((lang==="javascript"||lang==="cpp"||lang==="java") && ch==="/" && text[i+1]==="/"){
      let j=i; while(j<n && text[j] !== "\n"){ types[j]="com"; j++; } i=j; continue;
    }
    if(lang==="python" && ch==="#"){
      let j=i; while(j<n && text[j] !== "\n"){ types[j]="com"; j++; } i=j; continue;
    }
    // string (handles escaped quotes like \" )
    if(ch==='"'||ch==="'"||ch==="`"){
      const quote = ch; let j=i+1; types[i]="str";
      while(j<n){
        if(text[j]==="\\" && j+1<n){ types[j]="str"; types[j+1]="str"; j+=2; continue; }
        if(text[j]===quote){ types[j]="str"; j++; break; }
        types[j]="str"; j++;
      }
      i=j; continue;
    }
    // number (don't swallow ranges like 3...5)
    if(/[0-9]/.test(ch)){
      let j=i; let dots=0;
      while(j<n && /[0-9.]/.test(text[j])){
        if(text[j]==="."){ dots++; if(dots>1) break; }
        types[j]="num"; j++;
      }
      i=j; continue;
    }
    // word (identifier / keyword / function call)
    if(/[A-Za-z_]/.test(ch)){
      let j=i; while(j<n && /[A-Za-z0-9_]/.test(text[j])){ j++; }
      const word = text.slice(i,j);
      let t = "plain";
      if(kwSet.has(word)) t="kw";
      else if(text[j]==="(") t="fn";
      for(let k=i;k<j;k++) types[k]=t;
      i=j; continue;
    }
    // punctuation
    if(/[{}()\[\];,.<>=+\-*/%!&#|:]/.test(ch)){
      types[i]="punc"; i++; continue;
    }
    i++;
  }
  return text.split("").map((ch,idx)=>({ch, type:types[idx]}));
}

/* ============ STATE ============ */
const state = {
  mode:"code",
  lang:"javascript",
  durationTarget:30,
  wordTarget:50,
  usingWordMode:false,
  tokens:[],
  typedStatus:[], // null | 'correct' | 'incorrect' | 'autoskip'
  charCost:[], // per-index {k,c,e} so backspace can subtract stats
  cursor:0,
  bufferLen:0,
  started:false,
  finished:false,
  startTime:0,
  timerId:null,
  timeLeft:30,
  zenElapsed:0,
  errors:0,
  keystrokes:0,
  correctKeystrokes:0,
  keyErrorMap:{},
  wpmSamples:[], // {t, wpm}
  soundOn:true,
  activeChallenge:null,
  customText:null
};

/* ============ PERSISTENCE ============ */
const LS = {
  get(key, fallback){ try{ const v = localStorage.getItem(key); return v?JSON.parse(v):fallback; }catch(e){ return fallback; } },
  set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
};

let history = LS.get("kf_history", []);
let bestWpm = LS.get("kf_best_wpm", 0);
let bestAcc = LS.get("kf_best_acc", 0);
let streakData = LS.get("kf_streak", {count:0, lastDate:null});
let unlockedAch = LS.get("kf_achievements", []);
let unlockedChallenges = LS.get("kf_challenges", []);
let soundPref = LS.get("kf_sound", true);
let themePref = LS.get("kf_theme", "navy");

state.soundOn = soundPref;
document.body.setAttribute("data-theme", themePref);

/* ============ DOM ============ */
const textDisplay = document.getElementById("textDisplay");
const typeStage = document.getElementById("typeStage");
const hiddenInput = document.getElementById("hiddenInput");
const stageHint = document.getElementById("stageHint");
const statTime = document.getElementById("statTime");
const statWpm = document.getElementById("statWpm");
const statAcc = document.getElementById("statAcc");
const resultsPanel = document.getElementById("resultsPanel");
const resultsGrid = document.getElementById("resultsGrid");
const heatmapEl = document.getElementById("heatmap");
const achStrip = document.getElementById("achStrip");
const streakVal = document.getElementById("streakVal");
const bestWpmVal = document.getElementById("bestWpmVal");
const bestAccVal = document.getElementById("bestAccVal");
const totalTestsVal = document.getElementById("totalTestsVal");
const configBar = document.getElementById("configBar");
const challengePanel = document.getElementById("challengePanel");
const challengeListEl = document.getElementById("challengeList");
const wordSeg = document.getElementById("wordSeg");
const durationSeg = document.getElementById("durationSeg");
const langSelect = document.getElementById("langSelect");

/* ============ SOUND (Web Audio synth click) ============ */
let audioCtx = null;
function playClick(isError){
  if(!state.soundOn) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = isError ? 160 : 720 + Math.random()*120;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }catch(e){}
}

/* ============ TEXT GENERATION ============ */
function pickText(){
  if(state.mode === "custom" && state.customText){
    return {text: state.customText, lang:"plain"};
  }
  if(state.mode === "text" || state.mode === "zen"){
    let words = [];
    while(words.join(" ").length < 400){
      words.push(PLAIN_SENTENCES[Math.floor(Math.random()*PLAIN_SENTENCES.length)]);
    }
    return {text: words.join(" "), lang:"plain"};
  }
  // code mode / challenge (code-based)
  const bank = SNIPPETS[state.lang];
  let combined = bank[Math.floor(Math.random()*bank.length)];
  if(combined.length < 200){
    combined += "\n\n" + bank[Math.floor(Math.random()*bank.length)];
  }
  return {text: combined, lang: state.lang};
}

/* ============ RENDER TEXT ============ */
function renderText(){
  textDisplay.innerHTML = "";
  markCursor._last = null;
  const frag = document.createDocumentFragment();
  state.tokens.forEach((tok, idx)=>{
    const span = document.createElement("span");
    span.className = "char " + tok.type + " pending";
    span.dataset.idx = idx;
    span.textContent = tok.ch === "\n" ? "⏎\n" : tok.ch;
    frag.appendChild(span);
  });
  textDisplay.appendChild(frag);
  markCursor();
}

function markCursor(){
  const spans = textDisplay.children;
  if(markCursor._last != null && markCursor._last < spans.length){
    spans[markCursor._last].classList.remove("current");
  } else {
    for(let i=0;i<spans.length;i++){ spans[i].classList.remove("current"); }
  }
  if(state.cursor < spans.length){
    spans[state.cursor].classList.add("current");
    markCursor._last = state.cursor;
  } else {
    markCursor._last = null;
  }
}

function applyCharState(idx, cls){
  const span = textDisplay.children[idx];
  if(!span) return;
  span.classList.remove("pending","correct","incorrect","autoskip");
  span.classList.add(cls);
}

/* ============ TEST LIFECYCLE ============ */
function newTest(){
  clearInterval(state.timerId);
  const {text, lang} = pickText();
  state.tokens = tokenize(text, lang);
  state.typedStatus = new Array(state.tokens.length).fill(null);
  state.charCost = new Array(state.tokens.length).fill(null);
  state.cursor = 0;
  state.bufferLen = 0;
  hiddenInput.value = "";
  state.started = false;
  state.finished = false;
  state.startTime = 0;
  state.errors = 0;
  state.keystrokes = 0;
  state.correctKeystrokes = 0;
  state.keyErrorMap = {};
  state.wpmSamples = [];
  state.timeLeft = state.durationTarget;
  state.zenElapsed = 0;

  resultsPanel.classList.remove("show");
  stageHint.style.display = "flex";
  if(state.usingWordMode){
    const totalWords = state.tokens.filter(t=>t.ch===" ").length + 1;
    statTime.textContent = totalWords;
  } else if(state.mode === "zen"){
    statTime.textContent = "∞";
  } else {
    statTime.textContent = state.durationTarget;
  }
  statWpm.textContent = "0";
  statAcc.textContent = "100%";
  renderText();
}

function startTest(){
  if(state.started) return;
  state.started = true;
  state.startTime = Date.now();
  stageHint.style.display = "none";
  typeStage.classList.add("focused");

  if(state.usingWordMode){
    return; // word mode: no timer, ends on completion
  }
  if(state.mode === "zen"){
    // zen: count up, never auto-finish
    state.timerId = setInterval(()=>{
      state.zenElapsed += 1;
      statTime.textContent = state.zenElapsed + "s";
      updateLiveWpm(true);
    }, 1000);
    return;
  }
  state.timerId = setInterval(()=>{
    state.timeLeft -= 1;
    statTime.textContent = state.timeLeft;
    updateLiveWpm(true);
    if(state.timeLeft <= 0){
      endTest();
    }
  }, 1000);
}

function calcWpm(){
  const elapsedMin = (Date.now() - state.startTime) / 60000;
  if(elapsedMin <= 0 || !state.started) return 0;
  return Math.max(0, Math.round((state.correctKeystrokes/5) / elapsedMin));
}

function calcAcc(){
  return state.keystrokes ? Math.round((state.correctKeystrokes/state.keystrokes)*100) : 100;
}

function updateLiveWpm(pushSample){
  if(!state.started) return;
  const wpm = calcWpm();
  statWpm.textContent = wpm;
  statAcc.textContent = calcAcc() + "%";
  // only timer ticks push graph samples — per-keystroke pushes made the graph jagged
  if(pushSample){
    state.wpmSamples.push({t: Math.round((Date.now()-state.startTime)/1000), wpm});
  }
}

function endTest(){
  if(state.finished) return;
  state.finished = true;
  clearInterval(state.timerId);
  typeStage.classList.remove("focused");
  // final sample so graph reaches the end
  updateLiveWpm(true);
  const elapsedMin = Math.max((Date.now()-state.startTime)/60000, 0.01);
  // same formula as live WPM so the numbers match (incorrect keys simply don't add to correct)
  const wpm = Math.max(0, Math.round((state.correctKeystrokes/5)/elapsedMin));
  const accuracy = calcAcc();

  const result = {
    wpm, accuracy, errors: state.errors, mode: state.mode,
    duration_target: state.durationTarget, date: new Date().toISOString(),
    keyErrorMap: state.keyErrorMap
  };

  history.push(result);
  if(history.length>200) history = history.slice(-200);
  LS.set("kf_history", history);

  let newBestWpm = false, newBestAcc = false;
  if(wpm > bestWpm){ bestWpm = wpm; LS.set("kf_best_wpm", bestWpm); newBestWpm = true; }
  if(accuracy > bestAcc){ bestAcc = accuracy; LS.set("kf_best_acc", bestAcc); newBestAcc = true; }

  updateStreak();

  const newlyUnlockedAch = ACHIEVEMENTS.filter(a=>{
    if(unlockedAch.includes(a.id)) return false;
    return a.check(result, bestWpm, history.length, streakData.count);
  });
  newlyUnlockedAch.forEach(a=>unlockedAch.push(a.id));
  LS.set("kf_achievements", unlockedAch);

  let challengeResult = null;
  if(state.activeChallenge){
    const ch = CHALLENGES.find(c=>c.id===state.activeChallenge);
    if(ch && ch.check(result)){
      if(!unlockedChallenges.includes(ch.id)){
        unlockedChallenges.push(ch.id);
        LS.set("kf_challenges", unlockedChallenges);
      }
      challengeResult = ch;
    }
  }

  showResults(result, newBestWpm, newBestAcc, newlyUnlockedAch, challengeResult);
  refreshFooter();
  if(state.mode==="challenge") renderChallenges();
}

function updateStreak(){
  const today = new Date().toDateString();
  if(streakData.lastDate === today){ /* already counted today */ }
  else{
    const yesterday = new Date(Date.now()-86400000).toDateString();
    if(streakData.lastDate === yesterday){ streakData.count += 1; }
    else{ streakData.count = 1; }
    streakData.lastDate = today;
    LS.set("kf_streak", streakData);
  }
}

/* ============ INPUT HANDLING ============ */
typeStage.addEventListener("click", ()=>{ hiddenInput.focus(); });

hiddenInput.addEventListener("focus", ()=>{ if(!state.finished) typeStage.classList.add("focused"); });
hiddenInput.addEventListener("blur", ()=>{ typeStage.classList.remove("focused"); });

// Tab is handled on keydown (for indent-skip); everything else is driven by the
// 'input' event so mobile virtual keyboards / autocorrect / IME all work reliably.
hiddenInput.addEventListener("keydown", (e)=>{
  if(state.finished) return;
  if(e.key === "Tab"){
    e.preventDefault();
    if(!state.started) startTest();
    doTabIndent();
  }
});

hiddenInput.addEventListener("input", ()=>{
  if(state.finished){ hiddenInput.value = ""; state.bufferLen = 0; return; }
  if(!state.started) startTest();

  const val = hiddenInput.value;
  const prevLen = state.bufferLen;

  if(val.length > prevLen){
    const added = val.slice(prevLen);
    // anti-cheat: pasting many chars at once would auto-complete with 100%
    if(added.length > 3){
      hiddenInput.value = val.slice(0, prevLen);
      return;
    }
    for(const ch of added){ processTypedChar(ch); }
  } else if(val.length < prevLen){
    let removed = prevLen - val.length;
    while(removed > 0 && state.cursor > 0){ stepBack(); removed--; }
  }
  state.bufferLen = hiddenInput.value.length;

  markCursor();
  checkCompletion();

  // keep the buffer small so it never grows unbounded on very long tests
  if(hiddenInput.value.length > 500){
    const keep = hiddenInput.value.slice(-100);
    hiddenInput.value = keep;
    state.bufferLen = keep.length;
  }
});

function doTabIndent(){
  // indentation-aware: consume the full expected run of spaces (or a single \t) at cursor.
  // Counts as ONE keystroke total (not +8) so WPM isn't inflated.
  let idx = state.cursor;
  let consumed = 0;
  let first = true;
  while(state.tokens[idx] && state.tokens[idx].ch === " " && consumed < 8){
    registerChar(idx, true, true, first);
    idx++; consumed++; first = false;
  }
  if(consumed === 0 && state.tokens[state.cursor] && state.tokens[state.cursor].ch === "\t"){
    registerChar(state.cursor, true, true, true);
    idx = state.cursor+1; consumed = 1;
  }
  if(consumed > 0){
    // keep hidden buffer in sync so backspace accounting stays aligned
    // (programmatic set doesn't fire 'input', so no double-processing)
    hiddenInput.value += " ".repeat(consumed);
    state.bufferLen = hiddenInput.value.length;
  }
  state.cursor = idx;
  updateLiveWpm(false);
  markCursor();
  checkCompletion();
}

function processTypedChar(inputChar){
  const expected = state.tokens[state.cursor] ? state.tokens[state.cursor].ch : null;
  if(expected === undefined || expected === null){ return; }

  // normalize newline variants some mobile keyboards send
  if(inputChar === "\r") inputChar = "\n";

  const isCorrect = inputChar === expected;
  registerChar(state.cursor, isCorrect, false);
  state.cursor++;

  // bracket / quote auto-skip: if just-typed char has an immediate matching closer next
  // and it directly follows (simulating editor auto-close skip-over).
  // The auto-skipped closer is free (countStats=false) — no WPM inflation.
  const PAIRS = {"(" : ")", "[":"]", "{":"}", '"':'"', "'":"'"};
  if(isCorrect && PAIRS[inputChar]){
    const closer = PAIRS[inputChar];
    const nextTok = state.tokens[state.cursor];
    if(nextTok && nextTok.ch === closer){
      registerChar(state.cursor, true, true, false);
      state.cursor++;
      hiddenInput.value += closer;
      state.bufferLen = hiddenInput.value.length;
    }
  }
}

function stepBack(){
  if(state.cursor<=0) return;
  state.cursor--;
  // subtract whatever this char had counted, so accuracy recovers after correction
  const cost = state.charCost[state.cursor];
  if(cost){
    state.keystrokes = Math.max(0, state.keystrokes - (cost.k||0));
    state.correctKeystrokes = Math.max(0, state.correctKeystrokes - (cost.c||0));
    state.errors = Math.max(0, state.errors - (cost.e||0));
    if(cost.errKey){
      const k = cost.errKey;
      if(state.keyErrorMap[k]){
        state.keyErrorMap[k]--;
        if(state.keyErrorMap[k] <= 0) delete state.keyErrorMap[k];
      }
    }
    state.charCost[state.cursor] = null;
  }
  applyCharState(state.cursor, "pending");
  state.typedStatus[state.cursor]=null;
  updateLiveWpm(false);
}

function registerChar(idx, isCorrect, isAuto, countStats){
  if(countStats === undefined) countStats = !isAuto;
  if(countStats){
    state.keystrokes++;
    if(isCorrect){
      state.correctKeystrokes++;
      state.charCost[idx] = {k:1, c:1, e:0};
      applyCharState(idx, isAuto ? "autoskip" : "correct");
    } else {
      state.errors++;
      applyCharState(idx, "incorrect");
      const ch = state.tokens[idx].ch;
      const key = ch === " " ? "␣" : (ch === "\n" ? "⏎" : ch);
      state.keyErrorMap[key] = (state.keyErrorMap[key]||0)+1;
      state.charCost[idx] = {k:1, c:0, e:1, errKey:key};
    }
  } else {
    // free auto char: visual only, no score impact
    state.charCost[idx] = {k:0, c:0, e:0};
    applyCharState(idx, "autoskip");
  }
  playClick(!isCorrect);
  state.typedStatus[idx] = isCorrect ? "correct" : "incorrect";
  updateLiveWpm(false);
}

function checkCompletion(){
  if(state.usingWordMode){
    const totalWords = state.tokens.filter(t=>t.ch===" ").length + 1;
    const doneWords = state.tokens.filter((t,i)=>i<state.cursor && t.ch===" ").length;
    statTime.textContent = Math.max(totalWords - doneWords, 0);
  }
  if(state.cursor >= state.tokens.length){
    endTest();
  }
}

/* ============ GLOBAL RESTART: hold Tab then press Enter ============
// Tab alone = indent (handled in hiddenInput). To avoid wiping a code run on a
// fast Tab->Enter newline, restart only fires if Tab has been HELD ~350ms.
let tabHeld = false;
let tabDownAt = 0;
document.addEventListener("keydown", (e)=>{
  if(e.key === "Tab"){
    if(!tabHeld){ tabHeld = true; tabDownAt = Date.now(); }
  }
  if(e.key === "Enter" && tabHeld && (Date.now()-tabDownAt) > 350){
    // Shift+Enter always works as an alternative that never conflicts with indent
    e.preventDefault();
    newTest();
    hiddenInput.focus();
    tabHeld = false;
  }
  if(e.key === "Enter" && e.shiftKey && !tabHeld){
    // Shift+Enter quick restart (no hold needed)
    e.preventDefault();
    newTest();
    hiddenInput.focus();
  }
});
document.addEventListener("keyup", (e)=>{ if(e.key==="Tab"){ tabHeld=false; tabDownAt=0; } });

document.getElementById("restartBtn").addEventListener("click", ()=>{ newTest(); hiddenInput.focus(); });
document.getElementById("nextTestBtn").addEventListener("click", ()=>{ newTest(); hiddenInput.focus(); });
document.getElementById("closeResultsBtn").addEventListener("click", ()=>{ resultsPanel.classList.remove("show"); });

/* ============ RESULTS RENDER ============ */
function showResults(result, newBestWpm, newBestAcc, newAch, challengeResult){
  resultsPanel.classList.add("show");
  resultsGrid.innerHTML = `
    <div class="r-stat ${newBestWpm?'new-best':''}"><div class="v">${result.wpm}</div><div class="l">WPM</div></div>
    <div class="r-stat ${newBestAcc?'new-best':''}"><div class="v">${result.accuracy}%</div><div class="l">Accuracy</div></div>
    <div class="r-stat"><div class="v">${result.errors}</div><div class="l">Errors</div></div>
    <div class="r-stat"><div class="v">${history.length}</div><div class="l">Total Tests</div></div>
  `;
  drawGraph(state.wpmSamples);
  drawHeatmap(result.keyErrorMap);

  let achHtml = newAch.map(a=>`<div class="ach-badge">🏆 ${a.title}</div>`).join("");
  if(challengeResult){
    achHtml += `<div class="ach-badge">🎯 Challenge completed: ${challengeResult.title}</div>`;
  }
  achStrip.innerHTML = achHtml;
}

function drawGraph(samples){
  const canvas = document.getElementById("wpmGraph");
  const dpr = window.devicePixelRatio||1;
  const w = canvas.clientWidth || 800;
  const h = 130;
  canvas.width = w*dpr; canvas.height = h*dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const styles = getComputedStyle(document.body);
  const accent = styles.getPropertyValue("--accent").trim();
  const border = styles.getPropertyValue("--border").trim();
  const dim = styles.getPropertyValue("--text-dim").trim();

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  for(let i=0;i<=4;i++){
    const y = 10 + (h-30)*(i/4);
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }

  if(!samples.length){
    ctx.fillStyle = dim; ctx.font = "12px monospace";
    ctx.fillText("No data", 10, h/2);
    return;
  }
  const maxWpm = Math.max(...samples.map(s=>s.wpm), 10);
  const maxT = Math.max(...samples.map(s=>s.t), 1);

  ctx.beginPath();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  samples.forEach((s,i)=>{
    const x = (s.t/maxT) * (w-10) + 5;
    const y = h-24 - (s.wpm/maxWpm)*(h-40);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle = dim; ctx.font="10px monospace";
  ctx.fillText("0s", 4, h-6);
  ctx.fillText(maxT+"s", w-30, h-6);
}

function drawHeatmap(map){
  heatmapEl.innerHTML = "";
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){
    heatmapEl.innerHTML = `<div style="font-size:12px;color:var(--text-dim);">No mistakes — great job! 🎉</div>`;
    return;
  }
  const max = entries[0][1];
  entries.slice(0,20).forEach(([key,count])=>{
    const div = document.createElement("div");
    const intensity = Math.min(1, count/max);
    div.className = "hm-key";
    div.style.background = `color-mix(in srgb, var(--bad) ${Math.round(intensity*70)}%, var(--panel-2))`;
    div.style.color = intensity>0.4 ? "#fff" : "var(--text-dim)";
    div.title = `${count} mistakes`;
    div.textContent = key;
    heatmapEl.appendChild(div);
  });
}

/* ============ FOOTER ============ */
function refreshFooter(){
  streakVal.textContent = streakData.count||0;
  bestWpmVal.textContent = bestWpm;
  bestAccVal.textContent = bestAcc+"%";
  totalTestsVal.textContent = history.length;
}

/* ============ CHALLENGES ============ */
function renderChallenges(){
  challengeListEl.innerHTML = "";
  CHALLENGES.forEach(ch=>{
    const done = unlockedChallenges.includes(ch.id);
    const card = document.createElement("div");
    card.className = "challenge-card" + (state.activeChallenge===ch.id ? " selected":"");
    card.innerHTML = `<div class="ct">${done?"✅ ":""}${ch.title}</div><div class="cd">${ch.desc}</div>` +
      (done ? `<div class="challenge-progress">Completed</div>` : "");
    card.addEventListener("click", ()=>{
      state.activeChallenge = ch.id;
      // stay in challenge mode (don't flip state.mode to "code" — that desyncs the tabs)
      newTest();
      renderChallenges();
      hiddenInput.focus();
    });
    challengeListEl.appendChild(card);
  });
}

/* ============ MODE / CONFIG SWITCHES ============ */
document.querySelectorAll(".mode-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
    state.activeChallenge = null;

    configBar.style.display = (state.mode==="zen" || state.mode==="challenge" || state.mode==="custom") ? "none" : "flex";
    langSelect.style.display = (state.mode==="code") ? "inline-block" : "none";
    wordSeg.style.display = (state.mode==="text") ? "flex" : "none";
    durationSeg.style.display = (state.mode==="text" && state.usingWordMode) ? "none" : "flex";
    challengePanel.style.display = (state.mode==="challenge") ? "block" : "none";

    if(state.mode==="custom"){
      document.getElementById("customModal").classList.add("open");
      document.getElementById("customTextArea").focus();
      return;
    }
    if(state.mode==="challenge"){ renderChallenges(); }
    newTest();
  });
});

langSelect.addEventListener("change", (e)=>{ state.lang = e.target.value; newTest(); });

const customTimeBtn = document.getElementById("customTimeBtn");
const customTimeInput = document.getElementById("customTimeInput");

function setDuration(secs, save){
  secs = Math.max(5, Math.min(600, Math.round(secs)||30));
  state.durationTarget = secs;
  state.usingWordMode = false;
  if(save !== false){ try{ localStorage.setItem("kf_duration", JSON.stringify(secs)); }catch(e){} }
  durationSeg.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  const preset = durationSeg.querySelector(`button[data-dur="${secs}"]`);
  if(preset){
    preset.classList.add("active");
    customTimeBtn.textContent = "⚙";
    customTimeInput.style.display = "none";
  } else {
    customTimeBtn.classList.add("active");
    customTimeBtn.textContent = secs + "s";
  }
  newTest();
}

// restore saved duration (no newTest yet — INIT below will render once)
try{
  const savedDur = JSON.parse(localStorage.getItem("kf_duration")||"30");
  if(savedDur && savedDur !== 30){
    const secs = Math.max(5, Math.min(600, Math.round(savedDur)||30));
    state.durationTarget = secs;
    state.timeLeft = secs;
    durationSeg.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
    const preset = durationSeg.querySelector(`button[data-dur="${secs}"]`);
    if(preset){ preset.classList.add("active"); }
    else { customTimeBtn.classList.add("active"); customTimeBtn.textContent = secs + "s"; }
  }
}catch(e){}

durationSeg.querySelectorAll("button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(btn.dataset.dur === "custom"){
      const showing = customTimeInput.style.display !== "none";
      customTimeInput.style.display = showing ? "none" : "inline-block";
      if(!showing){ customTimeInput.value = state.durationTarget; customTimeInput.focus(); customTimeInput.select(); }
      return;
    }
    customTimeInput.style.display = "none";
    setDuration(parseInt(btn.dataset.dur,10));
  });
});

function applyCustomTime(){
  const v = parseInt(customTimeInput.value,10);
  if(!v || v < 5 || v > 600){
    customTimeInput.style.borderColor = "var(--bad)";
    setTimeout(()=>{ customTimeInput.style.borderColor = ""; }, 800);
    return;
  }
  customTimeInput.style.display = "none";
  setDuration(v);
  hiddenInput.focus();
}
customTimeInput.addEventListener("keydown", (e)=>{
  e.stopPropagation();
  if(e.key === "Enter"){ applyCustomTime(); }
  if(e.key === "Escape"){ customTimeInput.style.display = "none"; hiddenInput.focus(); }
});
customTimeInput.addEventListener("change", applyCustomTime);

wordSeg.querySelectorAll("button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    wordSeg.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    state.wordTarget = parseInt(btn.dataset.words,10);
    state.usingWordMode = true;
    newTest();
  });
});

/* ============ CUSTOM TEXT MODAL ============ */
document.getElementById("customCancelBtn").addEventListener("click", ()=>{
  document.getElementById("customModal").classList.remove("open");
  document.querySelector('.mode-btn[data-mode="code"]').click();
});
document.getElementById("customUseBtn").addEventListener("click", ()=>{
  const val = document.getElementById("customTextArea").value.trim();
  if(val){ state.customText = val; }
  document.getElementById("customModal").classList.remove("open");
  newTest();
  hiddenInput.focus();
});

/* ============ THEME & SOUND ============ */
const themeBtn = document.getElementById("themeBtn");
const themeDropdown = document.getElementById("themeDropdown");
themeBtn.addEventListener("click", (e)=>{ e.stopPropagation(); themeDropdown.classList.toggle("open"); });
document.addEventListener("click", ()=>{ themeDropdown.classList.remove("open"); });
themeDropdown.querySelectorAll(".theme-opt").forEach(opt=>{
  opt.addEventListener("click", ()=>{
    const t = opt.dataset.theme;
    document.body.setAttribute("data-theme", t);
    LS.set("kf_theme", t);
    themeDropdown.classList.remove("open");
    drawGraph(state.wpmSamples);
  });
});

const soundBtn = document.getElementById("soundBtn");
function refreshSoundBtn(){ soundBtn.textContent = state.soundOn ? "🔊" : "🔇"; soundBtn.classList.toggle("active", state.soundOn); }
soundBtn.addEventListener("click", ()=>{
  state.soundOn = !state.soundOn;
  LS.set("kf_sound", state.soundOn);
  refreshSoundBtn();
});

/* ============ INIT ============ */
refreshSoundBtn();
refreshFooter();
newTest();

})();
