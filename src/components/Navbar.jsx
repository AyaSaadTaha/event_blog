import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import './NavBar.css'

const kategorien = ["Alles", "Technik", "Kunst", "Musik", "Sport"];

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Button
                aria-controls={anchorEl ? "kategorien-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? "true" : undefined}
                onClick={handleOpen}
                color="inherit"
                endIcon={<FaChevronDown />}
                className="category-button"
            >
                Kategorien
            </Button>

            <Menu
                id="kategorien-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {kategorien.map((kat, idx) => (
                    <MenuItem
                        key={idx}
                        component={Link}
                        to={`/?category=${kat}`}
                        onClick={handleClose}
                    >
                        {kat}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default Navbar;
