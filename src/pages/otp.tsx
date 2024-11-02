import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./otp.css"; // Pastikan Anda menambahkan file CSS yang sesuai

const OTPVerification = (props) => {
  const navigate = useNavigate();
  const [otp, setOtp] = createSignal(["", "", "", "", "", ""]);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [showPopup, setShowPopup] = createSignal(false);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp()];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input if current input is filled
      if (value && index < otp().length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    } else if (value === "") {
      // Move focus to the previous input if current input is cleared
      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpValue = otp().join("");
    try {
      const response = await fetch("http://localhost:8082/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otpValue }), // Hanya kirim OTP
      });

      if (!response.ok) {
        throw new Error("OTP tidak valid");
      }

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate(props.redirectUrl); // Arahkan ke halaman yang ditentukan
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    // Logika untuk mengirim ulang OTP
    alert("OTP baru telah dikirim");
  };

  return (
    <div class="otp-container">
      <div class="otp-card">
        <h1>Verifikasi OTP</h1>
        <p>Masukkan kode OTP yang telah dikirimkan ke email Anda.</p>
        <form onSubmit={handleSubmit}>
          <div class="otp-inputs">
            {otp().map((digit, index) => (
              <input id={`otp-${index}`} class="otp-input" type="text" maxLength="1" value={digit} onInput={(e) => handleChange(e, index)} autofocus={index === 0} />
            ))}
          </div>
          {error() && <p class="error-message">{error()}</p>}
          <div class="buttonn-group">
            <button type="submit" disabled={loading()}>
              {loading() ? "Memproses..." : "Verifikasi"}
            </button>
            <button type="button" onClick={handleResend} class="resend-button">
              Kirim Ulang OTP
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up Success */}
      {showPopup() && (
        <div class="popup-overlay">
          <div class="popup">
            <i class="bx bx-check-circle check-icon"></i>
            <p>OTP berhasil diverifikasi!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
