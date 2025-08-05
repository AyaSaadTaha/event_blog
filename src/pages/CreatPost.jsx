import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar.jsx";
import {Button, Menu, MenuItem} from "@mui/material";
import {FaChevronDown} from "react-icons/fa";
import { getAllKategorien } from '../components/kategorienEnum.js';


export default function CreatePost() {
    // für kategorien dropdownlist
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedKategorie, setSelectedKategorie] = useState("");
    const handleKategorienOpen = (event) => setAnchorEl(event.currentTarget);
    const handleKategorienClose = () => setAnchorEl(null);

    const handleKategorieSelect = (kat) => {
        setForm({...form, KategorienID: kat.id});
        setSelectedKategorie(kat.name);
        handleKategorienClose();
    };
    // end für kategorien dropdownlist

    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        title: '',
        content: '',
        KategorienID: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (!form.title.trim() || !form.content.trim() || !form.KategorienID) {
            setError("Title, content, and category are required");
            setIsLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "posts"), {
                title: form.title,
                content: form.content,
                kategorienId: form.KategorienID,
                createdAt: new Date(),
                uid: currentUser?.uid,
                author: currentUser?.email,
            });
            setSuccess("Post created successfully!");
            setForm({ title: "", content: "", KategorienID: "" });
            setSelectedKategorie("");
        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.message || "Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page">
            {/*<Navbar />*/} {/* Don't forget to include the Navbar */}
            <h1>Post erstellen</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Enter post title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        placeholder="Write your post content here..."
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <Button
                        aria-controls={anchorEl ? "kategorien-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={anchorEl ? "true" : undefined}
                        onClick={handleKategorienOpen}
                        color="inherit"
                        endIcon={<FaChevronDown />}
                    >
                        {selectedKategorie || "Select Category"}
                    </Button>

                    <Menu
                        id="kategorien-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleKategorienClose}
                    >
                        <option value="">All Categories</option>
                        {getAllKategorien().map((kat) => (
                            <MenuItem
                                key={kat.id}
                                onClick={() => handleKategorieSelect(kat)}
                            >
                                {kat.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
                <br/><br/>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Post"}
                </button>
            </form>
        </div>
    );
}