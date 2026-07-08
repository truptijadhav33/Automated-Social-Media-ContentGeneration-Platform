const app = require('./app');
const { connectDB } = require('./config/db');

console.log('ALL ENV VARS:', {
  PYTHON_AI_SERVICE_URL: process.env.PYTHON_AI_SERVICE_URL,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
