document.addEventListener("DOMContentLoaded", () => {
  let questionsData = [];
  let usedQuestions = [];
  let score = 0;
  let questionNumber = 0;

  const questionElement = document.getElementById("question");
  const answerButtons = document.getElementById("answer-buttons");
  const nextButton = document.getElementById("next-btn");
  const restartButton = document.getElementById("restart-btn");

  function fetchQuestions() {
    fetch(
      "https://api.allorigins.win/get?url=" +
        encodeURIComponent("https://api.jsonserve.com/Uw5CrX")
    )
      .then((response) => response.json())
      .then((data) => {
        const responseData = JSON.parse(data.contents);

        if (responseData && Array.isArray(responseData.questions)) {
          questionsData = responseData.questions.map((q) => ({
            question: q.description,
            answers: q.options.map((option, index) => ({
              text: option.description,
              label: String.fromCharCode(65 + index),
              correct: option.is_correct,
            })),
          }));

          startQuiz();
        } else {
          console.error("Invalid API response format:", responseData);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function startQuiz() {
    score = 0;
    questionNumber = 0;
    usedQuestions = [];
    nextButton.style.display = "block";
    restartButton.style.display = "none";
    showQuestion();
  }

  function showQuestion() {
    resetState();

    if (usedQuestions.length === questionsData.length) {
      showScore();
      return;
    }

    let availableQuestions = questionsData.filter(
      (q) => !usedQuestions.includes(q)
    );
    let currentQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    usedQuestions.push(currentQuestion);
    questionNumber++;
    questionElement.innerHTML = `Q${questionNumber}: ${currentQuestion.question}`;

    answerButtons.classList.add("grid-container");
    currentQuestion.answers.forEach((answer) => {
      const buttonWrapper = document.createElement("div");
      buttonWrapper.classList.add("answer-wrapper");

      const label = document.createElement("span");
      label.classList.add("answer-label");
      label.innerHTML = answer.label;

      const button = document.createElement("button");
      button.innerHTML = answer.text;
      button.classList.add("btn");

      if (answer.correct) {
        button.dataset.correct = answer.correct;
      }

      button.addEventListener("click", selectAnswer);

      buttonWrapper.appendChild(label);
      buttonWrapper.appendChild(button);
      answerButtons.appendChild(buttonWrapper);
    });
  }

  function resetState() {
    nextButton.style.display = "none";
    answerButtons.classList.remove("grid-container");
    while (answerButtons.firstChild) {
      answerButtons.removeChild(answerButtons.firstChild);
    }
  }

  function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      selectedBtn.style.color = "white";
      score++;
    } else {
      selectedBtn.classList.add("incorrect");
    }

    Array.from(answerButtons.children).forEach((wrapper) => {
      const button = wrapper.querySelector("button");
      if (button.dataset.correct === "true") {
        button.classList.add("correct");
        button.style.color = "white";
      }
      button.disabled = true;
    });

    nextButton.style.display = "block";
  }

  function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questionsData.length}!`;
    nextButton.style.display = "none";
    restartButton.style.display = "block";
  }

  nextButton.addEventListener("click", showQuestion);
  restartButton.addEventListener("click", startQuiz);

  fetchQuestions();
});
