const express = require('express');
const router = express.Router();

const {
  getAllAdherents,
  getAdherentById,
  getHistoriqueEmprunts,
  createAdherent,
  updateAdherent,
  deleteAdherent,
} = require('../controllers/adherentController');
const { validateAdherent } = require('../middlewares/validators');

router.get('/', getAllAdherents);
router.get('/:id', getAdherentById);
router.get('/:id/emprunts', getHistoriqueEmprunts);
router.post('/', validateAdherent, createAdherent);
router.put('/:id', validateAdherent, updateAdherent);
router.delete('/:id', deleteAdherent);

module.exports = router;