import { checkEndedEvents } from './lib/utils/checkEndedEvents.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('Manually triggering event-ended email check...\n');
console.log('Environment check:');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'Not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('');

try {
    const results = await checkEndedEvents();
    
    console.log('\n' + '='.repeat(60));
    console.log('RESULTS:');
    console.log('='.repeat(60));
    console.log('Events checked:', results.checkedEvents);
    console.log('Emails sent:', results.emailsSent);
    
    if (results.errors && results.errors.length > 0) {
        console.log('\nErrors encountered:');
        results.errors.forEach((err, i) => {
            console.log(`${i + 1}. ${err}`);
        });
    }
    
    console.log('\n✓ Process completed');
    process.exit(0);
    
} catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
}
