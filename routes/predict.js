
import { Router } from 'express';
import { predictLatest } from '../services/predictionService.js';

const router = Router();

// Expects body: { symbol: "BTCUSDT", ohlcv: [{open,high,low,close,volume,time}, ...] }
router.post('/', (req, res) => {
  const { symbol, ohlcv } = req.body || {};
  if (!ohlcv || !Array.isArray(ohlcv) || ohlcv.length < 30) {
    return res.status(400).json({ error: 'Provide ohlcv array with at least 30 candles.' });
  }
  const result = predictLatest(ohlcv);
  res.json({ symbol, ...result });
});

export default router;
