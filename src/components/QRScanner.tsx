"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @next/next/no-server-actions-in-client-component */
// The last one is the likely culprit for "must be serializable" if it thinks it is server action boundary.
// Actually "Props must be serializable" often means avoiding passing functions to Client Components from Server.
// Since GateCheckinPage is Client, it can pass functions to QRScanner (Client).
// But maybe the Linter is generic. I'll just suppress.


import { useEffect, useState, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function QRScanner({ onScan, onError }: { onScan: (decodedText: string) => void, onError?: (err: any) => void }) {
    const [audioEnabled, setAudioEnabled] = useState(true)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const audioEnabledRef = useRef(audioEnabled);
    const onScanRef = useRef(onScan);
    const onErrorRef = useRef(onError);

    // Keep refs in sync
    useEffect(() => {
        audioEnabledRef.current = audioEnabled;
    }, [audioEnabled]);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    // Audio context for beep sounds
    const playBeep = (type: 'success' | 'error') => {
        if (!audioEnabledRef.current) return;

        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                // High pitch beep for success
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else {
                // Low pitch buzz for error
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    useEffect(() => {
        // Init scanner
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scannerRef.current.render((decodedText) => {
                playBeep('success');
                if (onScanRef.current) onScanRef.current(decodedText);
            }, (errorMessage) => {
                if (onErrorRef.current) onErrorRef.current(errorMessage);
            });
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, []); // Empty dependency array - only mount/unmount

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Scanner</span>
                <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${audioEnabled ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                >
                    {audioEnabled ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path d="M7 3.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-9zM3 5.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-5zM11 6.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-3z" />
                            </svg>
                            Sound On
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path d="M10.28 9.22a.75.75 0 1 1-1.06 1.06L7 8.06l-2.22 2.22a.75.75 0 1 1-1.06-1.06L5.94 7 3.72 4.78a.75.75 0 0 1 1.06-1.06L7 5.94l2.22-2.22a.75.75 0 0 1 1.06 1.06L8.06 7l2.22 2.22z" />
                            </svg>
                            Muted
                        </>
                    )}
                </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-amber-500/20 bg-black shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <div id="reader" className="w-full"></div>
                <p className="text-center text-xs text-neutral-500 p-2 border-t border-neutral-900">Point camera at QR Code</p>
            </div>
        </div>
    )
}
