import React, { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from "../firebase/config";
import {collection,query, where, getDocs,addDoc, deleteDoc,doc,updateDoc,orderBy, getDoc} from "firebase/firestore";
import './MangeCommentsList.css';

const MangeCommentsList = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Zustand für Kommentare und UI
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    // Daten aus dem Router state oder neu laden
    const [post, setPost] = useState(state?.post || null);
    const [currentUser, setCurrentUser] = useState(state?.currentUser || null);
    const [user, setUser] = useState(state?.user || null);

    // Kommentare laden
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Falls keine Daten über State kamen (direkter Aufruf)
                if (!post && state?.postId) {
                    const postDoc = await getDoc(doc(db, 'posts', state.postId));
                    if (postDoc.exists()) {
                        setPost({ uid: postDoc.id, ...postDoc.data() });
                    }
                }

                // Kommentare laden
                const commentsQuery = query(
                    collection(db, 'comments'),
                    where('postId', '==', post?.uid || state?.postId),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(commentsQuery);

                setComments(querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [post?.uid, state?.postId]);

    // Neuen Kommentar hinzufügen
    const handleAddComment = async () => {
        if (!newComment.trim() || !user || !post) return;

        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                postId: post.uid,
                uid: currentUser?.uid,
                author: currentUser?.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date().toISOString()
            });

            setComments(prev => [{
                id: docRef.id,
                uid:currentUser?.uid,
                postId: post.uid,
                author: currentUser?.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date().toISOString()
            }, ...prev]);

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        console.log('Attempting to delete comment:', commentId);
        console.log('Current user:', currentUser);

        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteDoc(doc(db, 'comments', commentId));
                console.log('Comment deleted successfully');
                setComments(comments.filter(c => c.id !== commentId));
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert(`Failed to delete comment: ${error.message}`);
            }
        }
    };

    // Kommentar bearbeiten - mit Debugging
    const handleUpdateComment = async (commentId) => {
        if (!editedContent.trim()) return;

        try {
            await updateDoc(doc(db, 'comments', commentId), {
                content: editedContent,
                updatedAt: new Date().toISOString()
            });

            setComments(prev => prev.map(c =>
                c.id === commentId ? {
                    ...c,
                    content: editedContent,
                    updatedAt: new Date().toISOString()
                } : c
            ));

            setEditingCommentId(null);
            setEditedContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    // Datumsformatierung
    const formatDate = (timestamp) => {
        try {
            const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(isValid(date) ? date : new Date(), 'PPpp');
        } catch {
            return format(new Date(), 'PPpp');
        }
    };

    if (loading) {
        return (
            <div className="comments-container">
                <div className="loading-spinner">Loading comments...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="comments-container">
                <div className="error-message">Post not found</div>
            </div>
        );
    }

    return (
        <div className="comments-container">
            <div className="comments-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← Back to Post
                </button>
                <h1>Comments for: {post.title}</h1>
            </div>

            <div className="comments-content">
                {/* Neuer Kommentar Bereich */}
                <div className="add-comment-section">
                    <h3>Add New Comment</h3>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Kommentar hinzufügen..."
                        rows="4"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="submit-comment-btn"
                    >
                        Kommentieren
                    </button>
                </div>

                {/* Kommentarliste */}
                <div className="comments-list">
                    <h3>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</h3>

                    {comments.length === 0 ? (
                        <div className="no-comments">No comments yet. Be the first to comment!</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-header">
                                    <div className="comment-author-info">
                                        <span className="author-name">{comment.authorName || comment.author}</span>
                                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    </div>

                                    {(currentUser?.uid === comment.uid ||
                                        user?.role === 'admin' ||
                                        user?.role === 'moderator') && (
                                        <div className="comment-actions">
                                            {editingCommentId === comment.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateComment(comment.id)}
                                                        className="action-btn save-btn"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(null);
                                                            setEditedContent('');
                                                        }}
                                                        className="action-btn cancel-btn"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(comment.id);
                                                            setEditedContent(comment.content);
                                                        }}
                                                        className="action-btn edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="action-btn delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {editingCommentId === comment.id ? (
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="edit-comment-textarea"
                                        rows="3"
                                    />
                                ) : (
                                    <div className="comment-text">{comment.content}</div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MangeCommentsList;