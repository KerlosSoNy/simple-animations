'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

// ─── Types ───────────────────────────────────────────────
interface View {
    bottom: number;
    height: number;
    camera?: THREE.PerspectiveCamera;
}

class SceneManager {
    public views: View[] = [
        { bottom: 0, height: 1 },
        { bottom: 0, height: 0 },
    ];
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public light: THREE.PointLight;
    public softLight: THREE.AmbientLight;
    public modelGroup: THREE.Group;
    private w = 0;
    private h = 0;

    constructor(model: THREE.Group) {
        // ── Renderer ──
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.prepend(this.renderer.domElement);

        // ── Scene ──
        this.scene = new THREE.Scene();

        // ── Cameras (two layers) ──
        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i];
            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            camera.position.set(0, 0, 180);
            camera.layers.disableAll();
            camera.layers.enable(i);
            camera.lookAt(0, 5, 0);
            view.camera = camera;
        }

        // ── Lights ──
        this.light = new THREE.PointLight(0xffffff, 0.75);
        this.light.position.set(70, -20, 150);
        this.scene.add(this.light);

        this.softLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(this.softLight);

        // ── Model + wireframe edges ──
        const mesh = model.children[0] as THREE.Mesh;
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x171511,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
        });
        const line = new THREE.LineSegments(edges, lineMat);
        line.position.set(0.5, 0.2, -1);

        // Assign layers: model on layer 0, wireframe on layer 1
        model.layers.set(0);
        line.layers.set(1);

        this.modelGroup = new THREE.Group();
        this.modelGroup.add(model);
        this.modelGroup.add(line);
        this.scene.add(this.modelGroup);

        // ── Resize ──
        this.onResize();
        window.addEventListener('resize', this.onResize);
    }

    public render = () => {
        for (const view of this.views) {
            const camera = view.camera!;
            const bottom = Math.floor(this.h * view.bottom);
            const height = Math.floor(this.h * view.height);

            this.renderer.setViewport(0, 0, this.w, this.h);
            this.renderer.setScissor(0, bottom, this.w, height);
            this.renderer.setScissorTest(true);

            camera.aspect = this.w / this.h;
            this.renderer.render(this.scene, camera);
        }
    };

    public onResize = () => {
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        for (const view of this.views) {
            const camera = view.camera!;
            camera.aspect = this.w / this.h;
            const camZ = (screen.width - this.w) / 3;
            camera.position.z = camZ < 180 ? 180 : camZ;
            camera.updateProjectionMatrix();
        }

        this.renderer.setSize(this.w, this.h);
        this.render();
    };

    // Cleanup
    public dispose() {
        window.removeEventListener('resize', this.onResize);
        this.renderer.dispose();
        document.body.removeChild(this.renderer.domElement);
    }
}

