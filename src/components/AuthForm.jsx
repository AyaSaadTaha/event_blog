import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth,db } from "../firebase/config";
import { doc,setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { Link } from "react-router-dom";
import './AuthForm.css'

export function AuthForm({mode}) {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let userCredential;
        try {
            if (mode === "login") {
                userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
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
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Header */}
                    <div className="auth-header">
                        <h2>{mode === "login" ? "Anmelden" : "Register"}</h2>
                        <p>
                            {mode === "login"
                                ? "Willkommen zurück! Bitte melden Sie sich bei Ihrem Konto an"
                                : "Erstellen Sie ein neues Konto, um loszulegen"
                            }
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <>
                                <div className="form-group">
                                    <label>Name <span>*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Geben Sie Ihren vollständigen Namen ein"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Telefonnummer <span>*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Geben Sie Ihre Telefonnummer ein"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>E-Mail <span>*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Geben Sie Ihre E-Mail-Adresse ein"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Passwort <span>*</span></label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Geben Sie Ihr Passwort ein"
                                required
                            />
                        </div>

                        <button type="submit" className="auth-submit">
                            {mode === "login" ? "Anmelden" : "Benutzerkonto erstellen"}
                        </button>

                        <div className="auth-toggle">
                            {mode === "login"
                                ? "Sie haben noch kein Konto? "
                                : "Sie haben bereits ein Konto? "}
                            <Link to={mode === "login" ? "/register" : "/login"}
                                  className="auth-link">
                                {mode === "login" ? "Hier registrieren" : "Hier anmelden"}
                            </Link>
                        </div>

                        {mode === "login" && (
                            <div className="auth-forgot">
                                <button type="button">Passwort vergessen?</button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="auth-footer">
                    <p>
                        Indem Sie fortfahren, stimmen Sie unseren Servicebedingungen und Datenschutzrichtlinien zu.</p>
                </div>
            </div>
        </div>
    );
}