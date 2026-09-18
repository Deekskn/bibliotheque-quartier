const express = require('express');
const router = express.Router();

const {
  getAllEmprunts,
  createEmprunt,
  retournerEmprunt,
} = require('../controllers/empruntController');
const { validateEmprunt } = require('../middlewares/validators');

router.get('/', getAllEmprunts);
router.post('/', validateEmprunt, createEmprunt);
router.put('/:id/retour', retournerEmprunt);

module.exports = router;