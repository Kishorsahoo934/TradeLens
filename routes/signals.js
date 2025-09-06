
import { Router } from 'express';
import { addIndicators } from '../services/indicators.js';
import { addSignals } from '../services/strategy.js';

const router = Router();

router.post('/', (req, res) => {
  const { ohlcv } = req.body || {};
  if (!ohlcv || !Array.isArray(ohlcv) || ohlcv.length < 5) {
    return res.status(400).json({ error: 'Provide ohlcv array with at least 5 candles.' });
  }
  const withInd = addIndicators(ohlcv);
  const withSig = addSignals(withInd);
  res.json({ rows: withSig });
});

export default router;
