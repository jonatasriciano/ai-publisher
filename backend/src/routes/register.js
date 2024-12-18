import express from 'express';
const router = express.Router();

// Dummy registration logic
router.post('/', (req, res) => {
  const { username, email, password, companyName } = req.body;

  if (!username || !email || !password || !companyName) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  // Simulate saving user to the database
  console.log('User Registered:', { username, email, companyName });
  return res.status(201).json({ message: 'User registered successfully!' });
});

export default router;