import { useEffect, useState } from 'react';
import { useTour } from '../../context/TourContext';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import { Button } from '../Button';

export function AppTour() {
    const { isTourOpen, currentStep, steps, nextStep, prevStep, endTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isTourOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isTourOpen]);

    useEffect(() => {
        if (isTourOpen && steps[currentStep]) {
            const element = document.getElementById(steps[currentStep].targetId);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        }
    }, [isTourOpen, currentStep, steps]);

    if (!isTourOpen || !steps[currentStep]) return null;

    const current = steps[currentStep];

    return (
        <div className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Overlay with cut-out using clip-path */}
            <div
                className="absolute inset-0 bg-black/70 pointer-events-auto transition-all duration-500"
                style={{
                    clipPath: targetRect ? `polygon(
            0% 0%, 
            0% 100%, 
            ${targetRect.x - 8}px 100%, 
            ${targetRect.x - 8}px ${targetRect.y - 8}px, 
            ${targetRect.x + targetRect.width + 8}px ${targetRect.y - 8}px, 
            ${targetRect.x + targetRect.width + 8}px ${targetRect.y + targetRect.height + 8}px, 
            ${targetRect.x - 8}px ${targetRect.y + targetRect.height + 8}px, 
            ${targetRect.x - 8}px 100%, 
            100% 100%, 
            100% 0%
          )` : 'none'
                }}
                onClick={endTour}
            />

            {/* Pulsing ring */}
            {targetRect && (
                <div
                    className="absolute border-2 border-white rounded-xl transition-all duration-500 pointer-events-none"
                    style={{
                        left: targetRect.x - 12,
                        top: targetRect.y - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div className="absolute inset-0 border-2 border-white rounded-lg animate-ping opacity-30" />
                </div>
            )}

            {/* Tooltip */}
            <div
                className="absolute z-[10000] w-[calc(100%-48px)] max-w-sm left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-auto"
                style={{
                    // Intelligent positioning
                    ...(current.position === 'top'
                        ? { bottom: targetRect ? window.innerHeight - targetRect.y + 20 : '60%' }
                        : current.position === 'bottom'
                            ? { top: targetRect ? targetRect.y + targetRect.height + 20 : '60%' }
                            : { top: '40%' }
                    ),
                    opacity: targetRect || current.position === 'center' ? 1 : 0,
                    transform: `translateX(-50%) translateY(${targetRect || current.position === 'center' ? '0' : '20px'})`
                }}
            >
                <div className="bg-white rounded-2xl p-6 shadow-2xl border border-primary-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
                            Passo {currentStep + 1} de {steps.length}
                        </span>
                        <button
                            onClick={endTour}
                            className="p-1 hover:bg-primary-50 rounded-full transition-colors text-primary-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-primary-900 mb-2">{current.title}</h3>
                    <p className="text-primary-600 mb-6 leading-relaxed">
                        {current.content}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentStep === 0 ? 'text-primary-200 cursor-not-allowed' : 'text-primary-500 hover:text-primary-700'}`}
                        >
                            <ChevronLeft size={18} />
                            Anterior
                        </button>

                        <Button
                            onClick={nextStep}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>
                                    <Check size={18} />
                                    Entendido!
                                </>
                            ) : (
                                <>
                                    Próximo
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
