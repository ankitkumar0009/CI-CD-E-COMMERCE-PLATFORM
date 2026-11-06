import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { ShoppingBag, Activity, ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export const Hero3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 3D Objects: Cybernetic Core (Icosahedron + Wireframe + Particle Field)
    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      shininess: 100
    });
    const coreMesh = new THREE.Mesh(geometry, material);
    scene.add(coreMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Floating Ambient Particles
    const particlesCount = 350;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight2.position.set(-5, -5, -2);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Constant gentle rotation
      coreMesh.rotation.x += 0.003;
      coreMesh.rotation.y += 0.005;

      innerMesh.rotation.x -= 0.004;
      innerMesh.rotation.y -= 0.006;

      particleSystem.rotation.y += 0.001;

      // Mouse tracking interpolation
      coreMesh.rotation.y += (mouseX * 0.5 - coreMesh.rotation.y) * 0.05;
      coreMesh.rotation.x += (-mouseY * 0.5 - coreMesh.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live DevOps Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Production E-Commerce Platform</span>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <span className="font-mono">AWS EKS &bull; CI/CD &bull; SRE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Cloud-Native Shopping with{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Production-Grade
              </span>{' '}
              DevOps
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience modern electronics and tech retail powered by a fully automated CI/CD pipeline, Kubernetes autoscaling, Docker multi-stage builds, and Prometheus observability.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Catalog & Shop
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              
              <Link
                to="/devops"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 shadow-md flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-emerald-500" />
                DevOps Dashboard
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">99.99%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High Availability SLA</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">Zero</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Downtime Rolling Updates</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">3-AZ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kubernetes Cluster (EKS)</p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Canvas with Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Three.js Canvas Container */}
            <div 
              ref={mountRef} 
              className="w-full h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing relative"
            />

            {/* Floating Glassmorphism Badge 1: AWS EKS Status */}
            <div className="absolute top-4 -left-2 sm:left-4 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-xl flex items-center gap-3 animate-float pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">AWS Infrastructure</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  EKS Cluster v1.30 (Multi-AZ)
                </p>
              </div>
            </div>

            {/* Floating Glassmorphism Badge 2: CI/CD Pipeline */}
            <div className="absolute bottom-6 -right-2 sm:right-4 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-xl flex items-center gap-3 animate-float [animation-delay:2s] pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">CI/CD Pipeline</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Rolling Deployment Ready
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

