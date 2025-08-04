import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

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
                //author: currentUser?.displayName || "Anonymous", // Fallback if no name
                author: currentUser.email,
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
        <div className="comment-section">
            <h3>Comments ({comments.length})</h3>
            {currentUser && (
                <form onSubmit={handleSubmit}>
          <textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
          />
                    <button type="submit">Post</button>
                </form>
            )}
            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment.id} className="comment">
                        <p><strong>{comment.author}</strong>: {comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}