import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-primary-50 p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-primary-900 mb-2">Ops! Algo deu errado</h1>
                    <p className="text-primary-600 mb-6 max-w-xs">
                        O aplicativo encontrou um erro inesperado. Tente recarregar ou voltar para o início.
                    </p>

                    {this.state.error && (
                        <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-red-100 text-left mb-8 overflow-auto max-h-40">
                            <p className="text-xs font-mono text-red-500 break-words">
                                {this.state.error.toString()}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={this.handleReset}
                        className="w-full max-w-xs flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Recarregar Aplicativo
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
