import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth,db } from "../firebase/config";
import { doc,setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";

export default function AuthForm({ mode }) {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let userCredential;
        try {
            if (mode === "login") {
                userCredential= await signInWithEmailAndPassword(auth, form.email, form.password);
            } else {
                userCredential = await  createUserWithEmailAndPassword(auth, form.email, form.password);
                const uid = userCredential.user.uid;
                await setDoc(doc(db, "users", uid), {
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    role: "user",
                    createdAt: new Date()
                });
            }
            await updateProfile(auth.currentUser, {
                displayName: userCredential.name,
            });
            navigate("/");

        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="auth-form">
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                {mode === "register" ? (
                    <>
                        <input
                            type="text"
                            placeholder="Name"
                            name="name"
                            onChange={handleChange}
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            name="phone"
                            onChange={handleChange}
                        />
                    </>
                ) : null}
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    onChange={handleChange}
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    onChange={handleChange}
                />

                <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
            </form>
        </div>
    );
}