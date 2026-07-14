import React from 'react'
import HorizontalScroll from '../components/horizontal/HorizontalScroll'

export default function page() {
    return (
        <div className="flex flex-col">
            <section className="h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 text-white">
                <div className="text-center">
                    <h1 className="text-6xl font-bold mb-4">Scroll to Explore</h1>
                    <p className="text-xl text-gray-300">A journey through stories and landscapes</p>
                </div>
            </section>
            <HorizontalScroll />
            <section className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-800 to-slate-900 text-white">
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">The End</h2>
                    <p className="text-xl text-gray-400">Every ending is a new beginning</p>
                </div>
            </section>
        </div>
    )
}
