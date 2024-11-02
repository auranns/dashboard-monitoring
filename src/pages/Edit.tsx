import { createSignal, onMount } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import "./EditData.css";
import Sidebar from "./Sidebar";
import Navbar from "./navbar";

const EditData = () => {
  const [user, setUser] = createSignal<any>({});
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [popupMessage, setPopupMessage] = createSignal("");
  const [showPopup, setShowPopup] = createSignal(false);

  onMount(async () => {
    if (id) {
      try {
        const response = await fetch(`http://127.0.0.1:8080/user/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Gagal mengambil data pengguna");
        }
      } catch (error) {
        console.error("Error saat mengambil data pengguna:", error);
      }
    }
  });

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setUser((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };
 
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8082/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user()),
      });

      if (response.ok) {
        setPopupMessage("Data pengguna berhasil diperbarui!");
        setShowPopup(true);
        setTimeout(closePopup, 3000); // Tutup pop-up setelah 3 detik
      } else {
        setPopupMessage("Gagal memperbarui data pengguna. Silakan coba lagi.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error saat memperbarui data pengguna:", error);
      setPopupMessage("Terjadi kesalahan saat memperbarui data pengguna. Silakan coba lagi.");
      setShowPopup(true);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate("/dashboard");
  };
  

  return (
    <div class="edit-data-container">
      <Navbar />
      <Sidebar />
      <form onSubmit={handleSubmit} class="edit">
        <h1>Edit Data Pengguna</h1>
        <div class="input-wrappp">
          <label for="nama">Nama Lengkap:</label>
          <input type="text" id="nama" name="nama" value={user().nama || ""} onInput={handleChange} />
        </div>

        <div class="input-wrappp">
          <label for="email">Email:</label>
          <input type="text" id="email" name="email" value={user().email || ""} onInput={handleChange} disabled />
        </div>

        <div class="input-wrappp">
          <label for="pekerjaan">Pekerjaan:</label>
          <input type="text" id="pekerjaan" name="pekerjaan" value={user().pekerjaan || ""} onInput={handleChange} />
        </div>

        <div class="input-wrappp">
          <label for="tanggal_lahir">Tanggal Lahir:</label>
          <input type="date" id="tanggal_lahir" name="tanggal_lahir" value={user().tanggal_lahir || ""} onInput={handleChange} />
        </div>

        <div class="input-wrapppp-group">
          <div class="input-wrappp">
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" value={user().gender || ""} onChange={handleChange}>
              <option value="" disabled>
                Pilih Gender
              </option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div class="input-wrappp">
            <label for="goldar">Golongan Darah:</label>
            <select id="goldar" name="goldar" value={user().goldar || ""} onChange={handleChange}>
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

        <div class="input-wrappp">
          <label for="umur">Umur:</label>
          <input type="text" id="umur" name="umur" value={user().umur || ""} onInput={handleChange} />
        </div>

        {/* Input Provinsi */}
        <div class="input-wrappp">
          <label for="provinsi">Provinsi:</label>
          <input type="text" id="provinsi" name="provinsi" value={user().provinsi || ""} onInput={handleChange} />
        </div>

        {/* Input Kabupaten */}
        <div class="input-wrappp">
          <label for="kabupaten">Kabupaten:</label>
          <input type="text" id="kabupaten" name="kabupaten" value={user().kabupaten || ""} onInput={handleChange} />
        </div>

        {/* Input Kecamatan */}
        <div class="input-wrappp">
          <label for="kecamatan">Kecamatan:</label>
          <input type="text" id="kecamatan" name="kecamatan" value={user().kecamatan || ""} onInput={handleChange} />
        </div>

        <div class="button-group">
          <button type="submit">Simpan Perubahan</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>

      {/* Pop-up untuk menampilkan pesan */}
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

export default EditData;
