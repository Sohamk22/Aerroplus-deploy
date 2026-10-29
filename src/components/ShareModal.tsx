'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Smartphone } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);
      setQrUrl(url);
    }
  }, []);

  useEffect(() => {
    if (isOpen && canvasRef.current && qrUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        qrUrl,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, qrUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">Scan to Open on Mobile</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Point your phone camera at this QR code during the poster session to test the live app!
        </p>

        {/* QR Code Canvas */}
        <div className="p-3 mx-auto w-fit bg-slate-50 rounded-xl border border-slate-200 shadow-inner flex justify-center">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
        </div>

        {/* Mobile Experience Features */}
        <div className="mt-4 p-3 bg-brand-50/70 border border-brand-100 rounded-xl text-left text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-brand-800">
            <Smartphone className="w-4 h-4" />
            <span>Mobile-First Presentation App</span>
          </div>
          <p className="text-slate-600">
            • AI-powered atmospheric conversational assistant<br />
            • Real-time CPCB air quality and weather telemetry<br />
            • Interactive clean air solutions & artificial tree simulator
          </p>
        </div>

        {/* Copy Link Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Live URL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
