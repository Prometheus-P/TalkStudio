/**
 * Conversation Model - 생성된 대화 데이터 모델
 * MongoDB/Mongoose 스키마 정의
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Message sub-document schema
const MessageSchema = new Schema({
  sender: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  timestamp: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/,  // HH:MM format
  },
  type: {
    type: String,
    enum: ['text', 'image', 'emoji'],
    default: 'text',
  },
}, { _id: false });

// Generation parameters sub-document schema
const GenerationParametersSchema = new Schema({
  temperature: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.7,
  },
  maxTokens: {
    type: Number,
    min: 100,
    max: 4000,
    default: 2000,
  },
  model: {
    type: String,
    default: 'unknown',
  },
}, { _id: false });

// Main Conversation schema
const ConversationSchema = new Schema({
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    default: null,
  },
  scenario: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 5,
      message: 'Participants must be between 2 and 5',
    },
  },
  messages: {
    type: [MessageSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 1 && arr.length <= 100,
      message: 'Messages must be between 1 and 100',
    },
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
  parameters: {
    type: GenerationParametersSchema,
    default: () => ({}),
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'edited'],
    default: 'generating',
  },
  aiProvider: {
    type: String,
    enum: ['upstage', 'openai'],
    default: 'upstage',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 90); // 90 days from now
      return date;
    },
  },
});

// Update updatedAt on save
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ templateId: 1 });
// TTL index for auto-deletion (defined in migrations)

// Static methods
ConversationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

ConversationSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance methods
ConversationSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

ConversationSchema.methods.markFailed = function() {
  this.status = 'failed';
  return this.save();
};

ConversationSchema.methods.markEdited = function() {
  this.status = 'edited';
  return this.save();
};

// Transform for JSON output
ConversationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
