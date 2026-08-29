import React, { useRef, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { uploadImage } from './services/api'
import axios from 'axios'
import LegacyHomePage from './LegacyHomePage'


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NavBar() {

  return (
    <nav className="sticky top-0 z-50 h-[64px] bg-[#76b900] text-black flex items-center justify-between px-[48px] shadow-sm">
      <Link to="/" className="font-nvidia font-bold text-[24px] text-black no-underline tracking-wide hover:opacity-80 transition-opacity">VISIMETRIC</Link>
      <div className="flex gap-[32px]">
        <Link to="/products" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">Products</Link>
        <Link to="/solutions" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">Solutions</Link>
        <Link to="/history" className="font-bold cursor-pointer hover:text-white transition-colors no-underline text-black text-[15px]">History</Link>
        <Link to="/archive" className="font-bold cursor-pointer hover:text-[#222] transition-colors no-underline text-black/80 text-[15px]">Archive UI</Link>
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
            <Link to="/privacy" className="hover:text-white cursor-pointer no-underline text-[#ccc] transition-colors">Privacy Policy</Link>
            <Link to="/manage-privacy" className="hover:text-white cursor-pointer no-underline text-[#ccc] transition-colors">Manage My Privacy</Link>
            <Link to="/legal" className="hover:text-white cursor-pointer no-underline text-[#ccc] transition-colors">Legal</Link>
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
    <main className="min-h-screen bg-black text-white font-sans">
        <section className="py-[80px] px-[48px] max-w-[1400px] mx-auto border-b border-[#333]">
            <h1 className="text-[56px] font-bold mb-[24px] text-white">VisiMetric Architecture & Solutions</h1>
            <p className="text-[20px] text-gray-400 max-w-[800px] leading-relaxed">
              Explore the underlying dual-engine pipeline and see how VisiMetric provides enterprise-grade AI image diagnostics across multiple industries.
            </p>
        </section>

        <section className="py-[80px] px-[48px] max-w-[1400px] mx-auto border-b border-[#333]">
            <h2 className="text-[36px] font-bold text-white mb-[48px]">The Dual-Engine Pipeline</h2>
            <div className="flex flex-col lg:flex-row gap-[64px] items-center">
                <div className="flex-1 space-y-[32px]">
                    <div className="flex gap-[24px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#76b900] flex items-center justify-center text-black font-bold text-[24px] shrink-0">1</div>
                        <div>
                            <h3 className="text-[24px] font-bold text-white mb-[8px]">OpenCV Heuristic Extraction</h3>
                            <p className="text-gray-400 text-[16px] leading-relaxed">Incoming images are first passed through deterministic OpenCV filters to extract Laplacian variance (blur) and mean luminance (exposure). This acts as a rapid frontline diagnostic pass.</p>
                        </div>
                    </div>
                    <div className="flex gap-[24px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#76b900] flex items-center justify-center text-black font-bold text-[24px] shrink-0">2</div>
                        <div>
                            <h3 className="text-[24px] font-bold text-white mb-[8px]">PyTorch Float Regression</h3>
                            <p className="text-gray-400 text-[16px] leading-relaxed">The image is tensorized and fed into a fine-tuned EfficientNet-B0 neural network. The classification head is replaced with a Continuous Float Regression node, bounded by Sigmoid activations, to predict a highly accurate base score.</p>
                        </div>
                    </div>
                    <div className="flex gap-[24px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#76b900] flex items-center justify-center text-black font-bold text-[24px] shrink-0">3</div>
                        <div>
                            <h3 className="text-[24px] font-bold text-white mb-[8px]">Dynamic Score Fusion</h3>
                            <p className="text-gray-400 text-[16px] leading-relaxed">The API merges the AI deep structural analysis with the OpenCV feature penalties, emitting a final 0-100 float score along with categorized metadata issues.</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop" className="w-full h-auto rounded-sm border border-[#333]" alt="Pipeline Flow" />
                </div>
            </div>
        </section>

        <section className="py-[80px] px-[48px] max-w-[1400px] mx-auto">
            <h2 className="text-[36px] font-bold text-white mb-[48px]">Industry Applications</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors overflow-hidden flex flex-col">
                    <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop" alt="Healthcare" className="w-full h-[200px] object-cover" />
                    <div className="p-[32px] flex-1">
                        <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Healthcare Imaging</h3>
                        <p className="text-gray-400 leading-relaxed">Ensure automated visual quality checks on X-ray and MRI outputs before they reach diagnosticians. VisiMetric removes blurs and exposure artifacts from your pipeline instantly.</p>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors overflow-hidden flex flex-col">
                    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop" alt="E-Commerce" className="w-full h-[200px] object-cover" />
                    <div className="p-[32px] flex-1">
                        <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">E-Commerce Moderation</h3>
                        <p className="text-gray-400 leading-relaxed">Automatically reject poorly lit, heavily distorted, or heavily compressed merchant uploads to maintain a pristine, high-conversion storefront.</p>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm hover:border-[#76b900] transition-colors overflow-hidden flex flex-col">
                    <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600&auto=format&fit=crop" alt="Autonomous Vehicles" className="w-full h-[200px] object-cover" />
                    <div className="p-[32px] flex-1">
                        <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Autonomous Vehicles</h3>
                        <p className="text-gray-400 leading-relaxed">Filter degraded telemetry camera feeds in real-time. If a camera lens becomes occluded or severely noisy, the system seamlessly triggers fallback safety logic.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-[80px] px-[48px] max-w-[1400px] mx-auto border-t border-[#333]">
            <h2 className="text-[36px] font-bold text-white mb-[48px] text-center">Complete Architecture Blueprint</h2>
            <div className="flex flex-col gap-[48px] items-center">
                {[...Array(10)].map((_, i) => {
                    const num = i + 1;
                    const paddedNum = num.toString().padStart(2, '0');
                    return (
                        <img 
                            key={num}
                            src={`/explain/VisiMetric_Engine_Blueprint_page-00${paddedNum}.jpg`} 
                            alt={`Blueprint Page ${num}`} 
                            className="w-full max-w-[1000px] h-auto border border-[#333] rounded-sm shadow-lg"
                        />
                    );
                })}
            </div>
        </section>
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


function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">Privacy Policy</h1>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm max-w-[1000px]">
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Data Collection & Usage</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed mb-[32px]">VisiMetric operates on a strict ephemeral-processing model. Images uploaded for quality assessment are processed entirely in-memory via our FastAPI instance. We do not write raw pixel data to disk, and all binaries are destroyed instantly after the PyTorch regression score is calculated.</p>
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Telemetry</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed">We record non-identifiable telemetry (such as the final float score and OpenCV heuristic flags) to our local SQLite database for historical metric tracking. No identifiable user information is attached to these records.</p>
        </div>
    </main>
  )
}

function ManagePrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">Manage My Privacy</h1>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm max-w-[1000px]">
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Cookie Preferences</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed mb-[32px]">VisiMetric currently utilizes zero tracking cookies. Your session is entirely stateless and does not track you across other domains.</p>
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Data Deletion Requests</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed">Because we do not store user-identifiable media, there is no personal media to delete from our active servers. If you wish to purge the anonymous telemetry history, you can manually clear the AnalysisResult table on your local deployed database instance.</p>
        </div>
    </main>
  )
}

function LegalPage() {
  return (
    <main className="min-h-screen bg-black text-white p-[48px] max-w-[1400px] mx-auto font-sans">
        <h1 className="text-[48px] font-bold mb-[24px] text-white">Legal Information</h1>
        <div className="bg-[#1a1a1a] p-[48px] border border-[#333] rounded-sm max-w-[1000px]">
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Copyright</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed mb-[32px]">&copy; 2026 VisiMetric Corporation, Developed by Anshuman Pattnaik. All rights reserved. The VisiMetric logo, corporate UI motifs, and AI architecture are proprietary concepts constructed for this deployment.</p>
            <h3 className="text-[24px] font-bold text-[#76b900] mb-[16px]">Open Source Licenses</h3>
            <p className="text-gray-300 text-[16px] leading-relaxed">This software utilizes PyTorch, OpenCV, FastAPI, and React. All respective open-source licenses remain intact. The training models utilize the KADID-10k and KonIQ-10k datasets intended strictly for academic and non-commercial assessment.</p>
        </div>
    </main>
  )
}

function NVIDIAHomePage() {
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
    <main className="min-h-screen bg-black text-white font-sans">
      
      <section className="relative w-full h-[85vh] bg-[#111] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2560&auto=format&fit=crop" 
            alt="AI Core Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-[48px]">
          <h1 className="text-[64px] font-bold leading-[1.1] mb-[24px] max-w-[800px]">
            THE ERA OF <br/>
            <span className="text-[#76b900]">AI-POWERED</span> <br/>
            QUALITY ASSESSMENT
          </h1>
          <p className="text-[24px] text-gray-300 mb-[16px] max-w-[600px] font-light">
            VisiMetric delivers enterprise-grade image analysis, detecting complex distortions instantly.
          </p>
          <p className="text-[20px] text-[#76b900] font-bold mb-[40px] uppercase tracking-widest">
            Developed by Anshuman Pattnaik
          </p>
          <button 
            onClick={() => document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#76b900] text-black font-bold text-[18px] px-[32px] py-[16px] rounded-sm hover:bg-white transition-colors"
          >
            Start Analyzing Now
          </button>
        </div>
      </section>

      <section id="upload-section" className="py-[120px] px-[48px] max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row gap-[64px] items-start">
          
          <div className="flex-1 w-full">
            <h2 className="text-[32px] font-bold mb-[16px]">Run Quality Diagnostics</h2>
            <p className="text-gray-400 mb-[32px] text-[18px]">Leverage our dual-engine architecture (OpenCV + EfficientNet) to score your media.</p>
            
            <div 
              onClick={handleUploadClick} 
              className="group border border-[#333] hover:border-[#76b900] bg-[#1a1a1a] p-[48px] rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all h-[300px]"
            >
              <div className="text-[56px] text-[#76b900] mb-[24px] group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h3 className="text-[24px] font-bold text-white mb-[8px]">Upload Media for Analysis</h3>
              <p className="text-[16px] text-gray-400 mb-[24px]">JPG, PNG, WebP supported</p>
              
              {loading ? (
                <div className="w-full bg-[#333] h-[4px] rounded-full overflow-hidden max-w-[200px]">
                  <div className="bg-[#76b900] h-full w-[50%] animate-pulse"></div>
                </div>
              ) : (
                <div className="text-[#76b900] font-bold border border-[#76b900] px-[24px] py-[8px] rounded-sm group-hover:bg-[#76b900] group-hover:text-black transition-colors">
                  Browse Files
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {error && <p className="text-red-500 mt-[16px] text-[16px] font-bold">{error}</p>}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
            <div className="bg-[#1a1a1a] border border-[#333] hover:border-[#76b900] transition-colors rounded-sm overflow-hidden group cursor-pointer">
              <div className="h-[160px] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-[24px]">
                <span className="text-[#76b900] font-bold text-[12px] uppercase mb-[8px] block">Architecture</span>
                <h3 className="font-bold text-[18px] mb-[12px]">PyTorch Integration</h3>
                <p className="text-gray-400 text-[14px]">Discover how VisiMetric utilizes continuous float regression for flawless scoring.</p>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] hover:border-[#76b900] transition-colors rounded-sm overflow-hidden group cursor-pointer">
              <div className="h-[160px] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-[24px]">
                <span className="text-[#76b900] font-bold text-[12px] uppercase mb-[8px] block">Dataset</span>
                <h3 className="font-bold text-[18px] mb-[12px]">Trained on KonIQ-10k</h3>
                <p className="text-gray-400 text-[14px]">Over 20,000 real-world images processed to guarantee production-ready AI.</p>
              </div>
            </div>
          </div>

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
      <ScrollToTop />
      <NavBar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<NVIDIAHomePage />} />
          <Route path="/analyze/:id" element={<AnalysisResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/archive" element={<LegacyHomePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/manage-privacy" element={<ManagePrivacyPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}