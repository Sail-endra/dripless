import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api/outfit'

function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'capture' | 'loading' | 'results' | 'error'
  const [preview, setPreview] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [imgError, setImgError] = useState(false)

  const handleCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      setScreen('error')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      setPreview(base64)
      setScreen('loading')

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `Server error (${res.status})`)
        }

        const data = await res.json()
        setResults(data)
        setScreen('results')
      } catch (err) {
        console.error('API error:', err)
        setError(err.message || 'Something went wrong. Please try again.')
        setScreen('error')
      }
    }
    reader.onerror = () => {
      setError('Failed to read the image file.')
      setScreen('error')
    }
    reader.readAsDataURL(file)
  }

  const resetToCapture = () => {
    setScreen('capture')
    setPreview(null)
    setResults(null)
    setError('')
    setImgError(false)
  }

  const goToLanding = () => {
    setScreen('landing')
    setPreview(null)
    setResults(null)
    setError('')
    setImgError(false)
  }

  // ── Landing ──
  if (screen === 'landing') {
    return (
      <div className="app app-landing">
        <section className="landing-hero">
          <h1 className="landing-hero-title">
            <span>DRESS</span>
            <span>DIFFERENT.</span>
          </h1>
          <p className="landing-hero-tagline">
            AI-powered outfit builder. Secondhand only. Zero guilt.
          </p>
          <button type="button" className="btn-hero" onClick={() => setScreen('capture')}>
            Scan Your Clothes
          </button>
          <p className="landing-hero-powered">Powered by GPT-4o</p>
        </section>

        <section className="landing-stats">
          <div className="landing-stats-inner">
            <div className="landing-stats-grid">
              <div>
                <p className="landing-stat-num">92M tonnes</p>
                <p className="landing-stat-label">textile waste yearly</p>
              </div>
              <div>
                <p className="landing-stat-num">75%</p>
                <p className="landing-stat-label">want to shop sustainably</p>
              </div>
              <div>
                <p className="landing-stat-num">35%</p>
                <p className="landing-stat-label">actually do</p>
              </div>
            </div>
            <p className="landing-stats-tagline">Dripless closes that gap.</p>
          </div>
        </section>

        <section className="landing-how">
          <span className="landing-how-watermark" aria-hidden="true">
            01
          </span>
          <div className="landing-how-inner">
            <h2>Point. Scan. Style.</h2>
            <div className="landing-cards">
              <div className="landing-card">
                <h3>Scan</h3>
                <p>Point your camera at any clothing item you own or are about to buy</p>
              </div>
              <div className="landing-card">
                <h3>Style</h3>
                <p>AI builds a complete outfit using color theory and fashion logic</p>
              </div>
              <div className="landing-card">
                <h3>Shop</h3>
                <p>Every suggested piece is sourced from secondhand marketplaces. Always.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-quote">
          <div className="landing-quote-inner">
            <blockquote>
              Fast fashion is the world&apos;s second most polluting industry. You didn&apos;t cause it. But you
              can opt out.
            </blockquote>
            <p className="landing-quote-source">— United Nations Environment Programme</p>
            <p className="landing-quote-follow">
              Every outfit Dripless builds is secondhand. Every scan is a vote against waste.
            </p>
          </div>
        </section>

        <section className="landing-cta">
          <h2>Your wardrobe. Reimagined.</h2>
          <p>Scan anything. Style everything. Spend less.</p>
          <button type="button" className="btn-cta" onClick={() => setScreen('capture')}>
            Start Styling
          </button>
        </section>
      </div>
    )
  }

  // ── Capture ──
  if (screen === 'capture') {
    return (
      <div className="app app-capture">
        <div className="capture-top">
          <button type="button" className="btn-back" onClick={goToLanding}>
            ← Back
          </button>
        </div>
        <div className="capture-screen">
          <div className="capture-upload-zone">
            <h2>Scan Your Item</h2>
            <p className="subtitle">Upload a photo of any clothing piece</p>
            <div className="capture-buttons">
              <label className="btn">
                <input type="file" accept="image/*" capture="environment" onChange={handleCapture} hidden />
                Open Camera
              </label>
              <label className="btn">
                <input type="file" accept="image/*" onChange={handleCapture} hidden />
                Upload Photo
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading ──
  if (screen === 'loading') {
    return (
      <div className="app app-loading">
        <div className="loading-screen">
          {preview && <img src={preview} alt="Your item" className="loading-preview" />}
          <div className="spinner" />
          <h2>Building your outfit...</h2>
          <p className="subtitle">Finding secondhand pieces that complete your look</p>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (screen === 'error') {
    return (
      <div className="app app-error">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Oops, something went wrong</h2>
          <p className="subtitle">{error}</p>
          <button type="button" className="btn-retry" onClick={resetToCapture}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Results ──
  const { analysis, suggestions, outfitImage } = results || {}

  return (
    <div className="app app-results">
      <div className="results-screen">
        <button type="button" className="btn-back" onClick={resetToCapture}>
          ← Scan Another
        </button>

        {outfitImage && !imgError && (
          <div className="outfit-image-wrapper">
            <img
              src={outfitImage}
              alt="Complete outfit"
              className="outfit-image"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        {imgError && (
          <div className="outfit-image-fallback">
            <p>Outfit preview unavailable</p>
          </div>
        )}

        {analysis && (
          <div className="analysis-card">
            <h3>Scanned Item</h3>
            <div className="analysis-details">
              <span className="tag-pill">{analysis.brand}</span>
              <span className="tag-pill">{analysis.itemType}</span>
              <span className="tag-pill">{analysis.color}</span>
              <span className="tag-pill">{analysis.style}</span>
            </div>
          </div>
        )}

        <h2 className="suggested-heading">Suggested Pieces</h2>
        <div className="suggestions-grid">
          {suggestions?.map((s, i) => (
            <div key={i} className="suggestion-card">
              <div className="suggestion-header">
                <h3>{s.item}</h3>
                <div className="suggestion-meta">
                  <span className="tag">{s.color}</span>
                  <span className="tag">{s.style}</span>
                </div>
              </div>

              {s.products && s.products.length > 0 && (
                <div className="products-list">
                  <p className="products-label">Shop Secondhand</p>
                  {s.products.map((p, j) => (
                    <a key={j} href={p.link} target="_blank" rel="noreferrer" className="product-card">
                      {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="product-thumb" />}
                      <div className="product-info">
                        <span className="product-title">{p.title}</span>
                        <span className="product-price">{p.price}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
