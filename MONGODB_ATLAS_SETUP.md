# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas Data API to work directly with your React frontend.

## 🚀 Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)

## 🔧 Step 2: Enable Data API

1. In your Atlas dashboard, click on "Data API" in the left sidebar
2. Click "Create Data API"
3. Choose your cluster
4. Copy the **API URL** and **API Key**

## 📝 Step 3: Configure Your App

1. Copy `atlas-config.example.js` to `atlas-config.js`:
   ```bash
   cp atlas-config.example.js atlas-config.js
   ```

2. Edit `atlas-config.js` and replace the placeholder values:
   ```javascript
   export const atlasConfig = {
     apiUrl: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1', // Your actual API URL
     apiKey: 'your_actual_api_key_here', // Your actual API Key
     database: 'vibevideo_ai',
     dataSource: 'Cluster0'
   };
   ```

## 🗄️ Step 4: Database Schema

The app will automatically create these collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // In production, hash this
  createdAt: Date,
  updatedAt: Date
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  username: String,
  title: String,
  messages: [
    {
      sender: String, // 'user' or 'assistant'
      text: String,
      timestamp: Date
    }
  ],
  audioFiles: Array,
  videoFiles: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Library Items Collection
```javascript
{
  _id: ObjectId,
  username: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  fileData: String, // Base64 encoded file
  originalName: String,
  mimeType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Processed Files Collection
```javascript
{
  _id: ObjectId,
  username: String,
  originalFile: {
    name: String,
    type: String,
    size: Number,
    data: String // Base64 encoded
  },
  processedFile: {
    name: String,
    type: String,
    size: Number,
    data: String // Base64 encoded
  },
  operation: String, // 'grayscale', 'merge', etc.
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Step 5: Security Settings

1. In Atlas, go to "Network Access"
2. Add your IP address or use `0.0.0.0/0` for development
3. Go to "Database Access"
4. Create a database user with read/write permissions

## ✅ Step 6: Test Your Setup

1. Start your React app: `npm start`
2. Try to sign up for a new account
3. Check your Atlas dashboard to see if data is being created
4. Try logging in with the new account

## 🎯 Features Included

- ✅ **User Authentication** (login/register)
- ✅ **Chat Management** (create, read, update, delete)
- ✅ **File Library** (audio/video files)
- ✅ **Real-time Data Sync** with Atlas
- ✅ **No Backend Required** - everything runs in the browser
- ✅ **Automatic Schema Creation** - collections are created as needed

## 🚨 Important Notes

1. **API Key Security**: Never commit your `atlas-config.js` file to version control
2. **Password Hashing**: In production, implement proper password hashing
3. **Rate Limits**: Atlas Data API has rate limits on the free tier
4. **File Storage**: Large files are stored as Base64, consider using Atlas GridFS for production

## 🔧 Troubleshooting

### Common Issues:

1. **"Atlas config not found"**: Make sure you created `atlas-config.js` from the example
2. **"API error 401"**: Check your API key is correct
3. **"API error 404"**: Check your API URL is correct
4. **"Network error"**: Check your network access settings in Atlas

### Debug Steps:

1. Check browser console for error messages
2. Verify your Atlas cluster is running
3. Check your API key permissions
4. Verify network access settings

## 🎉 You're Ready!

Once configured, your app will work entirely with MongoDB Atlas - no backend required! All data will be stored and retrieved directly from your Atlas database.
