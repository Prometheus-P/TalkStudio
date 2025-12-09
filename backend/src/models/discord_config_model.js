// backend/src/models/discord_config_model.js
import mongoose from 'mongoose';
import CryptoJS from 'crypto-js'; // Import crypto-js
import config from '../config/index.js'; // To get encryption secret

const DiscordConfigSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // Internal ID
  serverId: { type: String, required: true, unique: true }, // Discord's server ID
  serverName: { type: String },
  botToken: { type: String, required: true }, // Encrypted
  enabledChannels: [{ type: String }], // Array of Discord channel IDs
  captureStartDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastCapturedTimestamp: { type: Date }, // Last message timestamp captured
}, { timestamps: true });

// Pre-save hook to encrypt botToken
DiscordConfigSchema.pre('save', function(next) {
  if (this.isModified('botToken')) {
    this.botToken = CryptoJS.AES.encrypt(this.botToken, config.encryptionSecret).toString();
  }
  next();
});

// Method to decrypt botToken when retrieved
DiscordConfigSchema.methods.getDecryptedBotToken = function() {
  const bytes  = CryptoJS.AES.decrypt(this.botToken, config.encryptionSecret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const DiscordConfig = mongoose.model('DiscordConfig', DiscordConfigSchema);

export default DiscordConfig;