import { FaHeart } from "react-icons/fa";
import './PostCard.css'

export default function FavoriteInfo({ favoriteCount }) {
    return (
        <span className="postcard-author">
            Favorit <FaHeart style={{ color: 'red' }} /> {favoriteCount}
    </span>
    );
}