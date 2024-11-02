import { createSignal, onMount } from "solid-js";
import "./navbar.css";
import ThemeToggle from "../toggle/dark&light_mode";
import { BiSolidBell } from "solid-icons/bi"; // Pastikan untuk mengimpor ikon yang sesuai jika kamu menggunakan ikon dari solid-icons atau paket lain

const Navbar = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [userName, setUserName] = createSignal<string | null>("Guest"); // Default to "Guest"
  const [userPhoto, setUserPhoto] = createSignal<string | null>(null); // Signal untuk menyimpan URL foto pengguna

  const handleSearchSubmit = (event: Event) => {
    event.preventDefault();
    console.log("Search query:", searchQuery());
  };

  onMount(() => {
    // Fetch user data (misalnya dari API atau localStorage)
    const storedName = localStorage.getItem("userName");
    const storedPhoto = localStorage.getItem("userPhoto");

    if (storedName) {
      setUserName(storedName);
    }

    if (storedPhoto) {
      setUserPhoto(storedPhoto);
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  });

  return (
    <div class="navbar">
      <div class="greeting">
        <h1>Hello, {userName()}!</h1> {/* Menampilkan nama pengguna*/}
      </div>

      <div class="navbar-right">
        <ThemeToggle />
        <div class="icon">
          <BiSolidBell size={24} class="notif-icon" />
        </div>
        <div class="profile-pic">
          <img src={ "public/img/profile.jpeg"} alt="Profile" class="profile-photo" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
