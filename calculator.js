/**
 * UCENM Calculator – calculator.js
 * Lógica completa: operaciones, historial, teclado, dark mode, animaciones
 */

// ── Estado ──────────────────────────────────────────────────────────────────
const state = {
  current:      '0',      // número que se muestra
  previous:     '',       // número anterior
  operator:     null,     // operador activo
  expression:   '',       // expresión completa para mostrar arriba
  justEvaluated: false,   // flag para saber si acabamos de presionar =
  history:      [],       // historial de operaciones
};

// ── Elementos DOM ────────────────────────────────────────────────────────────
const resultLine    = document.getElementById('resultLine');
const expressionLine = document.getElementById('expressionLine');
const historyPanel  = document.getElementById('historyPanel');
const historyList   = document.getElementById('historyList');
const historyToggle = document.getElementById('historyToggle');
const clearHistory  = document.getElementById('clearHistory');
const copyBtn       = document.getElementById('copyBtn');
const modeToggle    = document.getElementById('modeToggle');
const modeIcon      = document.getElementById('modeIcon');

// ── Utilidades ───────────────────────────────────────────────────────────────

/** Formatea un número con separadores de miles (máx 10 decimales) */
function formatNumber(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;

  // Detect if the value has decimals
  const hasDecimal = val.toString().includes('.');
  if (hasDecimal) {
    // Keep up to 10 decimal places, no trailing zeros unless user typed them
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  }
  return num.toLocaleString('en-US');
}

/** Ajusta el tamaño de fuente según la longitud del resultado */
function adjustFontSize(text) {
  const len = text.replace(/[,\.]/g, '').length;
  resultLine.classList.remove('small', 'xsmall');
  if (len >= 14) resultLine.classList.add('xsmall');
  else if (len >= 10) resultLine.classList.add('small');
}

/** Convierte símbolo de operador a operador matemático */
function resolveOp(op) {
  switch (op) {
    case '÷': return '/';
    case '×': return '*';
    case '−': return '-';
    case '+': return '+';
    default: return op;
  }
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const display = formatNumber(state.current);
  resultLine.textContent = display;
  adjustFontSize(display);

  const exprText = state.expression || '\u00A0';
  expressionLine.textContent = exprText;

  // Mark active operator button
  document.querySelectorAll('.calc-btn.op').forEach(btn => {
    btn.classList.toggle('active',
      state.operator !== null &&
      !state.justEvaluated &&
      btn.dataset.value === state.operator
    );
  });
}

// ── Acciones ─────────────────────────────────────────────────────────────────

function inputNumber(digit) {
  if (state.justEvaluated) {
    // Start fresh after equals
    state.current = digit === '.' ? '0.' : digit;
    state.expression = '';
    state.justEvaluated = false;
    render();
    return;
  }

  if (state.current === 'Error') {
    state.current = digit;
    render();
    return;
  }

  if (digit === '.' && state.current.includes('.')) return;
  if (digit !== '.' && state.current === '0') {
    state.current = digit;
  } else if (digit === '.' && state.current === '0') {
    state.current = '0.';
  } else {
    if (state.current.replace(/[^0-9]/g, '').length >= 15) return; // max digits
    state.current += digit;
  }
  render();
}

function setOperator(op) {
  if (state.current === 'Error') return;

  // If we already have an operator and a previous value, chain calculation
  if (state.operator && !state.justEvaluated && state.previous !== '') {
    calculate(true); // silent chain
  }

  state.previous = state.current;
  state.operator = op;
  state.expression = `${formatNumber(state.previous)} ${op}`;
  state.current = state.previous; // show previous number grayed
  state.justEvaluated = false;

  // Next number input will replace current
  state._awaitingNext = true;
  render();
}

function calculate(silent = false) {
  if (!state.operator || state.previous === '') return;

  const a = parseFloat(state.previous.replace(/,/g, ''));
  const b = parseFloat(state.current.replace(/,/g, ''));
  const op = resolveOp(state.operator);

  let result;
  if (op === '/' && b === 0) {
    result = 'Error';
  } else {
    // Safe evaluation
    result = String(eval(`${a} ${op} ${b}`)); // eslint-disable-line no-eval
    // Handle floating point imprecision
    const num = parseFloat(result);
    if (!isNaN(num)) {
      result = String(parseFloat(num.toPrecision(14)));
    }
  }

  const exprFull = `${formatNumber(state.previous)} ${state.operator} ${formatNumber(state.current)} =`;

  if (!silent) {
    // Add to history
    if (result !== 'Error') {
      addToHistory(exprFull, result);
    }

    // Flash animation
    resultLine.classList.remove('flash');
    void resultLine.offsetWidth; // reflow trick
    resultLine.classList.add('flash');

    state.expression = exprFull;
    state.justEvaluated = true;
  }

  state.current = result;
  state.operator = silent ? state.operator : null;
  state.previous = result;
  state._awaitingNext = false;

  if (!silent) render();
}

function allClear() {
  state.current = '0';
  state.previous = '';
  state.operator = null;
  state.expression = '';
  state.justEvaluated = false;
  state._awaitingNext = false;
  render();
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  render();
}

