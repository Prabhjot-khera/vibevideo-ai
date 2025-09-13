import { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, VideoIcon, ScissorsIcon, PaletteIcon } from 'lucide-react';

const Login = ({ onLogin, onClose, showSignup, onToggleSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [loginStatus, setLoginStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('Sign in to access your personalized video editor');
  const [currentQuote, setCurrentQuote] = useState(0);

  // Quotes array with video editing testimonials
  const quotes = [
    {
      text: "This video editor has transformed how I create content. The AI suggestions are incredibly helpful!",
      author: "Content Creator"
    },
    {
      text: "The speed adjustment and cutting features saved me hours of work on my latest project.",
      author: "Video Producer"
    },
    {
      text: "As a beginner, the guided suggestions helped me learn professional editing techniques quickly.",
      author: "Aspiring Editor"
    },
    {
      text: "The audio enhancement feature is a game-changer for my podcast videos.",
      author: "Podcast Host"
    },
    {
      text: "I can now create professional-looking videos without expensive software or complex training.",
      author: "Small Business Owner"
    },
    {
      text: "The grayscale conversion and clip combining features are exactly what I needed for my art project.",
      author: "Digital Artist"
    }
  ];

  // Change welcome message randomly every 5 seconds
  useEffect(() => {
    const messages = [
      'Sign in to access your personalized video editor',
      'Create amazing videos with AI-powered assistance',
      'Save your editing history and preferences',
      'Access your past projects and conversations',
      'Get personalized video editing suggestions'
    ];
    
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setWelcomeMessage(messages[randomIndex]);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Cycle through quotes every 8 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(intervalId);
  }, [quotes.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(showSignup ? 'Signup submitted:' : 'Login submitted:', formData);
    setLoginStatus('loading');
    setStatusMessage(showSignup ? 'Creating your account...' : 'Verifying your credentials...');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (showSignup) {
        // Handle signup
        const { username, password, email } = formData;
        
        // Basic validation
        if (!username || !password || !email) {
          setLoginStatus('error');
          setStatusMessage('Please fill in all fields.');
          return;
        }
        
        if (password.length < 6) {
          setLoginStatus('error');
          setStatusMessage('Password must be at least 6 characters long.');
          return;
        }
        
        // Check if user already exists (localStorage for now)
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.find(user => user.username === username || user.email === email);
        
        if (userExists) {
          setLoginStatus('error');
          setStatusMessage('Username or email already exists.');
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now(),
          username,
          email,
          password, // In production, this would be hashed
          createdAt: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        console.log('Account created successfully');
        setLoginStatus('success');
        setStatusMessage('Account created! You can now sign in.');
        
        // Reset form for login
        setTimeout(() => {
          onToggleSignup();
          setFormData({ username: '', password: '', email: '' });
          setLoginStatus('idle');
          setStatusMessage('');
        }, 2000);
        
      } else {
        // Handle login
        const { username, password } = formData;
        
        if (!username || !password) {
          setLoginStatus('error');
          setStatusMessage('Please enter both username and password.');
          return;
        }
        
        // Check user credentials (localStorage for now)
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = existingUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
          console.log('Login successful');
          setLoginStatus('success');
          setStatusMessage('Login successful! Welcome back.');
          
          // Store current user session
          localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email
          }));
          
          // Brief delay for user to see success message
          setTimeout(() => {
            onLogin(user.username);
            onClose();
          }, 1000);
        } else {
          setLoginStatus('error');
          setStatusMessage('Invalid username or password.');
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setLoginStatus('error');
      setStatusMessage('An error occurred. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Reset status when user starts typing again
    if (loginStatus === 'error') {
      setLoginStatus('idle');
      setStatusMessage('');
    }
  };

  console.log('Login component rendering, showSignup:', showSignup);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden relative flex flex-col md:flex-row">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
      
        {/* Hero Section - Left Side */}
        <div className="w-full md:w-1/2 flex flex-col p-4 md:p-6 justify-center relative z-10 bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto">
          
          {/* App Logo and Title */}
          <div className="flex items-center mb-6">
            <VideoIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">VibeVideo.AI</h1>
          </div>
          
          {/* Hero Message */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Create Amazing Videos</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              An AI-powered video editing assistant that helps you create professional content with ease.
            </p>
            <div className="bg-gray-200 bg-opacity-50 p-3 rounded-lg border border-gray-300 relative overflow-hidden">
              <div className="transition-opacity duration-500 ease-in-out min-h-[80px] flex flex-col justify-center" key={currentQuote}>
                <p className="text-sm text-gray-600 italic">
                  "{quotes[currentQuote].text}"
                </p>
                <p className="text-xs text-gray-500 mt-1">— {quotes[currentQuote].author}</p>
              </div>
            </div>
          </div>
        
          {/* Key Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Key Features</h3>
            
            <div className="flex items-start">
              <div className="bg-blue-600 p-1.5 rounded-lg mr-3 flex-shrink-0">
                <VideoIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">AI-Powered Editing</h4>
                <p className="text-xs text-gray-600">Get intelligent suggestions for video speed, cuts, and enhancements</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-600 p-1.5 rounded-lg mr-3 flex-shrink-0">
                <ScissorsIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">Smart Cutting</h4>
                <p className="text-xs text-gray-600">Automatically suggest optimal cut points and time intervals</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-600 p-1.5 rounded-lg mr-3 flex-shrink-0">
                <PaletteIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">Visual Effects</h4>
                <p className="text-xs text-gray-600">Apply grayscale, color adjustments, and other effects with ease</p>
              </div>
            </div>
          </div>
      </div>
      
        {/* Login Section - Right Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-6 relative z-10 bg-white overflow-y-auto">
          <div className="w-full max-w-sm p-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            
            <div className="space-y-3 mb-4 relative z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-center text-gray-800">
                  {showSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 min-h-[40px] transition-all duration-500 ease-in-out">
                {welcomeMessage}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {showSignup && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg 
                             text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <UserIcon className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-9 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg 
                           text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <KeyIcon className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg 
                           text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status message display */}
              {statusMessage && (
                <div className={`text-sm text-center py-1 rounded ${
                  loginStatus === 'error' ? 'text-red-600' :
                  loginStatus === 'success' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {statusMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loginStatus === 'loading'}
                className={`w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg
                         transition-colors duration-200 font-semibold text-sm relative ${loginStatus === 'loading' ? 'opacity-80 cursor-wait' : ''}`}
              >
                {loginStatus === 'loading' ? (
                  <>
                    <span className="opacity-0">{showSignup ? 'Create Account' : 'Sign In'}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </>
                ) : (showSignup ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-600">
              {showSignup ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={onToggleSignup}
                className="text-blue-600 hover:text-blue-500 transition-colors font-semibold"
              >
                {showSignup ? 'Sign in' : 'Sign up'}
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300 text-center">
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:underline text-xs transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
