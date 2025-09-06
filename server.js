
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import predictRouter from './routes/predict.js';
import signalsRouter from './routes/signals.js';
import backtestRouter from './routes/backtest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// API routes
app.use('/api/predict', predictRouter);
app.use('/api/signals', signalsRouter);
app.use('/api/backtest', backtestRouter);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
