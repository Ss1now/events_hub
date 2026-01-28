import Blogmodel from './lib/models/blogmodel.js';
import { connectDB } from './lib/config/db.js';

async function checkEvents() {
    await connectDB();
    
    const events = await Blogmodel.find({
        status: 'past',
        publicEventType: { $in: ['pub', 'public'] },
        endNotificationSent: { $ne: true }
    }).select('title status publicEventType endNotificationSent endDateTime interestedUsers');
    
    console.log('Found', events.length, 'events that should get notifications:');
    events.forEach(event => {
        console.log(`\n- ${event.title}`);
        console.log(`  Status: ${event.status}`);
        console.log(`  Type: ${event.publicEventType}`);
        console.log(`  Notification sent: ${event.endNotificationSent}`);
        console.log(`  End time: ${event.endDateTime}`);
        console.log(`  Interested users: ${event.interestedUsers?.length || 0}`);
    });
    
    process.exit(0);
}

checkEvents();
