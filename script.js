(function () {
  const GAME_SECONDS = 120;
  const ARROWS = ["↑", "↓", "←", "→"];

  const el = id => document.getElementById(id);
  const block1 = el("block1"), block2 = el("block2"), qbar = el("qbar"), qtext = el("qtext");

  let timeLeft, timerId = null;
  let score, attempts, streak, bestStreak;
  let current = null;          // { task, oddAnswer, arrowsSame }
  let accepting = false;

  const rand = n => Math.floor(Math.random() * n);
  const coin = () => Math.random() < 0.5;

  function makeProblem() {
    const multiply = Math.random() < 0.4;
    let a, b;
    if (multiply) { a = 2 + rand(8); b = 2 + rand(8); }
    else { a = 1 + rand(20); b = 1 + rand(20); }
    const answer = multiply ? a * b : a + b;
    return { text: `${a} ${multiply ? "×" : "+"} ${b}`, odd: answer % 2 === 1 };
  }

  function makeArrows() {
    const set1 = Array.from({ length: 4 }, () => ARROWS[rand(4)]);
    const same = coin();
    let set2 = set1.slice();
    if (!same) {
      const changes = 1 + rand(2);
      const idxs = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, changes);
      idxs.forEach(i => {
        let x;
        do { x = ARROWS[rand(4)]; } while (x === set2[i]);
        set2[i] = x;
      });
    }
    return { set1: set1.join(" "), set2: set2.join(" "), same };
  }

  function fillBlock(n, prob, arr, flipped) {
    const blk = n === 1 ? block1 : block2;
    const mathDiv = blk.querySelector(".stim.math");
    const arrDiv = blk.querySelector(".stim.arrows");
    // flip = arrows on the left, problem on the right (rare)
    mathDiv.style.order = flipped ? 2 : 0;
    arrDiv.style.order = flipped ? 0 : 2;
    el(`b${n}-math`).textContent = prob.text;
    el(`b${n}-arr1`).textContent = arr.set1;
    el(`b${n}-arr2`).textContent = arr.set2;
  }

  function nextTrial() {
    const prob = makeProblem();
    const arr = makeArrows();

    // occasionally a block shows arrows on the left, problem on the right —
    // each block flips independently, so sometimes only one of them is mirrored
    const FLIP_CHANCE = 0.2;
    fillBlock(1, prob, arr, Math.random() < FLIP_CHANCE);
    fillBlock(2, prob, arr, Math.random() < FLIP_CHANCE);

    const topActive = coin();
    current = {
      task: topActive ? "math" : "arrow",
      oddAnswer: prob.odd,
      arrowsSame: arr.same
    };

    block1.className = "block" + (topActive ? " active task-math" : "");
    block2.className = "block" + (!topActive ? " active task-arrow" : "");
    qbar.className = "question " + (topActive ? "task-math" : "task-arrow");
    qtext.textContent = topActive
      ? "Is the answer to this problem ODD?"
      : "Are the two sets of arrows the SAME?";

    accepting = true;
  }

  function answer(saidYes) {
    if (!accepting || !current) return;
    accepting = false;
    attempts++;
    const truth = current.task === "math" ? current.oddAnswer : current.arrowsSame;
    const correct = saidYes === truth;
    if (correct) {
      score++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
    el("score").textContent = score;
    qbar.classList.remove("flash-good", "flash-bad");
    void qbar.offsetWidth; // restart animation
    qbar.classList.add(correct ? "flash-good" : "flash-bad");
    setTimeout(nextTrial, 320);
  }

  function tick() {
    timeLeft--;
    const m = Math.floor(timeLeft / 60), s = String(timeLeft % 60).padStart(2, "0");
    const t = el("timer");
    t.textContent = `${m}:${s}`;
    t.classList.toggle("low", timeLeft <= 10);
    if (timeLeft <= 0) endGame();
  }

  function startGame() {
    score = 0; attempts = 0; streak = 0; bestStreak = 0;
    timeLeft = GAME_SECONDS;
    el("score").textContent = "0";
    el("timer").textContent = "2:00";
    el("timer").classList.remove("low");
    el("startOverlay").classList.add("hidden");
    el("endOverlay").classList.add("hidden");
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    nextTrial();
  }

  /* ---------- leaderboard (stored in this browser) ---------- */
  const LB_KEY = "switchSprintLeaderboard";
  const LB_MAX = 10;

  function loadBoard() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; }
    catch { return []; }
  }
  function saveBoard(board) {
    try { localStorage.setItem(LB_KEY, JSON.stringify(board)); } catch {}
  }
  function renderBoard(highlightId) {
    const list = el("lbList");
    const board = loadBoard();
    list.innerHTML = "";
    if (!board.length) {
      list.innerHTML = '<li class="empty">No scores yet — be the first!</li>';
      return;
    }
    board.forEach((e, i) => {
      const li = document.createElement("li");
      if (e.id === highlightId) li.classList.add("you");
      const rank = document.createElement("span"); rank.className = "rank"; rank.textContent = (i + 1) + ".";
      const name = document.createElement("span"); name.className = "name"; name.textContent = e.name;
      const acc = document.createElement("span"); acc.className = "acc"; acc.textContent = e.acc + "%";
      const pts = document.createElement("span"); pts.className = "pts"; pts.textContent = e.score;
      li.append(rank, name, acc, pts);
      list.appendChild(li);
    });
  }
  function submitScore() {
    const input = el("playerName");
    const name = (input.value.trim() || "PLAYER").toUpperCase().slice(0, 12);
    const entry = {
      id: Date.now() + "-" + rand(1e6),
      name,
      score,
      acc: attempts ? Math.round((score / attempts) * 100) : 0
    };
    const board = loadBoard();
    board.push(entry);
    board.sort((a, b) => b.score - a.score || b.acc - a.acc);
    saveBoard(board.slice(0, LB_MAX));
    el("saveRow").classList.add("hidden");
    renderBoard(entry.id);
  }

  function endGame() {
    clearInterval(timerId);
    accepting = false;
    block1.className = "block";
    block2.className = "block";
    qbar.className = "question";
    qtext.textContent = "Time's up!";
    el("endScore").textContent = score;
    el("endAcc").textContent = attempts ? Math.round((score / attempts) * 100) + "%" : "—";
    el("endStreak").textContent = bestStreak;
    el("saveRow").classList.remove("hidden");
    renderBoard(null);
    el("endOverlay").classList.remove("hidden");
    el("playerName").focus();
  }

  el("btnStart").addEventListener("click", startGame);
  el("btnAgain").addEventListener("click", startGame);
  el("btnYes").addEventListener("click", () => answer(true));
  el("btnNo").addEventListener("click", () => answer(false));
  el("btnSave").addEventListener("click", submitScore);
  el("playerName").addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Enter") submitScore();
  });
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "y" || e.key === "Y") answer(true);
    if (e.key === "n" || e.key === "N") answer(false);
  });
})();