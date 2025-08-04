import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function AdminPanel() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const querySnapshot = await getDocs(collection(db, "posts"));
            const postsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsData);
        };
        fetchPosts();
    }, []);

    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    return (
        <div className="admin-panel">
            <h2>Manage Posts</h2>
            {posts.map((post) => (
                <div key={post.id} className="post-item">
                    <h3>{post.title}</h3>
                    <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}