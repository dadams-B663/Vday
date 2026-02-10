(function () {
  'use strict';

  const SPLASH_DURATION = 3500;
  const STORAGE_KEY = 'valentineQuizResults';

  const state = {
    currentScreen: 'splash',
    currentQuestion: 1,
    totalQuestions: 9,
    wrongCount: 0,
    noThanksClicks: 0,
    violenceMode: false,
    q5CustomAnswered: false,
    q7CustomAnswered: false,
    answers: {}
  };

  const screens = {
    splash: document.getElementById('splash'),
    landing: document.getElementById('landing'),
    quiz: document.getElementById('quiz'),
    success: document.getElementById('success'),
    results: document.getElementById('results-screen')
  };

  const section1 = document.getElementById('section-1');
  const section2 = document.getElementById('section-2');
  const section3 = document.getElementById('section-3');
  const finalSection = document.getElementById('final-section');
  const btnNoValentine = document.getElementById('btn-no-valentine');
  const popupOverlay = document.getElementById('popup-overlay');
  const popupText = document.getElementById('popup-text');
  const violencePopup = document.getElementById('violence-popup');
  const currentQEl = document.getElementById('current-q');
  const totalQEl = document.getElementById('total-q');
  const quizNav = document.querySelector('.quiz-nav');
  const q5Wrap = document.querySelector('[data-q="5"] .custom-input-wrap');
  const q5Input = document.getElementById('q5-input');
  const q7Wrap = document.querySelector('[data-q="7"] .custom-input-wrap');
  const q7Input = document.getElementById('q7-input');
  const finalPauseWrap = document.getElementById('final-pause-wrap');
  const finalQuestionWrap = document.getElementById('final-question-wrap');
  const finalLine1 = document.getElementById('final-line-1');
  const finalLine2 = document.getElementById('final-line-2');
  const finalLine3 = document.getElementById('final-line-3');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const resultsList = document.getElementById('results-list');
  const resultsEmpty = document.getElementById('results-empty');

  function showScreen(id) {
    if (id === 'results') {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.tab-btn[data-tab="results"]').classList.add('active');
      Object.values(screens).forEach(s => s && s.classList.remove('active'));
      if (screens.results) screens.results.classList.add('active');
      renderResults();
      return;
    }
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="quiz"]').classList.add('active');
    Object.values(screens).forEach(s => s && s.classList.remove('active'));
    if (screens[id]) screens[id].classList.add('active');
    state.currentScreen = id;
  }

  function getStoredResults() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveResult(payload) {
    const list = getStoredResults();
    list.unshift(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderResults() {
    const list = getStoredResults();
    resultsList.innerHTML = '';
    if (list.length === 0) {
      resultsEmpty.hidden = false;
      return;
    }
    resultsEmpty.hidden = true;
    list.forEach(function (entry, index) {
      const card = document.createElement('div');
      card.className = 'result-card';
      const date = new Date(entry.completedAt);
      const dateStr = date.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' at ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      const bodyId = 'result-body-' + index;
      card.innerHTML =
        '<button type="button" class="result-card-header" aria-expanded="false" aria-controls="' + bodyId + '" data-result-toggle>' +
        '<span>' + dateStr + '</span>' +
        '<span aria-hidden="true">▼</span>' +
        '</button>' +
        '<div class="result-card-body" id="' + bodyId + '" hidden></div>';
      const body = card.querySelector('.result-card-body');
      const rows = (entry.answers || []).map(function (a) {
        return '<div class="result-row"><span class="result-q">' + escapeHtml(a.questionText) + '</span><br><span class="result-a">' + escapeHtml(a.answerText) + '</span></div>';
      }).join('');
      if (entry.finalAnswer) {
        rows += '<div class="result-row"><span class="result-q">Will you be my Valentine?</span><br><span class="result-a">' + escapeHtml(entry.finalAnswer) + '</span></div>';
      }
      body.innerHTML = rows;
      card.querySelector('[data-result-toggle]').addEventListener('click', function () {
        const open = body.hidden;
        body.hidden = !open;
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      resultsList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showSection(sectionEl) {
    [section1, section2, section3, finalSection].forEach(s => s && s.classList.remove('active'));
    if (sectionEl) sectionEl.classList.add('active');
  }

  function showQuestion(num) {
    if (quizNav) quizNav.style.display = 'flex';
    state.currentQuestion = num;
    currentQEl.textContent = num;
    totalQEl.textContent = state.totalQuestions;

    const allQuestions = document.querySelectorAll('.question');
    allQuestions.forEach(q => {
      const n = parseInt(q.getAttribute('data-q'), 10);
      q.style.display = n === num ? 'block' : 'none';
    });

    if (num <= 3) showSection(section1);
    else if (num <= 6) showSection(section2);
    else if (num <= 9) showSection(section3);
    else showSection(finalSection);

    if (num === 5) {
      q5Wrap.hidden = true;
      document.querySelectorAll('[data-q="5"] .option').forEach(o => o.disabled = false);
    }
    if (num === 7) {
      q7Wrap.hidden = true;
      document.querySelectorAll('[data-q="7"] .option').forEach(o => o.disabled = false);
    }
  }

  function showFinal() {
    state.currentQuestion = 'final';
    showSection(finalSection);
    document.querySelectorAll('.question').forEach(q => q.style.display = 'none');
    finalSection.querySelector('.final-title').style.display = '';
    if (finalPauseWrap) finalPauseWrap.style.display = '';
    if (finalQuestionWrap) {
      finalQuestionWrap.style.display = '';
      finalQuestionWrap.classList.remove('visible');
    }

    [finalLine1, finalLine2, finalLine3].forEach(function (el) {
      if (el) { el.classList.remove('visible', 'fade-out'); }
    });

    if (state.violenceMode) {
      btnNoValentine.style.display = 'none';
    } else {
      btnNoValentine.style.display = '';
    }
    if (quizNav) quizNav.style.display = 'none';
    currentQEl.textContent = '♥';
    totalQEl.textContent = '♥';

    runFinalMessageSequence();
  }

  function runFinalMessageSequence() {
    var LINE_HOLD = 2400;
    var FADE_OUT = 700;
    if (!finalLine1 || !finalLine2 || !finalLine3 || !finalQuestionWrap) return;
    finalLine1.classList.add('visible');
    setTimeout(function () {
      finalLine1.classList.add('fade-out');
      finalLine2.classList.add('visible');
    }, LINE_HOLD);
    setTimeout(function () {
      finalLine2.classList.add('fade-out');
      finalLine3.classList.add('visible');
    }, LINE_HOLD + LINE_HOLD);
    setTimeout(function () {
      finalLine3.classList.add('fade-out');
    }, LINE_HOLD * 3);
    setTimeout(function () {
      finalLine1.classList.remove('visible', 'fade-out');
      finalLine2.classList.remove('visible', 'fade-out');
      finalLine3.classList.remove('visible', 'fade-out');
      finalQuestionWrap.classList.add('visible');
    }, LINE_HOLD * 3 + FADE_OUT);
  }

  function restartQuiz() {
    state.currentQuestion = 1;
    state.wrongCount = 0;
    state.noThanksClicks = 0;
    state.violenceMode = false;
    state.q5CustomAnswered = false;
    state.q7CustomAnswered = false;
    state.answers = {};
    document.querySelectorAll('.option').forEach(o => { o.disabled = false; o.classList.remove('chosen'); });
    q5Wrap.hidden = true;
    q7Wrap.hidden = true;
    btnNoValentine.style.display = '';
    showScreen('landing');
  }

  function showPopup(message) {
    popupText.textContent = message;
    popupOverlay.hidden = false;
  }

  function closePopup() {
    popupOverlay.hidden = true;
  }

  function closeViolencePopup() {
    violencePopup.hidden = true;
    state.violenceMode = true;
    showFinal();
  }

  function goNext() {
    if (state.currentQuestion === 9) {
      showFinal();
      return;
    }
    showQuestion(state.currentQuestion + 1);
  }

  function goPrev() {
    if (state.currentQuestion <= 1) return;
    showQuestion(state.currentQuestion - 1);
  }

  // Splash → Landing
  setTimeout(function () {
    if (state.currentScreen === 'splash') showScreen('landing');
  }, SPLASH_DURATION);

  function recordAnswer(qNum, questionText, answerText) {
    state.answers[qNum] = { questionText: questionText, answerText: answerText };
  }

  // Tab clicks
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = this.getAttribute('data-tab');
      if (tab === 'results') showScreen('results');
      else {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        Object.values(screens).forEach(s => s && s.classList.remove('active'));
        if (screens[state.currentScreen]) screens[state.currentScreen].classList.add('active');
      }
    });
  });

  // Start quiz
  document.querySelector('[data-action="start-quiz"]').addEventListener('click', function () {
    state.answers = {};
    showScreen('quiz');
    showQuestion(1);
  });

  // Quiz nav
  document.querySelector('[data-action="next"]').addEventListener('click', goNext);
  document.querySelector('[data-action="prev"]').addEventListener('click', goPrev);

  // Option clicks
  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', function () {
      const answer = this.getAttribute('data-answer');
      const qEl = this.closest('.question');
      const qNum = parseInt(qEl.getAttribute('data-q'), 10);
      const questionText = (qEl.querySelector('.question-text') || {}).textContent || '';

      if (answer === 'restart') {
        showPopup("Let's try again from the beginning. No pressure.");
        setTimeout(function () {
          closePopup();
          restartQuiz();
        }, 1500);
        return;
      }

      if (answer === 'noted') {
        recordAnswer(qNum, questionText, this.textContent.trim());
        showPopup("Okay, noted");
        state.wrongCount = Math.max(0, (state.wrongCount || 0) - 1);
        this.disabled = true;
        this.classList.add('chosen');
        setTimeout(function () {
          closePopup();
          goNext();
        }, 1200);
        return;
      }

      if (qNum === 5 && answer === 'depends') {
        this.disabled = true;
        this.classList.add('chosen');
        q5Wrap.hidden = false;
        return;
      }

      if (qNum === 7 && answer === 'custom7') {
        this.disabled = true;
        this.classList.add('chosen');
        q7Wrap.hidden = false;
        return;
      }

      recordAnswer(qNum, questionText, this.textContent.trim());
      this.disabled = true;
      this.classList.add('chosen');
      goNext();
    });
  });

  // Q5 custom submit
  document.querySelector('[data-action="submit-q5"]').addEventListener('click', function () {
    const val = (q5Input.value || '').trim();
    if (val) state.q5CustomAnswered = true;
    var qEl = document.querySelector('[data-q="5"]');
    var questionText = (qEl && qEl.querySelector('.question-text')) ? qEl.querySelector('.question-text').textContent : '';
    recordAnswer(5, questionText, val || 'Depends (no text)');
    q5Wrap.hidden = true;
    goNext();
  });

  // Q7 custom submit
  document.querySelector('[data-action="submit-q7"]').addEventListener('click', function () {
    const val = (q7Input.value || '').trim();
    if (val) state.q7CustomAnswered = true;
    var qEl = document.querySelector('[data-q="7"]');
    var questionText = (qEl && qEl.querySelector('.question-text')) ? qEl.querySelector('.question-text').textContent : '';
    recordAnswer(7, questionText, val || 'I have an idea (no text)');
    q7Wrap.hidden = true;
    goNext();
  });

  q5Input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.querySelector('[data-action="submit-q5"]').click();
  });
  q7Input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.querySelector('[data-action="submit-q7"]').click();
  });

  // Final buttons
  document.querySelectorAll('[data-final="yes"], [data-final="yes-planning"]').forEach(btn => {
    btn.addEventListener('click', function () {
      var finalAnswer = this.textContent.trim();
      var answersArray = [];
      for (var q = 1; q <= 9; q++) {
        if (state.answers[q]) answersArray.push(state.answers[q]);
      }
      saveResult({
        id: Date.now(),
        completedAt: new Date().toISOString(),
        answers: answersArray,
        finalAnswer: finalAnswer
      });
      showScreen('success');
    });
  });

  btnNoValentine.addEventListener('click', function () {
    state.noThanksClicks += 1;
    if (state.noThanksClicks >= 2) {
      violencePopup.hidden = false;
    }
  });

  document.querySelector('[data-action="close-popup"]').addEventListener('click', closePopup);
  document.querySelector('[data-action="close-violence"]').addEventListener('click', closeViolencePopup);
})();
