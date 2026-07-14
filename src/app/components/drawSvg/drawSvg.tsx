'use client';
import PlaneScene from '../plane';
export default function SVGDrawOnScroll() {


    return (
        <div id="drawSvg" className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
            <PlaneScene />
        </div>
    );
}