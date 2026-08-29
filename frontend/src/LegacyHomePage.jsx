import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from './services/api'
import axios from 'axios'

function HomePage() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
        const result = await uploadImage(file)
        navigate(`/analyze/${result.id}`)
    } catch (err) {
        setError(err.response?.data?.detail || 'Failed to upload image')
    } finally {
        setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-canvas">
      <section className="relative bg-surface-dark px-[48px] h-[calc(100vh-64px)] flex items-center justify-between overflow-hidden">
        <div className="w-[50%] z-10">
          <span className="text-[14px] font-bold text-primary uppercase block mb-[16px]">IMAGE QUALITY ASSESSMENT</span>
          <h1 className="text-[48px] font-bold text-on-dark leading-[1.25] mb-[24px]">See Every Flaw.<br/>Score Every Frame.</h1>
          <p className="text-[22px] text-on-dark-mute leading-[1.75] mb-[32px]">AI-powered image quality analysis. Detects blur, noise, exposure failures, and visual defects locally.</p>
          <div className="flex gap-[16px]">
            <button onClick={handleUploadClick} className="bg-primary text-on-primary h-[44px] px-[24px] rounded-sm font-bold text-[16px] hover:bg-primary-dark transition-colors">
              {loading ? 'Analyzing...' : 'Analyze an Image'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          {error && <p className="text-error mt-[16px] text-[14px] font-bold">{error}</p>}
        </div>
        <div className="w-[45%] h-full flex items-center justify-center py-[64px] z-10">
          <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1280&auto=format&fit=crop" alt="AI Core" className="w-full h-full max-h-[60vh] object-cover rounded-sm shadow-[0_0_40px_rgba(118,185,0,0.2)]" />
        </div>
        
        <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-on-dark-mute">
          <span className="text-[12px] font-bold uppercase tracking-widest mb-[8px]">Scroll Down</span>
          <i className="fa-solid fa-chevron-down text-primary"></i>
        </div>
      </section>

      <section className="py-[120px] px-[48px] max-w-[1280px] mx-auto min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-[36px] font-bold text-ink mb-[8px] text-center">Analyze Your Image</h2>
        <span className="text-[14px] font-bold text-primary uppercase block mb-[48px] text-center">UPLOAD & SCORE</span>
        
        <div onClick={handleUploadClick} className="border-2 border-dashed border-hairline hover:border-primary p-[32px] rounded-sm min-h-[280px] w-full max-w-[640px] flex flex-col items-center justify-center cursor-pointer bg-surface-soft mx-auto transition-colors">
          <div className="text-[48px] text-primary mb-[16px]">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 className="text-[20px] font-bold text-ink mb-[8px]">Drop your image here</h3>
          <p className="text-[15px] text-mute mb-[16px]">or click to browse — JPG, PNG, WebP up to 20 MB</p>
          {loading && <div className="w-full bg-hairline h-[4px] mt-[16px] rounded-full overflow-hidden max-w-[300px]"><div className="bg-primary h-full w-[50%] animate-pulse"></div></div>}
        </div>
      </section>
    </main>
  )
}



export default HomePage