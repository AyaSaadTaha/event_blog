import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import './CommentSection.css'

export default function CommentSection({ postId, comments }) {
    const [comment, setComment] = useState("");
    const { currentUser } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            await addDoc(collection(db, "comments"), {
                postId,
                uid: currentUser?.uid, // Store user ID with the post
                author: currentUser.email,
                authorName: currentUser.name,
                content: comment,
                createdAt: new Date(),
            });
            window.location.reload(); // Nicht ideal für UX
            setComment("");
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    return (
    <>
        {/* Section of all comments */}
        <section className="comments-section">
            <div className="comments-container">
                <h3 className="comments-title">Kommentare ({comments.length})</h3>
                <div className="gradient-line"></div>

                {comments.length > 0 ? (
                    <div>
                        {comments.map((c) => (
                            <div key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <strong className="comment-author">{c.author}</strong>
                                    <span className="comment-separator">•</span>
                                    <span className="comment-time">gerade eben</span>
                                </div>
                                <p className="comment-text">{c.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="comments-empty">
                        <p>No comments yet</p>
                        <p>Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </section>
        {/* Section of comments form */}
        {currentUser && (
            <div className="comment-form">
                <textarea
                    placeholder="Kommentar hinzufügen..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-textarea"
                    rows="3"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!comment.trim()}
                    className="comment-submit"
                >
                    Kommentieren
                </button>
            </div>
        )}
    </>

    );
}