'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { PANELS } from './panels';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function RotatingPanels() {
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const [activePanel, setActivePanel] = useState(0);

    const panelCount = PANELS.length;

    useGSAP(() => {
        if (!containerRef.current || panelCount === 0) return;

        const st = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${(panelCount - 1) * 600}%`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const t = 1 + progress * (panelCount - 1);

                panelRefs.current.forEach((panel, i) => {
                    if (!panel) return;
                    const local = t - i;
                    const dist = Math.abs(local - 1);
                    const opacity = gsap.utils.clamp(0, 1, 1 - dist * 1.5);

                    gsap.set(panel, {
                        opacity,
                        zIndex: Math.round(opacity * 100),
                        pointerEvents: opacity > 0.9 ? 'auto' : 'none',
                        // scale: 0.8 + opacity * 0.2,
                    });
                });

                setActivePanel(Math.round(progress * (panelCount - 1)));
            },
        });

        scrollTriggerRef.current = st;
        document.fonts.ready.then(() => ScrollTrigger.refresh());

        return () => st.kill();

    }, { scope: containerRef, dependencies: [panelCount] });

    const scrollToPanel = useCallback((i: number) => {
        const st = scrollTriggerRef.current;
        if (!st) return;

        const targetProgress = i / (panelCount - 1);

        gsap.to(window, {
            scrollTo: {
                y: st.start + targetProgress * (st.end - st.start),
                autoKill: false
            },
            duration: 1.5,
            ease: 'power3.inOut',
            overwrite: true
        });
    }, [panelCount]);

    return (
        <div>
            <section className="h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 text-white">
                <div className="text-center">
                    <h1 className="text-6xl font-bold mb-4">Scroll to Explore</h1>
                    <p className="text-xl text-gray-300">A journey through stories and landscapes</p>
                </div>
            </section>

            <section
                ref={containerRef}
                className="relative z-20 h-screen w-full overflow-hidden bg-slate-900"
                style={{ perspective: '1500px' }}
            >
                <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                    {PANELS.map((panel, i) => (
                        <div
                            key={panel.label}
                            ref={(el) => { panelRefs.current[i] = el; }}
                            className="absolute inset-0"
                            style={{
                                transformStyle: 'preserve-3d',
                                backfaceVisibility: 'hidden',
                                transformOrigin: 'center center',
                            }}
                        >
                            <div className="w-full h-full relative">
                                <Image
                                    src={panel.image}
                                    alt={panel.title}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                    priority={i === 0}
                                />
                                <div className={`absolute inset-0 bg-linear-to-br ${panel.color}`} />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content overlay with glass morphism effect */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className=" bg-black/20 rounded-3xl p-8 md:p-12 border border-white/10">
                            <span className="text-sm uppercase tracking-widest mb-4 block text-white/80">
                                Chapter {activePanel + 1} of {panelCount}
                            </span>
                            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
                                {PANELS[activePanel].title}
                            </h2>
                            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                                {PANELS[activePanel].description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation dots */}
                <div className="absolute bottom-1/2 right-4 md:right-8 -translate-y-1/2 flex flex-col gap-3 z-30">
                    {PANELS.map((panel, i) => (
                        <button
                            key={panel.label}
                            onClick={() => scrollToPanel(i)}
                            className="group relative"
                            aria-label={`Go to ${panel.label}`}
                        >
                            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${activePanel === i
                                ? 'bg-white scale-125 shadow-lg shadow-white/50'
                                : 'bg-white/50 hover:bg-white/80 backdrop-blur-sm'
                                }`} />
                            {/* Tooltip on hover */}
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                                {panel.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                    <span className="text-sm text-white/70 backdrop-blur-sm px-3 py-1 rounded-full bg-black/20">
                        Scroll to navigate
                    </span>
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
                        <div className="w-1.5 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
                    </div>
                </div>
            </section>

            <section className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-800 to-slate-900 text-white">
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">The End</h2>
                    <p className="text-xl text-gray-400">Every ending is a new beginning</p>
                </div>
            </section>
        </div>
    );
}