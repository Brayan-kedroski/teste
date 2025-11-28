import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error(err);
            if (isLogin) {
                setError('Falha no login. Verifique suas credenciais.');
            } else {
                if (err.code === 'auth/weak-password') {
                    setError('A senha deve ter pelo menos 6 caracteres.');
                } else if (err.code === 'auth/email-already-in-use') {
                    setError('Este email já está cadastrado.');
                } else if (err.code === 'auth/invalid-email') {
                    setError('Email inválido.');
                } else {
                    setError('Erro ao criar conta: ' + err.message);
                }
            }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-aurora-flag p-4">
            <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        Aurora School
                    </h2>
                    <p className="text-white/90 font-medium text-lg">
                        {isLogin ? 'Portal do Aluno e Professor' : 'Junte-se a nós'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center backdrop-blur-sm"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-white/80 hover:text-white transition-colors underline decoration-white/50 hover:decoration-white"
                    >
                        {isLogin ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
