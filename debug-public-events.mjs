import Blogmodel from './lib/models/blogmodel.js';
import { connectDB } from './lib/config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkPublicEvents() {
    try {
        await connectDB();
        
        console.log('Checking all pub/public events...\n');
        
        const allPublicEvents = await Blogmodel.find({
            publicEventType: { $in: ['pub', 'public'] }
        }).select('title publicEventType startDateTime endDateTime status').lean();
        
        console.log(`Found ${allPublicEvents.length} total pub/public events:\n`);
        
        for (const event of allPublicEvents) {
            const now = new Date();
            const isUpcoming = new Date(event.startDateTime) > now;
            
            console.log('─'.repeat(60));
            console.log(`Title: ${event.title}`);
            console.log(`Type: ${event.publicEventType}`);
            console.log(`Status: ${event.status || 'NOT SET'}`);
            console.log(`Start: ${event.startDateTime}`);
            console.log(`End: ${event.endDateTime || 'NOT SET'}`);
            console.log(`Is Upcoming: ${isUpcoming ? 'YES' : 'NO (past or ongoing)'}`);
            console.log('');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Testing API filter...\n');
        
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const apiResults = await Blogmodel.find({
            publicEventType: { $in: ['pub', 'public'] },
            startDateTime: { 
                $gte: now,
                $lte: sevenDaysFromNow
            }
        }).select('title publicEventType startDateTime').lean();
        
        console.log(`API would return ${apiResults.length} events:\n`);
        apiResults.forEach(e => {
            console.log(`- ${e.title} (${e.publicEventType}) - ${e.startDateTime}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPublicEvents();
