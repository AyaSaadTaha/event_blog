import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {doc, setDoc, deleteDoc, getDoc, collection,query,onSnapshot} from "firebase/firestore";
import { db } from "../firebase/config";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Divider,
    Box,
    Stack,
} from "@mui/material";

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
        <Card sx={{ marginBottom: 3 }}>
            <CardContent>
                {/* Oben: Datum + Favoriten */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {new Date(post.createdAt?.toDate()).toLocaleDateString()}
                    </Typography>

                        {currentUser && (
                            <IconButton
                                className={`favorite-button ${isFavorite ? "active" : ""}`}
                                onClick={toggleFavorite}
                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {isFavorite ? <FaHeart /> : <FaRegHeart />}
                            </IconButton>
                        )}

                </Stack>

                {/* title */}
                <Typography variant="h5" component="div" sx={{ marginTop: 1 }}>
                    <Link to={`/PostDetails/${post.id}`}>
                        <h3>{post.title}</h3>
                    </Link>
                </Typography>

                {/* description */}
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                    <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
                </Typography>

                {/* categories */}
                <Box sx={{ marginTop: 2 }}>
                    <Chip label={post.category} color="primary" />
                </Box>

                <Divider sx={{ marginY: 2 }} />
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                    {post.author || "Unknown author"}
                </Typography>
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                    <FaHeart /> {favoriteCount}
                </Typography>

            </CardContent>
        </Card>
    );
}