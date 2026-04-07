import communityImg from '../assets/community.png';
import { Link } from 'react-router-dom';

export default function Welcome() {
    return (
        <div className="flex flex-col items-center justify-center p-8 flex-1 text-center space-y-10 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
            <div className="p-6 bg-primary-800/50 rounded-full border border-primary-700 shadow-xl backdrop-blur-sm">
                <img src={communityImg} alt="Vizinhança Segura" className="w-40 h-40 object-contain" />
            </div>

            <div className="space-y-4 max-w-xs">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Vizinhança Segura
                </h1>
                <p className="text-primary-200 text-lg leading-relaxed">
                    Segurança comunitária colaborativa. Proteja quem você ama.
                </p>
            </div>

            <div className="w-full max-w-xs space-y-4 pt-8">
                <Link
                    to="/register"
                    className="block w-full py-4 px-6 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-semibold shadow-lg shadow-accent-900/20 transition-all active:scale-95 text-lg"
                >
                    Criar Conta
                </Link>
                <Link
                    to="/login"
                    className="block w-full py-4 px-6 bg-primary-800/80 hover:bg-primary-700 text-primary-50 rounded-xl font-semibold transition-all active:scale-95 border border-primary-700/50 backdrop-blur-sm"
                >
                    Entrar
                </Link>
            </div>

            <div className="absolute bottom-8 w-full text-center px-8">
                <p className="text-xs text-primary-400 border-t border-primary-800 pt-4">
                    Ao continuar, você concorda com nossos Termos de Uso e Código de Conduta.
                </p>
            </div>
        </div>
    );
}
