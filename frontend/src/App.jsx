import React from 'react'
import { Routes, Route } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 h-[64px] bg-surface-dark text-on-dark flex items-center justify-between px-[48px] shadow-sticky">
      <div className="font-nvidia font-bold text-[20px] text-primary">VisiMetric</div>
      <div className="flex gap-[24px]">
        <span className="font-bold cursor-pointer hover:text-primary">Analyze</span>
        <span className="font-bold cursor-pointer hover:text-primary">History</span>
      </div>
      <button className="bg-primary text-on-primary h-[44px] px-[24px] rounded-sm font-bold text-[16px]">Upload Image</button>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark-mute pt-[64px] pb-[32px] px-[48px]">
      <div className="grid grid-cols-4 gap-[24px] mb-[64px]">
        <div>
          <h4 className="text-on-dark font-bold mb-[16px]">VisiMetric</h4>
          <p className="mb-[8px] cursor-pointer hover:text-white">About</p>
          <p className="mb-[8px] cursor-pointer hover:text-white">GitHub</p>
        </div>
        <div>
          <h4 className="text-on-dark font-bold mb-[16px]">API</h4>
          <p className="mb-[8px] cursor-pointer hover:text-white">Analyze Endpoint</p>
          <p className="mb-[8px] cursor-pointer hover:text-white">Health Check</p>
        </div>
      </div>
      <div className="border-t border-hairline-strong pt-[24px] text-[10px] text-mute uppercase">
        Built by Anshuman Pattnaik
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-surface-dark py-[80px] px-[48px]">
        <div className="max-w-[1280px] mx-auto flex">
          <div className="w-[55%]">
            <span className="text-[14px] font-bold text-primary uppercase block mb-[16px]">IMAGE QUALITY ASSESSMENT</span>
            <h1 className="text-[48px] font-bold text-on-dark leading-[1.25] mb-[24px]">See Every Flaw. Score Every Frame.</h1>
            <p className="text-[22px] text-on-dark-mute leading-[1.75] mb-[32px]">AI-powered image quality analysis. Detects blur, noise, exposure failures, and visual defects.</p>
            <div className="flex gap-[16px]">
              <button className="bg-primary text-on-primary h-[44px] px-[24px] rounded-sm font-bold text-[16px]">Analyze an Image</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
