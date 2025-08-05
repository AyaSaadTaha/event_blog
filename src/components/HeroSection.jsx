import React from "react";
import "./Header.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {

    const [offsetY, setOffsetY] = useState(0);

    const handleScroll = () => setOffsetY(window.scrollY);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className="hero-container"
            style={{
                backgroundPositionY: `${offsetY * 0.5}px`
            }}
        >
            <div className="hero-overlay">
                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }} // smooth
                >
                    Events planen – so einfach wie nie zuvor
                </motion.h1>
            </div>
        </div>
    );
};

export default HeroSection;