export default function PlaneScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const manager = new THREE.LoadingManager();
        const loader = new OBJLoader(manager);

        let loadedModel: THREE.Group | null = null;

        manager.onLoad = () => {
            if (!loadedModel) return;
            loadedModel.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mat = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        specular: 0xd0cbc7,
                        shininess: 5,
                        flatShading: true,
                    });
                    (child as THREE.Mesh).material = mat;
                }
            });

            // 2. Create SceneManager and start animation
            const scene = new SceneManager(loadedModel);
            setSceneManager(scene);
            setupAnimation(scene);
        };

        loader.load(
            'https://assets.codepen.io/557388/1405+Plane_1.obj',
            (obj) => { loadedModel = obj; },
            undefined,
            (err) => console.error('OBJ load error:', err)
        );

        function setupAnimation(scene: SceneManager) {
            const plane = scene.modelGroup;
            const tau = Math.PI * 2;

            // Initial state
            gsap.set(plane.rotation, { y: tau * -0.25 });
            gsap.set(plane.position, { x: 80, y: -32, z: -60 });

            // ── Multi‑view transitions ──
            gsap.fromTo(
                scene.views[1],
                { height: 1, bottom: 0 },
                {
                    height: 0,
                    bottom: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.blueprint',
                        scrub: true,
                        start: 'bottom bottom',
                        end: 'bottom top',
                    },
                }
            );
            gsap.fromTo(
                scene.views[1],
                { height: 0, bottom: 0 },
                {
                    height: 1,
                    bottom: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.blueprint',
                        scrub: true,
                        start: 'top bottom',
                        end: 'top top',
                    },
                }
            );

            // ── Parallax for ground/clouds ──
            gsap.to('.ground', {
                y: '30%',
                scrollTrigger: {
                    trigger: '.ground-container',
                    scrub: true,
                    start: 'top bottom',
                    end: 'bottom top',
                },
            });
            gsap.from('.clouds', {
                y: '25%',
                scrollTrigger: {
                    trigger: '.ground-container',
                    scrub: true,
                    start: 'top bottom',
                    end: 'bottom top',
                },
            });

            // ── SVG draw animations ──
            const drawConfigs = [
                { id: '#line-length', trigger: '.length', start: 'top bottom', end: 'top top' },
                { id: '#line-wingspan', trigger: '.wingspan', start: 'top 25%', end: 'bottom 50%' },
                { id: '#circle-phalange', trigger: '.phalange', start: 'top 50%', end: 'bottom 100%' },
            ];
            for (const cfg of drawConfigs) {
                gsap.to(cfg.id, {
                    drawSVG: 100,
                    scrollTrigger: {
                        trigger: cfg.trigger,
                        scrub: true,
                        start: cfg.start,
                        end: cfg.end,
                    },
                });
                // Fade out later
                gsap.to(cfg.id, {
                    opacity: 0,
                    drawSVG: 0,
                    scrollTrigger: {
                        trigger: cfg.trigger,
                        scrub: true,
                        start: 'top top',
                        end: 'bottom top',
                    },
                });
            }

            // ── Main timeline ──
            const tl = gsap.timeline({
                onUpdate: scene.render,
                scrollTrigger: {
                    trigger: '.content',
                    scrub: true,
                    start: 'top top',
                    end: 'bottom bottom',
                },
                defaults: { duration: 1, ease: 'power2.inOut' },
            });

            let delay = 0;
            const sectionDuration = 1;

            // Fade scroll CTA
            tl.to('.scroll-cta', { duration: 0.25, opacity: 0 }, delay);
            tl.to(plane.position, { x: -10, ease: 'power1.in' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: -tau * 0.05, ease: 'power1.inOut' }, delay);
            tl.to(plane.position, { x: -40, y: 0, z: -60, ease: 'power1.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: tau * 0.05, ease: 'power3.inOut' }, delay);
            tl.to(plane.position, { x: 40, y: 0, z: -60, ease: 'power2.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.2, y: 0, z: -tau * 0.1, ease: 'power3.inOut' }, delay);
            tl.to(plane.position, { x: -40, y: 0, z: -30, ease: 'power2.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: 0, z: 0, y: tau * 0.25 }, delay);
            tl.to(plane.position, { x: 0, y: -10, z: 50 }, delay);
            delay += sectionDuration * 2;

            tl.to(plane.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: 'power4.inOut' }, delay);
            tl.to(plane.position, { z: 30, ease: 'power4.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: 'power4.inOut' }, delay);
            tl.to(plane.position, { z: 60, x: 30, ease: 'power4.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.35, y: tau * 0.75, z: tau * 0.6, ease: 'power4.inOut' }, delay);
            tl.to(plane.position, { z: 100, x: 20, y: 0, ease: 'power4.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { x: tau * 0.15, y: tau * 0.85, z: 0, ease: 'power1.in' }, delay);
            tl.to(plane.position, { z: -150, x: 0, y: 0, ease: 'power1.inOut' }, delay);
            delay += sectionDuration;

            tl.to(plane.rotation, { duration: sectionDuration, x: -tau * 0.05, y: tau, z: -tau * 0.1, ease: 'none' }, delay);
            tl.to(plane.position, { duration: sectionDuration, x: 0, y: 30, z: 320, ease: 'power1.in' }, delay);
            tl.to(scene.light.position, { duration: sectionDuration, x: 0, y: 0, z: 0 }, delay);
        }

        // Cleanup on unmount
        return () => {
            if (sceneManager) {
                sceneManager.dispose();
                ScrollTrigger.getAll().forEach((st) => st.kill());
            }
        };
    }, []);

    // ─── Render DOM (SVG + trigger sections) ───
    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {/* The canvas will be appended by Three.js */}

            {/* SVG Draw elements - these are referenced by GSAP */}
            <svg
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10,
                    opacity: 0,
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <line
                    id="line-length"
                    x1="10"
                    y1="50"
                    x2="90"
                    y2="50"
                    stroke="#fff"
                    strokeWidth="1"
                    strokeDasharray="0 100"
                />
                <line
                    id="line-wingspan"
                    x1="20"
                    y1="20"
                    x2="80"
                    y2="80"
                    stroke="#fff"
                    strokeWidth="1"
                    strokeDasharray="0 100"
                />
                <circle
                    id="circle-phalange"
                    cx="50"
                    cy="50"
                    r="20"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1"
                    strokeDasharray="0 314"
                />
            </svg>

            {/* Dummy sections for scroll triggers */}
            <div className="blueprint" style={{ height: '100vh', background: 'transparent' }} />
            <div className="ground-container" style={{ height: '200vh', background: 'transparent' }}>
                <div className="ground" style={{ height: '50vh', background: 'rgba(0,0,0,0.1)' }} />
                <div className="clouds" style={{ height: '50vh', background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="length" style={{ height: '100vh', background: 'transparent' }} />
            <div className="wingspan" style={{ height: '100vh', background: 'transparent' }} />
            <div className="phalange" style={{ height: '100vh', background: 'transparent' }} />
            <div className="content" style={{ height: '300vh', background: 'transparent' }} />

            {/* Scroll CTA */}
            <div
                className="scroll-cta"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    fontSize: '1.2rem',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: 20,
                }}
            >
                ↓ Scroll to fly
            </div>


            <style>{`
        body {
          margin: 0;
          background: #0b0d1a;
          color: #fff;
          overflow-x: hidden;
          font-family: sans-serif;
        }
        canvas {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 0;
        }
        .scroll-cta {
          transition: opacity 0.5s;
        }
        .loading {
          transition: opacity 0.5s;
        }
        .ground, .clouds {
          transition: transform 0.1s;
        }
        svg line, svg circle {
          stroke: rgba(255,255,255,0.3);
        }
      `}</style>
        </div>
    );
}