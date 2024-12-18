import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Approve user account
router.post('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approvedByAdmin: true });
    res.status(200).json({ message: 'User approved successfully.', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; // Export as default