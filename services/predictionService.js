
import { addIndicators } from './indicators.js';
import { addSignals } from './strategy.js';

// This replaces the sklearn .pkl models with rule-based signals derived from indicators.
export function predictLatest(ohlcv) {
  const withInd = addIndicators(ohlcv);
  const withSig = addSignals(withInd);
  const last = withSig[withSig.length - 1];
  let decision = 'Hold';
  if (last.signal === 1) decision = 'Buy';
  if (last.signal === -1) decision = 'Sell';
  return {
    decision,
    indicators: {
      sma_short: last.sma_short,
      sma_long: last.sma_long,
      rsi: last.rsi
    }
  };
}
