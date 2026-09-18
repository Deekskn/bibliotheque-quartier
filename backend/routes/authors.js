// backend/routes/authors.js

const express = require('express');
const router = express.Router();

const {
  getAllAuteurs,
  getAuteurById,
  createAuteur,
  updateAuteur,
  deleteAuteur,
} = require('../controllers/authorController');
const { validateAuteur } = require('../middlewares/validators');

router.get('/', getAllAuteurs);
router.get('/:id', getAuteurById);
router.post('/', validateAuteur, createAuteur);
router.put('/:id', validateAuteur, updateAuteur);
router.delete('/:id', deleteAuteur);

module.exports = router;