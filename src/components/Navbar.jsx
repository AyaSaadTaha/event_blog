import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase/config';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModerator, setIsModerator] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setIsAdmin(userSnap.data().role === "admin");
                    setIsModerator(userSnap.data().role === "moderator");
                }
            } else {
                setIsAdmin(false);
                setIsModerator(false);
            }
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">EventBlog</Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                {currentUser ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        {isAdmin && (
                            <>
                                <Link to="/creatpost">Add Post</Link>
                                <Link to="/adminpanel">Posts</Link>
                                <Link to="/users">Users</Link>
                            </>
                        )}
                        {isModerator && !isAdmin && (
                            <>
                                <Link to="/creatpost">Add Post</Link>
                                <Link to="/adminpanel">Posts</Link>
                            </>
                        )}
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}