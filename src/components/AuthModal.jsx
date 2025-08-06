import { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { FaTimes } from "react-icons/fa";

export function AuthModal({ mode, open, onClose, onSwitchMode }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent>
                <div style={{ position: "relative" }}>
                    <IconButton
                        onClick={onClose}
                        style={{ position: "absolute", right: 0, top: 0 }}
                    >
                        <FaTimes />
                    </IconButton>
                    <AuthForm mode={mode} onClose={onClose} onSwitchMode={onSwitchMode} />
                </div>
            </DialogContent>
        </Dialog>
    );
}