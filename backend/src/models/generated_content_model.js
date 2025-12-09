// backend/src/models/generated_content_model.js
import mongoose from 'mongoose';

const GeneratedContentSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // Internal ID
  relatedDiscordMessageIds: [{ type: String, required: true }],
  contentType: { type: String, required: true },
  generatedText: { type: String, required: true },
  upstageModelUsed: { type: String, required: true },
  promptUsed: { type: String, required: true },
  temperature: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now },
  feedback: { type: Object }, // Can store user feedback
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

const GeneratedContent = mongoose.model('GeneratedContent', GeneratedContentSchema);

export default GeneratedContent;
