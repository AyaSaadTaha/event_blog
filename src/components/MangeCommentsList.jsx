import React, { useState, useEffect } from 'react';
import {format, isValid} from 'date-fns';
import './MangeCommentsList.css';
import { db } from "../firebase/config";
import {collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

const MangeCommentsList = ({ post, currentUser,user, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    console.log("hi"+user.name);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentsCol = collection(db, 'comments');
                const q = query(commentsCol, where('postId', '==', post.uid));
                const querySnapshot = await getDocs(q);

                const commentsData = querySnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));

                setComments(commentsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setLoading(false);
            }
        };

        fetchComments();
    }, [post.uid]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const commentsCol = collection(db, 'comments');
            const docRef = await addDoc(commentsCol, {
                postId: post.uid,
                uid: currentUser?.uid, // Store user ID with the post
                author: currentUser.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date().toISOString()
            });

            // Add the new comment to state with its generated ID
            setComments([...comments, {
                postId: post.uid,
                uid: docRef.id,
                author: currentUser.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date().toISOString()
            }]);

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteDoc(doc(db, 'comments', commentId));
                setComments(comments.filter(comment => comment.uid !== commentId));
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

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

    return (
        <div className="comments-modal-overlay">
            <div className="comments-modal">
                <div className="comments-header">
                    <h2>Comments for: {post.title}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <div className="comments-list">
                    {loading ? (
                        <div className="loading">Loading comments...</div>
                    ) : comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.uid} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.authorName||comment.author}</span>
                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    {(currentUser.role === 'admin' || currentUser.role === 'moderator' || currentUser.uid === comment.author) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.uid)}
                                            className="delete-comment-btn"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div className="comment-content">{comment.content}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-comments">No comments yet</div>
                    )}
                </div>

                <div className="add-comment">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment here..."
                    />
                        <button onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button onClick={handleAddComment} className="add-comment-btn">
                            Add Comment
                        </button>
                </div>

            </div>
        </div>
    );
};

export default MangeCommentsList;