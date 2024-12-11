// Nav bar start
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

var prevScrollpos = window.pageYOffset;
var navWrap = document.getElementById("navbar-wrap");
var navBody = document.getElementById("navbar");

window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos >= currentScrollPos) {
        navWrap.style.top = "0";
        navBody.style.boxShadow = "-1px 4px 15px 0px rgba(209, 205, 209, 0.5)";
    } else {
        navWrap.style.top = "-91px";
        navBody.style.boxShadow = "-1px 4px 15px 0px rgba(209, 205, 209, 0)";
    }
    prevScrollpos = currentScrollPos;
}
// Nav bar end


// Events Start
var swiper = new Swiper(".mySwiper", {
    breakpoints: {
        1500: { slidesPerView: 3 },
        900: { slidesPerView: 2, spaceBetween: 25 },
    },
    spaceBetween: 10,
    slidesPerView: 1,
    centeredSlides: false,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
    },
});
// Events end





// Loading screen start
const pageLoaded = () => {
    // Animate on scroll
    AOS.init(
        {
            duration: 800,
            once: true
        }
    );

    // Remove loader
    const loader = document.getElementById('loader_block');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 300);

    // Lazy load images with cdn
    const imgs = document.querySelectorAll('[data-src]');
    imgs.forEach(img => {
        img.setAttribute('src', 'https://cdn.jsdelivr.net/gh/GfG-IIIT-Bh/GfG-IIIT-Bh.github.io' + img.getAttribute('data-src').substring(1));
    });

    // Lazy load images without cdn
    const imgs2 = document.querySelectorAll('[data-src-noncdn]');
    imgs2.forEach(img => {
        img.setAttribute('src', img.getAttribute('data-src-noncdn'));
    });

    // Lazy load contact form iframe
    document.getElementById('contact-form').setAttribute('src', 'https://docs.google.com/forms/d/e/1FAIpQLSd8v5SA60CpZtwK2njAqfyT5b1FOwZhoqyGdhe2VNIXOXOEhg/viewform?embedded=true');

    window.removeEventListener('load', pageLoaded);
}
window.addEventListener('load', pageLoaded);
// Loading screen end



import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC4mLD6HkjElgJrMdelrgESJvAJDdnl9g",
  authDomain: "quiz-2a43b.firebaseapp.com",
  databaseURL: "https://quiz-2a43b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quiz-2a43b",
  storageBucket: "quiz-2a43b.firebasestorage.app",
  messagingSenderId: "411100906430",
  appId: "1:411100906430:web:75e29afc332b90c7feafef",
  measurementId: "G-BXF22YNG6C",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const questionSets = {
  set1: [
    { question: "Capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], answer: 0 },
    { question: "2 + 2?", options: ["3", "4", "5", "6"], answer: 1 },
  ],
  set2: [
    { question: "Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1 },
    { question: "Largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: 2 },
  ],
  set3: [
    { question: "Square root of 16?", options: ["2", "3", "4", "5"], answer: 2 },
    { question: "Fastest land animal?", options: ["Cheetah", "Lion", "Tiger", "Deer"], answer: 0 },
  ],
};

let userData = { name: "", assignedSet: "", responses: [], score: 0 };
let currentQuestionIndex = 0;

function assignQuestionSet() {
  const timestamp = new Date().getTime();
  return timestamp % 3 === 0 ? "set1" : timestamp % 3 === 1 ? "set2" : "set3";
}

window.startQuiz = function () {
  const username = document.getElementById("username").value;
  if (!username) {
    alert("Please enter your name.");
    return;
  }

  userData.name = username;
  userData.assignedSet = assignQuestionSet();
  document.getElementById("user-form").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");
  loadQuestion();
};

function loadQuestion() {
  const quizElement = document.getElementById("quiz");
  const currentSet = questionSets[userData.assignedSet];
  const currentQuestion = currentSet[currentQuestionIndex];

  quizElement.innerHTML = `
    <h3>${currentQuestion.question}</h3>
    ${currentQuestion.options
      .map((option, index) => `<button onclick="window.selectOption(${index})">${option}</button>`)
      .join("")}
  `;
}

window.selectOption = function (selectedIndex) {
  userData.responses[currentQuestionIndex] = selectedIndex;
};

window.nextQuestion = function () {
  const currentSet = questionSets[userData.assignedSet];
  if (typeof userData.responses[currentQuestionIndex] === "undefined") {
    alert("Please select an answer.");
    return;
  }

  if (currentSet[currentQuestionIndex].answer === userData.responses[currentQuestionIndex]) {
    userData.score++;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < currentSet.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
};

function saveScore() {
  const scoreRef = ref(db, "scores/");
  const newScoreRef = push(scoreRef);
  set(newScoreRef, {
    name: userData.name,
    score: userData.score,
    assignedSet: userData.assignedSet,
  });
}

function loadScores() {
  const scoreRef = ref(db, "scores/");
  onValue(scoreRef, (snapshot) => {
    const scores = snapshot.val();
    const scoreBoardElement = document.getElementById("scoreboard");
    scoreBoardElement.innerHTML = Object.values(scores || {})
      .map((score) => `<p>${score.name}: ${score.score} (${score.assignedSet})</p>`)
      .join("");
  });
}

window.endQuiz = function () {
  saveScore();
  document.getElementById("quiz-container").classList.add("hidden");
  document.getElementById("result").textContent = `Thank you for participating! Your score is ${userData.score}.`;
  document.getElementById("result").classList.remove("hidden");
};

loadScores();