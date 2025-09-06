
// Simple backtester to mirror CryptoTrader/trading/backtester.py
export function backtest(rows, { initial=1000 } = {}) {
  let balance = initial;
  let position = 0;
  let entryPrice = null;
  const equityCurve = [];

  for (let i = 0; i < rows.length; i++) {
    const { close, signal } = rows[i];
    if (signal === 1 && position === 0) {
      // Buy with full balance
      position = balance / close;
      entryPrice = close;
      balance = 0;
    } else if (signal === -1 && position > 0) {
      // Sell all
      balance = position * close;
      position = 0;
      entryPrice = null;
    }
    const equity = balance + position * close;
    equityCurve.push(equity);
  }

  // Liquidate at end
  if (position > 0) {
    balance = position * rows[rows.length - 1].close;
    position = 0;
  }

  return {
    finalValue: balance,
    equityCurve
  };
}
