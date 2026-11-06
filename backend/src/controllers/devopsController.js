const os = require('os');
const config = require('../config');
const { getDBStatus } = require('../config/database');
const store = require('../models/store');

const startTime = Date.now();

// Simulated persistent pipeline state that updates when triggered
let pipelineRuns = [
  {
    id: 'run-8942',
    workflow: 'Production CI/CD Deployment',
    branch: 'main',
    commit: {
      sha: config.gitCommit,
      message: 'feat(auth): add JWT refresh rotation & AWS Secrets Manager integration',
      author: 'Ankit Chaudhary <ankit@devops.cloud>'
    },
    status: 'success',
    triggeredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    duration: '4m 32s',
    stages: [
      { name: 'Lint & Static Analysis', status: 'success', duration: '32s' },
      { name: 'Unit & Integration Tests', status: 'success', duration: '58s' },
      { name: 'Docker Multi-stage Build', status: 'success', duration: '1m 24s' },
      { name: 'Trivy Security & CVE Scan', status: 'success', duration: '28s' },
      { name: 'Push to AWS ECR', status: 'success', duration: '35s' },
      { name: 'EKS Rolling Update Deploy', status: 'success', duration: '35s' }
    ]
  },
  {
    id: 'run-8941',
    workflow: 'Security & Vulnerability Audit',
    branch: 'feature/prometheus-monitoring',
    commit: {
      sha: 'a7b3e19',
      message: 'feat(metrics): add Prometheus RED metric collectors for latency and errors',
      author: 'Jane CloudEngineer <jane@devops.cloud>'
    },
    status: 'success',
    triggeredAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 177).toISOString(),
    duration: '3m 15s',
    stages: [
      { name: 'Lint & Static Analysis', status: 'success', duration: '29s' },
      { name: 'Unit & Integration Tests', status: 'success', duration: '52s' },
      { name: 'Docker Multi-stage Build', status: 'success', duration: '1m 18s' },
      { name: 'Trivy Security & CVE Scan', status: 'success', duration: '36s' }
    ]
  },
  {
    id: 'run-8940',
    workflow: 'Production CI/CD Deployment',
    branch: 'fix/cors-origin-alb',
    commit: {
      sha: 'f4e29c0',
      message: 'fix(ingress): update AWS ALB ingress cross-origin headers',
      author: 'Ankit Chaudhary <ankit@devops.cloud>'
    },
    status: 'failed',
    triggeredAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 358).toISOString(),
    duration: '1m 45s',
    error: 'Smoke test timeout on ALB Target Group health check: HTTP 504',
    stages: [
      { name: 'Lint & Static Analysis', status: 'success', duration: '30s' },
      { name: 'Unit & Integration Tests', status: 'success', duration: '55s' },
      { name: 'Docker Multi-stage Build', status: 'failed', duration: '20s' }
    ]
  }
];

