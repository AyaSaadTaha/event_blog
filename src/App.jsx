import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/./Header.jsx';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatPost from './pages/CreatPost.jsx';
import Profile from './pages/Profile';
import AdminPanel from "./components/AdminPanel.jsx";
import Users from "./pages/Users.jsx";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <main className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/PostDetails/:id" element={<PostDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/creatpost" element={<CreatPost />} />
                        <Route path="/adminpanel" element={<AdminPanel />} />
                        <Route path="/users" element={<Users/>} />
                        <Route path="/profile" element={<Profile />}/>
                    </Routes>
                </main>
                <footer>
                    <p>© {new Date().getFullYear()} EventBlog. All rights reserved.</p>
                </footer>
            </AuthProvider>
        </Router>
    );
}

export default App;