import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./forgotpass.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [uniqueQuestion, setUniqueQuestion] = createSignal("");
  const [answer, setAnswer] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [showPopup, setShowPopup] = createSignal(false);
  const [popupMessage, setPopupMessage] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8082/forgot_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email(),
          question: uniqueQuestion(),
          answer: answer(),
          password: newPassword(),
        }),
      });

      if (response.ok) {
        setPopupMessage("Password telah berhasil direset");
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/");
        }, 3000);
      } else {
        const errorMessage = await response.text();
        setPopupMessage(errorMessage);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setPopupMessage("Terjadi kesalahan saat mereset password");
      setShowPopup(true);
    }
  };

  return (
    <div class="forgotpassword-container">
      <div class="left-section">
        <div class="image-card">
          <h2>Lupa kata sandi? Mari reset untuk mengakses dashboard Anda kembali</h2>
          <img src="/public/img/forgot.png" alt="Dashboard illustration" />
        </div>
      </div>
      <div class="right-section">
        <div class="forgotpassword-card">
          <h1>Forgot Password</h1>
          <p>Tenang, kami siap membantu reset password Anda.</p>
          <form onSubmit={handleSubmit}>
            <div class="form-group password-containerr">
              <label class="form-label" for="email">
                Email:
              </label>
              <input id="email" class="form-input" type="email" value={email()} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} required />
            </div>
            <div class="form-group password-containerr">
              <label class="form-label" for="uniqueQuestion">
                Pertanyaan Unik:
              </label>
              <select id="uniqueQuestion" class="form-input" value={uniqueQuestion()} onChange={(e) => setUniqueQuestion((e.target as HTMLSelectElement).value)} required>
                <option value="" disabled>
                  Pilih Pertanyaan Unik
                </option>
                <option value="Apa hobi favoritmu?">Apa hobi favoritmu?</option>
                <option value="Apa nama hewan favorit Anda?">Apa nama hewan favorit Anda?</option>
                <option value="Di kota mana Anda lahir?">Di kota mana Anda lahir?</option>
                <option value="Apa makanan favorit Anda?">Apa makanan favorit Anda?</option>
              </select>
            </div>
            <div class="form-group password-containerr">
              <label class="form-label" for="answer">
                Jawaban:
              </label>
              <input id="answer" class="form-input" type="text" value={answer()} onInput={(e) => setAnswer((e.target as HTMLInputElement).value)} required />
            </div>
            <div class="form-group password-containerr">
              <label class="form-label" for="newPassword">
                Password Baru:
              </label>
              <input id="newPassword" class="form-input" type={showPassword() ? "text" : "password"} value={newPassword()} onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)} required />
              <i class={`bx ${showPassword() ? "bx-show" : "bx-hide"}`} onClick={() => setShowPassword(!showPassword())}></i>
            </div>
            <div class="button-groupp">
              <button type="submit" class="submit-button">
                Reset
              </button>
              <button type="button" onClick={() => navigate("/")} class="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      {showPopup() && (
        <div class="popup-overlay">
          <div class="popup">
            <div class="popup-contentt">
              {popupMessage().includes("berhasil") ? <i class="bx bx-check-circle check-icon"></i> : <i class="bx bx-x-circle error-icon"></i>}
              <p>{popupMessage()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
