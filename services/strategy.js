
// Mirrors CryptoTrader/trading/strategy.py (rule-based signals)
export function addSignals(rows) {
  return rows.map((row, i, arr) => {
    const prev = i > 0 ? arr[i-1] : null;
    let signal = 0; // 1 buy, -1 sell, 0 hold
    if (row.sma_short != null && row.sma_long != null) {
      if (prev && prev.sma_short != null && prev.sma_long != null) {
        const crossedUp = prev.sma_short <= prev.sma_long && row.sma_short > row.sma_long;
        const crossedDown = prev.sma_short >= prev.sma_long && row.sma_short < row.sma_long;
        if (crossedUp) signal = 1;
        if (crossedDown) signal = -1;
      }
    }
    // RSI filter (avoid overbought/oversold)
    if (row.rsi != null) {
      if (signal === 1 && row.rsi > 70) signal = 0;
      if (signal === -1 && row.rsi < 30) signal = 0;
    }
    return { ...row, signal };
  });
}
