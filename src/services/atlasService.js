// MongoDB Atlas Data API service for direct frontend integration
// No backend dependency - works entirely in the browser

// Import configuration (you'll need to create atlas-config.js from atlas-config.example.js)
let atlasConfig;
try {
  atlasConfig = require('../../atlas-config.js').atlasConfig;
} catch (error) {
  console.warn('Atlas config not found. Please create atlas-config.js from atlas-config.example.js');
  atlasConfig = {
    apiUrl: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1',
    apiKey: 'YOUR_API_KEY_HERE',
    database: 'vibevideo_ai',
    dataSource: 'Cluster0'
  };
}

class AtlasService {
  constructor() {
    this.apiUrl = atlasConfig.apiUrl;
    this.apiKey = atlasConfig.apiKey;
    this.database = atlasConfig.database;
    this.dataSource = atlasConfig.dataSource;
  }

  // Helper method to make API requests to Atlas Data API
  async makeRequest(endpoint, method = 'POST', body = null) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Atlas API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Atlas API request failed:', error);
      throw error;
    }
  }

  // ==================== USER AUTHENTICATION ====================

  async login(username, password) {
    try {
      // Find user in MongoDB
      const response = await this.makeRequest('/action/findOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'users',
        filter: { username, password }
      });

      if (response.document) {
        const user = response.document;
        const { password: _, ...userWithoutPassword } = user;

        // Get user's chats and library items
        const [chats, libraryItems] = await Promise.all([
          this.getUserChats(username),
          this.getUserLibrary(username)
        ]);

        return {
          success: true,
          user: userWithoutPassword,
          chats,
          library_items: libraryItems
        };
      } else {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: `Login failed: ${error.message}`
      };
    }
  }

  async register(username, email, password) {
    try {
      // Check if user already exists
      const existingUser = await this.makeRequest('/action/findOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'users',
        filter: { $or: [{ username }, { email }] }
      });

      if (existingUser.document) {
        return {
          success: false,
          error: 'Username or email already exists'
        };
      }

      // Create new user
      const response = await this.makeRequest('/action/insertOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'users',
        document: {
          username,
          email,
          password, // In production, hash this password
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        user: {
          _id: response.insertedId,
          username,
          email,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: `Registration failed: ${error.message}`
      };
    }
  }

  // ==================== CHAT MANAGEMENT ====================

  async getUserChats(username, limit = 50) {
    try {
      const response = await this.makeRequest('/action/find', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'chats',
        filter: { username },
        sort: { updatedAt: -1 },
        limit
      });

      return response.documents || [];
    } catch (error) {
      console.error('Get chats error:', error);
      return [];
    }
  }

  async saveChat(username, chatData) {
    try {
      const response = await this.makeRequest('/action/insertOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'chats',
        document: {
          username,
          title: chatData.title,
          messages: chatData.messages,
          audioFiles: chatData.audioFiles || [],
          videoFiles: chatData.videoFiles || [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        chat: { ...chatData, _id: response.insertedId }
      };
    } catch (error) {
      console.error('Save chat error:', error);
      return {
        success: false,
        error: `Failed to save chat: ${error.message}`
      };
    }
  }

  async updateChat(chatId, chatData) {
    try {
      const response = await this.makeRequest('/action/updateOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'chats',
        filter: { _id: { $oid: chatId } },
        update: {
          $set: {
            ...chatData,
            updatedAt: new Date()
          }
        }
      });

      return {
        success: response.modifiedCount > 0,
        modifiedCount: response.modifiedCount
      };
    } catch (error) {
      console.error('Update chat error:', error);
      return {
        success: false,
        error: `Failed to update chat: ${error.message}`
      };
    }
  }

  async deleteChat(chatId) {
    try {
      const response = await this.makeRequest('/action/deleteOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'chats',
        filter: { _id: { $oid: chatId } }
      });

      return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount
      };
    } catch (error) {
      console.error('Delete chat error:', error);
      return {
        success: false,
        error: `Failed to delete chat: ${error.message}`
      };
    }
  }

  // ==================== FILE LIBRARY MANAGEMENT ====================

  async getUserLibrary(username, limit = 100) {
    try {
      const response = await this.makeRequest('/action/find', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'library_items',
        filter: { username },
        sort: { updatedAt: -1 },
        limit
      });

      return response.documents || [];
    } catch (error) {
      console.error('Get library error:', error);
      return [];
    }
  }

  async saveLibraryItem(username, itemData) {
    try {
      const response = await this.makeRequest('/action/insertOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'library_items',
        document: {
          username,
          fileName: itemData.fileName,
          fileType: itemData.fileType,
          fileSize: itemData.fileSize,
          fileData: itemData.fileData, // Base64 encoded file data
          originalName: itemData.originalName,
          mimeType: itemData.mimeType,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        item: { ...itemData, _id: response.insertedId }
      };
    } catch (error) {
      console.error('Save library item error:', error);
      return {
        success: false,
        error: `Failed to save library item: ${error.message}`
      };
    }
  }

  async deleteLibraryItem(itemId) {
    try {
      const response = await this.makeRequest('/action/deleteOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'library_items',
        filter: { _id: { $oid: itemId } }
      });

      return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount
      };
    } catch (error) {
      console.error('Delete library item error:', error);
      return {
        success: false,
        error: `Failed to delete library item: ${error.message}`
      };
    }
  }

  // ==================== FILE PROCESSING ====================

  async saveProcessedFile(username, file, processedFile, operation) {
    try {
      // Convert file to base64 for storage
      const fileData = await this.fileToBase64(file);
      const processedFileData = await this.fileToBase64(processedFile);

      const response = await this.makeRequest('/action/insertOne', 'POST', {
        dataSource: this.dataSource,
        database: this.database,
        collection: 'processed_files',
        document: {
          username,
          originalFile: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: fileData
          },
          processedFile: {
            name: processedFile.name,
            type: processedFile.type,
            size: processedFile.size,
            data: processedFileData
          },
          operation,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        fileId: response.insertedId
      };
    } catch (error) {
      console.error('Save processed file error:', error);
      return {
        success: false,
        error: `Failed to save processed file: ${error.message}`
      };
    }
  }

  // Helper method to convert file to base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Helper method to convert base64 to file
  base64ToFile(base64, filename, mimeType) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mimeType || mime });
  }
}

// Create and export a singleton instance
const atlasService = new AtlasService();
export default atlasService;
