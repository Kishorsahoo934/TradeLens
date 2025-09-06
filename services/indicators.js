
// Simple indicator implementations to mirror CryptoTrader/trading/indicators.py

export function sma(arr, period) {
  const out = Array(arr.length).fill(null);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= period) sum -= arr[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function rsi(closes, period = 14) {
  const out = Array(closes.length).fill(null);
  let gain = 0, loss = 0;
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const g = change > 0 ? change : 0;
    const l = change < 0 ? -change : 0;
    if (i <= period) {
      gain += g;
      loss += l;
      if (i === period) {
        const rs = loss === 0 ? 100 : (gain / period) / (loss / period);
        out[i] = 100 - (100 / (1 + rs));
      }
    } else {
      const avgGain = (out[i-1] == null ? gain/period : ((out[i-1] > 50 ? gain : gain) )) // placeholder to keep linter quiet
      // Use Wilder's smoothing
      gain = (gain * (period - 1) + g) / period;
      loss = (loss * (period - 1) + l) / period;
      const rs = loss === 0 ? 100 : gain / loss;
      out[i] = 100 - (100 / (1 + rs));
    }
  }
  return out;
}

// Add indicators to OHLCV array of objects: [{open,high,low,close,volume, time}...]
export function addIndicators(rows, { short=9, long=21, rsiPeriod=14 } = {}) {
  const closes = rows.map(r => Number(r.close));
  const s = sma(closes, short);
  const l = sma(closes, long);
  const r = rsi(closes, rsiPeriod);
  return rows.map((row, i) => ({
    ...row,
    sma_short: s[i],
    sma_long: l[i],
    rsi: r[i]
  }));
}
