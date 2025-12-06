"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL} from "@/config/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
    
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAuthHeaders = useCallback(() => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('social-network-token')}`
        }
    }), []);

    const handleUnauthorized = useCallback(() => {
        window.location.href = '/login';
    }, []);

    const showPostComments = useCallback(async (postId) => {
        setSelectedPostId(postId);

        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/posts/${postId}/comments`, 
                getAuthHeaders()
            );
            
            if (response.status === 200) {
                // Le backend retourne directement un tableau de commentaires
                setComments(Array.isArray(response.data) ? response.data : response.data.comments || []);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires", error);
            toast.error('Erreur lors du chargement des commentaires');
            if (error.response?.status === 401) handleUnauthorized();
        }
    }, [getAuthHeaders, handleUnauthorized]);

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/posts`, 
                getAuthHeaders()
            );

            if (response.status === 200) {
                // Le backend retourne directement un tableau de posts
                setPosts(Array.isArray(response.data) ? response.data : response.data.posts || []);
            } else if (response.data?.message === "Unauthenticated.") {
                handleUnauthorized();
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else if (error.response?.status === 429) {
                toast.error('Trop de requêtes. Veuillez réessayer plus tard.');
            } else if (error.code === 'ECONNREFUSED' || !error.response) {
                toast.error('Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution.');
            } else {
                toast.error('Erreur lors du chargement des posts');
            }
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, handleUnauthorized]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSubmit = useCallback(async (endpoint, formData, method = 'post') => {
        try {
            const headers = {
                ...getAuthHeaders().headers
            };
            
            // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
            if (!(formData instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }
            
            const response = await axios({
                method,
                url: endpoint,
                data: formData,
                headers
            });
            if (response.status === 200 || response.status === 201) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erreur lors de la soumission", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else if (error.response?.status === 429) {
                toast.error('Trop de requêtes. Veuillez réessayer plus tard.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.code === 'ECONNREFUSED' || !error.response) {
                toast.error('Impossible de se connecter au serveur.');
            } else {
                toast.error('Erreur lors de l\'opération');
            }
            return false;
        }
    }, [getAuthHeaders, handleUnauthorized]);

    const addPost = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', e.target.content.value);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }
        
        const success = await handleSubmit(`${API_BASE_URL}/api/posts`, formData);
        if (success) {
            await fetchPosts();
            e.target.reset();
            setPreviewImage(null);
            setSelectedFile(null);
            toast.success('Post publié avec succès');
        }
        setIsSubmitting(false);
    }, [handleSubmit, fetchPosts, selectedFile]);
  
    const addComment = useCallback(async (e) => {
        e.preventDefault();
        const formData = {
            content: e.target.content.value,
        };
        const success = await handleSubmit(
            `${API_BASE_URL}/api/posts/${selectedPostId}/comments`, 
            formData
        );
        if (success) {
            showPostComments(selectedPostId);
            e.target.reset();
            toast.success('Commentaire ajouté avec succès');
        }
    }, [handleSubmit, selectedPostId, showPostComments]);

    const toggleLike = useCallback(async (postId) => {
        // Note: La route pour les likes n'existe pas encore dans le backend
        // Cette fonctionnalité sera désactivée jusqu'à ce que la route soit créée
        toast.info('La fonctionnalité de like n\'est pas encore disponible côté backend');
        const success = await handleSubmit(`${API_BASE_URL}/api/posts/${postId}/likes`, {});
         if (success) {
             await fetchPosts();
             toast.success('Like mis à jour avec succès');
         }
    }, []);

    const deletePost = useCallback(async (postId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
            const success = await handleSubmit(`${API_BASE_URL}/api/posts/${postId}`, {}, 'delete');
            if (success) {
                fetchPosts();
                toast.success('Post supprimé avec succès');
            }
        }
    }, [handleSubmit, fetchPosts]);

    const deleteComment = useCallback(async (commentId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            const success = await handleSubmit(`${API_BASE_URL}/api/comments/${commentId}`, {}, 'delete');
            if (success) {
                showPostComments(selectedPostId);
                toast.success('Commentaire supprimé avec succès');
            }
        }
    }, [handleSubmit, selectedPostId, showPostComments]);

    const closeComments = useCallback(() => {
        setSelectedPostId(null);
        setComments([]);
    }, []);

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
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Déconnexion
                    </button>
                </div>

            <div className="mb-8 bg-white rounded-lg shadow p-6">
                <form className="space-y-4" onSubmit={addPost}>
                    <div>
                        <textarea
                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                            name="content"
                            id="content"
                            required
                            rows="4"
                            placeholder="Quoi de neuf ?"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500">Cliquez pour ajouter une image</p>
                                </div>
                                <input 
                                    id="image-upload" 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                setPreviewImage(e.target.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {previewImage && (
                            <div className="relative">
                                <img 
                                    src={previewImage} 
                                    alt="Aperçu" 
                                    className="max-h-48 rounded-lg mx-auto"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImage(null);
                                        setSelectedFile(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Publication...' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Chargement des posts...</p>
                    </div>
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">Aucun post pour le moment. Soyez le premier à publier !</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">{post.author?.name || post.user?.name || 'Utilisateur inconnu'}</h2>
                            <div className="flex items-center gap-4">
                                <p className="text-gray-500">{post.created_at}</p>
                                <button 
                                        onClick={() => deletePost(post.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        🗑️
                                    </button>
                            </div>
                        </div>
                        <hr className="my-4" />
                        <p className="text-gray-700">{post.content}</p>
                        {post.image_url && (
                            <img src={post.image_url} alt="Post Image" className="max-h-96 object-contain w-full mt-4 mx-auto rounded-lg" />
                        )}
                        <hr className="my-4" />
                        <div className="flex items-center space-x-4 text-gray-500">
                            <button 
                                onClick={() => toggleLike(post.id)}
                                className={`flex items-center space-x-2 hover:text-indigo-600 ${post.isLiked ? 'text-red-500' : ''}`}
                            >
                                <span>{post.isLiked ? "Je n'aime plus" : "J'aime"}</span>
                            </button>
                            <button className="flex items-center space-x-2 hover:text-indigo-600">
                                <span>{post.likes_count || 0} ❤️</span>
                            </button>
                            <button 
                                onClick={() => showPostComments(post.id)}
                                className="flex items-center space-x-2 hover:text-indigo-600"
                            >
                                <span>💬</span>
                                <span>{post.comments_count || 0} Commentaires</span>
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            )}

            {selectedPostId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Commentaires</h2>
                            <button 
                                onClick={closeComments}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {comments?.map((comment) => (
                                <div key={comment.id} className="border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{comment.user.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-gray-500">{comment.created_at}</p>
                                            <button 
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    🗑️ delete
                                                </button>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-700">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <form className="flex items-center gap-2" onSubmit={addComment}>
                                <input
                                    type="text"
                                    id="content"
                                    name="content"
                                    placeholder="Écrivez un commentaire..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <span>Envoyer</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </ProtectedRoute>
    );
}