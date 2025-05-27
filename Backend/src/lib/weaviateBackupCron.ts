import cron from 'node-cron';
import { weaviateClient } from '../models/weaviate';
import { WeaviateBackup } from '../models/weaviateBackup';

async function backupWeaviateClass(className: string) {
  try {
    // Build fields based on class type
    let fields = '';
    switch (className) {
      case 'Forum':
        fields = 'title description';
        break;
      case 'Thread':
        fields = 'title description';
        break;
      case 'Post':
        fields = 'content';
        break;
      case 'Comment':
        fields = 'content';
        break;
    }

    const result = await weaviateClient.graphql.get()
      .withClassName(className)
      .withFields(`
        _additional {
          id
          vector
        }
        mongoId
        ${fields}
      `)
      .do();

    const objects = result.data.Get[className];
    if (!objects) return;

    // Add logging for skipped objects
    const invalidObjects = objects.filter((obj: any) => !obj.mongoId || obj.mongoId === "null");
    if (invalidObjects.length > 0) {
      console.log(`⚠️ Skipped ${invalidObjects.length} ${className} objects:`);
      invalidObjects.forEach((obj: any) => {
        console.log(`  - ID: ${obj._additional.id}, mongoId: ${obj.mongoId}`);
      });
    }

    const validObjects = objects.filter((obj: any) => obj.mongoId && obj.mongoId !== "null");

    const backups = validObjects.map((obj: any) => ({
      class: className,
      originalId: obj._additional.id,
      mongoId: obj.mongoId,
      vector: obj._additional.vector,
      properties: {
        title: className === 'Forum' || className === 'Thread' ? obj.title : undefined,
        description: className === 'Forum' || className === 'Thread' ? obj.description : undefined,
        content: className === 'Post' || className === 'Comment' ? obj.content : undefined
      }
    }));

    if (backups.length > 0) {
      await WeaviateBackup.insertMany(backups);
      console.log(`✅ Backed up ${backups.length}/${objects.length} ${className} objects`);
    } else {
      console.log(`ℹ️ No valid ${className} objects to backup`);
    }
  } catch (error) {
    console.error(`❌ Error backing up ${className}:`, error);
  }
}

// Main backup function
export async function backupWeaviateData() {
  console.log('🔄 Starting Weaviate backup...');
  const startTime = Date.now();

  try {
    // Delete old backups (keep only last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await WeaviateBackup.deleteMany({ backupDate: { $lt: sevenDaysAgo } });

    // Backup all classes in parallel
    await Promise.all([
      backupWeaviateClass('Forum'),
      backupWeaviateClass('Thread'),
      backupWeaviateClass('Post'),
      backupWeaviateClass('Comment')
    ]);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Weaviate backup completed in ${duration}s`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
}

// Schedule cron job to run at 12:00 AM every day
export function setupWeaviateBackup() {
  cron.schedule('0 0 * * *', backupWeaviateData);
  console.log('📅 Weaviate backup scheduled for midnight');
}