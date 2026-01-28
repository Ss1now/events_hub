import Blogmodel from './lib/models/blogmodel.js';
import { connectDB } from './lib/config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function resetNotifications() {
    try {
        await connectDB();
        
        console.log('Resetting endNotificationSent for past pub/public events...\n');
        
        const result = await Blogmodel.updateMany(
            {
                status: 'past',
                publicEventType: { $in: ['pub', 'public'] }
            },
            {
                $set: {
                    endNotificationSent: false,
                    endNotificationTime: null
                }
            }
        );
        
        console.log(`Reset ${result.modifiedCount} events`);
        console.log('\nNow when you trigger the cron, emails should be sent for:');
        
        const events = await Blogmodel.find({
            status: 'past',
            publicEventType: { $in: ['pub', 'public'] },
            interestedUsers: { $ne: [] }
        }).select('title publicEventType interestedUsers').lean();
        
        console.log(`\n${events.length} events with interested users:`);
        events.forEach(e => {
            console.log(`  - ${e.title} (${e.publicEventType}) - ${e.interestedUsers.length} users`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetNotifications();
