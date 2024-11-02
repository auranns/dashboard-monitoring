import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./adduser.css";
import Sidebar from "./Sidebar";
import Navbar from "./navbar";

const AddUser = () => {
  const [user, setUser] = createSignal({
    nama: "",
    email: "",
    pekerjaan: "",
    tanggal_lahir: "",
    gender: "",
    umur: "",
    goldar: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    password: "",
    uniqueQuestion: "",
    uniqueAnswer: "",
  });

  const [showPassword, setShowPassword] = createSignal(false);
  const [showPopup, setShowPopup] = createSignal(false);
  const [popupMessage, setPopupMessage] = createSignal("");
  const navigate = useNavigate();

  const [filteredProvinces, setFilteredProvinces] = createSignal([]);
  const [filteredKabupaten, setFilteredKabupaten] = createSignal([]);
  const [filteredKecamatan, setFilteredKecamatan] = createSignal([]);

  const provinces = ["Jawa Barat", "Jawa Timur", "DKI Jakarta"];
  const kabupatens = {
    "Jawa Barat": ["Kabupaten Bandung", "Kabupaten Garut", "Kabupaten Cirebon"],
    "Jawa Timur": ["Kabupaten Malang", "Kabupaten Kediri", "Kabupaten Banyuwangi"],
    "DKI Jakarta": ["Jakarta Selatan", "Jakarta Barat", "Jakarta Timur"],
  };
  const kecamatans = {
    "Kabupaten Bandung": ["Kecamatan Bojongsoang", "Kecamatan Ciparay"],
    // Tambahkan kecamatan lainnya...
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

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setUser((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const validateForm = () => {
    if (!validatePassword(user().password)) {
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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch(`http://127.0.0.1:8080/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: user().nama,
            email: user().email,
            password: user().password,
            pekerjaan: user().pekerjaan,
            tanggal_lahir: user().tanggal_lahir,
            gender: user().gender,
            umur: parseInt(user().umur, 10), // Konversi umur menjadi integer
            goldar: user().goldar,
            provinsi: user().provinsi,
            kabupaten: user().kabupaten,
            kecamatan: user().kecamatan,
            question: user().uniqueQuestion,
            answer: user().uniqueAnswer,
          }),
        });

        if (response.ok) {
          setPopupMessage("Pengguna berhasil ditambahkan!");
          setShowPopup(true);

          setTimeout(() => {
            setShowPopup(false);
            navigate("/dashboard");
          }, 3000);
        } else {
          const errorContentType = response.headers.get("content-type");
          const errorData = errorContentType && errorContentType.includes("application/json") ? await response.json() : await response.text();
          setPopupMessage(`Gagal menambahkan pengguna: ${errorData.message || errorData}`);
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error saat menambahkan pengguna:", error);
        setPopupMessage("Terjadi kesalahan saat menambahkan pengguna. Silakan coba lagi.");
        setShowPopup(true);
      }
    }
  };

  const handleCancel = () => {
    navigate("/dashboard"); // Arahkan kembali ke halaman dashboard tanpa menyimpan perubahan
  };

  return (
    <div class="add-user-container">
      <Navbar />
      <Sidebar />
      <form onSubmit={handleSubmit} class="add">
        <h1>Tambah Pengguna Baru</h1>

        {/* Input Fields */}
        <div class="input-wrapadd">
          <label for="nama">Nama Lengkap:</label>
          <input type="text" id="nama" name="nama" value={user().nama} onInput={handleChange} required />
        </div>

        <div class="input-wrapadd">
          <label for="email">Email:</label>
          <input type="text" id="email" name="email" value={user().email} onInput={handleChange} required />
        </div>

        <div class="input-wrapadd">
          <label for="pekerjaan">Pekerjaan:</label>
          <input type="text" id="pekerjaan" name="pekerjaan" value={user().pekerjaan} onInput={handleChange} required />
        </div>

        <div class="input-wrapadd">
          <label for="tanggal_lahir">Tanggal Lahir:</label>
          <input type="date" id="tanggal_lahir" name="tanggal_lahir" value={user().tanggal_lahir} onInput={handleChange} required />
        </div>

        <div class="input-wrapadd-group">
          <div class="input-wrapadd">
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" value={user().gender} onChange={handleChange} required>
              <option value="" disabled>
                Pilih Gender
              </option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div class="input-wrapadd">
            <label for="goldar">Golongan Darah:</label>
            <select id="goldar" name="goldar" value={user().goldar} onChange={handleChange} required>
              <option value="" disabled>
                Pilih Golongan Darah
              </option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
        </div>

        <div class="input-wrapadd">
          <label for="umur">Umur:</label>
          <input type="number" id="umur" name="umur" value={user().umur} onInput={handleChange} required />
        </div>

        {/* Field Provinsi */}
        <div class="input-wrapadd">
          <label for="provinsi">Provinsi:</label>
          <input type="text" id="provinsi" value={user().provinsi} onInput={(e) => handleInput(e, (val) => setUser((prev) => ({ ...prev, provinsi: val })), provinces, setFilteredProvinces)} required />
          {filteredProvinces().length > 0 && (
            <div class="autocomplete-items">
              <For each={filteredProvinces()}>{(prov) => <div onClick={() => selectItem((val) => setUser((prev) => ({ ...prev, provinsi: val })), setFilteredProvinces, prov)}>{prov}</div>}</For>
            </div>
          )}
        </div>

        {/* Field Kabupaten */}
        <div class="input-wrapadd">
          <label for="kabupaten">Kabupaten:</label>
          <input type="text" id="kabupaten" value={user().kabupaten} onInput={(e) => handleInput(e, (val) => setUser((prev) => ({ ...prev, kabupaten: val })), kabupatens[user().provinsi] || [], setFilteredKabupaten)} required />
          {filteredKabupaten().length > 0 && (
            <div class="autocomplete-items">
              <For each={filteredKabupaten()}>{(kab) => <div onClick={() => selectItem((val) => setUser((prev) => ({ ...prev, kabupaten: val })), setFilteredKabupaten, kab)}>{kab}</div>}</For>
            </div>
          )}
        </div>

        {/* Field Kecamatan */}
        <div class="input-wrapadd">
          <label for="kecamatan">Kecamatan:</label>
          <input type="text" id="kecamatan" value={user().kecamatan} onInput={(e) => handleInput(e, (val) => setUser((prev) => ({ ...prev, kecamatan: val })), kecamatans[user().kabupaten] || [], setFilteredKecamatan)} required />
          {filteredKecamatan().length > 0 && (
            <div class="autocomplete-items">
              <For each={filteredKecamatan()}>{(kec) => <div onClick={() => selectItem((val) => setUser((prev) => ({ ...prev, kecamatan: val })), setFilteredKecamatan, kec)}>{kec}</div>}</For>
            </div>
          )}
        </div>

        <div class="input-wrapadd">
          <label for="password">Password:</label>
          <input type={showPassword() ? "text" : "password"} minlength="4" autocomplete="off" id="password" name="password" value={user().password} onInput={handleChange} required />
          <i class={`bx ${showPassword() ? "bx-show" : "bx-hide"}`} onClick={() => setShowPassword(!showPassword())}></i>
        </div>

        {/* Unique Question Input */}
        <div class="input-wrapadd">
          <label for="uniqueQuestion">Pertanyaan Unik:</label>
          <select id="uniqueQuestion" name="uniqueQuestion" value={user().uniqueQuestion} onChange={handleChange} required>
            <option value="" disabled>
              Pilih Pertanyaan Unik
            </option>
            <option value="Apa hobi favoritmu?">Apa hobi favoritmu?</option>
            <option value="Apa nama hewan favorit Anda?">Apa nama hewan favorit Anda?</option>
            <option value="Di kota mana Anda lahir?">Di kota mana Anda lahir?</option>
            <option value="Apa makanan favorit Anda?">Apa makanan favorit Anda?</option>
          </select>
        </div>

        <div class="input-wrapadd">
          <label for="uniqueAnswer">Jawaban:</label>
          <input type="text" id="uniqueAnswer" name="uniqueAnswer" value={user().uniqueAnswer} onInput={handleChange} required />
        </div>

        <div class="button-group">
          <button type="submit">Tambah Pengguna</button>
          <button type="button" onClick={handleCancel}>
            Batal
          </button>
        </div>
      </form>
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
    </div>
  );
};

export default AddUser;
