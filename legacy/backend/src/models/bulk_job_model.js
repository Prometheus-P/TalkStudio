/**
 * BulkJob Model - 대량 생성 작업 데이터 모델
 * 대량 생성 작업 상태 추적 및 결과 저장
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Bulk scenario sub-document
const BulkScenarioSchema = new Schema({
  rowIndex: {
    type: Number,
    required: true,
  },
  scenario: {
    type: String,
    required: true,
    trim: true,
  },
  participants: {
    type: Number,
    required: true,
    min: 2,
    max: 5,
  },
  messageCount: {
    type: Number,
    required: true,
    min: 5,
    max: 50,
  },
  tone: {
    type: String,
    enum: ['casual', 'formal', 'humorous'],
    default: 'casual',
  },
  platform: {
    type: String,
    enum: ['kakaotalk', 'discord', 'telegram', 'instagram'],
    default: 'kakaotalk',
  },
}, { _id: false });

// Bulk result sub-document
const BulkResultSchema = new Schema({
  rowIndex: {
    type: Number,
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
}, { _id: false });

// Bulk error sub-document
const BulkErrorSchema = new Schema({
  rowIndex: {
    type: Number,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
}, { _id: false });

// Main BulkJob schema
const BulkJobSchema = new Schema({
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'partially_completed', 'failed'],
    default: 'pending',
    index: true,
  },
  totalCount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  completedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  scenarios: {
    type: [BulkScenarioSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 1 && arr.length <= 100,
      message: 'Scenarios must be between 1 and 100',
    },
  },
  results: {
    type: [BulkResultSchema],
    default: [],
  },
  errors: {
    type: [BulkErrorSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setHours(date.getHours() + 24); // 24 hours from now
      return date;
    },
  },
});

// Indexes
BulkJobSchema.index({ createdAt: -1 });
// TTL index for auto-deletion (defined in migrations)

// Virtual for progress percentage
BulkJobSchema.virtual('progress').get(function() {
  if (this.totalCount === 0) return 0;
  return Math.round(((this.completedCount + this.failedCount) / this.totalCount) * 100);
});

// Static methods
BulkJobSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

BulkJobSchema.statics.findProcessing = function() {
  return this.find({ status: 'processing' }).sort({ createdAt: 1 });
};

BulkJobSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance methods
BulkJobSchema.methods.start = function() {
  this.status = 'processing';
  return this.save();
};

BulkJobSchema.methods.addResult = function(rowIndex, conversationId, success) {
  this.results.push({
    rowIndex,
    conversationId: success ? conversationId : null,
    status: success ? 'success' : 'failed',
  });

  if (success) {
    this.completedCount += 1;
  } else {
    this.failedCount += 1;
  }

  return this.save();
};

BulkJobSchema.methods.addError = function(rowIndex, errorMessage) {
  this.errors.push({
    rowIndex,
    error: errorMessage,
  });
  this.failedCount += 1;
  return this.save();
};

BulkJobSchema.methods.complete = function() {
  this.completedAt = new Date();

  if (this.failedCount === 0) {
    this.status = 'completed';
  } else if (this.completedCount === 0) {
    this.status = 'failed';
  } else {
    this.status = 'partially_completed';
  }

  return this.save();
};

// Transform for JSON output
BulkJobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const BulkJob = mongoose.model('BulkJob', BulkJobSchema);

export default BulkJob;
