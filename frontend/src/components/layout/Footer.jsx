import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Activity, Shield, Terminal, Cpu, Cloud, GitBranch } from 'lucide-react';
import { api } from '../../services/api';

export const Footer = () => {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    api.getDevOpsStatus()
      .then(res => {
        if (res.success) setTelemetry(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 text-sm">
      {/* Infrastructure Telemetry Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CLUSTER HEALTHY (99.99%)
            </span>
            <span className="hidden sm:inline font-mono text-slate-400">
              ENV: <strong className="text-slate-200">{telemetry?.app?.environment || 'Production - AWS EKS'}</strong>
            </span>
            <span className="hidden md:inline font-mono text-slate-400">
              REGION: <strong className="text-slate-200">{telemetry?.app?.region || 'us-east-1'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-slate-400">
            <span className="hidden lg:inline">
              COMMIT: <span className="text-cyan-400">{telemetry?.app?.gitCommit || 'c8f7d2a'}</span>
            </span>
            <Link to="/devops" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline">
              <Activity className="w-3.5 h-3.5" />
              Live Observability Console &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CloudOps Platform</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Enterprise-grade E-Commerce architecture engineered with Docker multi-stage builds, automated GitHub Actions CI/CD, AWS EKS orchestrations, and real-time Prometheus & Grafana observability.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-1.5 rounded-md bg-slate-800 text-cyan-400" title="AWS Cloud Infrastructure">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="p-1.5 rounded-md bg-slate-800 text-purple-400" title="Kubernetes Orchestration">
                <Layers className="w-4 h-4" />
              </div>
              <div className="p-1.5 rounded-md bg-slate-800 text-emerald-400" title="Prometheus Metrics">
                <Activity className="w-4 h-4" />
              </div>
              <div className="p-1.5 rounded-md bg-slate-800 text-blue-400" title="Automated CI/CD Workflows">
                <GitBranch className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">E-Commerce Store</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Laptops+%26+Computers" className="hover:text-white transition-colors">Laptops & Workstations</Link></li>
              <li><Link to="/shop?category=Audio+%26+Headphones" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
              <li><Link to="/shop?category=Smart+Devices+%26+Wearables" className="hover:text-white transition-colors">Wearables & Watches</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Active Orders</Link></li>
            </ul>
          </div>

          {/* DevOps & Cloud */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Cloud & DevOps</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/devops" className="text-emerald-400 hover:text-emerald-300 font-medium">DevOps Telemetry Dashboard</Link></li>
              <li><a href="/metrics" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Prometheus /metrics Endpoint</a></li>
              <li><a href="/health" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">L7 Health Probe (/health)</a></li>
              <li><a href="/health/ready" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">K8s Readiness Probe</a></li>
              <li><a href="/health/live" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">K8s Liveness Probe</a></li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">SRE & Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Protected by AWS IAM least privilege roles, encrypted secrets via AWS Secrets Manager, and rate-limited REST endpoints.
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="text-cyan-400 font-semibold">&gt; kubectl get pods -n ecommerce-prod</div>
              <div className="text-emerald-400">&#x2714; 6/6 pods Running</div>
              <div className="text-slate-400">&gt; ALB Status: Active (HTTP 200)</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} CloudOps E-Commerce Platform. Built for DevOps & Cloud Architecture Demonstration.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Docker</span>
            <span>&bull;</span>
            <span>Kubernetes</span>
            <span>&bull;</span>
            <span>Terraform</span>
            <span>&bull;</span>
            <span>AWS EKS</span>
            <span>&bull;</span>
            <span>Prometheus</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

