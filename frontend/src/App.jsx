import React, { useRef, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import { uploadImage } from './services/api'
import axios from 'axios'

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 h-[64px] bg-[#76b900] text-black flex items-center justify-between px-[48px] shadow-sm">
      <Link to="/" className="font-nvidia font-bold text-[24px] text-black no-underline tracking-wide hover:opacity-80 transition-opacity">VISIMETRIC</Link>
      <div className="flex gap-[32px]">
        <Link to="/products" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">Products</Link>
        <Link to="/solutions" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">Solutions</Link>
        <Link to="/history" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">History</Link>
        
      </div>
      <div className="flex gap-[24px] text-[18px]">
        <i className="fa-solid fa-magnifying-glass cursor-pointer hover:text-white transition-colors"></i>
        <i className="fa-regular fa-user cursor-pointer hover:text-white transition-colors"></i>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-[#111] text-[#ccc] pt-[80px] pb-[40px] px-[48px] mt-auto border-t border-[#333]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px] mb-[64px]">
          <div>
            <h4 className="text-white font-bold mb-[24px] text-[18px]">Corporate Information</h4>
            <Link to="/about" className="block mb-[12px] cursor-pointer text-[#ccc] hover:text-[#76b900] transition-colors text-[14px] no-underline">About VisiMetric</Link>
            <Link to="/policies" className="block mb-[12px] cursor-pointer text-[#ccc] hover:text-[#76b900] transition-colors text-[14px] no-underline">Corporate Policies</Link>
            <a href="https://github.com/ANSHPG/VisiMetric" target="_blank" rel="noreferrer" className="block mb-[12px] cursor-pointer text-[#ccc] hover:text-[#76b900] transition-colors text-[14px] no-underline">GitHub Repository</a>
          </div>
        </div>
        <div className="border-t border-[#333] pt-[32px] flex items-center justify-between text-[12px]">
          <div className="flex gap-[24px]">
            <span className="text-[#76b900] font-bold">India</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Manage My Privacy</span>
            <span className="hover:text-white cursor-pointer">Legal</span>
          </div>
          <div>
            Copyright 2026 VisiMetric Corporation
          </div>
        </div>
      </div>
    </footer>
  )
}

function SolutionsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">VisiMetric Solutions</h1>
        <p className="text-[18px] text-gray-400 mb-[48px] max-w-[800px]">
          Discover how VisiMetric provides enterprise-grade AI image diagnostics across multiple industries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
            <div className="bg-[#1a1a1a] p-[40px] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors cursor-pointer">
                <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Healthcare Imaging</h3>
                <p className="text-gray-400 leading-relaxed">Ensure automated visual quality checks on X-ray and MRI outputs before they reach diagnosticians. VisiMetric removes blurs and exposure artifacts from your pipeline instantly.</p>
            </div>
            <div className="bg-[#1a1a1a] p-[40px] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors cursor-pointer">
                <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">E-Commerce Moderation</h3>
                <p className="text-gray-400 leading-relaxed">Automatically reject poorly lit, heavily distorted, or heavily compressed merchant uploads to maintain a pristine, high-conversion storefront.</p>
            </div>
            <div className="bg-[#1a1a1a] p-[40px] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors cursor-pointer">
                <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Autonomous Vehicles</h3>
                <p className="text-gray-400 leading-relaxed">Filter degraded telemetry camera feeds in real-time. If a camera lens becomes occluded or severely noisy, the system seamlessly triggers fallback safety logic.</p>
            </div>
        </div>
    </main>
  )
}

function ProductsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">VisiMetric Products</h1>
        <p className="text-[18px] text-gray-400 mb-[48px] max-w-[800px]">
          Our core technologies powering the next generation of visual telemetry.
        </p>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm flex flex-col md:flex-row gap-[48px] items-center mb-[32px] hover:border-[#76b900] transition-colors">
            <div className="flex-1">
                <h3 className="text-[32px] font-bold text-white mb-[16px]">VisiMetric AI Core</h3>
                <p className="text-gray-400 mb-[24px] text-[18px] leading-relaxed">A Continuous Float Regression neural network built on PyTorch, bounded by Sigmoid activations for flawless 0-100 quality scoring.</p>
                <Link to="/" className="text-black bg-[#76b900] px-[24px] py-[12px] font-bold rounded-sm no-underline hover:bg-white transition-colors inline-block mt-[16px]">Test Core Now</Link>
            </div>
            <div className="flex-1">
                <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" className="w-full h-auto rounded-sm" alt="Product Core"/>
            </div>
        </div>
    </main>
  )
}

function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-[#76b900]">About VisiMetric</h1>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm max-w-[800px]">
            <p className="text-gray-300 text-[18px] leading-relaxed mb-[24px]">
              VisiMetric was founded to solve a singular problem: automating human-level perception of image degradation at scale. 
            </p>
            <p className="text-gray-300 text-[18px] leading-relaxed">
              By merging deterministic OpenCV pipelines with deep neural networks trained on over 20,000 empirical images, we provide enterprise-ready vision diagnostics.
            </p>
        </div>
    </main>
  )
}

function PoliciesPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">Corporate Policies</h1>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm max-w-[1000px]">
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Privacy & Telemetry</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed mb-[32px]">Images uploaded to VisiMetric servers are processed entirely in memory via the FastAPI backend and instantly discarded after metrics extraction. We do not persist raw image binary data.</p>
            
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Open Source Commitment</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed">Our PyTorch training algorithms and datasets (KADID-10k and KonIQ-10k mappings) are transparent and available to researchers on our GitHub repository.</p>
        </div>
    </main>
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

  if (loading) return <div className="p-[48px] text-[20px] font-bold bg-black text-white min-h-screen">Loading analysis...</div>
  if (!result) return <div className="p-[48px] text-[20px] font-bold text-red-500 bg-black min-h-screen">Analysis not found.</div>

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <section className="bg-[#111] border-b border-[#333] py-[64px] px-[48px] flex items-center justify-between">
        <div>
          <span className="text-[14px] font-bold text-gray-400 uppercase block mb-[8px]">HISTORY / {result.filename}</span>
          <h1 className="text-[32px] font-bold text-white">Analysis Diagnostics Complete</h1>
        </div>
        <div className={`px-[16px] py-[8px] rounded-sm text-[16px] font-bold uppercase text-black ${result.quality_label === 'ACCEPTABLE' ? 'bg-[#76b900]' : result.quality_label === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'}`}>
          {result.quality_label}
        </div>
      </section>

      <section className="py-[64px] px-[48px] max-w-[1400px] mx-auto">
        <h2 className="text-[24px] font-bold text-white mb-[32px]">Quality Score</h2>
        <div className="bg-[#1a1a1a] border border-[#333] p-[48px] rounded-sm max-w-[480px] relative">
          <div className="absolute top-0 left-0 w-[16px] h-[16px] bg-[#76b900]"></div>
          <span className="text-[14px] font-bold text-[#76b900] uppercase block mb-[16px]">VisiMetric AI Score</span>
          <div className="text-[64px] font-bold text-white mb-[16px] leading-none">{result.quality_score.toFixed(0)}</div>
          <div className="w-full bg-[#333] h-[8px] rounded-sm mb-[16px]">
            <div className="h-full bg-[#76b900] rounded-sm" style={{width: `${result.quality_score}%`}}></div>
          </div>
          <div className="text-[14px] text-gray-400 font-bold uppercase">out of 100</div>
        </div>

        <h2 className="text-[24px] font-bold text-white mt-[80px] mb-[32px]">Detected Architectural Issues</h2>
        {result.issues && result.issues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                {result.issues.map((issue, idx) => (
                    <div key={idx} className="bg-[#1a1a1a] border border-[#333] p-[32px] rounded-sm relative hover:border-[#76b900] transition-colors">
                        <div className="absolute top-0 left-0 w-[16px] h-[16px] bg-[#76b900]"></div>
                        <div className="flex gap-[12px] mb-[24px]">
                            <span className="px-[12px] py-[4px] rounded-sm text-[12px] font-bold uppercase bg-[#333] text-white">{issue.type}</span>
                            <span className="px-[12px] py-[4px] rounded-sm text-[12px] font-bold uppercase bg-red-900/50 text-red-500 border border-red-900">{issue.severity}</span>
                        </div>
                        <h3 className="text-[20px] font-bold text-white mb-[8px] capitalize">{issue.type} detected</h3>
                        <p className="text-[16px] text-gray-400 mb-[0]">AI Confidence: {(issue.confidence * 100).toFixed(1)}%</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-[#1a1a1a] border border-[#333] p-[48px] rounded-sm">
                <h3 className="text-[24px] font-bold text-[#76b900]"><i className="fa-solid fa-check-circle mr-[12px]"></i>No issues detected</h3>
                <p className="text-gray-400 mt-[16px]">The AI confirms this image meets production quality standards.</p>
            </div>
        )}
      </section>
    </main>
  )
}

function HistoryPage() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })
                const response = await api.get(`/analyses`)
                setHistory(response.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
            <h1 className="text-[48px] font-bold mb-[48px] text-white">Diagnostics History</h1>
            {loading ? (
                <div className="text-[18px] font-bold text-[#76b900]">Loading historical data...</div>
            ) : history.length === 0 ? (
                <p className="text-[18px] text-gray-400">No telemetry found. Process an image to initialize history.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                    {history.map(item => (
                        <Link to={`/analyze/${item.id}`} key={item.id} className="block no-underline">
                            <div className="bg-[#1a1a1a] border border-[#333] p-[32px] rounded-sm hover:border-[#76b900] transition-colors cursor-pointer h-full flex flex-col group">
                                <div className="flex justify-between items-start mb-[24px]">
                                    <h3 className="text-[18px] font-bold text-white truncate max-w-[75%] group-hover:text-[#76b900] transition-colors">{item.filename}</h3>
                                    <span className={`px-[12px] py-[4px] rounded-sm text-[14px] font-bold uppercase text-black ${item.quality_label === 'ACCEPTABLE' ? 'bg-[#76b900]' : item.quality_label === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                        {item.quality_score.toFixed(0)}
                                    </span>
                                </div>
                                <div className="mt-auto pt-[24px] border-t border-[#333] text-[14px] text-gray-400 flex justify-between font-bold">
                                    <span>{new Date(item.analyzed_at).toLocaleDateString()}</span>
                                    <span>{item.issues?.length || 0} Issues</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <NavBar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze/:id" element={<AnalysisResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
                    <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}