function percent() {
  const num = parseFloat(state.current);
  if (isNaN(num)) return;
  if (state.previous !== '' && state.operator) {
    // Percentage relative to previous: a * (b/100)
    const prev = parseFloat(state.previous);
    state.current = String(prev * num / 100);
  } else {
    state.current = String(num / 100);
  }
  render();
}

// ── Input interception (handles _awaitingNext flag) ───────────────────────────
function handleNumber(digit) {
  if (state._awaitingNext) {
    state.current = digit === '.' ? '0.' : digit;
    state._awaitingNext = false;
    render();
    return;
  }
  inputNumber(digit);
}

// ── Historial ─────────────────────────────────────────────────────────────────
function addToHistory(expr, result) {
  state.history.unshift({ expr, result });
  if (state.history.length > 30) state.history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (state.history.length === 0) {
    historyList.innerHTML = '<li class="history-empty">Sin historial aún</li>';
    return;
  }
  state.history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="h-expr">${item.expr}</div>
      <div class="h-result">${formatNumber(item.result)}</div>
    `;
    li.addEventListener('click', () => {
      state.current = item.result;
      state.expression = item.expr;
      state.justEvaluated = true;
      render();
      toggleHistoryPanel();
    });
    historyList.appendChild(li);
  });
}

function toggleHistoryPanel() {
  historyPanel.classList.toggle('open');
}

// ── Botones ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    // Ripple
    triggerRipple(btn);

    switch (action) {
      case 'number':   handleNumber(value); break;
      case 'operator': setOperator(value);  break;
      case 'equals':   calculate();         break;
      case 'allclear': allClear();          break;
      case 'toggleSign': toggleSign();      break;
      case 'percent':  percent();           break;
      case 'decimal':  handleNumber('.');   break;
    }
  });
});

// ── Ripple Effect ─────────────────────────────────────────────────────────────
function triggerRipple(btn) {
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute;
    border-radius:50%;
    background:rgba(255,255,255,0.25);
    width:80px;height:80px;
    left:50%;top:50%;
    transform:translate(-50%,-50%) scale(0);
    animation:rippleAnim 0.4s ease-out forwards;
    pointer-events:none;
  `;
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes rippleAnim{to{transform:translate(-50%,-50%) scale(3);opacity:0;}}';
    document.head.appendChild(s);
  }
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 400);
}

// ── Teclado ───────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) return;
  const key = e.key;

  if (key >= '0' && key <= '9') { e.preventDefault(); handleNumber(key); }
  else if (key === '.') { e.preventDefault(); handleNumber('.'); }
  else if (key === '+') { e.preventDefault(); setOperator('+'); }
  else if (key === '-') { e.preventDefault(); setOperator('−'); }
  else if (key === '*') { e.preventDefault(); setOperator('×'); }
  else if (key === '/') { e.preventDefault(); setOperator('÷'); }
  else if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); }
  else if (key === 'Escape') { e.preventDefault(); allClear(); }
  else if (key === 'Backspace') {
    e.preventDefault();
    if (state.current.length > 1 && state.current !== 'Error') {
      state.current = state.current.slice(0, -1) || '0';
    } else {
      state.current = '0';
    }
    render();
  }
  else if (key === '%') { e.preventDefault(); percent(); }

  // Visual feedback: flash the matching button
  highlightKey(key);
});

function highlightKey(key) {
  const keyMap = {
    'Enter': '[data-action="equals"]', '=': '[data-action="equals"]',
    'Escape': '[data-action="allclear"]',
    '+': '[data-value="+"]', '-': '[data-value="−"]',
    '*': '[data-value="×"]', '/': '[data-value="÷"]',
    '%': '[data-action="percent"]',
  };
  const sel = keyMap[key] ||
    (['0','1','2','3','4','5','6','7','8','9','.'].includes(key)
      ? `[data-value="${key}"], [data-action="decimal"]`
      : null);
  if (!sel) return;
  const btns = document.querySelectorAll(sel);
  btns.forEach(btn => {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
  });
}

// Add pressed style
const pressedStyle = document.createElement('style');
pressedStyle.textContent = `.calc-btn.pressed { transform: scale(0.93) !important; filter: brightness(0.85); }`;
document.head.appendChild(pressedStyle);

// ── History Toggle ─────────────────────────────────────────────────────────────
historyToggle.addEventListener('click', () => {
  renderHistory();
  toggleHistoryPanel();
});

clearHistory.addEventListener('click', () => {
  state.history = [];
  renderHistory();
});

// Close history when clicking outside
historyPanel.addEventListener('click', e => {
  if (e.target === historyPanel) toggleHistoryPanel();
});

// ── Copy Button ───────────────────────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
  const text = state.current;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado al portapapeles ✓');
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
    showToast('Copiado al portapapeles ✓');
  });
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Dark Mode ──────────────────────────────────────────────────────────────────
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  modeIcon.textContent = dark ? '🌙' : '☀️';
  localStorage.setItem('ucenm-theme', dark ? 'dark' : 'light');
}

modeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

// Persist theme
const savedTheme = localStorage.getItem('ucenm-theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  applyTheme(true);
}

// ── Init ───────────────────────────────────────────────────────────────────────
render();
