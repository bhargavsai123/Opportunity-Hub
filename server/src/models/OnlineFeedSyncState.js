import mongoose from 'mongoose';

const onlineFeedSyncStateSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  lastAttemptAt: { type: Date, default: null },
  lastSuccessAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
  recordCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('OnlineFeedSyncState', onlineFeedSyncStateSchema);
