import axios from 'axios';

// Create a new instance of axios
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`
});

// const api = axios.create({
//   baseURL: '/api' // Use the relative path for local development with proxy
// });

// Add a request interceptor to the instance
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors (optional but recommended)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401, redirect to the login page
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Clear the expired token
      window.location.href = '/admin-login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
