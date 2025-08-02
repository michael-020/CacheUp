import mongoose, { Document, Schema } from 'mongoose';

interface IWeaviateBackup extends Document {
  class: 'Forum' | 'Thread' | 'Post' | 'Comment';
  originalId: string;
  mongoId: string;
  vector: number[];
  properties: {
    title?: string;
    description?: string;
    content?: string;
    [key: string]: any;
  };
  backupDate: Date;
}

const weaviateBackupSchema = new Schema<IWeaviateBackup>({
  class: {
    type: String,
    enum: ['Forum', 'Thread', 'Post', 'Comment'],
    required: true
  },
  originalId: {
    type: String,
    required: true
  },
  mongoId: {
    type: String,
    required: true
  },
  vector: {
    type: [Number],
    required: true
  },
  properties: {
    type: Schema.Types.Mixed,
    required: true
  },
  backupDate: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient querying
weaviateBackupSchema.index({ class: 1, originalId: 1, backupDate: -1 });

export const WeaviateBackup = mongoose.model<IWeaviateBackup>('WeaviateBackup', weaviateBackupSchema);