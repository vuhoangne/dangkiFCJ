const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// API endpoints
router.get('/', visitController.getVisits);
router.post('/', visitController.createVisit);
router.patch('/:id', visitController.updateVisitStatus);
router.delete('/:id', visitController.deleteVisit);

// Giữ lại API cũ để tương thích ngược
router.put('/:id', visitController.updateVisitStatus);

module.exports = router;
