
import React, { useState } from 'react';

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
            --primary: 43 96% 56%; /* #F5B800 */
            --primary-hex: #F5B800;
            --bg-base: #0f1115;      /* Updated to match lighter dark theme */
            --bg-card: #18181b;      /* Zinc 900 - Distinct but dark */
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-base);
            color: #e2e8f0;
            /* Balanced ambient light - visible but moody */
            background-image: radial-gradient(circle at 50% 0%, #2a2d35 0%, var(--bg-base) 100%);
            min-height: 100vh;
            /* overflow-x: hidden; REMOVED TO FIX STICKY */
        }
        
        body, html {
            margin: 0;
            padding: 0;
            overscroll-behavior-y: none;
        }
        
        /* Typography */
        h1, h2, h3, .font-display {
            font-family: 'Outfit', sans-serif;
            letter-spacing: 0.02em; 
        }

        .font-serif {
            font-family: 'Playfair Display', serif;
        }

        .mono-font {
            font-family: 'Inter', monospace;
        }
        
        /* Utilities */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* SCOPED SCROLLBAR TO DESKTOP */
        @media (min-width: 768px) {
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #F5B800;
                border-radius: 4px;
            }
        }
        
        /* Animations */
        .fade-enter { opacity: 0; }
        .fade-enter-active { opacity: 1; transition: opacity 500ms ease-in-out; }
        
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }

        html { scroll-behavior: smooth; }

        /* Hardware Acceleration to prevent text jitter */
        .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
        }
        
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes ken-burns {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
        }
        .animate-ken-burns {
            animation: ken-burns 20s ease-out forwards;
        }
        
        @keyframes forge-reveal {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(10px); }
            50% { opacity: 1; transform: scale(1.05) translateY(0); filter: blur(0px); }
            100% { transform: scale(1); }
        }
        .animate-forge-reveal {
            animation: forge-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: #F5B800;
            box-shadow: 0 0 10px #F5B800;
            animation: scan 2s linear infinite;
        }
        
        .cursor-blink {
            display: inline-block;
            width: 8px;
            height: 14px;
            background-color: #F5B800;
            animation: blink 1s step-end infinite;
            vertical-align: middle;
            margin-left: 2px;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        /* Glass Card Utility */
        .glass-card {
            background: rgba(26, 29, 35, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        /* 
           UPDATED GRADIENT:
           Smoother transition from the new Zinc base.
        */
        .card-gradient-overlay {
            background: linear-gradient(to top, rgba(15, 17, 21, 0.98) 0%, rgba(15, 17, 21, 0.7) 25%, transparent 60%);
        }
        
        @keyframes breathing {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-breathing {
            animation: breathing 4s ease-in-out infinite;
        }

        @keyframes atmosphere-glow {
            0% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
            100% { opacity: 0.4; transform: scale(1); }
        }
        .animate-atmosphere-glow {
            animation: atmosphere-glow 10s ease-in-out infinite;
        }

        .shadow-glow {
            box-shadow: 0 0 30px var(--glow-color, #F5B800);
        }

        .editable-field:hover {
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
            cursor: text;
        }
    `}</style>
);

export default GlobalStyles;