const getStatus = async (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const processMem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // Real CPU usage estimation
  const cpuLoad = os.loadavg();
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Virtual Multi-core Processor';

  const analytics = await store.getAnalytics();

  res.status(200).json({
    success: true,
    data: {
      app: {
        name: config.appName,
        version: config.appVersion,
        environment: config.environment,
        region: config.region,
        gitCommit: config.gitCommit,
        nodeVersion: process.version,
        platform: `${os.platform()} (${os.arch()})`,
        uptime: {
          seconds: uptimeSeconds,
          human: formatUptime(uptimeSeconds),
          startedAt: new Date(startTime).toISOString()
        }
      },
      system: {
        cpuCount: cpus.length,
        cpuModel,
        cpuLoadAvg: cpuLoad.map(l => parseFloat(l.toFixed(2))),
        memory: {
          totalMB: Math.round(totalMem / (1024 * 1024)),
          usedMB: Math.round(usedMem / (1024 * 1024)),
          freeMB: Math.round(freeMem / (1024 * 1024)),
          usagePercent: parseFloat(((usedMem / totalMem) * 100).toFixed(1))
        },
        processMemory: {
          rssMB: Math.round(processMem.rss / (1024 * 1024)),
          heapTotalMB: Math.round(processMem.heapTotal / (1024 * 1024)),
          heapUsedMB: Math.round(processMem.heapUsed / (1024 * 1024))
        }
      },
      database: getDBStatus(),
      cloudInfrastructure: {
        provider: 'Amazon Web Services (AWS)',
        cluster: 'ecommerce-eks-production',
        vpc: 'vpc-07a89b41c0e (10.0.0.0/16)',
        subnets: ['subnet-private-1a', 'subnet-private-1b', 'subnet-public-1a', 'subnet-public-1b'],
        alb: 'k8s-ecommerce-alb-91283.us-east-1.elb.amazonaws.com',
        nodeGroup: 'eks-managed-m5-large (3/3 Ready)',
        ecrRegistry: '123456789012.dkr.ecr.us-east-1.amazonaws.com/ecommerce-platform',
        monitoring: 'Prometheus v2.48.0 + Grafana v10.2.2'
      },
      metricsSummary: {
        totalOrders: analytics.totalOrders,
        totalProducts: analytics.totalProducts,
        totalRevenue: analytics.totalRevenue,
        activeConnections: Math.floor(12 + Math.random() * 8),
        p95LatencyMs: Math.floor(45 + Math.random() * 15),
        errorRatePercent: 0.04
      }
    }
  });
};

const getPipelineHistory = (req, res) => {
  res.status(200).json({
    success: true,
    data: pipelineRuns
  });
};

const triggerPipeline = (req, res) => {
  const newRun = {
    id: `run-${Math.floor(9000 + Math.random() * 999)}`,
    workflow: 'Production CI/CD Deployment',
    branch: req.body.branch || 'main',
    commit: {
      sha: Math.random().toString(16).substr(2, 7),
      message: req.body.message || 'chore: automated deployment triggered from DevOps Dashboard',
      author: 'DevOps Engineer <sre@ecommerce.cloud>'
    },
    status: 'running',
    triggeredAt: new Date().toISOString(),
    completedAt: null,
    duration: 'In progress...',
    stages: [
      { name: 'Lint & Static Analysis', status: 'success', duration: '28s' },
      { name: 'Unit & Integration Tests', status: 'success', duration: '51s' },
      { name: 'Docker Multi-stage Build', status: 'running', duration: 'Active' },
      { name: 'Trivy Security & CVE Scan', status: 'pending', duration: '-' },
      { name: 'Push to AWS ECR', status: 'pending', duration: '-' },
      { name: 'EKS Rolling Update Deploy', status: 'pending', duration: '-' }
    ]
  };

  pipelineRuns.unshift(newRun);

  // Complete simulation after 10 seconds
  setTimeout(() => {
    newRun.status = 'success';
    newRun.completedAt = new Date().toISOString();
    newRun.duration = '3m 48s';
    newRun.stages = newRun.stages.map(s => ({
      ...s,
      status: 'success',
      duration: s.duration === '-' || s.duration === 'Active' ? `${Math.floor(25 + Math.random() * 40)}s` : s.duration
    }));
  }, 10000);

  res.status(202).json({
    success: true,
    message: 'CI/CD Pipeline workflow initiated successfully',
    data: newRun
  });
};

