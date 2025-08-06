import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import PostCard from "../components/PostCard";
import '../components/PostCard.css'
import {FaSearch, FaSortAmountDown} from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import {Pagination} from "@mui/material";
import {Box} from "@mui/material";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get("category") || "alles";

    //Pagination
    const postsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log("📌 Posts from Firestore:", postsData);
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((post) => {
        if (categoryParam === "alles") return true; // show all event posts
        return String(post.kategorienId) === String(Number(categoryParam) - 1);
        //search input
    }).filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
        // Sort posts by date
    ).sort((a, b) => {
        const dateA = a.createdAt.toDate(); // Timestamp → Date
        const dateB = b.createdAt.toDate();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="events-page-container">
            <div className="events-page-sort">
            <h1 className="events-page-title">Kommende Veranstaltungen</h1>
                <div className="events-controls">
                    {/* field search */}
                <div>
                    <div
                        className={`icon-button ${sortOrder === "asc" ? "active" : ""}`}
                        onClick={() => setSortOrder("asc")}
                        title="Sort by oldest first"
                    >
                        <FaSortAmountUp />
                    </div>
                    <div
                        className={`icon-button ${sortOrder === "desc" ? "active" : ""}`}
                        onClick={() => setSortOrder("desc")}
                        title="Sort by newest first"
                    >
                        <FaSortAmountDown />
                    </div>
                </div>

            </div>

            </div>
            <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="event-search"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="events-list">
                {currentPosts.map((post) => (
                    <PostCard key={post.id} post={post}/>
                ))}
            </div>
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mb={4}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => handlePageChange(event, value)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                '&.Mui-selected': {
                                    backgroundColor: '#83b2e4',
                                    color: '#fff',
                                },
                                '&:hover': {
                                    backgroundColor: '#d0d0d0',
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </div>
    );
}