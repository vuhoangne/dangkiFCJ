const express = require('express');
const router = express.Router();
const visitRoutes = require('./visitRoutes');
const authRoutes = require('./authRoutes');
const emailRoutes = require('./emailRoutes');

// Sử dụng các routes con
router.use('/visits', visitRoutes);
router.use('/auth', authRoutes);
router.use('/email', emailRoutes);

module.exports = router;
