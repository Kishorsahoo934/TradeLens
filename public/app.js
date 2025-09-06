
const output = document.getElementById('output');
const input = document.getElementById('ohlcvInput');
const btnSignals = document.getElementById('btnSignals');
const btnPredict = document.getElementById('btnPredict');
const btnBacktest = document.getElementById('btnBacktest');

const tabLearn = document.getElementById('tabLearn');
const tabCommunity = document.getElementById('tabCommunity');
const learnSection = document.getElementById('learnSection');
const communitySection = document.getElementById('communitySection');

tabLearn.onclick = () => {
  tabLearn.classList.add('active');
  tabCommunity.classList.remove('active');
  learnSection.classList.remove('hidden');
  communitySection.classList.add('hidden');
}
tabCommunity.onclick = () => {
  tabCommunity.classList.add('active');
  tabLearn.classList.remove('active');
  learnSection.classList.add('hidden');
  communitySection.classList.remove('hidden');
}

function parseInput() {
  try {
    const data = JSON.parse(input.value);
    if (!Array.isArray(data)) throw new Error('Expected array');
    return data.map(c => ({
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume),
      time: c.time ?? null
    }));
  } catch (e) {
    alert('Invalid JSON: ' + e.message);
    throw e;
  }
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

btnSignals.onclick = async () => {
  const ohlcv = parseInput();
  const res = await post('/api/signals', { ohlcv });
  output.textContent = JSON.stringify(res, null, 2);
};

btnPredict.onclick = async () => {
  const ohlcv = parseInput();
  const res = await post('/api/predict', { symbol: 'SYMBOL', ohlcv });
  output.textContent = JSON.stringify(res, null, 2);
};

btnBacktest.onclick = async () => {
  const ohlcv = parseInput();
  const res = await post('/api/backtest', { ohlcv, initial: 1000 });
  output.textContent = JSON.stringify(res, null, 2);
};
