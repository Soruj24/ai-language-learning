import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripePriceId: {
    type: String,
  },
  stripeCurrentPeriodEnd: {
    type: Date,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    required: true,
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due', 'unpaid', 'incomplete'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
