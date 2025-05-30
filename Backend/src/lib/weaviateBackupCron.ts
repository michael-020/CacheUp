import cron from 'node-cron';
import { weaviateClient } from '../models/weaviate';
import { WeaviateBackup } from '../models/weaviateBackup';

async function backupWeaviateClass(className: string) {
  try {
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

    // Only get objects that haven't been backed up
    const result = await weaviateClient.graphql.get()
      .withClassName(className)
      .withFields(`
        _additional {
          id
          vector
        }
        mongoId
        isBackedUp
        ${fields}
      `)
      .withWhere({
        operator: 'Or',
        operands: [
          {
            path: ['isBackedUp'],
            operator: 'Equal',
            valueBoolean: false
          },
          {
            path: ['isBackedUp'],
            operator: 'IsNull',
            valueBoolean: true
          }
        ]
      })
      .do();

    const objects = result.data.Get[className];
    if (!objects || objects.length === 0) {
      console.log(`ℹ️ No new ${className} objects to backup`);
      console.log(`✅ 0 objects skipped`);
      return;
    }

    // Filter out invalid objects
    const validObjects = objects.filter((obj: any) => obj.mongoId && obj.mongoId !== "null");
    const skippedObjects = objects.filter((obj: any) => !obj.mongoId || obj.mongoId === "null");
    
    if (skippedObjects.length > 0) {
      console.log(`⚠️ Skipped ${skippedObjects.length} ${className} objects:`);
      skippedObjects.forEach((obj: any) => {
        console.log(`  - ID: ${obj._additional.id}, mongoId: ${obj.mongoId}`);
      });
    } else {
      console.log(`✅ 0 objects skipped`);
    }
    
    if (validObjects.length > 0) {
      // Create backups
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

      await WeaviateBackup.insertMany(backups);

      // Mark objects as backed up
      await Promise.all(
        validObjects.map(async (obj: any) => {
          await weaviateClient.data.updater()
            .withClassName(className)
            .withId(obj._additional.id)
            .withProperties({ isBackedUp: true })
            .do();
        })
      );

      console.log(`✅ Backed up ${validObjects.length}/${objects.length} ${className} objects`);
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
    await WeaviateBackup.deleteMany();

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

export async function resetBackupStatus(className?: string) {
  try {
    const classes = className ? [className] : ['Forum', 'Thread', 'Post', 'Comment'];
    
    for (const cls of classes) {
      const result = await weaviateClient.graphql.get()
        .withClassName(cls)
        .withFields('_additional { id }')
        .do();

      const objects = result.data.Get[cls];
      if (!objects) continue;

      await Promise.all(
        objects.map(async (obj: any) => {
          await weaviateClient.data.updater()
            .withClassName(cls)
            .withId(obj._additional.id)
            .withProperties({ isBackedUp: false })
            .do();
        })
      );

      console.log(`✅ Reset backup status for ${objects.length} ${cls} objects`);
    }
  } catch (error) {
    console.error('❌ Error resetting backup status:', error);
  }
}