// Debug script to check API responses
import fetch from 'node-fetch';

console.log('Starting API debug script...');

async function checkSLAAPI() {
  try {
    console.log('=== SLA Analysis API ===');
    const response = await fetch('http://34.60.217.109/slagraph/avg-activity-duration-bar');
    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    if (data && data.data && Array.isArray(data.data)) {
      console.log('Has data.data array');
      if (data.data[0]) {
        console.log('First data item:', JSON.stringify(data.data[0], null, 2));
      }
    }
    
    if (data && data.x && data.y) {
      console.log('Has x and y arrays');
      console.log('x:', data.x);
      console.log('y:', data.y);
    }
    
  } catch (error) {
    console.error('SLA API Error:', error);
  }
}

async function checkResourceSwitchesAPI() {
  try {
    console.log('\n=== Resource Switches Count Table API ===');
    const response = await fetch('http://34.60.217.109/resourceswitches_count_table');
    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    if (data && data.data && Array.isArray(data.data)) {
      console.log('Has data.data array');
      if (data.data[0]) {
        console.log('First data item:', JSON.stringify(data.data[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('Resource Switches API Error:', error);
  }
}

checkSLAAPI();
checkResourceSwitchesAPI();
