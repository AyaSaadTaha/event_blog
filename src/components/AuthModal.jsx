import { AuthForm } from "../components/AuthForm";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { FaTimes } from "react-icons/fa";

export function AuthModal({ mode, open, onClose, onSwitchMode }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                scroll="paper"
                sx={{
                    "& .MuiDialog-paper": {
                        overflow: "hidden",
                        borderRadius: "12px",
                        padding: 0,
                        margin: 0
                    }
                }}>
            <DialogContent sx={{
                position: "relative",
                padding: "24px",
                display: "flex",
                flexDirection: "column"
            }}>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            zIndex: 10,
                            color: "#666",
                            "&:hover": { color: "#000" }
                        }}
                    >
                        <FaTimes />
                    </IconButton>
                    <AuthForm mode={mode} onClose={onClose} onSwitchMode={onSwitchMode} />
            </DialogContent>
        </Dialog>
    );
}