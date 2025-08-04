import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import PostCard from '../components/PostCard';

export default function Profile() {
    const { currentUser } = useAuth();
    const [favoritePosts, setFavoritePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    // 1. Get user's document from Firestore
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data());
                    } else {
                        console.log("No user data found");
                    }

                    // 2. Get user's favorite posts
                    const favoritesRef = collection(db, "users", currentUser.uid, "userFavorites");
                    const favoritesSnapshot = await getDocs(favoritesRef);

                    const postsPromises = favoritesSnapshot.docs.map(async (favDoc) => {
                        const postRef = doc(db, "posts", favDoc.id);
                        const postSnap = await getDoc(postRef);

                        return {
                            id: favDoc.id,
                            ...postSnap.data(),
                            favoritedAt: favDoc.data().favoritedAt
                        };
                    });

                    const posts = await Promise.all(postsPromises);
                    setFavoritePosts(posts);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <FaUser size={80} />
                </div>
                <h1>{userData?.name || currentUser?.displayName || 'User Profile'}</h1>
            </div>

            <div className="profile-details">
                <div className="detail-card">
                    <FaEnvelope className="detail-icon" />
                    <div>
                        <h3>Email</h3>
                        <p>{currentUser?.email}</p>
                    </div>
                </div>

                <div className="detail-card">
                    <FaPhone className="detail-icon" />
                    <div>
                        <h3>Phone</h3>
                        <p>{userData?.phone || 'Not provided'}</p>
                    </div>
                </div>

                <div className="detail-card">
                    <FaUserShield className="detail-icon" />
                    <div>
                        <h3>Role</h3>
                        <p>{userData?.role || 'user'}</p>
                    </div>
                </div>

                <div className="detail-card">
                    <FaCalendarAlt className="detail-icon" />
                    <div>
                        <h3>Member Since</h3>
                        <p>
                            {currentUser?.metadata?.creationTime
                                ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                                : 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="favorites-section">
                <h2>Your Favorite Posts ({favoritePosts.length})</h2>
                {loading ? (
                    <div className="loading">Loading favorites...</div>
                ) : favoritePosts.length > 0 ? (
                    <div className="favorites-grid">
                        {favoritePosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={{
                                    id: post.id,
                                    title: post.title,
                                    content: post.content || "",
                                    kategorienId: post.kategorienId || "",
                                    createdAt: post.createdAt,
                                    author: post.author
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-favorites">You haven't favorited any posts yet.</p>
                )}
            </div>
        </div>
    );
}