// ==============================================================================
// Synthetic Smoke Test Suite (Used in Post-Deployment CI/CD Health Gates)
// ==============================================================================

const http = require('http');

const TARGET_HOST = process.env.TARGET_HOST || 'localhost';
const TARGET_PORT = process.env.TARGET_PORT || 5000;

const makeRequest = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout connecting to ${TARGET_HOST}:${TARGET_PORT}${path}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runSmokeTests() {
  console.log(`\n🔍 Initiating Post-Deployment Smoke Tests against http://${TARGET_HOST}:${TARGET_PORT}...`);
  let passed = 0;
  let failed = 0;

  const tests = [
    { name: 'L7 Health Probe (/health)', path: '/health', expectedStatus: 200 },
    { name: 'Kubernetes Liveness Probe (/health/live)', path: '/health/live', expectedStatus: 200 },
    { name: 'Kubernetes Readiness Probe (/health/ready)', path: '/health/ready', expectedStatus: 200 },
    { name: 'Prometheus Telemetry Endpoint (/metrics)', path: '/metrics', expectedStatus: 200 },
    { name: 'Product Catalog API (/api/products)', path: '/api/products', expectedStatus: 200 },
    { name: 'DevOps System Telemetry (/api/devops/status)', path: '/api/devops/status', expectedStatus: 200 },
    { name: 'CI/CD Pipeline Telemetry (/api/devops/pipeline-history)', path: '/api/devops/pipeline-history', expectedStatus: 200 }
  ];

  for (const test of tests) {
    try {
      const res = await makeRequest(test.path);
      if (res.status === test.expectedStatus) {
        console.log(`  ✔ [PASS] ${test.name}`);
        passed++;
      } else {
        console.error(`  ❌ [FAIL] ${test.name} - Expected HTTP ${test.expectedStatus}, got ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ [FAIL] ${test.name} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Smoke Tests Finished: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

runSmokeTests();

