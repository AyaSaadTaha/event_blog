import React, {useEffect, useState} from "react";
import {collection, addDoc, doc, getDoc} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useAuth } from '../context/AuthContext';
import { Button, Menu, MenuItem, TextField, Box, Typography, Paper, CircularProgress } from "@mui/material";
import { FaChevronDown } from "react-icons/fa";
import { getAllKategorien } from '../components/kategorienEnum.js';

export default function BeitragErstellen() {

    const { currentUser } = useAuth();
    // Kategorien Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedKategorie, setSelectedKategorie] = useState("");
    const open = Boolean(anchorEl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        title: '',       // DB-Feld bleibt gleich
        content: '',     // DB-Feld bleibt gleich
        KategorienID: '', // DB-Feld bleibt gleich
        image: null,     // DB-Feld bleibt gleich
        imagePreview: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                if (!currentUser?.uid) {
                    throw new Error("Benutzer nicht angemeldet");
                }
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    throw new Error("Benutzerdokument nicht gefunden");
                }
                setUser(userDocSnap.data())
            } catch (error) {
                setError(error.message);
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

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setError("Bitte wählen Sie eine Bilddatei aus");
            return;
        }

        if (file.size > 500 * 1024) {
            setError("Das Bild muss kleiner als 500KB sein");
            return;
        }

        try {
            const compressedImage = await compressImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({
                    ...form,
                    image: reader.result,
                    imagePreview: reader.result
                });
                setError("");
            };
            reader.readAsDataURL(compressedImage);
        } catch (err) {
            setError("Fehler beim Verarbeiten des Bildes");
            console.error(err);
        }
    };

    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;

                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        } else {
                            reject(new Error("Fehler beim Komprimieren des Bildes."));
                        }
                    }, 'image/jpeg', 0.4);
                };
            };
        });
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
            setError("Titel, Inhalt und Kategorie sind erforderlich");
            setIsLoading(false);
            return;
        }

        try {
            const postData = {
                title: form.title,          // DB-Feld bleibt gleich
                content: form.content,      // DB-Feld bleibt gleich
                kategorienId: form.KategorienID, // DB-Feld bleibt gleich
                createdAt: new Date(),
                uid: currentUser?.uid,
                author: currentUser?.email,
                authorName: user?.name,
                imageBase64: form.image || null  // DB-Feld bleibt gleich
            };

            await addDoc(collection(db, "posts"), postData);

            setSuccess("Beitrag erfolgreich erstellt!");
            setForm({
                title: "",
                content: "",
                KategorienID: "",
                image: null,
                imagePreview: null
            });
            setSelectedKategorie("");
        } catch (err) {
            console.error("Fehler beim Erstellen des Beitrags:", err);
            setError(err.message || "Fehler beim Erstellen des Beitrags. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                    Neuen Beitrag erstellen
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
                        label="Titel"
                        variant="outlined"
                        fullWidth
                        name="title"       // DB-Feld bleibt gleich
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        label="Inhalt"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={1}
                        name="content"     // DB-Feld bleibt gleich
                        value={form.content}
                        onChange={handleChange}
                        required
                    />

                    <Box>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="raised-button-file">
                            <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                                Bild hochladen
                            </Button>
                        </label>
                        {form.imagePreview && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Bildvorschau:</Typography>
                                <img
                                    src={form.imagePreview}
                                    alt="Vorschau"
                                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            onClick={handleKategorienOpen}
                            endIcon={<FaChevronDown />}
                            sx={{ minWidth: 200, justifyContent: 'space-between' }}
                        >
                            {selectedKategorie || "Kategorie auswählen"}
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
                        {isLoading ? "Wird erstellt..." : "Beitrag erstellen"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};