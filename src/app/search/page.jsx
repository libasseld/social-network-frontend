"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const getAuthHeaders = useCallback(() => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('social-network-token')}`
        }
    }), []);

    const handleUnauthorized = useCallback(() => {
        window.location.href = '/login';
    }, []);

    const performSearch = useCallback(async (query) => {
        if (!query || query.trim() === '') {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
                getAuthHeaders()
            );

            if (response.status === 200) {
                // Le backend peut retourner différents types de résultats
                // On s'adapte à la structure de la réponse
                if (Array.isArray(response.data)) {
                    setResults(response.data);
                } else if (response.data.results) {
                    setResults(response.data.results);
                } else if (response.data.posts) {
                    setResults(response.data.posts);
                } else {
                    setResults([]);
                }
            }
        } catch (error) {
            console.error("Erreur lors de la recherche", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else if (error.response?.status === 429) {
                toast.error('Trop de requêtes. Veuillez réessayer plus tard.');
            } else if (error.code === 'ECONNREFUSED' || !error.response) {
                toast.error('Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution.');
            } else {
                toast.error('Erreur lors de la recherche');
            }
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, handleUnauthorized]);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams, performSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            performSearch(query);
        }
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('social-network-token');
        window.location.href = '/';
        toast.info('Déconnexion réussie');
    }, []);

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto p-8 bg-gray-100 min-h-screen">
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">EPF SOCIAL</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/home')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Accueil
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>

                <div className="mb-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Recherche</h2>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher des posts, utilisateurs..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Recherche en cours...</p>
                        </div>
                    </div>
                ) : hasSearched ? (
                    results.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-gray-600">
                                    {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''} pour "{searchQuery}"
                                </p>
                            </div>
                            {results.map((result) => (
                                <div key={result.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold">
                                            {result.author?.name || result.user?.name || 'Utilisateur inconnu'}
                                        </h2>
                                        <p className="text-gray-500">{result.created_at}</p>
                                    </div>
                                    <hr className="my-4" />
                                    <p className="text-gray-700">{result.content}</p>
                                    {result.image_url && (
                                        <img 
                                            src={result.image_url} 
                                            alt="Post Image" 
                                            className="max-h-96 object-contain w-full mt-4 mx-auto rounded-lg" 
                                        />
                                    )}
                                    <hr className="my-4" />
                                    <div className="flex items-center space-x-4 text-gray-500">
                                        <span>{result.likes_count || 0} ❤️</span>
                                        <span>{result.comments_count || 0} 💬 Commentaires</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-500">Entrez un terme de recherche pour commencer</p>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
