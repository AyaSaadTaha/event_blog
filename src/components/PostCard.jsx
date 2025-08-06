import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {doc, setDoc, deleteDoc, getDoc, collection,query,onSnapshot} from "firebase/firestore";
import { db } from "../firebase/config";
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
                    {new Date(post.createdAt?.toDate()).toLocaleString('de-DE', { month: 'short' }).toUpperCase()}
                </span>
                <span className="event-day">
                     {new Date(post.createdAt?.toDate()).getDate()}
                </span>
            </div>

            <div className="event-info">
                <div className="event-image-wrapper">
                    <img
                        src={post.imageBase64 || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070"}
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
                        <Chip sx={{backgroundColor:'#c01615', width: 100}} label={getKategorieNameById(post.kategorienId)} color="primary" />
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
                            Veranstaltungsdetails anzeigen →
                        </Link>
                        <Box/>
                    </div>
                </CardContent>
                </div>
            </div>
        </div>
    </Card>
    );
}