"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HomePage() {
    
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);

    const getAuthHeaders = useCallback(() => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }), []);

    const handleUnauthorized = useCallback(() => {
        window.location.href = '/login';
    }, []);

    const showPostComments = useCallback(async (postId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/posts/${postId}/comments`, 
                getAuthHeaders()
            );
            
            if (response.status === 200) {
                setComments(response.data.comments);
                setSelectedPostId(postId);
                toast.success('Commentaires chargés avec succès');
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires", error);
            toast.error('Erreur lors du chargement des commentaires');
            if (error.response?.status === 401) handleUnauthorized();
        }
    }, [getAuthHeaders, handleUnauthorized]);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/posts`, 
                getAuthHeaders()
            );

            if (response.status === 200) {
                setPosts(response.data.posts);
            } else if (response.data.message === "Unauthenticated.") {
                handleUnauthorized();
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts", error);
            toast.error('Erreur lors du chargement des posts');
            if (error.response?.status === 401) handleUnauthorized();
        }
    }, [getAuthHeaders, handleUnauthorized]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSubmit = useCallback(async (endpoint, formData, method = 'post') => {
        try {
            const response = await axios({
                method,
                url: endpoint,
                data: formData,
                headers: getAuthHeaders().headers
            });
            if (response.status === 200 || response.status === 201) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erreur lors de la soumission", error);
            toast.error('Erreur lors de l\'opération');
            return false;
        }
    }, [getAuthHeaders]);

    const addPost = useCallback(async (e) => {
        e.preventDefault();
        const formData = {
            content: e.target.content.value,
        };
        const success = await handleSubmit(`${API_BASE_URL}/posts`, formData);
        if (success) {
            fetchPosts();
            e.target.reset();
            toast.success('Post publié avec succès');
        }
    }, [handleSubmit, fetchPosts]);
  
    const addComment = useCallback(async (e) => {
        e.preventDefault();
        const formData = {
            content: e.target.content.value,
        };
        const success = await handleSubmit(
            `${API_BASE_URL}/posts/${selectedPostId}/comments`, 
            formData
        );
        if (success) {
            showPostComments(selectedPostId);
            e.target.reset();
            toast.success('Commentaire ajouté avec succès');
        }
    }, [handleSubmit, selectedPostId, showPostComments]);

    const toggleLike = useCallback(async (postId) => {
        const success = await handleSubmit(`${API_BASE_URL}/posts/${postId}/likes`, {});
        if (success) {
            fetchPosts();
            toast.success('Like mis à jour avec succès');
        }
    }, [handleSubmit, fetchPosts]);

    const deletePost = useCallback(async (postId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
            const success = await handleSubmit(`${API_BASE_URL}/posts/${postId}`, {}, 'delete');
            if (success) {
                fetchPosts();
                toast.success('Post supprimé avec succès');
            }
        }
    }, [handleSubmit, fetchPosts]);

    const deleteComment = useCallback(async (commentId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            const success = await handleSubmit(`${API_BASE_URL}/comments/${commentId}`, {}, 'delete');
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
        localStorage.removeItem('token');
        window.location.href = '/';
        toast.info('Déconnexion réussie');
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gray-100">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-600">EPPF SOCIAL</h1>
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
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Publier
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {posts?.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">{post.user.name}</h2>
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
    );
}