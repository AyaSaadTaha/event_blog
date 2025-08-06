import React, { useState, useEffect } from 'react';
import {format, isValid} from 'date-fns';
import './MangePostsList.css';
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../firebase/config";
import {collection,query, where,getDocs,updateDoc,deleteDoc,doc,orderBy,getDoc} from "firebase/firestore";
import {getAllKategorien, getKategorieNameById} from "./kategorienEnum.js";
import {useNavigate} from "react-router-dom";

const MangePostsList = () => {
    // State management
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);
    const postsPerPage = 5;
    const [error, setError] = useState(null);
    const [isAdminView, setIsAdminView] = useState(false); // Added state for admin view
    const [user, setUser] = useState(false); // Added state for admin view

    // Fetch data from Firebase
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!currentUser?.uid) {
                    throw new Error("User not authenticated");
                }

                // 1. Get user role
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    throw new Error("User document not found");
                }

                const userRole = userDocSnap.data().role;
                const adminView = userRole === 'admin' || userRole === 'moderator';
                setIsAdminView(adminView);
                setUser(userDocSnap.data())

                // 2. Fetch posts based on role
                const postsQuery = adminView
                    ? query(collection(db, 'posts'), orderBy("createdAt", "desc"))
                    : query(collection(db, 'posts'),
                        where('uid', '==', currentUser.uid),
                        orderBy("createdAt", "desc"));

                const postsSnapshot = await getDocs(postsQuery);
                const postsData = postsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        title: data.title || 'Untitled',
                        content: data.content || '',
                        kategorienId: data.kategorienId || null,
                        author: data.author || currentUser.uid,
                        createdAt: data.createdAt || new Date().toISOString()
                    };
                });
                setPosts(postsData);

                // 3. Fetch categories
                setCategories(getAllKategorien());

            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.uid) {
            fetchData();
        }
    }, [currentUser]);

    // Filter posts based on search and category


    const filteredPosts = posts.filter(post => {
        const searchTerm = searchQuery.toLowerCase();
        const matchesSearch =
            post.title?.toLowerCase().includes(searchTerm) ||
            post.content?.toLowerCase().includes(searchTerm);

        // Verbesserte Kategorienfilterung
        const matchesCategory =
            !categoryFilter ||
            post.kategorienId?.toString() === categoryFilter.toString();

        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const paginatedPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Helper functions
    const formatDate = (timestamp) => {
        try {
            // Handle both Firestore Timestamp objects and ISO strings
            const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(isValid(date) ? date : new Date(), 'MMM dd, yyyy HH:mm');
        } catch (error) {
            console.warn('Invalid date:', error);
            return format(new Date(), 'MMM dd, yyyy HH:mm'); // Fallback to current date
        }
    };

    const truncateContent = (content, length = 50) => {
        return content?.length > length ? `${content.substring(0, length)}...` : content;
    };

    // CRUD operations with Firebase

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {

            try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(prevPosts => prevPosts.filter(post => post.uid !== postId));
            } catch (err) {
            console.error("Error deleting post:", err);
        }
        }
    };

    const handleUpdatePost = async () => {
        try {
            const postRef = doc(db, 'posts', selectedPost.uid);
            await updateDoc(postRef, {
                title: selectedPost.title,
                content: selectedPost.content,
                kategorienId: selectedPost.kategorienId
            });

            setPosts(posts.map(post =>
                post.uid === selectedPost.uid ? selectedPost : post
            ));
            setSelectedPost(null);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    // Render functions
    if (loading) {
        return <div className="loading-spinner">Wird geladen...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!currentUser) {
        return <div className="auth-message">Bitte melde dich an, um Beiträge anzusehen</div>;
    }

    return (
        <div className="posts-container">
            {/* Header */}
            <div className="header">
                {<h1>{isAdminView ? 'Alle  Beiträge' : 'Meine Beiträge'}</h1>}
            </div>

            {/* Search and Filter */}
            <div className="search-filter">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Beiträge suchen..."
                    className="search-input"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-select"
                >
                    <option value="">Alle Kategorien </option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Posts Table */}
            <div className="posts-table">
                <table>
                    <thead>
                    <tr>
                        <th>Titel</th>
                        <th>Inhalt</th>
                        <th>Kategorie</th>
                        <th>Erstellt am </th>
                        <th>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedPosts.length > 0 ? (
                        paginatedPosts.map(post => (
                            <tr key={post.uid}>
                                <td>{post.title}</td>
                                <td>{truncateContent(post.content)}</td>
                                <td>{getKategorieNameById(post.kategorienId)}</td>
                                <td>{formatDate(post.createdAt)}</td>
                                <td className="actions">
                                    <button
                                        onClick={() => navigate(`/posts/${post.uid}/comments`, {
                                            state: {
                                                post: {
                                                    uid: post.uid,
                                                    title: post.title,
                                                    content: post.content,
                                                    kategorienId: post.kategorienId,
                                                    author: post.author,
                                                    createdAt: post.createdAt
                                                    // Nur die benötigten Felder
                                                },
                                                currentUser: {
                                                    uid: currentUser?.uid,
                                                    email: currentUser?.email,
                                                    role: currentUser?.role
                                                    // Nur die benötigten Felder
                                                },
                                                user: {
                                                    name: user?.name,
                                                    role: user?.role
                                                    // Weitere benötigte Felder
                                                }
                                            }
                                        })}
                                        className="action-btn view-comments"
                                    >
                                        Kommentare verwalten
                                    </button>
                                    <button
                                        onClick={() => setSelectedPost({...post})}
                                        className="action-btn edit"
                                    >
                                        Bearbeiten
                                    </button>
                                    <button
                                        onClick={() => handleDeletePost(post.uid)}
                                        className="action-btn delete"
                                    >
                                        Löschen
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-posts">Keine Beiträge gefunden</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Zurück
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Weiter
                    </button>
                </div>
            )}

            {/* Edit Post Modal */}
            {selectedPost && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Beitrag bearbeiten </h2>
                        <div className="form-group">
                            <label>Titel</label>
                            <input
                                type="text"
                                value={selectedPost.title}
                                onChange={(e) => setSelectedPost({...selectedPost, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Inhalt</label>
                            <textarea
                                value={selectedPost.content}
                                onChange={(e) => setSelectedPost({...selectedPost, content: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Kategorie</label>
                            <select
                                value={selectedPost.kategorienId}
                                onChange={(e) => setSelectedPost({...selectedPost, kategorienId: e.target.value})}
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setSelectedPost(null)} className="cancel-btn">
                                Abbrechen
                            </button>
                            <button onClick={handleUpdatePost} className="confirm-btn">
                                Änderungen speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MangePostsList;

