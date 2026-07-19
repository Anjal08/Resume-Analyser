import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ShieldAlert, Cpu, Sparkles } from 'lucide-react'

const LOADING_STEPS = [
    { label: "Uploading resume and job description...", icon: FileText, color: "#60a5fa" },
    { label: "Parsing text content and structure...", icon: Cpu, color: "#c084fc" },
    { label: "Extracting key skills and experience...", icon: Sparkles, color: "#facc15" },
    { label: "Matching credentials with job description...", icon: Cpu, color: "#2dd4bf" },
    { label: "Generating ATS Match Score & prep plan...", icon: Sparkles, color: "#4ade80" }
]

const ScanningLoader = () => {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const ActiveIcon = LOADING_STEPS[currentStep].icon

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            color: 'var(--text-primary)',
            background: 'var(--bg-page)',
            perspective: '1000px',
            padding: '2rem',
            textAlign: 'center'
        }}>
            {/* 3D Scanning Document Container */}
            <motion.div 
                style={{
                    width: '240px',
                    height: '320px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '2rem',
                    marginBottom: '3rem',
                    transformStyle: 'preserve-3d',
                    backdropFilter: 'blur(10px)'
                }}
                initial={{ rotateX: 45, rotateZ: -10, y: 50, opacity: 0 }}
                animate={{ 
                    rotateX: [25, 30, 25], 
                    rotateY: [-5, 5, -5],
                    y: 0, 
                    opacity: 1 
                }}
                transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    repeatType: 'reverse', 
                    ease: 'easeInOut' 
                }}
            >
                {/* Scanner Laser line */}
                <motion.div 
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, #60a5fa, #c084fc, #60a5fa, transparent)',
                        boxShadow: '0 0 15px #c084fc, 0 0 5px #60a5fa',
                        zIndex: 10
                    }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Dummy Document lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ width: '70%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                            <div style={{ width: '40%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
                    <div style={{ width: '90%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                    <div style={{ width: '75%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                    <div style={{ width: '85%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: '30%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                    <div style={{ width: '20%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                </div>
            </motion.div>

            {/* Stepped Text Display */}
            <div style={{ minHeight: '80px', maxWidth: '400px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{
                            width: '48px', height: '48px',
                            background: `rgba(255,255,255,0.03)`,
                            border: `1px solid ${LOADING_STEPS[currentStep].color}40`,
                            borderRadius: '12px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: LOADING_STEPS[currentStep].color,
                            boxShadow: `0 0 20px ${LOADING_STEPS[currentStep].color}10`
                        }}>
                            <ActiveIcon size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            {LOADING_STEPS[currentStep].label}
                        </h3>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Overall Progress Indicator */}
            <div style={{ width: '240px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '2rem', overflow: 'hidden' }}>
                <motion.div 
                    style={{ height: '100%', background: 'linear-gradient(90deg, #60a5fa, #c084fc)' }}
                    animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    )
}

export default ScanningLoader
