const CRON_SECRET = 'bda213fb498db2ccbc794ded2cfb22802df6df3d66ebb0f845862a3e3ccab56c';

console.log('Triggering check-ended endpoint...\n');

try {
    const response = await fetch('http://localhost:3000/api/check-ended', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${CRON_SECRET}`
        }
    });

    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

} catch (error) {
    console.error('Error:', error.message);
}
