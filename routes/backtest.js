
import { Router } from 'express';
import { addIndicators } from '../services/indicators.js';
import { addSignals } from '../services/strategy.js';
import { backtest } from '../services/backtester.js';

const router = Router();

router.post('/', (req, res) => {
  const { ohlcv, initial } = req.body || {};
  if (!ohlcv || !Array.isArray(ohlcv) || ohlcv.length < 50) {
    return res.status(400).json({ error: 'Provide ohlcv array with at least 50 candles.' });
  }
  const rows = addSignals(addIndicators(ohlcv));
  const result = backtest(rows, { initial: initial || 1000 });
  res.json(result);
});

export default router;
