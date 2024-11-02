import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./Sidebar.css"; // Pastikan file CSS ini ada dan benar
import "boxicons/css/boxicons.min.css";

export default function Sidebar() {
  const [activeItem, setActiveItem] = createSignal<string | null>(null);
  const navigate = useNavigate(); 

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);

    if (itemId === "logout") {
      handleLogout();
    }
  };

const handleLogout = async () => {
  try {
    const user_id = localStorage.getItem("user_id");

    if (user_id) {
      const response = await fetch(`http://localhost:8082/logout/${user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response Body:", await response.text());

      if (response.ok) {
        // Hapus informasi dari localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        navigate("/"); // Arahkan pengguna ke halaman login
      } else {
        console.warn("Failed to logout");
      }
    } else {
      console.warn("User ID not found in localStorage");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};


  return (
    <div class="sidebar">
      <div class="background-sidebar"></div>
      <div class="logo">
        <div class="logo-circle">
          <div class="logo-letter">G</div>
        </div>
        <div class="logo-name">Dashmon</div>
      </div>
      <div class="menu">
        <div class="menu-title">MENU</div>
        <div class="active-background"></div>

        <div class={`menu-item dashboard ${activeItem() === "dashboard" ? "active" : ""}`} onClick={() => handleItemClick("dashboard")}>
          <div class="icon">
            <i class="bx bx-tachometer"></i>
          </div>
          <div class="menu-text">Dashboard</div>
        </div>

        <div class={`menu-item data-user ${activeItem() === "data-user" ? "active" : ""}`} onClick={() => handleItemClick("data-user")}>
          <div class="icon">
            <i class="bx bx-user"></i>
          </div>
          <div class="menu-text">Data User</div>
        </div>

        <div class={`menu-item analysis ${activeItem() === "analysis" ? "active" : ""}`} onClick={() => handleItemClick("analysis")}>
          <div class="icon">
            <i class="bx bx-bar-chart"></i>
          </div>
          <div class="menu-text">Analysis</div>
        </div>

        <div class="menu-titlee">OTHERS</div>

        <div class={`menu-item settings ${activeItem() === "settings" ? "active" : ""}`} onClick={() => handleItemClick("settings")}>
          <div class="icon">
            <i class="bx bx-cog"></i>
          </div>
          <div class="menu-text">Pengaturan</div>
        </div>

        <div class={`menu-item help ${activeItem() === "help" ? "active" : ""}`} onClick={() => handleItemClick("help")}>
          <div class="icon">
            <i class="bx bx-help-circle"></i>
          </div>
          <div class="menu-text">Help</div>
        </div>

        <div class={`menu-item logout ${activeItem() === "logout" ? "active" : ""}`} onClick={() => handleItemClick("logout")}>
          {" "}
          <div class="icon">
            <i class="bx bx-log-out"></i>
          </div>
          <div class="menu-text">Logout</div>
        </div>
      </div>
    </div>
  );
}
