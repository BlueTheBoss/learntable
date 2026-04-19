// State Management
const state = {
    streak: parseInt(localStorage.getItem('tt-streak')) || 0,
    history: JSON.parse(localStorage.getItem('tt-history')) || [],
    currentView: 'home',
    currentTable: 1,
    quiz: {
        currentQuestion: null,
        score: 0,
        totalQuestions: 0,
        timer: 60,
        interval: null,
        isActive: false
    },
    mistakes: JSON.parse(localStorage.getItem('tt-mistakes')) || {},
    selectedTables: [],
    currentCategory: 'multiplication' // multiplication, squares, cubes
};

// Router
const router = {
    navigate: (view, params = {}) => {
        state.currentView = view;
        updateNav(view);
        render(view, params);
        window.scrollTo(0, 0);
    }
};

function updateNav(view) {
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.toggle('active', btn.id === `nav-btn-${view.split('-')[0]}`);
    });
}

// Views
const views = {
    home: () => {
        return `
            <section class="hero">
                <h1>Master Math <br>Fundamentals</h1>
                <p>Learn multiplication tables (1-50), squares (1-30), and cubes (1-10) with interactive tools.</p>
                <div class="hero-actions" style="display:flex; justify-content:center; gap: 1rem;">
                    <button class="btn-primary" onclick="router.navigate('tables')">Multiplication</button>
                    <button class="btn-primary" style="background:var(--secondary);" onclick="router.navigate('lab')">Math Lab</button>
                </div>
            </section>
            <div class="grid-container">
                <div class="glass-card" onclick="router.navigate('tables')">
                    <h3>📚 Tables</h3>
                    <p>Interactive tables 1-50.</p>
                </div>
                <div class="glass-card" onclick="router.navigate('lab')">
                    <h3>🧪 Math Lab</h3>
                    <p>Squares, Cubes & Roots reference.</p>
                </div>
                <div class="glass-card" onclick="router.navigate('challenge')">
                    <h3>⚡ Challenge</h3>
                    <p>Test your speed and accuracy.</p>
                </div>
                <div class="glass-card" onclick="router.navigate('flashcards')">
                    <h3>🎴 Flashcards</h3>
                    <p>Universal memorization tool.</p>
                </div>
            </div>
        `;
    },

    lab: () => `
        <div class="hero">
            <h1>Math Laboratory</h1>
            <p>Select a category to learn squares, cubes, and their roots.</p>
        </div>
        <div class="grid-container">
            <div class="glass-card" onclick="router.navigate('lab-category', {type: 'squares'})">
                <h2 style="color:var(--accent);">x²</h2>
                <p>Squares up to 30</p>
                <span style="color:var(--text-muted); font-size:0.9rem;">Includes Square Roots</span>
            </div>
            <div class="glass-card" onclick="router.navigate('lab-category', {type: 'cubes'})">
                <h2 style="color:var(--secondary);">x³</h2>
                <p>Cubes up to 10</p>
                <span style="color:var(--text-muted); font-size:0.9rem;">Includes Cube Roots</span>
            </div>
        </div>
    `,

    'lab-category': (params) => {
        const type = params.type;
        const max = type === 'squares' ? 30 : 10;
        const symbol = type === 'squares' ? '²' : '³';
        const rootSymbol = type === 'squares' ? '√' : '∛';
        
        let html = `
            <div class="hero">
                <button onclick="router.navigate('lab')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700; margin-bottom: 2rem;">← Back to Lab</button>
                <h1>${type.charAt(0).toUpperCase() + type.slice(1)} & Roots</h1>
            </div>
            <div class="grid-container">
        `;
        
        for (let i = 1; i <= max; i++) {
            const val = type === 'squares' ? i * i : i * i * i;
            html += `
                <div class="glass-card" style="text-align:center;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">
                        ${i}${symbol} = <span style="color:var(--accent); font-weight:800;">${val}</span>
                    </div>
                    <div style="font-size: 1.1rem; color: var(--text-muted);">
                        ${rootSymbol}${val} = <span style="color:var(--text-white); font-weight:600;">${i}</span>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    focus: () => {
        const topMistakes = Object.entries(state.mistakes)
            .sort((a, b) => b[1] - a[1])
            .map(m => parseInt(m[0]));
        
        if (topMistakes.length === 0) return views.home();

        // Generate a question only from mistake tables
        const n1 = topMistakes[Math.floor(Math.random() * topMistakes.length)];
        const n2 = Math.floor(Math.random() * 10) + 1;
        const q = { n1, n2, ans: n1 * n2 };
        state.quiz.currentQuestion = q;

        return `
            <div class="hero">
                <h1 style="color: #f87171;">Focus Session</h1>
                <p>Targeting your most frequent mistakes.</p>
            </div>
            <div class="quiz-box glass-card" style="border-color: #f87171;">
                <div class="equation" style="font-size: 4rem; font-weight: 800;">${q.n1} × ${q.n2}</div>
                <div class="input-group">
                    <input type="number" id="quiz-input" class="answer-input" placeholder="?" autofocus onkeyup="checkFocusAnswer(event)">
                </div>
                <div id="quiz-feedback" style="margin-top: 1.5rem; min-height: 2rem; font-weight: 700;"></div>
            </div>
        `;
    },

    tables: () => {
        let html = '<div class="hero"><h1>Select a Table</h1><p>Master each one, step by step.</p></div>';
        html += '<div class="grid-container">';
        for (let i = 1; i <= 50; i++) {
            html += `
                <div class="glass-card table-card" onclick="router.navigate('table-detail', {num: ${i}})">
                    <h2>${i}</h2>
                    <p>Table of ${i}</p>
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    'table-detail': (params) => {
        const n = params.num;
        let html = `
            <div class="hero">
                <button onclick="router.navigate('tables')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700; margin-bottom: 2rem;">← Back to Tables</button>
                <h1>Table of ${n}</h1>
            </div>
            <div class="grid-container" style="max-width: 800px; margin: 0 auto;">
        `;
        for (let i = 1; i <= 10; i++) {
            html += `
                <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding: 1.5rem 2rem;">
                    <span style="font-size: 1.5rem; font-weight: 600;">${n} × ${i}</span>
                    <span style="font-size: 2rem; font-weight: 800; color: var(--accent);">${n * i}</span>
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    flashcards: () => {
        // Pick a random question for the first card
        const q = generateQuestion();
        return `
            <div class="hero">
                <h1>Flashcards</h1>
                <p>Tap to reveal the answer. Focus on the pattern.</p>
            </div>
            <div class="flashcard-container">
                <div class="flashcard" id="active-flashcard" onclick="this.classList.toggle('flipped')">
                    <div class="card-face card-front">
                        <div class="equation">${q.n1} × ${q.n2}</div>
                        <p style="margin-top: 1rem; color: var(--text-muted);">Tap to Reveal</p>
                    </div>
                    <div class="card-face card-back">
                        <div class="result">${q.ans}</div>
                        <button class="btn-primary" style="margin-top: 2rem;" onclick="event.stopPropagation(); router.navigate('flashcards')">Next Card</button>
                    </div>
                </div>
            </div>
        `;
    },

    challenge: () => {
        let selectionHtml = '';
        for (let i = 1; i <= 50; i++) {
            const isSelected = state.selectedTables.includes(i);
            selectionHtml += `
                <div class="selection-item ${isSelected ? 'selected' : ''}" 
                     onclick="toggleTable(${i}, this)">
                     ${i}
                </div>`;
        }

        return `
            <div class="hero">
                <h1>Practice Setup</h1>
                <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                    <button class="btn-primary" style="opacity: ${state.currentCategory === 'multiplication' ? '1' : '0.5'}" onclick="setCategory('multiplication')">Tables</button>
                    <button class="btn-primary" style="opacity: ${state.currentCategory === 'squares' ? '1' : '0.5'}" onclick="setCategory('squares')">Squares</button>
                    <button class="btn-primary" style="opacity: ${state.currentCategory === 'cubes' ? '1' : '0.5'}" onclick="setCategory('cubes')">Cubes</button>
                </div>
                
                ${state.currentCategory === 'multiplication' ? `
                    <p>Select the tables you want to practice:</p>
                    <div class="selection-grid">
                        ${selectionHtml}
                    </div>
                ` : `<p>Practicing ${state.currentCategory} category.</p>`}
                <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="startPracticeMode('loop')">Practice Loop</button>
                    <button class="btn-primary" onclick="startPracticeMode('speed')" style="background: var(--secondary); box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4);">Speed Test</button>
                    <button class="btn-primary" style="background: var(--bg-dark); border: 1px solid var(--card-border); box-shadow: none;" onclick="clearSelection()">Clear All</button>
                </div>
            </div>
        `;
    },

    'practice-loop': () => {
        const q = generateQuestion();
        state.quiz.currentQuestion = q;
        const equation = q.type === 'mul' ? `${q.n1} × ${q.n2}` : (q.type === 'sq' ? `${q.n1}²` : `${q.n1}³`);
        return `
            <div class="hero">
                <button onclick="router.navigate('challenge')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700; margin-bottom: 2rem;">← Change Selection</button>
                <h1>Practice Mode</h1>
                <p>Category: ${state.currentCategory}</p>
            </div>
            <div class="quiz-box glass-card">
                <div class="equation" style="font-size: 4rem; font-weight: 800;">${equation}</div>
                <div class="input-group">
                    <input type="number" id="quiz-input" class="answer-input" placeholder="?" autofocus onkeyup="checkAnswer(event)">
                </div>
                <div id="quiz-feedback" style="margin-top: 1.5rem; min-height: 2rem; font-weight: 700;"></div>
            </div>
        `;
    },

    'speed-test': () => `
        <div class="hero">
            <h1>Speed Test</h1>
            <div style="font-size: 3rem; font-weight: 800; color: var(--accent); margin-bottom: 1rem;">
                <span id="timer-display">60</span>s
            </div>
            <p>Score: <span id="current-score">0</span></p>
        </div>
        <div class="quiz-box glass-card">
            <div id="speed-question" class="equation" style="font-size: 4rem; font-weight: 800;">...</div>
            <div class="input-group">
                <input type="number" id="speed-input" class="answer-input" placeholder="?" autofocus onkeyup="checkSpeedAnswer(event)">
            </div>
            <div id="quiz-feedback" style="margin-top: 1.5rem; min-height: 2rem; font-weight: 700;"></div>
        </div>
    `,

    'results': (params) => `
        <div class="hero">
            <h1>Times Up!</h1>
            <p>You scored</p>
            <div style="font-size: 5rem; font-weight: 800; color: var(--accent); margin: 2rem 0;">${params.score}</div>
            <button class="btn-primary" onclick="router.navigate('challenge')">Try Again</button>
        </div>
    `
};

// Utils
function generateQuestion() {
    // If we're in a specific category (added logic for challenge switching later)
    const cat = state.currentCategory;
    
    if (cat === 'multiplication') {
        let n1;
        if (state.selectedTables.length > 0) {
            n1 = state.selectedTables[Math.floor(Math.random() * state.selectedTables.length)];
        } else {
            n1 = Math.floor(Math.random() * 50) + 1;
        }
        const n2 = Math.floor(Math.random() * 10) + 1;
        return { n1, n2, ans: n1 * n2, type: 'mul' };
    } else if (cat === 'squares') {
        const n1 = Math.floor(Math.random() * 30) + 1;
        return { n1, n2: null, ans: n1 * n1, type: 'sq' };
    } else {
        const n1 = Math.floor(Math.random() * 10) + 1;
        return { n1, n2: null, ans: n1 * n1 * n1, type: 'cb' };
    }
}

window.setCategory = (cat) => {
    state.currentCategory = cat;
    router.navigate('challenge');
};

window.toggleTable = (num, el) => {
    const idx = state.selectedTables.indexOf(num);
    if (idx > -1) {
        state.selectedTables.splice(idx, 1);
        el.classList.remove('selected');
    } else {
        state.selectedTables.push(num);
        el.classList.add('selected');
    }
};

window.clearSelection = () => {
    state.selectedTables = [];
    router.navigate('challenge');
};

window.startPracticeMode = (type) => {
    if (type === 'speed') {
        startSpeedTest();
    } else {
        router.navigate('practice-loop');
    }
};

window.checkAnswer = (e) => {
    if (e.key === 'Enter') {
        const val = parseInt(e.target.value);
        const feedback = document.getElementById('quiz-feedback');
        const input = document.getElementById('quiz-input');
        const q = state.quiz.currentQuestion;
        
        if (val === q.ans) {
            feedback.innerHTML = '<span style="color: #4ade80;">Correct!</span>';
            state.streak++;
            saveStreak();
            updateUIStats();
            setTimeout(() => router.navigate('practice-loop'), 500);
        } else {
            feedback.innerHTML = `<span style="color: #f87171;">Ouch! ${q.n1} × ${q.n2} = ${q.ans}</span>`;
            trackMistake(q.n1);
            state.streak = 0;
            saveStreak();
            updateUIStats();
            input.value = '';
            input.classList.add('shake');
            setTimeout(() => {
                input.classList.remove('shake');
                router.navigate('practice-loop');
            }, 1200);
        }
    }
};

window.startSpeedTest = () => {
    state.quiz.score = 0;
    state.quiz.timer = 60;
    state.quiz.isActive = true;
    router.navigate('speed-test');
    
    nextSpeedQuestion();
    
    state.quiz.interval = setInterval(() => {
        state.quiz.timer--;
        const display = document.getElementById('timer-display');
        if (display) display.innerText = state.quiz.timer;
        
        if (state.quiz.timer <= 0) {
            clearInterval(state.quiz.interval);
            state.quiz.isActive = false;
            router.navigate('results', { score: state.quiz.score });
        }
    }, 1000);
};

function nextSpeedQuestion() {
    const q = generateQuestion();
    state.quiz.currentQuestion = q;
    const equation = q.type === 'mul' ? `${q.n1} × ${q.n2}` : (q.type === 'sq' ? `${q.n1}²` : `${q.n1}³`);
    const qEl = document.getElementById('speed-question');
    if (qEl) qEl.innerText = equation;
    const input = document.getElementById('speed-input');
    if (input) {
        input.value = '';
        input.focus();
    }
}

window.checkSpeedAnswer = (e) => {
    const val = parseInt(e.target.value);
    const q = state.quiz.currentQuestion;
    
    if (val === q.ans) {
        state.quiz.score++;
        document.getElementById('current-score').innerText = state.quiz.score;
        nextSpeedQuestion();
    }
};

window.checkFocusAnswer = (e) => {
    if (e.key === 'Enter') {
        const val = parseInt(e.target.value);
        const feedback = document.getElementById('quiz-feedback');
        const q = state.quiz.currentQuestion;
        
        if (val === q.ans) {
            feedback.innerHTML = '<span style="color: #4ade80;">Correct! Reduced mistake weight.</span>';
            state.mistakes[q.n1] = Math.max(0, state.mistakes[q.n1] - 1);
            localStorage.setItem('tt-mistakes', JSON.stringify(state.mistakes));
            setTimeout(() => router.navigate('focus'), 600);
        } else {
            feedback.innerHTML = `<span style="color: #f87171;">Still tricky! It's ${q.ans}</span>`;
            trackMistake(q.n1);
            const input = document.getElementById('quiz-input');
            input.value = '';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 400);
        }
    }
};

function trackMistake(table) {
    state.mistakes[table] = (state.mistakes[table] || 0) + 1;
    localStorage.setItem('tt-mistakes', JSON.stringify(state.mistakes));
}

function saveStreak() {
    localStorage.setItem('tt-streak', state.streak);
}

function updateUIStats() {
    document.getElementById('streak-count').innerText = `🔥 ${state.streak}`;
}

// Render Logic
function render(view, params = {}) {
    const main = document.getElementById('main-content');
    if (views[view]) {
        main.style.opacity = '0';
        setTimeout(() => {
            main.innerHTML = views[view](params);
            
            // Staggered Animations
            const cards = main.querySelectorAll('.glass-card, .table-card');
            cards.forEach((card, i) => {
                card.style.animationDelay = `${i * 0.05}s`;
            });

            main.style.opacity = '1';
            
            // Auto-focus input if in challenge
            const input = document.getElementById('quiz-input');
            if (input) input.focus();
        }, 150);
    }
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    render('home');
    updateUIStats();
});
