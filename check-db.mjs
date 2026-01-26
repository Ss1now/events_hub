import mongoose from 'mongoose';
import fs from 'fs';

const blogSchema = new mongoose.Schema({}, { strict: false });
const BlogModel = mongoose.model('blogs', blogSchema);

async function check() {
    try {
        // Read MongoDB URI from .env.local
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const mongoLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI'));
        const mongoURI = mongoLine.split('=')[1].trim().replace(/"/g, '');
        
        console.log('Connecting...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to:', mongoose.connection.name);
        
        const events = await BlogModel.find({}).select('title startDateTime endDateTime').limit(5).sort({ date: -1 });
        console.log(`\nFound ${events.length} events:\n`);
        
        events.forEach((e, i) => {
            console.log(`${i+1}. ${e.title}`);
            console.log(`   ID: ${e._id}`);
            console.log(`   Start: ${e.startDateTime}`);
            console.log(`   End: ${e.endDateTime}\n`);
        });
        
        if (events.length > 0) {
            const test = events[0];
            console.log(`\nTesting update on: ${test.title}`);
            const oldStart = new Date(test.startDateTime);
            const newStart = new Date('2026-03-01T20:00:00Z');
            
            console.log(`Old: ${oldStart.toISOString()}`);
            console.log(`New: ${newStart.toISOString()}`);
            
            const result = await BlogModel.updateOne(
                { _id: test._id },
                { $set: { startDateTime: newStart } }
            );
            console.log('\nUpdate result:', result);
            
            const check = await BlogModel.findById(test._id);
            console.log(`\nAfter update: ${check.startDateTime.toISOString()}`);
            console.log(`Match? ${check.startDateTime.toISOString() === newStart.toISOString() ? 'YES ✅' : 'NO ❌'}`);
            
            // Restore
            await BlogModel.updateOne({ _id: test._id }, { $set: { startDateTime: oldStart } });
            console.log('\n✅ Restored original value');
        }
        
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

check();
