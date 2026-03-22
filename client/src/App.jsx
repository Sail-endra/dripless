import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api/outfit'

function App() {
  const [screen, setScreen] = useState('capture') // 'capture' | 'loading' | 'results' | 'error'
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

    // Read file as base64
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

  const reset = () => {
    setScreen('capture')
    setPreview(null)
    setResults(null)
    setError('')
  }

  // ── Screen 1: Capture ──
  if (screen === 'capture') {
    return (
      <div className="app">
        <div className="capture-screen">
          <div className="capture-icon">📸</div>
          <h1>Scan Your Item</h1>
          <p className="subtitle">
            Upload a photo of a clothing piece and we'll style a sustainable outfit around it.
          </p>
          <div className="capture-buttons">
            <label className="btn btn-primary">
              <input type="file" accept="image/*" capture="environment" onChange={handleCapture} hidden />
              📷 Open Camera
            </label>
            <label className="btn btn-secondary">
              <input type="file" accept="image/*" onChange={handleCapture} hidden />
              🖼️ Upload Photo
            </label>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 2: Loading ──
  if (screen === 'loading') {
    return (
      <div className="app">
        <div className="loading-screen">
          {preview && <img src={preview} alt="Your item" className="loading-preview" />}
          <div className="spinner"></div>
          <h2>Analyzing your item...</h2>
          <p className="subtitle">Finding the perfect outfit and sustainable shopping options</p>
        </div>
      </div>
    )
  }

  // ── Error Screen ──
  if (screen === 'error') {
    return (
      <div className="app">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Oops, something went wrong</h2>
          <p className="subtitle">{error}</p>
          <button className="btn btn-primary" onClick={reset}>Try Again</button>
        </div>
      </div>
    )
  }

  // ── Screen 3: Results ──
  const { analysis, suggestions, outfitImage } = results || {}
  console.log('outfitImage URL:', outfitImage)

  return (
    <div className="app">
      <div className="results-screen">
        <button className="btn btn-back" onClick={reset}>← Scan Another</button>

        <h1>Your Outfit</h1>

        {/* DALL-E generated outfit image */}
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

        {/* Scanned item analysis */}
        {analysis && (
          <div className="analysis-card">
            <h3>Scanned Item</h3>
            <div className="analysis-details">
              <span className="tag">{analysis.brand}</span>
              <span className="tag">{analysis.itemType}</span>
              <span className="tag">{analysis.color}</span>
              <span className="tag">{analysis.style}</span>
            </div>
          </div>
        )}

        {/* Suggestions with product cards */}
        <h2>Suggested Pieces</h2>
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
                      {p.thumbnail && (
                        <img src={p.thumbnail} alt={p.title} className="product-thumb" />
                      )}
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
