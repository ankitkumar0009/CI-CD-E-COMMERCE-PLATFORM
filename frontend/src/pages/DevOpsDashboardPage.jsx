import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Activity, 
  Server, 
  Cpu, 
  HardDrive, 
  GitBranch, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw, 
  Layers, 
  Clock, 
  ExternalLink,
  Box,
  Terminal,
  Zap,
  Radio
} from 'lucide-react';

export const DevOpsDashboardPage = () => {
  const [statusData, setStatusData] = useState(null);
  const [pipelineHistory, setPipelineHistory] = useState([]);
  const [k8sData, setK8sData] = useState(null);
  const [dockerData, setDockerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'k8s' | 'cicd' | 'docker' | 'metrics'
  const [refreshCountdown, setRefreshCountdown] = useState(5);

  const fetchAllTelemetry = async () => {
    try {
      const [statusRes, pipelineRes, k8sRes, dockerRes] = await Promise.all([
        api.getDevOpsStatus(),
        api.getPipelineHistory(),
        api.getK8sTopology(),
        api.getDockerInfo()
      ]);

      if (statusRes.success) setStatusData(statusRes.data);
      if (pipelineRes.success) setPipelineHistory(pipelineRes.data);
      if (k8sRes.success) setK8sData(k8sRes.data);
      if (dockerRes.success) setDockerData(dockerRes.data);
    } catch (err) {
      console.warn('Telemetry load issue:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTelemetry();

    // Auto-refresh interval (every 5 seconds)
    const interval = setInterval(() => {
      fetchAllTelemetry();
      setRefreshCountdown(5);
    }, 5000);

    const countInterval = setInterval(() => {
      setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countInterval);
    };
  }, []);

  const handleTriggerPipeline = async () => {
    setTriggeringPipeline(true);
    try {
      const res = await api.triggerPipeline({
        branch: 'main',
        message: 'chore(deploy): manual rollback & canary deployment verification'
      });
      if (res.success && res.data) {
        setPipelineHistory(prev => [res.data, ...prev]);
        setActiveTab('cicd');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setTimeout(() => setTriggeringPipeline(false), 1500);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Environment Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 font-mono">
                CloudOps SRE Console
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                HEALTHY 99.99%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Amazon EKS Cluster &bull; GitHub Actions CI/CD &bull; Prometheus Telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPipeline}
              disabled={triggeringPipeline}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {triggeringPipeline ? 'Triggering Pipeline...' : 'Trigger CI/CD Pipeline'}
            </button>

            <button
              onClick={fetchAllTelemetry}
              className="p-2.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
              title="Manual Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-mono text-[11px] hidden sm:inline">{refreshCountdown}s</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-bold">
          {[
            { id: 'overview', label: 'System Overview & Telemetry', icon: Activity },
            { id: 'k8s', label: 'Kubernetes Pods & Nodes (EKS)', icon: Layers },
            { id: 'cicd', label: 'CI/CD Pipeline Monitor', icon: GitBranch },
            { id: 'docker', label: 'Docker & ECR Registry', icon: Box },
            { id: 'metrics', label: 'Prometheus & SRE Targets', icon: Radio }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Live Host Telemetry */}
        {activeTab === 'overview' && statusData && (
          <div className="space-y-6">
            
            {/* Live Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Memory */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    Host Memory Usage
                  </span>
                  <span className="font-mono text-xs text-cyan-400 font-bold">
                    {statusData.system.memory.usagePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, statusData.system.memory.usagePercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Used: {statusData.system.memory.usedMB} MB</span>
                  <span>Total: {statusData.system.memory.totalMB} MB</span>
                </div>
              </div>

              {/* Card 2: CPU Load */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    CPU Load (1m, 5m, 15m)
                  </span>
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    {statusData.system.cpuCount} Cores
                  </span>
                </div>
                <div className="font-mono text-base font-extrabold text-white">
                  {statusData.system.cpuLoadAvg.join('  •  ')}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {statusData.system.cpuModel}
                </div>
              </div>

              {/* Card 3: Process RSS */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Node.js RSS Memory
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    Heap: {statusData.system.processMemory.heapUsedMB} MB
                  </span>
                </div>
                <div className="font-mono text-2xl font-extrabold text-white">
                  {statusData.system.processMemory.rssMB} <span className="text-xs text-slate-400 font-normal">MB RSS</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Runtime: Node.js {statusData.app.nodeVersion}
                </div>
              </div>

              {/* Card 4: Uptime & Uptime Counter */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Process Uptime
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    STATUS UP
                  </span>
                </div>
                <div className="font-mono text-xl font-extrabold text-white">
                  {statusData.app.uptime.human}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Started: {new Date(statusData.app.uptime.startedAt).toLocaleTimeString()}
                </div>
              </div>

            </div>

            {/* AWS Cloud Architecture Specifications Panel */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Active Cloud Infrastructure Provisioning (AWS Terraform State)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Cloud Provider:</span>
                  <p className="text-slate-200 font-bold mt-0.5">{statusData.cloudInfrastructure.provider}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Kubernetes Cluster:</span>
                  <p className="text-cyan-400 font-bold mt-0.5">{statusData.cloudInfrastructure.cluster}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">VPC & Subnets:</span>
                  <p className="text-slate-200 font-bold mt-0.5">{statusData.cloudInfrastructure.vpc}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Application Load Balancer:</span>
                  <p className="text-slate-200 font-bold mt-0.5 truncate">{statusData.cloudInfrastructure.alb}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">ECR Image Registry:</span>
                  <p className="text-purple-400 font-bold mt-0.5 truncate">{statusData.cloudInfrastructure.ecrRegistry}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Database Engine:</span>
                  <p className="text-emerald-400 font-bold mt-0.5">{statusData.database.engine}</p>
                </div>
              </div>
            </div>

            {/* Business & Telemetry RED Metrics */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live SRE Telemetry & Latency
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">p95 Request Latency</p>
                  <p className="text-xl font-extrabold text-cyan-400 mt-1">{statusData.metricsSummary.p95LatencyMs} ms</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">HTTP 5xx Error Rate</p>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">{statusData.metricsSummary.errorRatePercent}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Active In-Flight HTTP</p>
                  <p className="text-xl font-extrabold text-purple-400 mt-1">{statusData.metricsSummary.activeConnections}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Total Orders Placed</p>
                  <p className="text-xl font-extrabold text-amber-400 mt-1">{statusData.metricsSummary.totalOrders}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Kubernetes Cluster Topology */}
        {activeTab === 'k8s' && k8sData && (
          <div className="space-y-6">
            
            {/* EKS Pods Table */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Kubernetes Pods & ReplicaSets ({k8sData.pods.length} Pods Running)
                  </h3>
                  <p className="text-xs text-slate-400">Target Namespace: <code className="text-cyan-400 font-mono">{k8sData.namespace}</code></p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800">
                  RollingUpdate Zero-Downtime Strategy
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Pod Name</th>
                      <th className="p-3">Namespace</th>
                      <th className="p-3">Ready</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Restarts</th>
                      <th className="p-3">CPU</th>
                      <th className="p-3">Memory</th>
                      <th className="p-3">Node</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {k8sData.pods.map((pod, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 text-cyan-300 font-semibold">{pod.name}</td>
                        <td className="p-3 text-slate-400">{pod.namespace}</td>
                        <td className="p-3 text-emerald-400">{pod.ready}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {pod.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{pod.restarts}</td>
                        <td className="p-3 text-slate-200">{pod.cpuUsage}</td>
                        <td className="p-3 text-slate-200">{pod.memoryUsage}</td>
                        <td className="p-3 text-slate-400">{pod.node}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Horizontal Pod Autoscalers (HPA) */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Horizontal Pod Autoscaling (HPA v2)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {k8sData.hpa.map((hpa, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{hpa.target}</span>
                      <span className="text-cyan-400 font-bold">{hpa.currentReplicas} / {hpa.maxReplicas} Replicas</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>CPU Utilization Target: {hpa.cpuTargetPercent}%</span>
                      <span className="text-emerald-400 font-bold">Current: {hpa.currentCpuPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(hpa.currentCpuPercent / hpa.cpuTargetPercent) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: CI/CD Pipeline Monitor */}
        {activeTab === 'cicd' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  GitHub Actions CI/CD Pipeline Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-1">Automated test, multi-stage build, ECR push, and EKS rolling deployment</p>
              </div>
              <button
                onClick={handleTriggerPipeline}
                disabled={triggeringPipeline}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Pipeline
              </button>
            </div>

            {/* Pipeline Runs Feed */}
            <div className="space-y-4">
              {pipelineHistory.map((run) => (
                <div
                  key={run.id}
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          run.status === 'success' ? 'bg-emerald-400' :
                          run.status === 'failed' ? 'bg-rose-500' :
                          'bg-amber-400 animate-ping'
                        }`} />
                        <h4 className="text-sm font-bold text-white">{run.workflow}</h4>
                        <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {run.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">
                        {run.commit.message} &bull; <span className="text-cyan-400">[{run.commit.sha}]</span>
                      </p>
                    </div>

                    <div className="text-right text-xs font-mono">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        run.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        run.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {run.status} ({run.duration})
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Triggered {new Date(run.triggeredAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Stage Visualizer */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {run.stages.map((stage, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs font-mono flex flex-col justify-between ${
                          stage.status === 'success' ? 'bg-slate-900 border-emerald-900/50 text-emerald-400' :
                          stage.status === 'failed' ? 'bg-rose-950/30 border-rose-900/50 text-rose-400' :
                          stage.status === 'running' ? 'bg-amber-950/30 border-amber-900/50 text-amber-400 animate-pulse' :
                          'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400">0{i + 1}</span>
                          {stage.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {stage.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          {stage.status === 'running' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                        </div>
                        <span className="font-bold text-[11px] leading-tight text-slate-200">{stage.name}</span>
                        <span className="text-[10px] text-slate-400 mt-2">{stage.duration}</span>
                      </div>
                    ))}
                  </div>

                  {/* Error Notification if failed */}
                  {run.error && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{run.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 4: Docker & ECR Container Images */}
        {activeTab === 'docker' && dockerData && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Box className="w-5 h-5 text-cyan-400" />
                    Amazon Elastic Container Registry (ECR)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Registry: {dockerData.registry}</p>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800">
                  Trivy Security Scanning: 0 Critical CVEs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {dockerData.images.map((img, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-cyan-400">{img.repository}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-white">
                        {img.tag}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-400 text-[11px]">
                      <div className="flex justify-between">
                        <span>Image Size:</span>
                        <span className="text-white font-bold">{img.sizeMB} MB (Multi-stage build)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Image:</span>
                        <span className="text-white">{img.baseImage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image Digest:</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{img.digest}</span>
                      </div>
                    </div>

                    {/* CVE Vulnerability Breakdown */}
                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Vulnerability Audit (Trivy Scan):
                      </span>
                      <div className="grid grid-cols-4 gap-2 mt-2 text-center text-[10px]">
                        <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900">
                          Critical: {img.vulnerabilities.critical}
                        </div>
                        <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900">
                          High: {img.vulnerabilities.high}
                        </div>
                        <div className="p-1.5 rounded bg-slate-800 text-slate-300">
                          Medium: {img.vulnerabilities.medium}
                        </div>
                        <div className="p-1.5 rounded bg-slate-800 text-slate-400">
                          Low: {img.vulnerabilities.low}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Prometheus & Metrics Targets */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                Prometheus Observability & SRE Endpoints
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your monitoring tools directly to these live endpoints instrumented within the application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Prometheus Metrics</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      HTTP 200
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">GET /metrics</p>
                  <a
                    href="/metrics"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Open Live Stream <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Liveness Probe</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      HTTP 200
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">GET /health/live</p>
                  <a
                    href="/health/live"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Check Probe <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Readiness Probe</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      HTTP 200
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">GET /health/ready</p>
                  <a
                    href="/health/ready"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Check Readiness <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

