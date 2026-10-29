import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import opportunityRoutes from './routes/opportunities.js';
import meRoutes from './routes/me.js';
import { syncOnlineOpportunities } from './services/onlineOpportunityService.js';

const app = express();
app.use(helmet());

const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map(value => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    const localDevelopmentOrigin = typeof origin === 'string'
      && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (!origin || configuredOrigins.includes(origin) || localDevelopmentOrigin) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: '200kb' }));
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', service: 'opportunity-hub-api' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/me', meRoutes);

app.use((err, _req, res, _next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Please check the submitted fields.', fields: err.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) } });
  }
  if (err?.code === 11000) return res.status(409).json({ error: { code: 'DUPLICATE', message: 'A record with that value already exists.' } });
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } });
});

async function ensureAdminAccount() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'change-this-before-use') return null;
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      email,
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: 'admin',
      displayName: 'Opportunity Hub Admin'
    });
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }
  return admin;
}

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in server/.env');
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await ensureAdminAccount();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Opportunity Hub API listening on ${port}`));

  // Populate/refresh the catalogue from online feeds at startup. Source outages never stop the API.
  const existingUser = admin || await User.findOne().select('_id');
  const syncActorId = existingUser?._id || new mongoose.Types.ObjectId();
  syncOnlineOpportunities(syncActorId).then(result => {
    console.log(`Online opportunity sync finished: ${result.imported} imported, ${result.updated} updated, ${result.total} total.`);
    for (const failure of result.failures) console.warn(`Online source ${failure.source} failed: ${failure.message}`);
  }).catch(error => console.warn('Online opportunity sync failed:', error.message));
}

start().catch(error => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});
