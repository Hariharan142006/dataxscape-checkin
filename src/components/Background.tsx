export default function Background() {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden">
            {/* Base Black Background */}
            <div className="absolute inset-0 bg-black" />

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
                <source src="https://dsc-panimalar-ads.in/GB.mp4" type="video/mp4" />
            </video>

            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Stars / Particles Overlay (CSS based) */}
            <div className="stars-layer absolute inset-0 opacity-50 pointer-events-none" />
        </div>
    )
}
