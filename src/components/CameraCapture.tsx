'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, ChevronLeft } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (base64: string, options: { gender: string; season: string }) => void;
  onBack: () => void;
}

export default function CameraCapture({ onImageCapture, onBack }: CameraCaptureProps) {
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [gender, setGender] = useState('unisex');
  const [season, setSeason] = useState('spring');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      onImageCapture(base64String, { gender, season });
    };
    reader.onerror = () => {
        setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleOpenCamera = async () => {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }

    try {
      setIsStartingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setError('Unable to access your camera. Check your browser and macOS camera permissions.');
    } finally {
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => {
      setError('Unable to start the camera preview.');
    });
  }, [isCameraOpen]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Unable to capture photo from camera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64String = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onImageCapture(base64String, { gender, season });
  };

  return (
    <div className="flex flex-col min-h-screen bg-beige animate-fade-in">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto w-full">
        <p className="font-sans text-xs font-semibold tracking-[3px] uppercase">Dripless</p>
        <button onClick={onBack} className="flex items-center gap-2 font-sans text-xs font-semibold tracking-[3px] uppercase hover:opacity-60 transition-opacity">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 w-full max-w-2xl mx-auto">
        {!isCameraOpen ? (
          <div className="w-full flex flex-col items-center gap-10">
            <div className="w-full h-[400px] border border-dashed border-grey-mid flex flex-col items-center justify-center p-6 cursor-pointer hover:border-black transition-colors group relative">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
              <h2 className="font-display text-4xl italic text-grey-mid mb-4 group-hover:text-black transition-colors">Drop a photo to begin</h2>
              <p className="font-sans text-xs tracking-[2px] uppercase text-grey-mid group-hover:text-black transition-colors">or click to upload</p>
            </div>

            {/* Toggles */}
            <div className="w-full flex flex-col gap-6 items-center">
              <div className="flex flex-wrap gap-2 justify-center">
                {['men', 'women', 'unisex'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-6 py-2 border text-[10px] tracking-[2px] uppercase transition-all ${gender === g ? 'bg-black text-white border-black' : 'border-grey-light text-grey-mid hover:border-black hover:text-black'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['spring', 'summer', 'autumn', 'winter'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-6 py-2 border text-[10px] tracking-[2px] uppercase transition-all ${season === s ? 'bg-black text-white border-black' : 'border-grey-light text-grey-mid hover:border-black hover:text-black'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={handleOpenCamera}
                disabled={isStartingCamera}
                className="btn-zara btn-zara-dark flex-1"
              >
                {isStartingCamera ? 'Opening...' : 'Open Camera'}
              </button>
              <label className="btn-zara btn-zara-light flex-1 text-center cursor-pointer">
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                Upload Photo
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full aspect-[3/4] bg-black overflow-hidden relative shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={handleCapturePhoto}
                className="btn-zara btn-zara-dark flex-1"
              >
                Take Photo
              </button>
              <button
                onClick={stopCamera}
                className="btn-zara btn-zara-light flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-6 text-red text-xs font-semibold tracking-wide uppercase animate-pulse">{error}</p>}
      </main>
    </div>
  );
}
