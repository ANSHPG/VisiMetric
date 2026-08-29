import React, { useRef, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import { uploadImage } from './services/api'
import axios from 'axios'

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 h-[64px] bg-surface-dark text-on-dark flex items-center justify-between px-[48px] shadow-sticky">
      <Link to="/" className="font-nvidia font-bold text-[20px] text-primary no-underline">VisiMetric</Link>
      <div className="flex gap-[24px]">
        <Link to="/" className="font-bold cursor-pointer hover:text-primary no-underline text-on-dark">Analyze</Link>
        <Link to="/history" className="font-bold cursor-pointer hover:text-primary no-underline text-on-dark">History</Link>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark-mute pt-[64px] pb-[32px] px-[48px] mt-auto">
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
      <section className="bg-surface-dark py-[80px] px-[48px] flex items-center justify-between">
        <div className="w-[50%]">
          <span className="text-[14px] font-bold text-primary uppercase block mb-[16px]">IMAGE QUALITY ASSESSMENT</span>
          <h1 className="text-[48px] font-bold text-on-dark leading-[1.25] mb-[24px]">See Every Flaw.<br/>Score Every Frame.</h1>
          <p className="text-[22px] text-on-dark-mute leading-[1.75] mb-[32px]">AI-powered image quality analysis. Detects blur, noise, exposure failures, and visual defects locally.</p>
          <div className="flex gap-[16px]">
            <button onClick={handleUploadClick} className="bg-primary text-on-primary h-[44px] px-[24px] rounded-sm font-bold text-[16px]">
              {loading ? 'Analyzing...' : 'Analyze an Image'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          {error && <p className="text-error mt-[16px] text-[14px] font-bold">{error}</p>}
        </div>
        <div className="w-[45%]">
          <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1280&auto=format&fit=crop" alt="AI Core" className="w-full h-auto rounded-sm object-cover" />
        </div>
      </section>

      <section className="py-[64px] px-[48px] max-w-[1280px] mx-auto">
        <h2 className="text-[36px] font-bold text-ink mb-[8px]">Analyze Your Image</h2>
        <span className="text-[14px] font-bold text-primary uppercase block mb-[32px]">UPLOAD & SCORE</span>
        
        <div onClick={handleUploadClick} className="border-2 border-dashed border-hairline hover:border-primary p-[32px] rounded-sm min-h-[240px] max-w-[640px] flex flex-col items-center justify-center cursor-pointer bg-surface-soft mx-auto">
          <div className="text-[40px] text-primary mb-[16px]">
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

function AnalysisResultPage() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
        try {
            const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })
            const response = await api.get(`/analyses/${id}`)
            setResult(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    fetchResult()
  }, [id])

  if (loading) return <div className="p-[48px] text-[20px] font-bold">Loading analysis...</div>
  if (!result) return <div className="p-[48px] text-[20px] font-bold text-error">Analysis not found.</div>

  return (
    <main className="min-h-screen bg-canvas">
      <section className="bg-surface-dark py-[64px] px-[48px] flex items-center justify-between">
        <div>
          <span className="text-[14px] font-bold text-mute uppercase block mb-[8px]">HISTORY / {result.filename}</span>
          <h1 className="text-[24px] font-bold text-on-dark">Analysis Complete</h1>
        </div>
        <div className={`px-[10px] py-[4px] rounded-sm text-[14px] font-bold uppercase text-white ${result.quality_label === 'ACCEPTABLE' ? 'bg-success-deep' : result.quality_label === 'DEGRADED' ? 'bg-warning' : 'bg-error'}`}>
          {result.quality_label}
        </div>
      </section>

      <section className="py-[64px] px-[48px] max-w-[1280px] mx-auto">
        <h2 className="text-[24px] font-bold text-ink mb-[32px]">Quality Score</h2>
        <div className="border border-hairline p-[32px] rounded-sm max-w-[480px] relative">
          <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-primary"></div>
          <span className="text-[14px] font-bold text-primary uppercase block mb-[16px]">QUALITY SCORE</span>
          <div className="text-[48px] font-bold text-ink mb-[16px]">{result.quality_score.toFixed(0)}</div>
          <div className="w-full bg-surface-soft h-[8px] rounded-sm mb-[8px]">
            <div className="h-full bg-primary rounded-sm" style={{width: `${result.quality_score}%`}}></div>
          </div>
          <div className="text-[12px] text-mute">out of 100</div>
        </div>

        <h2 className="text-[24px] font-bold text-ink mt-[64px] mb-[32px]">Detected Issues</h2>
        {result.issues && result.issues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {result.issues.map((issue, idx) => (
                    <div key={idx} className="border border-hairline p-[24px] rounded-sm relative">
                        <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-primary"></div>
                        <div className="flex gap-[8px] mb-[16px]">
                            <span className="px-[10px] py-[4px] rounded-sm text-[14px] font-bold uppercase bg-surface-soft text-body">{issue.type}</span>
                            <span className="px-[10px] py-[4px] rounded-sm text-[14px] font-bold uppercase bg-[#ffd4d4] text-error">{issue.severity}</span>
                        </div>
                        <h3 className="text-[17px] font-bold text-ink mb-[8px]">{issue.type} detected</h3>
                        <p className="text-[15px] text-body mb-[16px]">Confidence rating: {(issue.confidence * 100).toFixed(1)}%</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="border border-hairline p-[32px] rounded-sm">
                <h3 className="text-[20px] font-bold text-success-deep"><i className="fa-solid fa-check-circle mr-[8px]"></i>No issues detected</h3>
            </div>
        )}
      </section>
    </main>
  )
}

function HistoryPage() {
    return (
        <main className="min-h-screen bg-canvas p-[48px]">
            <h1 className="text-[36px] font-bold mb-[32px]">Analysis History</h1>
            <p className="text-[16px] text-mute">Recent evaluations will appear here.</p>
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
          <Route path="/analyze/:id" element={<AnalysisResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
