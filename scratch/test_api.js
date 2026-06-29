const https = require('https');

const options = {
  hostname: 'huggingface.co',
  path: '/api/daily_papers?limit=10',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const json = JSON.parse(data);
        console.log('Results Count:', json.length);
        if (json.length > 0) {
          console.log('First Paper Title:', json[0].paper.title);
          console.log('First Paper PDF URL:', `https://arxiv.org/pdf/${json[0].paper.id}.pdf`);
          console.log('First Paper Details:', JSON.stringify(json[0], null, 2));
        }
      } else {
        console.log('Error Response:', data.slice(0, 1000));
      }
    } catch (e) {
      console.error('Parse Error:', e.message);
      console.log('Raw data length:', data.length);
      console.log('Raw data:', data.slice(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.end();
