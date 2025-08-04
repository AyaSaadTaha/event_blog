import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import CommentSection from "../components/CommentSection";

export default function PostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const postDoc = await getDoc(doc(db, "posts", id));
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() });
                } else {
                    setPost(null);
                }

                const q = query(collection(db, "comments"), where("postId", "==", id));
                const querySnapshot = await getDocs(q);
                const commentsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setComments(commentsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!post) return <div className="error">Post not found</div>;

    return (
        <div className="post-page">
            <article>
                <h1>{post.title}</h1>
                <div className="post-meta">
                    <span>Posted on: {new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
                {post.imageUrl && (
                    <div className="post-image">
                        <img src={post.imageUrl} alt={post.title} />
                    </div>
                )}
                <div className="post-content">
                    {post.content.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <CommentSection postId={id} comments={comments} />
        </div>
    );
}