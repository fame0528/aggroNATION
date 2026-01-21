/**
 * Test YouTube API Key
 * 
 * Verifies the YouTube API key works by making a simple API call
 */

const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

if (!YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY not found in environment');
  process.exit(1);
}

console.log('🔑 Testing YouTube API Key...');
console.log(`Key: ${YOUTUBE_API_KEY.substring(0, 10)}...${YOUTUBE_API_KEY.substring(YOUTUBE_API_KEY.length - 5)}`);
console.log('');

// Test 1: Simple search
console.log('Test 1: Search for "intheworldofai" channel...');
axios.get(`${YOUTUBE_API_BASE}/search`, {
  params: {
    part: 'snippet',
    q: 'intheworldofai',
    type: 'channel',
    maxResults: 1,
    key: YOUTUBE_API_KEY,
  },
})
.then(response => {
  console.log('✅ Search API works!');
  console.log('Response:', JSON.stringify(response.data, null, 2));
  
  const channelId = response.data.items?.[0]?.id?.channelId;
  if (channelId) {
    console.log('');
    console.log(`✅ Found channel ID: ${channelId}`);
    
    // Test 2: Get channel details
    console.log('');
    console.log('Test 2: Get channel details...');
    return axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'contentDetails,snippet',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });
  } else {
    console.log('❌ No channel found in search results');
    process.exit(1);
  }
})
.then(response => {
  console.log('✅ Channels API works!');
  const channel = response.data.items?.[0];
  if (channel) {
    console.log(`Channel Title: ${channel.snippet.title}`);
    console.log(`Uploads Playlist: ${channel.contentDetails.relatedPlaylists.uploads}`);
    console.log('');
    console.log('🎉 All tests passed! Your API key is working correctly.');
  }
})
.catch(error => {
  console.error('❌ API Error:', error.message);
  
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response:', JSON.stringify(error.response.data, null, 2));
    
    if (error.response.status === 403) {
      console.error('');
      console.error('⚠️  403 Forbidden - Possible issues:');
      console.error('   1. API key is invalid or expired');
      console.error('   2. YouTube Data API v3 is not enabled in Google Cloud Console');
      console.error('   3. API key has IP or referrer restrictions');
      console.error('   4. Quota exceeded (check Google Cloud Console)');
      console.error('');
      console.error('📝 To fix:');
      console.error('   1. Go to: https://console.cloud.google.com/apis/credentials');
      console.error('   2. Verify API key is correct');
      console.error('   3. Check API restrictions (should allow YouTube Data API v3)');
      console.error('   4. Enable YouTube Data API v3: https://console.cloud.google.com/apis/library/youtube.googleapis.com');
    }
  }
  
  process.exit(1);
});
