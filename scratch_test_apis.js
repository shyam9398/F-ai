async function testLocalApi() {
  try {
    const res = await fetch('http://localhost:3000/api/papers?limit=1');
    console.log('API response status:', res.status);
    const data = await res.json();
    console.log('Paper returned:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('API call failed:', err.message);
  }
}
testLocalApi();
