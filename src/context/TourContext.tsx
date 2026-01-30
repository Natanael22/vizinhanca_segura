import { createContext, useContext, useState, useCallback } from 'react';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'center';
}

interface TourContextType {
    isTourOpen: boolean;
    currentStep: number;
    steps: TourStep[];
    startTour: (steps: TourStep[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);

    const startTour = useCallback((newSteps: TourStep[]) => {
        setSteps(newSteps);
        setCurrentStep(0);
        setIsTourOpen(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    }, [currentStep, steps.length]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const endTour = useCallback(() => {
        setIsTourOpen(false);
        localStorage.setItem('has_seen_tour', 'true');
    }, []);

    return (
        <TourContext.Provider value={{
            isTourOpen,
            currentStep,
            steps,
            startTour,
            nextStep,
            prevStep,
            endTour
        }}>
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
}
