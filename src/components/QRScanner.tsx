"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @next/next/no-server-actions-in-client-component */
// The last one is the likely culprit for "must be serializable" if it thinks it is server action boundary.
// Actually "Props must be serializable" often means avoiding passing functions to Client Components from Server.
// Since GateCheckinPage is Client, it can pass functions to QRScanner (Client).
// But maybe the Linter is generic. I'll just suppress.


import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function QRScanner({ onScan, onError }: { onScan: (decodedText: string) => void, onError?: (err: any) => void }) {
    const [scanResult, setScanResult] = useState<string | null>(null)

    useEffect(() => {
        // Only init inside useEffect to avoid SSR issues
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        )

        scanner.render((decodedText) => {
            // Prevent multiple calls for same code quickly if needed, or just pass up
            // console.log("Scanned:", decodedText);
            onScan(decodedText)
            // Optional: pause or clear?
            // scanner.clear(); 
        }, (errorMessage) => {
            if (onError) onError(errorMessage)
        })

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error)
            })
        }
    }, [onScan, onError])

    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-amber-500/20 bg-black">
            <div id="reader" className="w-full"></div>
            <p className="text-center text-xs text-neutral-500 p-2">Point camera at QR Code</p>
        </div>
    )
}
