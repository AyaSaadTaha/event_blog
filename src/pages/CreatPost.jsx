import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useAuth } from '../context/AuthContext';

export default function CreatePost() {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        title: '',
        content: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (!form.title.trim() || !form.content.trim()) {
            setError("Title and content are required");
            setIsLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "posts"), {
                title: form.title,
                content: form.content,
                createdAt: new Date(),
                uid: currentUser?.uid, // Store user ID with the post
                author: currentUser?.email, // Optional: Store author email
            });
            setSuccess("Post created successfully!");
            setForm({ title: "", content: "" }); // Reset form
        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.message || "Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <h1>Create New Post</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Enter post title"
                        name="title"
                        value={form.title} // Controlled input
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        placeholder="Write your post content here..."
                        name="content"
                        value={form.content} // Controlled input
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Publishing..." : "Publish Post"}
                </button>
            </form>
        </div>
    );
}