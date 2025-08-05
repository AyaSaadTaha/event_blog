import React, {useEffect, useState} from "react";
import {collection, addDoc, doc, getDoc} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useAuth } from '../context/AuthContext';
import { Button, Menu, MenuItem, TextField, Box, Typography, Paper, CircularProgress } from "@mui/material";
import { FaChevronDown } from "react-icons/fa";
import { getAllKategorien } from '../components/kategorienEnum.js';

export default function CreatePost() {

    const { currentUser } = useAuth();
    // Kategorien Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedKategorie, setSelectedKategorie] = useState("");
    const open = Boolean(anchorEl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        KategorienID: ''
    });

    // Fetch data from Firebase
    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                if (!currentUser?.uid) {
                    throw new Error("User not authenticated");
                }
                // 1. Get user
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    throw new Error("User document not found");
                }
                setUser(userDocSnap.data())
                console.log(userDocSnap.data().name)
            } catch (error) {
                setError(error);
            }
        }
            if (currentUser?.uid) {
                fetchData();
            }
        }, [currentUser]);


    const handleKategorienOpen = (event) => setAnchorEl(event.currentTarget);
    const handleKategorienClose = () => setAnchorEl(null);
    const handleKategorieSelect = (kat) => {
        setForm({...form, KategorienID: kat.id});
        setSelectedKategorie(kat.name);
        handleKategorienClose();
    };
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
                authorName: user.name,
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
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                    Create New Post
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Typography color="success.main" sx={{ mb: 2 }}>
                        {success}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Content"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={1}
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                    />

                    <Box>
                        <Button
                            variant="outlined"
                            onClick={handleKategorienOpen}
                            endIcon={<FaChevronDown />}
                            sx={{ minWidth: 200, justifyContent: 'space-between' }}
                        >
                            {selectedKategorie || "Select Category"}
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleKategorienClose}
                        >
                            {getAllKategorien().map((kat) => (
                                <MenuItem
                                    key={kat.id}
                                    onClick={() => handleKategorieSelect(kat)}
                                    selected={form.KategorienID === kat.id}
                                >
                                    {kat.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{ mt: 2, py: 1.5 }}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                        {isLoading ? "Creating..." : "Create Post"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );

    };