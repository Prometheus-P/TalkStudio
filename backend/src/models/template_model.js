/**
 * Template Model - 시나리오 템플릿 데이터 모델
 * 사전 정의 및 커스텀 대화 시나리오 템플릿
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

const TemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  category: {
    type: String,
    enum: ['game_trade', 'daily_chat', 'customer_service', 'friend_chat', 'custom'],
    required: true,
    index: true,
  },
  scenario: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  participants: {
    type: Number,
    required: true,
    min: 2,
    max: 5,
    default: 2,
  },
  messageCount: {
    type: Number,
    required: true,
    min: 5,
    max: 50,
    default: 10,
  },
  tone: {
    type: String,
    enum: ['casual', 'formal', 'humorous'],
    default: 'casual',
  },
  isSystem: {
    type: Boolean,
    default: false,
    index: true,
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

// Update updatedAt on save
TemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Text search index for name search
TemplateSchema.index({ name: 'text' });

// Compound index for category + isSystem queries
TemplateSchema.index({ category: 1, isSystem: 1 });

// Static methods
TemplateSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ isSystem: -1, createdAt: -1 });
};

TemplateSchema.statics.findSystemTemplates = function() {
  return this.find({ isSystem: true }).sort({ category: 1, name: 1 });
};

TemplateSchema.statics.findCustomTemplates = function() {
  return this.find({ isSystem: false }).sort({ createdAt: -1 });
};

TemplateSchema.statics.searchByName = function(query) {
  return this.find({
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

// Prevent deletion/modification of system templates
TemplateSchema.pre('remove', function(next) {
  if (this.isSystem) {
    next(new Error('System templates cannot be deleted'));
  } else {
    next();
  }
});

TemplateSchema.pre('findOneAndUpdate', function(next) {
  // Allow only specific fields to be updated for system templates
  const update = this.getUpdate();
  const isSystemQuery = this.getQuery().isSystem;

  if (isSystemQuery === true) {
    next(new Error('System templates cannot be modified'));
  } else {
    next();
  }
});

// Transform for JSON output
TemplateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Template = mongoose.model('Template', TemplateSchema);

export default Template;
