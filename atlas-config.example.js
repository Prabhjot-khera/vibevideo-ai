// MongoDB Atlas Data API Configuration
// Copy this file to atlas-config.js and fill in your actual values

export const atlasConfig = {
  // Your Atlas Data API URL (get this from Atlas Data API settings)
  apiUrl: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1',
  
  // Your Atlas Data API Key (get this from Atlas Data API settings)
  apiKey: 'your_api_key_here',
  
  // Database name (will be created automatically)
  database: 'vibevideo_ai',
  
  // Data source name (usually Cluster0)
  dataSource: 'Cluster0'
};

// Instructions:
// 1. Go to MongoDB Atlas Dashboard
// 2. Click on "Data API" in the left sidebar
// 3. Create a new Data API if you haven't already
// 4. Copy the API URL and API Key
// 5. Replace the values above with your actual credentials
// 6. Rename this file to atlas-config.js
