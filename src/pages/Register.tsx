import { createSignal, onMount, onCleanup, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./Register.css";
import OTPVerification from "./otp";
import "boxicons/css/boxicons.min.css";
import { init } from "../slide.js";

export default function Register() {
  const navigate = useNavigate();

  const [nama, setNama] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [job, setJob] = createSignal("");
  const [dob, setDob] = createSignal("");
  const [gender, setGender] = createSignal("");
  const [age, setAge] = createSignal("");
  const [bloodType, setBloodType] = createSignal("")

  const [province, setProvince] = createSignal("");
  const [kabupaten, setKabupaten] = createSignal("");
  const [kecamatan, setKecamatan] = createSignal("");
  const [filteredProvinces, setFilteredProvinces] = createSignal([]);
  const [filteredKabupaten, setFilteredKabupaten] = createSignal([]);
  const [filteredKecamatan, setFilteredKecamatan] = createSignal([]);
  // Daftar provinsi, kabupaten, dan kecamatan
  const provinces = ["Jawa Barat", "Jawa Timur", "DKI Jakarta"];
  const kabupatens = {
    "Jawa Barat": ["Kabupaten Bandung", "Kabupaten Garut", "Kabupaten Cirebon"],
    "Jawa Timur": ["Kabupaten Malang", "Kabupaten Kediri", "Kabupaten Banyuwangi"],
    "DKI Jakarta": ["Jakarta Selatan", "Jakarta Barat", "Jakarta Timur"],
  };
  const kecamatans = {
    "Kabupaten Bandung": ["Kecamatan Bojongsoang", "Kecamatan Ciparay"],
    "Kabupaten Garut": ["Kecamatan Tarogong", "Kecamatan Cikajang"],
    "Kabupaten Cirebon": ["Kecamatan Arjawinangun", "Kecamatan Babakan"],
    "Kabupaten Malang": ["Kecamatan Kepanjen", "Kecamatan Lawang"],
    "Kabupaten Kediri": ["Kecamatan Pare", "Kecamatan Papar"],
    "Kabupaten Banyuwangi": ["Kecamatan Rogojampi", "Kecamatan Genteng"],
    "Jakarta Selatan": ["Kecamatan Kebayoran Baru", "Kecamatan Tebet"],
    "Jakarta Barat": ["Kecamatan Cengkareng", "Kecamatan Palmerah"],
    "Jakarta Timur": ["Kecamatan Matraman", "Kecamatan Pulogadung"],
  };
  const [showPassword, setShowPassword] = createSignal(false);
  const [showPopup, setShowPopup] = createSignal(false);
  const [popupMessage, setPopupMessage] = createSignal("");
  const [uniqueQuestion, setUniqueQuestion] = createSignal("");
  const [uniqueAnswer, setUniqueAnswer] = createSignal("");
  const [currentStep, setCurrentStep] = createSignal(1);
  const [showOtpPopup, setShowOtpPopup] = createSignal(false);

  onMount(() => {
    init();
  });

  const handleNextStep = () => {
    setCurrentStep(currentStep() + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep() - 1);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const validateForm = () => {
    if (!validatePassword(password())) {
      setPopupMessage("Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.");
      setShowPopup(true);

      // Menyembunyikan pop-up setelah 3 detik
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);

      return false;
    }
    return true;
  };

  const handleInput = (e, setState, options, setFiltered) => {
    const input = e.target.value;
    setState(input);
    if (input.length > 0) {
      const filtered = options.filter((item) => item.toLowerCase().startsWith(input.toLowerCase()));
      setFiltered(filtered);
    } else {
      setFiltered([]);
    }
  };

  const selectItem = (setState, setFiltered, value) => {
    setState(value);
    setFiltered([]);
  };


  let container;
  const handleClickOutside = (e) => {
    if (container && !container.contains(e.target)) {
      setFilteredProvinces([]);
      setFilteredKabupaten([]);
      setFilteredKecamatan([]);
    }
   };
  document.addEventListener("click", handleClickOutside);
  onCleanup(() => document.removeEventListener("click", handleClickOutside));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch("http://127.0.0.1:8082/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: nama(),
            email: email(),
            password: password(),
            pekerjaan: job(),
            tanggal_lahir: dob(),
            gender: gender(),
            umur: parseInt(age(), 10), // Ubah umur ke angka
            goldar: bloodType(),
            provinsi: province(),
            kabupaten: kabupaten(),
            kecamatan: kecamatan(),
            question: uniqueQuestion(),
            answer: uniqueAnswer(),
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          const result = contentType && contentType.includes("application/json") ? await response.json() : await response.text();

          setPopupMessage("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
          setShowPopup(true);

          setTimeout(() => {
            setShowPopup(false);
            setShowOtpPopup(true);
          }, 3000);
        } else {
          const errorContentType = response.headers.get("content-type");
          const errorData = errorContentType && errorContentType.includes("application/json") ? await response.json() : await response.text();
          setPopupMessage(`Pendaftaran gagal: ${errorData.message || errorData}`);
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error during registration:", error);
        setPopupMessage("Terjadi kesalahan saat pendaftaran. Silakan coba lagi nanti.");
        setShowPopup(true);
      }
    }
  };

  return (
    <section>
      <div class="boxr">
        <div class="inner-boxr">
          <div class="forms-wrapr">
            <form onSubmit={handleSubmit} autocomplete="off" class="sign-in-form">
              <div class="logoo">
                <img src="./img/logo.png" alt="dashmon" />
              </div>

              <div class="headingg">
                <h2>Buat akun anda</h2>
                <h6>Sudah memiliki akun?</h6>
                <a href="/" class="toggle">
                  Login
                </a>
              </div>

              {/* Form Tahap 1 */}
              <div class={`actual-formm form-step ${currentStep() === 1 ? "active" : ""}`}>
                <div class="input-wrapp">
                  <input type="text" minlength="4" class="input-field" autocomplete="off" id="nama" value={nama()} onInput={(e) => setNama((e.target as HTMLInputElement).value)} required />
                  <label for="nama">Nama lengkap</label>
                </div>

                <div class="input-wrapp">
                  <input type="email" minlength="4" class="input-field" autocomplete="off" id="email" value={email()} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} required />
                  <label for="email">Email</label>
                </div>

                <div class="input-wrapp">
                  <input type={showPassword() ? "text" : "password"} minlength="4" class="input-field" autocomplete="off" id="signupPass" value={password()} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} required />
                  <label for="signupPass">Password</label>
                  <i class={`bx ${showPassword() ? "bx-show" : "bx-hide"}`} onClick={() => setShowPassword(!showPassword())}></i>
                </div>

                <div class="input-wrapp">
                  <select class="input-field" id="uniqueQuestion" value={uniqueQuestion()} onChange={(e) => setUniqueQuestion((e.target as HTMLSelectElement).value)} required>
                    <option value="" disabled>
                      Pilih Pertanyaan Unik
                    </option>
                    <option value="Apa hobi favoritmu?">Apa hobi favoritmu?</option>
                    <option value="Apa nama hewan favorit Anda?">Apa nama hewan favorit Anda?</option>
                    <option value="Di kota mana Anda lahir?">Di kota mana Anda lahir?</option>
                    <option value="Apa makanan favorit Anda?">Apa makanan favorit Anda?</option>
                  </select>
                  <label for="uniqueQuestion">Pertanyaan Unik</label>
                </div>

                <div class="input-wrapp">
                  <input type="text" class="input-field" autocomplete="off" id="uniqueAnswer" value={uniqueAnswer()} onInput={(e) => setUniqueAnswer((e.target as HTMLInputElement).value)} required />
                  <label for="uniqueAnswer">Jawaban</label>
                </div>
              </div>

              {/* Form Tahap 2 */}
              <div class={`actual-formm form-step ${currentStep() === 2 ? "active" : ""}`}>
                <div class="input-wrapp">
                  <input type="text" class="input-field" autocomplete="off" id="job" value={job()} onInput={(e) => setJob((e.target as HTMLInputElement).value)} required />
                  <label for="job">Pekerjaan</label>
                </div>

                <div class="input-wrapp-group">
                  <div class="input-wrapp">
                    <input type="date" class="input-field" autocomplete="off" id="dob" value={dob()} onInput={(e) => setDob((e.target as HTMLInputElement).value)} required />
                    <label for="dob">Tanggal lahir</label>
                  </div>

                  <div class="input-wrapp">
                    <select class="input-field" id="gender" value={gender()} onChange={(e) => setGender((e.target as HTMLSelectElement).value)} required>
                      <option value="" disabled>
                        Pilih gender
                      </option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <label for="gender">Gender</label>
                  </div>
                </div>

                <div class="input-wrapp-group">
                  <div class="input-wrapp">
                    <input type="number" class="input-field" autocomplete="off" id="age" value={age()} onInput={(e) => setAge((e.target as HTMLInputElement).value)} required />
                    <label for="age">Umur</label>
                  </div>

                  <div class="input-wrapp">
                    <select class="input-field" id="bloodType" value={bloodType()} onChange={(e) => setBloodType((e.target as HTMLSelectElement).value)} required>
                      <option value="" disabled>
                        Pilih Gol.Darah
                      </option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    <label for="bloodType">Golongan darah</label>
                  </div>
                </div>

                <div class="input-wrapp">
                  <input type="text" class="input-field" id="province" value={province()} onInput={(e) => handleInput(e, setProvince, provinces, setFilteredProvinces)} required />
                  <label for="province">Provinsi</label>

                  {/* Dropdown untuk provinsi yang muncul saat mengetik */}
                  {filteredProvinces().length > 0 && (
                    <div class="autocomplete-items">
                      <For each={filteredProvinces()}>
                        {(prov) => (
                          <div onClick={() => selectItem(setProvince, setFilteredProvinces, prov)} class="autocomplete-item">
                            {prov}
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </div>

                <div class="input-wrapp">
                  <input type="text" class="input-field" id="kabupaten" value={kabupaten()} onInput={(e) => handleInput(e, setKabupaten, kabupatens[province()] || [], setFilteredKabupaten)} required />
                  <label for="kabupaten">Kabupaten</label>
                  {filteredKabupaten().length > 0 && (
                    <div class="autocomplete-items">
                      <For each={filteredKabupaten()}>
                        {(kab) => (
                          <div onClick={() => selectItem(setKabupaten, setFilteredKabupaten, kab)} class="autocomplete-item">
                            {kab}
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </div>

                <div class="input-wrapp">
                  <input type="text" class="input-field" id="kecamatan" value={kecamatan()} onInput={(e) => handleInput(e, setKecamatan, kecamatans[kabupaten()] || [], setFilteredKecamatan)} required />
                  <label for="kecamatan">Kecamatan</label>
                  {filteredKecamatan().length > 0 && (
                    <div class="autocomplete-items">
                      <For each={filteredKecamatan()}>
                        {(kec) => (
                          <div onClick={() => selectItem(setKecamatan, setFilteredKecamatan, kec)} class="autocomplete-item">
                            {kec}
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Navigasi */}
              <div class="form-navigation">
                <button type="button" onClick={handlePreviousStep} disabled={currentStep() === 1}>
                  Sebelumnya
                </button>
                {currentStep() === 2 ? (
                  <button type="submit" class="sign-btnn">
                    Buat akun
                  </button>
                ) : (
                  <button type="button" onClick={handleNextStep}>
                    Selanjutnya
                  </button>
                )}
              </div>
            </form>
          </div>

          <div class="carousell">
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
                  <h2>Managing Data Effortless </h2>
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
      {/* Popup Success */}
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
      {showOtpPopup() && (
        <div class="popup-overlay">
          <div class="popup">
            <OTPVerification redirectUrl="/" />
          </div>
        </div>
      )}
    </section>
  );
}
