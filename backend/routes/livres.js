// backend/routes/livres.js

const express = require('express');
const router = express.Router();

const {
  getAllLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
} = require('../controllers/livreController');
const { validateLivre } = require('../middlewares/validators');

router.get('/', getAllLivres);
router.get('/:id', getLivreById);
router.post('/', validateLivre, createLivre);
router.put('/:id', validateLivre, updateLivre);
router.delete('/:id', deleteLivre);

module.exports = router;