const getK8sTopology = (req, res) => {
  const pods = [
    {
      name: 'ecommerce-frontend-7f99b64c78-6px8q',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-1-42.ec2.internal',
      cpuUsage: '38m',
      memoryUsage: '48Mi',
      ip: '10.0.1.189'
    },
    {
      name: 'ecommerce-frontend-7f99b64c78-w2n9z',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-2-88.ec2.internal',
      cpuUsage: '42m',
      memoryUsage: '52Mi',
      ip: '10.0.2.14'
    },
    {
      name: 'ecommerce-frontend-7f99b64c78-zk7lp',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-3-112.ec2.internal',
      cpuUsage: '35m',
      memoryUsage: '46Mi',
      ip: '10.0.3.77'
    },
    {
      name: 'ecommerce-backend-5c8bd45d9-4m8vc',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-1-42.ec2.internal',
      cpuUsage: '115m',
      memoryUsage: '128Mi',
      ip: '10.0.1.204'
    },
    {
      name: 'ecommerce-backend-5c8bd45d9-7k81t',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-2-88.ec2.internal',
      cpuUsage: '122m',
      memoryUsage: '134Mi',
      ip: '10.0.2.65'
    },
    {
      name: 'ecommerce-backend-5c8bd45d9-m9z4b',
      namespace: 'ecommerce-prod',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '4d 12h',
      node: 'ip-10-0-3-112.ec2.internal',
      cpuUsage: '108m',
      memoryUsage: '122Mi',
      ip: '10.0.3.91'
    },
    {
      name: 'prometheus-server-859cf5c6b-2m87q',
      namespace: 'monitoring',
      ready: '2/2',
      status: 'Running',
      restarts: 0,
      age: '12d',
      node: 'ip-10-0-1-42.ec2.internal',
      cpuUsage: '145m',
      memoryUsage: '340Mi',
      ip: '10.0.1.55'
    },
    {
      name: 'grafana-6bf9677465-9r4tz',
      namespace: 'monitoring',
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '12d',
      node: 'ip-10-0-2-88.ec2.internal',
      cpuUsage: '45m',
      memoryUsage: '110Mi',
      ip: '10.0.2.118'
    }
  ];

  const nodes = [
    {
      name: 'ip-10-0-1-42.ec2.internal',
      instanceType: 'm5.large',
      zone: 'us-east-1a',
      status: 'Ready',
      cpuAllocatable: '2000m',
      cpuUsed: '38%',
      memAllocatable: '8192Mi',
      memUsed: '46%'
    },
    {
      name: 'ip-10-0-2-88.ec2.internal',
      instanceType: 'm5.large',
      zone: 'us-east-1b',
      status: 'Ready',
      cpuAllocatable: '2000m',
      cpuUsed: '41%',
      memAllocatable: '8192Mi',
      memUsed: '49%'
    },
    {
      name: 'ip-10-0-3-112.ec2.internal',
      instanceType: 'm5.large',
      zone: 'us-east-1c',
      status: 'Ready',
      cpuAllocatable: '2000m',
      cpuUsed: '32%',
      memAllocatable: '8192Mi',
      memUsed: '39%'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      cluster: 'ecommerce-eks-production',
      namespace: 'ecommerce-prod',
      pods,
      nodes,
      hpa: [
        {
          target: 'ecommerce-backend',
          minReplicas: 3,
          maxReplicas: 10,
          currentReplicas: 3,
          cpuTargetPercent: 75,
          currentCpuPercent: 28
        },
        {
          target: 'ecommerce-frontend',
          minReplicas: 3,
          maxReplicas: 8,
          currentReplicas: 3,
          cpuTargetPercent: 70,
          currentCpuPercent: 18
        }
      ]
    }
  });
};

const getDockerInfo = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      registry: '123456789012.dkr.ecr.us-east-1.amazonaws.com',
      images: [
        {
          repository: 'ecommerce-frontend',
          tag: 'v1.0.0-c8f7d2a',
          latest: true,
          sizeMB: 38.4,
          baseImage: 'nginx:1.25-alpine-slim',
          multiStage: true,
          vulnerabilities: { critical: 0, high: 0, medium: 2, low: 4 },
          digest: 'sha256:7f48a19de0239b6b80ad2e0081dcf34870f719391ab2ef124097491d90214c71',
          pushedAt: '2026-03-05T08:42:10Z'
        },
        {
          repository: 'ecommerce-backend',
          tag: 'v1.0.0-c8f7d2a',
          latest: true,
          sizeMB: 84.2,
          baseImage: 'node:20-alpine',
          multiStage: true,
          vulnerabilities: { critical: 0, high: 0, medium: 1, low: 3 },
          digest: 'sha256:c9284a009fb665d93e1a0b1298402bcde0985a91845bb08a1197c385610bcde8',
          pushedAt: '2026-03-05T08:41:45Z'
        }
      ]
    }
  });
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
}

module.exports = {
  getStatus,
  getPipelineHistory,
  triggerPipeline,
  getK8sTopology,
  getDockerInfo
};

