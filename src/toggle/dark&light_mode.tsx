import { createSignal, onMount } from "solid-js";
import "./ThemeToggle.css";

function ThemeToggle() {
  // Ambil nilai default dari localStorage, default ke false (light mode)
  const [isDarkMode, setIsDarkMode] = createSignal(localStorage.getItem("theme") === "dark");

  const handleToggle = () => {
    const newMode = !isDarkMode();
    setIsDarkMode(newMode);

    const theme = newMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme); // Simpan preferensi tema di localStorage

    // Trigger event untuk menginformasikan perubahan tema
    const event = new Event("themeChanged");
    window.dispatchEvent(event);
  };

  // Setel tema saat halaman dimuat berdasarkan localStorage
  onMount(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setIsDarkMode(savedTheme === "dark");
  });

  return (
    <div class="theme-toggle">
      <input id="theme" class="theme__toggle" type="checkbox" role="switch" name="theme" checked={isDarkMode()} onChange={handleToggle} aria-label="Toggle theme" />
      <span class="theme__icon">
        {[...Array(9)].map((_, index) => (
          <span class="theme__icon-part" />
        ))}
      </span>
    </div>
  );
}

export default ThemeToggle;
