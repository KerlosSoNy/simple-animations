'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Playfair_Display, Inter, DM_Sans } from 'next/font/google';
import { panels } from './Panels';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '600'],
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
});

export default function MagazinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);

    useGSAP(
        () => {
            const container = containerRef.current;
            const track = trackRef.current;
            if (!container || !track) return;

            const tween = gsap.to(track, {
                x: () => -calcPanelsWidth(),
                ease: 'none',
            });

            const panelElements = gsap.utils.toArray<HTMLElement>('.panel', track);
            const calcPanelsWidth = () =>
                panelElements.reduce(
                    (prev, panel) => prev + panel.offsetWidth,
                    0
                ) - container.offsetWidth;

            const progressEl = document.getElementById('magazine-progress');
            const progressFill = progressEl?.querySelector(
                '.progress-fill'
            ) as HTMLElement | null;

            ScrollTrigger.create({
                trigger: container,
                start: 'top top',
                end: () => `${calcPanelsWidth()}`,
                pinSpacing: true,
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    if (progressFill) {
                        progressFill.style.width = `${self.progress * 100}%`;
                    }
                    const total = panelElements.length;
                    const rawIndex = self.progress * (total - 1);
                    const index = Math.round(rawIndex);
                    const clamped = Math.min(Math.max(index, 0), total - 1);
                    setCurrentIndex(clamped);
                },
                animation: tween,
                snap: {
                    snapTo: 1 / (panelElements.length - 1),
                    duration: 0.6,
                    delay: 0.05,
                    ease: 'power2.out',
                },
            });

            panelElements.forEach((panel) => {
                const title = panel.querySelector('.panel-title');
                const subtitle = panel.querySelector('.panel-subtitle');
                const meta = panel.querySelector('.panel-meta');

                gsap.fromTo(
                    [title, subtitle, meta],
                    {
                        y: -300,
                        opacity: 0,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: tween,
                            start: 'left center',
                            end: 'right center',
                            scrub: 1,
                            invalidateOnRefresh: true,
                        },
                    }
                );
            });
            tween.progress(0);
            ScrollTrigger.refresh();

            return () => {
                tween.kill();
                ScrollTrigger.getAll().forEach((st) => st.kill());
            };
        },
        { scope: containerRef }
    );

    return (
        <div className="relative w-full overflow-hidden bg-[#0a0a0a] font-sans">
            <div
                id="magazine-progress"
                className="fixed top-0 left-0 z-50 w-full h-0.5 bg-white/10"
            >
                <div
                    className="progress-fill h-full bg-linear-to-r from-amber-400 via-rose-400 to-purple-400 transition-all duration-200"
                    style={{ width: '0%' }}
                />
            </div>

            <div className="fixed bottom-8 right-8 z-40">
                <div
                    className={`${inter.className} text-white/60 text-sm tracking-[0.3em] font-light flex items-center gap-2`}
                >
                    <span className="text-white/80">
                        0{currentIndex + 1}
                    </span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/30">
                        {String(panels.length).padStart(2, '0')}
                    </span>
                </div>
            </div>

            <div className="fixed top-6 left-8 z-40 hidden md:block">
                <div
                    className={`${playfair.className} text-white/40 text-xl tracking-[0.4em] font-light`}
                >
                    <span className="text-white/80">M</span>AGAZINE
                </div>
            </div>

            {/* ── Scroll Indicator ────────────────────────────── */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 md:hidden">
                <span
                    className={`${inter.className} text-white/30 text-[10px] tracking-[0.2em] uppercase`}
                >
                    Scroll
                </span>
                <div className="w-px h-8 bg-linear-to-b from-white/30 to-transparent animate-pulse" />
            </div>

            <div
                ref={containerRef}
                className="relative w-full h-screen flex overflow-hidden"
            >
                <div
                    ref={trackRef}
                    className="flex h-full w-max will-change-transform"
                >
                    {panels.map((panel, index) => {
                        // Determine text alignment classes
                        let textAlignClass = 'items-center justify-center';
                        let textWrapperClass = 'text-center max-w-3xl';
                        let titleSize = 'text-5xl md:text-7xl lg:text-8xl';

                        if (panel.layout === 'bottom-left') {
                            textAlignClass =
                                'items-end justify-start pb-16 md:pb-20 pl-8 md:pl-16';
                            textWrapperClass = 'text-left max-w-2xl';
                            titleSize = 'text-4xl md:text-6xl lg:text-7xl';
                        } else if (panel.layout === 'right') {
                            textAlignClass =
                                'items-center justify-end pr-8 md:pr-16';
                            textWrapperClass = 'text-right max-w-2xl';
                            titleSize = 'text-4xl md:text-6xl lg:text-7xl';
                        } else if (panel.layout === 'center-bottom') {
                            textAlignClass =
                                'items-end justify-center pb-16 md:pb-24';
                            textWrapperClass = 'text-center max-w-3xl';
                            titleSize = 'text-4xl md:text-6xl lg:text-7xl';
                        } else if (panel.layout === 'left') {
                            textAlignClass =
                                'items-center justify-start pl-8 md:pl-16';
                            textWrapperClass = 'text-left max-w-2xl';
                            titleSize = 'text-4xl md:text-6xl lg:text-7xl';
                        } else if (panel.layout === 'bottom-right') {
                            textAlignClass =
                                'items-end justify-end pb-16 md:pb-20 pr-8 md:pr-16';
                            textWrapperClass = 'text-right max-w-2xl';
                            titleSize = 'text-4xl md:text-6xl lg:text-7xl';
                        }

                        return (
                            <div
                                key={panel.id}
                                className="panel relative h-screen w-screen shrink-0 overflow-hidden"
                            >
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        fill
                                        src={panel.image}
                                        alt={panel.title}
                                        className="h-full w-full object-cover"
                                        loading={
                                            index === 0 ? 'eager' : 'lazy'
                                        }
                                    />
                                    <div
                                        className={`absolute inset-0 bg-linear-to-t ${panel.overlay}`}
                                    />
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.4)_100%)]" />
                                </div>

                                <div
                                    className={`relative z-10 flex h-full w-full px-6 ${textAlignClass}`}
                                >
                                    <div className={`${textWrapperClass}`}>
                                        <div
                                            className={`${inter.className} flex items-center gap-4 text-white/60 text-xs md:text-sm tracking-[0.25em] uppercase mb-4 md:mb-6`}
                                        >
                                            <span>{panel.category}</span>
                                            <span className="w-6 h-px bg-white/20" />
                                            <span>Issue {panel.issue}</span>
                                        </div>

                                        <h1
                                            className={`${playfair.className} ${titleSize} font-bold leading-[1.05] tracking-[-0.02em] text-white mb-3 md:mb-4 panel-title`}
                                        >
                                            {panel.title}
                                        </h1>

                                        <p
                                            className={`${inter.className} text-base md:text-xl text-white/70 font-light leading-relaxed max-w-xl panel-subtitle ${panel.layout === 'center' ||
                                                panel.layout === 'center-bottom'
                                                ? 'mx-auto'
                                                : ''
                                                }`}
                                        >
                                            {panel.subtitle}
                                        </p>

                                        <div
                                            className={`${dmSans.className} mt-4 md:mt-6 flex items-center gap-3 text-white/40 text-xs md:text-sm tracking-wide panel-meta`}
                                        >
                                            <span className="w-6 h-px bg-white/20" />
                                            <span>{panel.author}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* <div
                                    className={`${inter.className} absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 text-white/20 text-xs tracking-[0.2em] font-light`}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </div> */}

                                <div
                                    className={`absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}