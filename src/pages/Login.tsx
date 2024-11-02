import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./Login.css";
import "boxicons/css/boxicons.min.css";
import { init } from "../slide.js";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [showPopup, setShowPopup] = createSignal(false);
  const [popupMessage, setPopupMessage] = createSignal("");
  const navigate = useNavigate();

  onMount(() => {
    init();
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:8082/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email(), password: password() }), // Kirim email dan password
      });

      if (!response.ok) {
        throw new Error("Email atau password salah");
      }

      const data = await response.json(); // Parsing respons sebagai JSON

      // Periksa data yang diterima
      console.log(data); // Debugging

      setPopupMessage("Login sukses");
      setShowPopup(true);

      localStorage.setItem("token", data.token); // Simpan token
      localStorage.setItem("user_id", data.id); // Simpan user ID
      localStorage.setItem("userName", data.nama); // Simpan nama pengguna

      // Navigasi setelah login sukses
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setPopupMessage(error.message);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 2000); // Popup muncul selama 2 detik
    }
  };

  return (
    <section>
      <div class="box">
        <div class="inner-box">
          <div class="forms-wrap">
            {/* Form Login */}
            <form onSubmit={handleSubmit} autocomplete="off" class="sign-in-form">
              <div class="logo">
                <img src="./img/logo.png" alt="dashmon" />
              </div>

              <div class="heading">
                <h2>Selamat datang!</h2>
                <h6>Belum punya akun?</h6>
                <a href="/register" class="toggle">
                  Buat akun
                </a>
              </div>

              <div class="actual-form">
                <div class="input-wrapname">
                  <input type="email" minlength="4" class="input-field" autocomplete="off" id="email" value={email()} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} required />
                  <label for="email">Email</label>
                </div>

                <div class="input-wrap">
                  <input type={showPassword() ? "text" : "password"} minlength="4" class="input-field" autocomplete="off" id="pass" value={password()} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} required />
                  <label for="pass">Password</label>
                  <i
                    class={`bx ${showPassword() ? "bx-show" : "bx-hide"}`} // Toggle icon class
                    onClick={() => setShowPassword(!showPassword())} // Toggle visibility
                  ></i>
                </div>
                <p class="textt">
                  <a href="/forgotpass">Lupa password</a>
                </p>
                <input type="submit" value="Login" class="sign-btn" />
              </div>
            </form>
          </div>

          <div class="carousel">
            <div class="images-wrapper">
              <img src="./img/image1.png" class="image img-1 show" alt="" />
              <img src="./img/image2.gif" class="image img-2" alt="" />
              <img src="./img/image3.gif" class="image img-3" alt="" />
            </div>

            <div class="text-slider">
              <div class="text-wrap">
                <div class="text-group">
                  <h2>Pantau semua data Anda</h2>
                  <h2>dalam satu tempat</h2>
                  <h2>Managing Data Effortless</h2>
                  <h2>and Effective</h2>
                </div>
              </div>

              <div class="bullets">
                <span class="active" data-value="1"></span>
                <span data-value="2"></span>
                <span data-value="3"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup() && (
        <div class="popup-overlay">
          <div class="popup">
            <div class="popup-content">
              <h2>{popupMessage()}</h2>
              {/* Menambahkan ikon centang biru jika login sukses */}
              {popupMessage() === "Login sukses" && <i class="bx bx-check-circle" style={{ color: "blue" }}></i>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
