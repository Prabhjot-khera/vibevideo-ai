const API_BASE_URL = 'https://videov323-e45c00e08e30.herokuapp.com';

class MongoDBService {
  // Login user and fetch their data
  static async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          user: data.user,
          chats: data.chats || [],
          library_items: data.library_items || []
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Get user's chats
  static async getUserChats(username, limit = 50) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats?username=${encodeURIComponent(username)}&limit=${limit}`, {
        method: 'GET',
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          chats: data.chats || []
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch chats'
        };
      }
    } catch (error) {
      console.error('Get chats error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Get user's library items
  static async getUserLibrary(username, limit = 100) {
    try {
      const response = await fetch(`${API_BASE_URL}/library?username=${encodeURIComponent(username)}&limit=${limit}`, {
        method: 'GET',
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          library_items: data.library_items || []
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch library'
        };
      }
    } catch (error) {
      console.error('Get library error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Save chat to MongoDB (this would need to be implemented in backend)
  static async saveChat(username, chatData) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ...chatData
        }),
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          chat: data.chat
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to save chat'
        };
      }
    } catch (error) {
      console.error('Save chat error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Save library item to MongoDB (this would need to be implemented in backend)
  static async saveLibraryItem(username, itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ...itemData
        }),
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          item: data.item
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to save library item'
        };
      }
    } catch (error) {
      console.error('Save library item error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }
}

export default MongoDBService;
