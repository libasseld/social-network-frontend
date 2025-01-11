"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export default function HomePage() {
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);
    const showPostComments = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                
                setComments(response.data.comments);
                setSelectedPostId(postId);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires", error);
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
        }
    };

    const fetchPosts = async () => {
        try {
            console.log("fetchPosts");
        
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch((error) => {
                if (error.response.status === 401) {
                    window.location.href = '/login';
                }
                console.error("Erreur lors de la récupération des posts", error);
            });
            if (response.status === 200) {
                const data = response.data;
                setPosts(data.posts);
            } else {
                if (response.data.message == "Unauthenticated.") {
                    window.location.href = '/login';
                }
                console.error("Erreur lors de la récupération des posts", response.data.message);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts", error);
        }
    };

    const addPost = async (e) => {
        e.preventDefault();
        console.log("addPost");
        const token = localStorage.getItem('token');
        const formData = {
            content: e.target.content.value,
        };
        try {
            const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });
            if (response.status === 200 || response.status === 201) {
                fetchPosts();
            } else {
                console.error("Erreur lors de l'ajout du post", response.data.message);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du post", error);
        }
    };
  
  const addComment = async (e) => {
    e.preventDefault();
    console.log("addComment");
    const token = localStorage.getItem('token');
    const formData = {
        content: e.target.content.value,
    };
    try {
        const response = await axios.post(`${API_BASE_URL}/posts/${selectedPostId}/comments`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 200 || response.status === 201) {
          showPostComments(selectedPostId);
          e.target.content.value = '';
        } else {
            console.error("Erreur lors de l'ajout du commentaire", response.data.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire", error);
    }
  };

  const toggleLike = async (postId) => {
    console.log("toggleLike", postId);
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`${API_BASE_URL}/posts/${postId}/likes`,{}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 200 || response.status === 201) {
            fetchPosts();
        } else {
            console.error("Erreur lors de l'ajout du like", response.data.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du like", error);
    }

  };

  const closeComments = () => {
    setSelectedPostId(null);
    setComments([]);
  };
  return (
    <div className="max-w-5xl  mx-auto p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-600">EPPF SOCIAL</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Déconnexion
        </button>
      </div>
      {/* Formulaire de création de post */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <form className="space-y-4" onSubmit={ addPost}>
          <div>
            <textarea
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
              name="content"
              id="content"
              required
              rows="4"
              placeholder="Quoi de neuf ?"
            ></textarea>
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

      {/* Liste des posts */}
      <div className="space-y-6">
        {posts && posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{post.user.name}</h2>
                <p className="text-gray-500">{post.created_at}</p>
            </div>
            <hr className="my-4" />
            <p className="text-gray-700">{post.content}</p>
            <hr className="my-4" />
            <div className="flex items-center space-x-4 text-gray-500">
            <button 
              onClick={() => toggleLike(post.id)}
              className={`flex items-center space-x-2 hover:text-indigo-600 ${post.isLiked ? 'text-red-500' : ''}`}
            >
              <span> {post.isLiked ? "Je n'aime plus" : "J'aime"}</span>
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
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Commentaires</h2>
              <button 
                onClick={() => closeComments()}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
           
            </div>
            <div className="space-y-4">
              {comments && comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{comment.user.name}</h3>
                    <p className="text-sm text-gray-500">{comment.created_at}</p>
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