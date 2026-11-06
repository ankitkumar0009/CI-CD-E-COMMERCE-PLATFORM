const express = require('express');
const router = express.Router();
const {
  getStatus,
  getPipelineHistory,
  triggerPipeline,
  getK8sTopology,
  getDockerInfo
} = require('../controllers/devopsController');

router.get('/status', getStatus);
router.get('/pipeline-history', getPipelineHistory);
router.post('/pipeline/trigger', triggerPipeline);
router.get('/k8s-topology', getK8sTopology);
router.get('/docker-info', getDockerInfo);

module.exports = router;

