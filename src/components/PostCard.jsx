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
import './PostCard.css'
import {getKategorieNameById} from "./kategorienEnum.js";

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
    <Card className="event-card">
        <div className="event-container">

            <div className="event-date">
                <span className="event-month">
                    {new Date(post.createdAt?.toDate()).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                </span>
                <span className="event-day">
                     {new Date(post.createdAt?.toDate()).getDate()}
                </span>
            </div>

            <div className="event-info">
                <div className="event-image-wrapper">
                    <img
                        src={post.image || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070"}
                        alt="Event"
                        className="event-image"
                    />
                    {currentUser && (
                        <IconButton
                            className={`favorite-icon ${isFavorite ? "active" : ""}`}
                            onClick={toggleFavorite}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isFavorite ? <FaHeart /> : <FaRegHeart />}
                        </IconButton>
                    )}
                </div>


                <div className="event-content">
                <CardContent>
                    <Box sx={{ marginBottom: 3 }}>
                        <Chip label={getKategorieNameById(post.kategorienId)} color="primary" />
                    </Box>
                    <Typography sx={{ marginBottom: 3 }} variant="h6" className="event-title">
                        <Link to={`/PostDetails/${post.id}`}>
                            {post.title}
                        </Link>
                    </Typography>

                    <Typography sx={{ marginBottom: 5 }} variant="body2" className="event-description">
                        {post.content.substring(0, 100)}...
                    </Typography>

                    <div className="event-footer">
                        <Box sx={{ borderTop: '1px solid #ddd', mt: 2, mb: 1 }} />
                        <Link to={`/PostDetails/${post.id}`} className="event-details-link">
                            View Event Details →
                        </Link>
                        <Box/>
                    </div>
                </CardContent>
                </div>
            </div>
        </div>
    </Card>

    /*<Card className="postcard-card" sx={{ marginBottom: 3 }}>
            <div className="postcard-image-container">
                <img
                    src={post.image || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dg"}
                    alt="img"
                    className="postcard-image"
                />
            </div>
            <CardContent className="postcard-content">
                {/!* Oben: Datum + Favoriten *!/}
                <Stack className="postcard-top" direction="row" justifyContent="space-between" alignItems="center">
                    <Typography className="postcard-date" variant="body2" color="text.secondary">
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

                {/!* title *!/}
                <Typography variant="h5" component="div" sx={{ marginTop: 1 }}>
                    <Link className="postcard-title" to={`/PostDetails/${post.id}`}>
                        <h3>{post.title}</h3>
                    </Link>
                </Typography>

                {/!* description *!/}
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                    <p className="postcard-description">{post.content.substring(0, 100)}...</p>
                </Typography>

                {/!* categories *!/}
                <Box sx={{ marginTop: 2 }}>
                    <Chip label={getKategorieNameById(post.kategorienId)} color="primary" />
                </Box>

                <Divider className="postcard-divider" sx={{ marginY: 2 }} />
                <span className="postcard-author">
                    {post.author || "Unknown author"} • <FaHeart /> {favoriteCount}
                </span>

            </CardContent>
        </Card>*/
    );
}