import Blogmodel from './lib/models/blogmodel.js';
import { connectDB } from './lib/config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkEventState() {
    try {
        await connectDB();
        
        console.log('Looking for pub/public events you marked interest in...\n');
        
        // Your user ID from the terminal output
        const userId = '69603ffd31cfc67958a2ec0c';
        
        // Find pub/public events where you clicked interest
        const events = await Blogmodel.find({
            publicEventType: { $in: ['pub', 'public'] },
            interestedUsers: userId
        }).select('title publicEventType status endDateTime endNotificationSent endNotificationTime moveNowExpiresAt interestedUsers').lean();
        
        console.log(`Found ${events.length} pub/public events you're interested in:\n`);
        
        for (const event of events) {
            console.log('─'.repeat(60));
            console.log(`Title: ${event.title}`);
            console.log(`Type: ${event.publicEventType}`);
            console.log(`Status: ${event.status}`);
            console.log(`End Time: ${event.endDateTime}`);
            console.log(`End Notification Sent: ${event.endNotificationSent || false}`);
            console.log(`End Notification Time: ${event.endNotificationTime || 'N/A'}`);
            console.log(`Move Now Expires: ${event.moveNowExpiresAt || 'N/A'}`);
            console.log(`Interested Users Count: ${event.interestedUsers?.length || 0}`);
            console.log('');
        }
        
        // Also check for events that should have triggered
        console.log('\n' + '='.repeat(60));
        console.log('Checking for events that should trigger email...\n');
        
        const shouldTrigger = await Blogmodel.find({
            status: 'past',
            publicEventType: { $in: ['pub', 'public'] },
            endNotificationSent: { $ne: true }
        }).select('title publicEventType status endDateTime endNotificationSent interestedUsers').lean();
        
        console.log(`Found ${shouldTrigger.length} events that haven't sent notifications:\n`);
        
        for (const event of shouldTrigger) {
            console.log('─'.repeat(60));
            console.log(`Title: ${event.title}`);
            console.log(`Type: ${event.publicEventType}`);
            console.log(`Status: ${event.status}`);
            console.log(`End Time: ${event.endDateTime}`);
            console.log(`Interested Users Count: ${event.interestedUsers?.length || 0}`);
            
            // Debug the ObjectId comparison
            const userIdString = userId.toString();
            const inList = event.interestedUsers?.some(id => id.toString() === userIdString);
            console.log(`You in list: ${inList ? 'YES' : 'NO'}`);
            
            if (event.interestedUsers?.length > 0) {
                console.log(`First user ID type: ${typeof event.interestedUsers[0]}`);
                console.log(`First user ID value: ${event.interestedUsers[0]}`);
                console.log(`Your ID: ${userId}`);
            }
            console.log('');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEventState();
