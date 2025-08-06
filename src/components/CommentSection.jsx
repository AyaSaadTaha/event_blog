import { useState,useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import './CommentSection.css'

export default function CommentSection({ post, postId, comments }) {
    const [comment, setComment] = useState("");
    const { currentUser } = useAuth();
    const [user, setUser] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Fetch data from Firebase users
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!currentUser?.uid) {
                    throw new Error("User not authenticated");
                }
                // 1. Get user
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    throw new Error("User document not found");
                }
                setUser(userDocSnap.data())
                console.log(userDocSnap.data().name)
            } catch (error) {
               console.log(error)
            }
        }
        if (currentUser?.uid) {
            fetchData();
        }
        setComment(comments)
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const docRef =  await addDoc(collection(db, "comments"), {
                postId,
                uid: currentUser?.uid, // Store user ID with the post
                author: currentUser.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date(),
            });

            setComment(prev => [{
                id: docRef.id,
                uid:currentUser?.uid,
                postId: postId,
                author: currentUser?.email,
                authorName: user.name,
                content: newComment,
                createdAt: new Date().toISOString()
            }, ...prev]);

            setNewComment('');

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

                {comment.length > 0 ? (
                    <div>
                        {comment.map((c) => (
                            <div key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{c.authorName}</span>
                                    <span className="comment-separator">•</span>
                                    <span className="comment-time">{new Date(c.createdAt?.toDate()).toLocaleString('de-DE')}</span>
                                </div>
                                <p className="comment-text">{c.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="comments-empty">
                        <p>Noch keine Kommentare</p>
                        <p>Sei der Erste, der deine Meinung teilt!</p>
                    </div>
                )}
            </div>
        </section>
        {/* Section of comments form */}
        {currentUser && (
            <div className="comment-form">
                <textarea
                    placeholder="Kommentar hinzufügen..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-textarea"
                    rows="3"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!newComment.trim()}
                    className="comment-submit"
                >
                    Kommentieren
                </button>
            </div>
        )}
    </>

    );
}