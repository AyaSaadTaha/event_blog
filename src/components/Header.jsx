import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {auth, db} from '../firebase/config';
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import './Header.css'
import {AppBar, Box, Button, IconButton, Toolbar, Typography} from "@mui/material";
import Navbar from "./Navbar.jsx";
import {FaSignInAlt, FaUserPlus} from "react-icons/fa";
import {MdLogout} from "react-icons/md";
import { Menu, MenuItem } from "@mui/material";
import { FaChevronDown } from "react-icons/fa";
import { AuthModal } from "./AuthModal";
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const {currentUser} = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);


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
            navigate('/'); // Weiterleitung zur Startseite
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };
    const handleSwitchAuthMode = () => {
        setAuthMode(authMode === "login" ? "register" : "login");
    };

    return (
        <>
            <AppBar position="absolute" elevation={0} className="header-appbar">
                <Toolbar className="header-toolbar" sx={{display: "flex", justifyContent: "space-between"}}>
                    {/* Name oder Logo */}
                    <Typography variant="h6" component={Link} to="/"
                                sx={{color: "inherit", textDecoration: "none"}}>
                        EventBlog
                    </Typography>

                    {/* Navbar: Links + Navbar */}
                    <Box className="header-links" sx={{display: "flex", alignItems: "center", gap: 2}}>
                        <Button className="header-link" component={Link} to="/" color="inherit">Home</Button>
                        <Button className="header-link" component={Link} to="/about" color="inherit">Über
                            uns</Button>
                        <Button className="header-link" component={Link} to="/contact"
                                color="inherit">Kontakte</Button>

                        {/* Navbar component */}
                        <Navbar/>

                    </Box>

                    {currentUser ? (
                        <>
                            <Button
                                aria-controls={open ? "user-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? "true" : undefined}
                                onClick={handleOpen}
                                color="inherit"
                                endIcon={<FaChevronDown />}
                            >
                                Menü
                            </Button>

                            <Menu
                                id="user-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                keepMounted
                                MenuListProps={{
                                    'aria-labelledby': 'kategorien-menu',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                PaperProps={{
                                    style: {
                                        minWidth: '200px',
                                        maxWidth: '250px',
                                        marginTop: '8px',
                                    }
                                }}
                            >
                                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                    Profil
                                </MenuItem>

                                <MenuItem component={Link} to="/creatpost" onClick={handleClose}>
                                    Beitrag hinzufügen
                                </MenuItem>

                                <MenuItem component={Link} to="/adminpanel" onClick={handleClose}>
                                    Beiträge
                                </MenuItem>

                                {isAdmin && (
                                    <MenuItem component={Link} to="/users" onClick={handleClose}>
                                        Nutzer
                                    </MenuItem>
                                )}
                                <MenuItem
                                    onClick={() => {
                                        handleLogout();
                                        handleClose();
                                    }}
                                >
                                    <MdLogout style={{ marginRight: 8 }} />
                                    Abmelden
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box className="header-auth-icons">
                            <IconButton
                                onClick={() => handleAuthClick("login")}
                                color="inherit"
                                title="Login"
                            >
                                <FaSignInAlt />
                            </IconButton>
                            <IconButton
                                onClick={() => handleAuthClick("register")}
                                color="inherit"
                                title="Registrieren"
                            >
                                <FaUserPlus />
                            </IconButton>
                        </Box>
                    )}


                </Toolbar>
            </AppBar>
            <AuthModal
                mode={authMode}
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSwitchMode={handleSwitchAuthMode}/>

        </>
    );
}