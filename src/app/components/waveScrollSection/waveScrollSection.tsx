"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
    { id: "intro", label: "Intro", color: "#0f172a" },
    { id: "services", label: "Services", color: "#134e4a" },
    { id: "work", label: "Work", color: "#312e81" },
    { id: "contact", label: "Contact", color: "#7c2d12" },
];

export default function WaveScrollSections() {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const dotLottieRef = useRef(null);
    const totalFramesRef = useRef(0);
    const stRef: any = useRef(null);

    useEffect(() => {
        const container: any = containerRef.current;
        const track: any = trackRef.current;
        const panels = gsap.utils.toArray(".wave-panel", track);

        const ctx = gsap.context(() => {
            // total horizontal distance to travel = track width - viewport width
            const getScrollDistance = () => track.scrollWidth - window.innerWidth;

            // The single authoritative tween driving horizontal movement.
            const mainTween = gsap.to(track, {
                x: () => -getScrollDistance(),
                ease: "none",
            });

            const st = ScrollTrigger.create({
                trigger: container,
                start: "top top",
                end: () => `+=${getScrollDistance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                animation: mainTween,
                onUpdate: (self) => {
                    const dotLottie: any = dotLottieRef.current;
                    const totalFrames = totalFramesRef.current;
                    if (!dotLottie || !totalFrames) return;

                    const frame = self.progress * (totalFrames - 1);
                    dotLottie.setFrame(frame);
                },
            });
            stRef.current = st;
            panels.forEach((panel: any) => {
                gsap.fromTo(
                    panel,
                    { opacity: 0.4, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: mainTween,
                            start: "left center",
                            end: "200px center",
                            scrub: true,
                        },
                    }
                );
            });

            return () => st.kill();
        }, container);

        return () => ctx.revert();
    }, []);

    const handleDotLottieRef = (dotLottie: any) => {
        if (!dotLottie) return;
        dotLottieRef.current = dotLottie;
        dotLottie.addEventListener("load", () => {
            totalFramesRef.current = dotLottie.totalFrames;
            dotLottie.setFrame(0);
            dotLottie.pause();
            ScrollTrigger.refresh();
        });
    };

    return (
        <>
            <div className="w-screen h-screen bg-green-500" />
            <div ref={containerRef} style={{ position: "relative", overflow: "hidden" }}>
                {/* Wave divider — scrubbed by scroll progress, not autoplaying */}
                <DotLottieReact
                    src="wave-effect.json"
                    autoplay={false}
                    loop={false}
                    dotLottieRefCallback={handleDotLottieRef}
                    className="absolute w-screen!"
                />

                <div
                    ref={trackRef}
                    style={{
                        display: "flex",
                        height: "100vh",
                        width: `${PANELS.length * 100}vw`,
                    }}
                >
                    {PANELS.map((panel) => (
                        <section
                            key={panel.id}
                            className="wave-panel"
                            style={{
                                width: "100vw",
                                height: "100vh",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: panel.color,
                                color: "#fff",
                                fontSize: "3rem",
                                fontWeight: 500,
                            }}
                        >
                            {panel.label}
                        </section>
                    ))}
                </div>
            </div>
            <div className="w-screen h-screen bg-green-500" />
        </>
    );
}