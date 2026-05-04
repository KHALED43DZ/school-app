let data = {};
let questions = [];
let current = 0;
let score = 0;

fetch('data.json')
  .then(res => res.json())
  .then(json => data = json);

function startQuiz() {
  questions = data.levels["5"]["term1"]["math"] || [];
  current = 0;
  score = 0;

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  let q = questions[current];

  document.getElementById("question").innerText = q.question;
  document.getElementById("score").innerText = score + " / " + questions.length;

  let optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, index) => {
    let btn = document.createElement("button");
    btn.innerText = opt;

    btn.onclick = () => checkAnswer(index, q.answer, q.explanation, btn);

    optionsDiv.appendChild(btn);
  });

  document.getElementById("feedback").innerText = "";
}

function checkAnswer(selected, correct, explanation, btn) {
  let buttons = document.querySelectorAll("#options button");
  buttons.forEach(b => b.disabled = true);

  if (selected === correct) {
    btn.classList.add("correct");
    score++;
    document.getElementById("feedback").innerText = "✔️ إجابة صحيحة";
  } else {
    btn.classList.add("wrong");
    buttons[correct].classList.add("correct");
    document.getElementById("feedback").innerText = "❌ " + explanation;
  }

  saveProgress();
}

function nextQuestion() {
  current++;

  if (current < questions.length) {
    showQuestion();
  } else {
    alert("انتهى الاختبار! نتيجتك: " + score + "/" + questions.length);
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("quiz").classList.add("hidden");
  }
}

function saveProgress() {
  localStorage.setItem("lastScore", score);
}
