import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import PostCard from "../components/PostCard";
import '../components/PostCard.css'
import {FaSearch, FaSortAmountDown} from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="events-page-container">
            <div className="events-page-sort">
            <h1 className="events-page-title">Kommende Veranstaltungen</h1>
                <div className="events-controls">
                    {/* field search */}
                    <div className="search-wrapper">
                       {/* <FaSearch className="search-icon" />*/}
                        <input
                            type="text"
                            className="event-search"
                            placeholder="Suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <div className="icon-button"><FaSortAmountDown /></div>
                    <div className="icon-button"><FaSortAmountUp /></div>
                </div>
            </div>

            <div className="events-list">
                {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}