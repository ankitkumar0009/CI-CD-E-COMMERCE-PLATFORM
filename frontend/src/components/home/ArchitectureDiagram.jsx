import React, { useState } from 'react';
import { Cloud, Layers, Server, Database, Activity, ShieldCheck, GitBranch, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitectureDiagram = () => {
  const [activeTab, setActiveTab] = useState('cloud');

  return (
    <section className="py-16 bg-slate-100 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            SRE & System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
            Production Cloud Architecture & Pipeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Engineered with high-availability principles, immutable infrastructure via Terraform, and zero-downtime rolling updates.
          </p>

          {/* Architecture Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cloud'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              AWS Cloud Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('cicd')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cicd'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              CI/CD Automation Pipeline
            </button>
            <button
              onClick={() => setActiveTab('k8s')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'k8s'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Kubernetes EKS & Monitoring
            </button>
          </div>
        </div>

        {/* Tab 1: Cloud Architecture Diagram */}
        {activeTab === 'cloud' && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              
              {/* Step 1: Ingress & CDN */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Edge & Load Balancing</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Amazon Route 53 DNS routes traffic to AWS CloudFront CDN for cached assets and AWS Application Load Balancer (ALB) across 3 Availability Zones.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                  Port 80/443 SSL (ACM)
                </div>
              </div>

              {/* Step 2: EKS Cluster */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AWS EKS Cluster v1.30</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Managed Node Groups in Private Subnets. Frontend SPA (Nginx) pods and Node.js REST API pods running with Horizontal Pod Autoscaling (HPA).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  RollingUpdate Zero-Downtime
                </div>
              </div>

              {/* Step 3: Persistence & Secrets */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multi-AZ Database & Secrets</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Multi-AZ encrypted RDS MySQL / DocumentDB instance. Credentials securely retrieved via AWS Secrets Manager with IAM IRSA roles.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  AES-256 KMS Encryption
                </div>
              </div>

              {/* Step 4: Observability */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Prometheus & Grafana</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Prometheus scrapes <code className="text-cyan-400 font-mono">/metrics</code> every 5s for RED metrics (Rate, Errors, Duration). Pre-configured Grafana dashboards & alerts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-rose-600 dark:text-rose-400">
                  p95 Latency & 5xx Alerting
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: CI/CD Pipeline */}
        {activeTab === 'cicd' && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Actions Automated Workflow</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Triggered on every commit push or pull request merge into main</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-purple-300 dark:border-purple-800">
                  Workflow: ci-cd.yml
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
                {[
                  { step: '1', title: 'Code Checkout & Setup', desc: 'Node.js 20 & caching' },
                  { step: '2', title: 'Automated Tests', desc: 'Jest & Supertest suites' },
                  { step: '3', title: 'Multi-Stage Docker', desc: 'Build slim prod images' },
                  { step: '4', title: 'Trivy CVE Scan', desc: 'Container vulnerability scan' },
                  { step: '5', title: 'ECR Push (OIDC)', desc: 'Zero long-lived keys' },
                  { step: '6', title: 'EKS Rolling Update', desc: 'Probed zero-downtime rollout' }
                ].map((s, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Kubernetes & Monitoring */}
        {activeTab === 'k8s' && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                <div className="text-cyan-400 font-bold">$ kubectl get deployments -n ecommerce-prod</div>
                <div className="text-slate-400">NAME &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; READY &nbsp; UP-TO-DATE &nbsp; AVAILABLE &nbsp; AGE</div>
                <div className="text-emerald-400">ecommerce-frontend &nbsp; 3/3 &nbsp; &nbsp; 3 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 3 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 4d</div>
                <div className="text-emerald-400">ecommerce-backend &nbsp; &nbsp;3/3 &nbsp; &nbsp; 3 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 3 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 4d</div>
                <div className="pt-2 text-cyan-400 font-bold">$ kubectl get hpa -n ecommerce-prod</div>
                <div className="text-slate-300">backend-hpa &nbsp; &nbsp; Deployment/backend &nbsp; 28%/75% &nbsp; 3 &nbsp; 10 &nbsp; 3</div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Prometheus & Grafana Observability</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Integrated Prometheus exporter collects RED metrics, system load, container memory, and transaction counts. Alerts automatically notify DevOps on high latency or HTTP 5xx spikes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/devops"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow"
                  >
                    <Activity className="w-4 h-4" />
                    Open Live DevOps Dashboard
                  </Link>
                  <a
                    href="/metrics"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Raw /metrics Stream
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

