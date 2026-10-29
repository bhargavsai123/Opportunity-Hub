import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  isSaved: { type: Boolean, default: false },
  // Saving a listing does not mean the student has applied.
  hasApplied: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Interested', 'Planning', 'InProgress', 'Applied', 'Accepted', 'Rejected', 'Withdrawn'],
    default: null
  },
  note: { type: String, default: '', maxLength: 1000 },
  checklist: { type: Map, of: String, default: {} },
  remindersSeen: { type: [String], default: [] }
}, { timestamps: true });

trackingSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
trackingSchema.index({ userId: 1, hasApplied: 1 });
trackingSchema.index({ userId: 1, status: 1 });

export default mongoose.model('TrackingRecord', trackingSchema);
