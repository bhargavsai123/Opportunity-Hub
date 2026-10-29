import { Router } from 'express';
import { z } from 'zod';
import Opportunity from '../models/Opportunity.js';
import Tracking from '../models/TrackingRecord.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

function studentOnly(req, res, next) {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      error: { code: 'STUDENT_ONLY', message: 'Only student accounts can save opportunities or track applications.' }
    });
  }
  next();
}

router.get('/profile', (req, res) => res.json({
  user: {
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
    profile: req.user.profile,
    preferences: req.user.preferences
  }
}));

router.patch('/profile', async (req, res, next) => {
  try {
    const p = z.object({
      displayName: z.string().trim().min(1).max(80).optional(),
      profile: z.object({
        educationLevel: z.string().max(80).optional(),
        discipline: z.string().max(100).optional(),
        graduationYear: z.number().int().min(2000).max(2100).nullable().optional(),
        interests: z.array(z.string().max(50)).max(20).optional(),
        preferredLocation: z.string().max(100).optional(),
        preferredModes: z.array(z.enum(['Online', 'Onsite', 'Hybrid'])).max(3).optional()
      }).optional(),
      preferences: z.object({
        timeZone: z.string().max(80).optional(),
        inAppReminders: z.boolean().optional(),
        reminderLeadDays: z.array(z.number().int().min(1).max(30)).max(5).optional()
      }).optional()
    }).parse(req.body);

    if (p.displayName) req.user.displayName = p.displayName;
    if (p.profile) req.user.set('profile', { ...req.user.profile, ...p.profile });
    if (p.preferences) req.user.set('preferences', { ...req.user.preferences, ...p.preferences });
    await req.user.save();
    res.json({
      message: 'Profile updated',
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName,
        profile: req.user.profile,
        preferences: req.user.preferences
      }
    });
  } catch (e) { next(e); }
});

router.get('/tracking', studentOnly, async (req, res, next) => {
  try {
    const records = await Tracking.find({ userId: req.user.id })
      .populate({ path: 'opportunityId', match: { status: 'Published' } })
      .sort({ updatedAt: -1 });

    const data = records.filter(record => record.opportunityId).map(record => {
      const value = record.toObject();
      // Keep records applied in older versions visible in the Applications page.
      if (value.hasApplied === undefined || value.hasApplied === false) {
        value.hasApplied = ['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(value.status);
      }
      return value;
    });
    res.json({ data });
  } catch (e) { next(e); }
});

router.put('/tracking/:id', studentOnly, async (req, res, next) => {
  try {
    const p = z.object({
      isSaved: z.boolean().optional(),
      hasApplied: z.boolean().optional(),
      status: z.enum(['Interested', 'Planning', 'InProgress', 'Applied', 'Accepted', 'Rejected', 'Withdrawn']).nullable().optional(),
      note: z.string().max(1000).optional(),
      checklist: z.record(z.enum(['Meets', 'Does not meet', 'Not sure'])).optional()
    }).parse(req.body);

    const op = await Opportunity.findOne({ _id: req.params.id, status: 'Published' });
    if (!op) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Opportunity not found.' } });
    }

    // Do not infer an application from saving, viewing, or checking eligibility.
    // The frontend explicitly sends hasApplied=true when Apply is clicked.
    const record = await Tracking.findOneAndUpdate(
      { userId: req.user.id, opportunityId: op._id },
      { $set: p, $setOnInsert: { userId: req.user.id, opportunityId: op._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ data: record });
  } catch (e) { next(e); }
});

router.delete('/tracking/:id', studentOnly, async (req, res, next) => {
  try {
    await Tracking.deleteOne({ userId: req.user.id, opportunityId: req.params.id });
    res.json({ message: 'Tracking removed' });
  } catch (e) { next(e); }
});

router.get('/dashboard', studentOnly, async (req, res, next) => {
  try {
    const records = await Tracking.find({ userId: req.user.id })
      .populate({ path: 'opportunityId', match: { status: 'Published' } });
    const active = records.filter(record => record.opportunityId);
    const now = new Date();
    const soon = new Date(now.getTime() + 14 * 86400000);
    const deadlines = active
      .filter(record => record.hasApplied && record.opportunityId.deadlineAt && record.opportunityId.deadlineAt >= now && record.opportunityId.deadlineAt <= soon)
      .sort((a, b) => a.opportunityId.deadlineAt - b.opportunityId.deadlineAt);

    res.json({
      summary: {
        saved: active.filter(record => record.isSaved).length,
        applied: active.filter(record => record.hasApplied || ['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(record.status)).length,
        inProgress: active.filter(record => record.hasApplied && ['Planning', 'InProgress'].includes(record.status)).length,
        upcoming: deadlines.length
      },
      upcoming: deadlines
    });
  } catch (e) { next(e); }
});

export default router;
