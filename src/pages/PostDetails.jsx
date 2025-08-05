import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import CommentSection from "../components/CommentSection";
import {Box, Chip} from "@mui/material";
import {getKategorieNameById} from "../components/kategorienEnum.js";
import {FaRegHeart} from "react-icons/fa";
import '../components/CommentSection.css'

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
            <div className="post-container">
            {/* Event */}
            <article className="post-article">
                <div className="post-content">
                    <Box sx={{ marginBottom: 1, textAlign: "center" }}>
                        <Chip sx={{backgroundColor:'#c01615', width: 100}} label={getKategorieNameById(post.kategorienId)} color="primary" />
                    </Box>
                    <header className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-date">
                            Veröffentlicht am: {new Date(post.createdAt?.toDate()).toLocaleDateString('de-DE')}
                        </div>
                    </header>

                    <div className="post-body-container">
                    <img src={post.image || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070"} alt={post.title} className="post-image" />
                    <div className="post-body">
                        {post.content.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                    </div>
                    {/* Like button */}
                    <div className="comment-actions">
                        <button className="like-btn">
                            <FaRegHeart />
                            <span>0</span>
                        </button>
                    </div>
                </div>
            </article>
            <CommentSection postId={id} comments={comments} />
            </div>
        </div>
    );
}