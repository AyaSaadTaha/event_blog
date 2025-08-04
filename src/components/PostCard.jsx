import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {doc, setDoc, deleteDoc, getDoc, collection,query,onSnapshot} from "firebase/firestore";
import { db } from "../firebase/config";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function PostCard({ post }) {
    const { currentUser } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    // Check if current user has favorited this post
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (currentUser) {
                const favRef = doc(db, "posts", post.id, "favorites", currentUser.uid);
                const docSnap = await getDoc(favRef);
                setIsFavorite(docSnap.exists());
            }
        };
        checkFavoriteStatus();
    }, [currentUser, post.id]);

    // Subscribe to favorite count changes
    useEffect(() => {
        const q = query(collection(db, "posts", post.id, "favorites"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFavoriteCount(snapshot.size);
        });
        return () => unsubscribe();
    }, [post.id]);

    const toggleFavorite = async () => {
        if (!currentUser) return;

        const postFavRef = doc(db, "posts", post.id, "favorites", currentUser.uid);
        const userFavRef = doc(db, "users", currentUser.uid, "userFavorites", post.id);

        try {
            if (isFavorite) {
                await deleteDoc(postFavRef);
                await deleteDoc(userFavRef);
            } else {
                const favData = {
                    favoritedAt: new Date(),
                    postTitle: post.title,
                    postContent: post.content
                };
                await setDoc(postFavRef, favData);
                await setDoc(userFavRef, favData);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Error updating favorite:", error);
        }
    };

    return (
        <div className="post-card">
            <div className="post-image-container">
                {currentUser && (
                    <button
                        className={`favorite-button ${isFavorite ? "active" : ""}`}
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
            </div>

            <div className="post-content">
                <Link to={`/PostDetails/${post.id}`}>
                    <h3>{post.title}</h3>
                    <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
                </Link>

                <div className="post-meta">
                    <span className="post-date">
                      {new Date(post.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                    <span className="post-author">
                        {post.author || "Unknown author"}
                    </span>
                    <div className="favorite-count">
                        <FaHeart /> {favoriteCount}
                    </div>
                </div>
            </div>
        </div>
    );
}