import { createSignal, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import AgGridSolid from "ag-grid-solid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Dashboard.css";
import "boxicons/css/boxicons.min.css";
import { FiAlertCircle } from "solid-icons/fi";
import BloodTypeChart from "./amchart1";
import BarChart from "./amchart2";
import LineChart from "./amchart3";
import GenderChart from "./amchart4";
import Navbar from "./navbar";
import Sidebar from "./Sidebar";
import Maps from "./Map";

const Dashboard = () => {
  const [rowData, setRowData] = createSignal<any[]>([]);
  const [showDeletePopup, setShowDeletePopup] = createSignal(false);
  const [userToDelete, setUserToDelete] = createSignal<any>(null);
  const [userCount, setUserCount] = createSignal({ registered: 0 });
  const [userName, setUserName] = createSignal<string>("");
  const navigate = useNavigate();
  const [totalUserCount, setTotalUserCount] = createSignal(0);
  const [verifiedUserCount, setVerifiedUserCount] = createSignal(0);

  onMount(() => {
    loadUserData();
    loadUserName();
    loadTotalUserCount();
    loadVerifiedUserCount();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dataUpdated", handleDataUpdated); 
  });

  onCleanup(() => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("dataUpdated", handleDataUpdated); // Remove event listener
  });

  const loadTotalUserCount = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8082/users/totaluser");
      if (response.ok) {
        const data = await response.json();
        setTotalUserCount(data.count);
      } else {
        console.error("Failed to fetch total user count");
      }
    } catch (error) {
      console.error("Error fetching total user count:", error);
    }
  };

  const loadVerifiedUserCount = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8082/users/userverif");
      if (response.ok) {
        const data = await response.json();
        setVerifiedUserCount(data.count);
      } else {
        console.error("Failed to fetch verified user count");
      }
    } catch (error) {
      console.error("Error fetching verified user count:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8082/users");
      if (response.ok) {
        const data = await response.json();
        setRowData(
          data.map((user: any) => ({
            ...user,
            role: user.role || "User",
          }))
        );
        setUserCount({ registered: data.length });
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const loadUserName = () => {
    const savedUser = localStorage.getItem("dataDash");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserName(parsedUser.fullName);
    }
  };

  const handleStorageChange = () => {
    loadUserData();
    loadUserName();
  };

  const handleDataUpdated = async () => {
    await loadUserData(); // Reload user data
    await loadTotalUserCount(); // Reload total user count
    await loadVerifiedUserCount(); // Reload verified user count
  };

  const updateRowData = (newData: any[]) => {
    setRowData(newData);
    localStorage.setItem("dataDash", JSON.stringify(newData));
    window.dispatchEvent(new Event("storage"));
  };

  const onEditClick = (params) => {
    navigate(`/edit/${params.data.id}`);
  };

  const columnDefs = [
    { headerName: "Nama Lengkap", field: "nama" },
    { headerName: "Email", field: "email" },
    { headerName: "Pekerjaan", field: "pekerjaan" },
    { headerName: "Tanggal Lahir", field: "tanggal_lahir" },
    { headerName: "Gender", field: "gender" },
    { headerName: "Umur", field: "umur" },
    { headerName: "Golongan Darah", field: "goldar" },
    { headerName: "Provinsi", field: "provinsi" }, 
    { headerName: "Kabupaten", field: "kabupaten" }, 
    { headerName: "Kecamatan", field: "kecamatan" },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        const container = document.createElement("div");
        container.classList.add("action-buttons");

        const updateButton = document.createElement("button");
        updateButton.innerText = "Edit";
        updateButton.classList.add("action-button", "update-button");
        updateButton.addEventListener("click", () => onEditClick(params));

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.classList.add("action-button", "delete-button");
        deleteButton.addEventListener("click", () => confirmDeleteUser(params.data));

        container.appendChild(updateButton);
        container.appendChild(deleteButton);

        return container;
      },
    },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 150,
  };

  const onCellValueChanged = (event: any) => {
    const updatedData = rowData().map((user) => (user.email === event.data.email ? { ...user, [event.colDef.field]: event.newValue } : user));
    updateRowData(updatedData);
  };

  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeletePopup(true);
  };

  const deleteUser = async () => {
    const userToDeleteValue = userToDelete();
    if (userToDeleteValue) {
      try {
        const response = await fetch(`http://localhost:8082/users/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userToDeleteValue.id }), // Kirim ID pengguna yang akan dihapus
        });

        if (response.ok) {
          const updatedData = rowData().filter((user) => user.email !== userToDeleteValue.email);
          updateRowData(updatedData);
          setShowDeletePopup(false);

          // Memicu event untuk memperbarui chart
          const event = new Event("dataUpdated");
          window.dispatchEvent(event);
        } else {
          console.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const addNewUser = () => {
    navigate("/adduser"); // Arahkan ke halaman add-user
  };

  const closePopup = () => {
    setShowDeletePopup(false);
    setUserToDelete(null);
  };

  return (
    <div class="dashboard-container">
      <Navbar />
      <Sidebar />
      <div class="content-g">
        {/* Today's Sales Section */}
        <div class="sales-summary">
          <div class="header">
            <div class="title">
              <h2>Dashboard</h2>
              <p>Lihat laporan hari ini!!</p>
            </div>
            <button class="exportt-btnn">
              <i class="bx bx-detail"></i> Detail
            </button>
          </div>

          <div class="sales-cards">
            <div class="card ">
              <div class="icon">
                <i class="bx bx-user"></i>
              </div>
              <div class="details">
                <h3>{totalUserCount()}</h3>
                <p>Total Pengguna Terdaftar</p>
              </div>
            </div>
            <div class="card total-sales">
              <div class="icon">
                <i class="bx bx-bar-chart"></i>
              </div>
              <div class="details">
                <h3>{verifiedUserCount()}</h3>
                <p>Total Pengguna login</p>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container4">
          <GenderChart />
        </div>
        <div class="chart-container">
          <BloodTypeChart />
        </div>
        <div class="chart-container2">
          <BarChart />
        </div>
        <div class="chart-container3">
          <LineChart />
        </div>

        <div class="grid-section">
          <div class="card-header">
            <h2 class="grid-title">User Data Table</h2>
            <button class="add-buttonn" onClick={addNewUser}>
              + Add User
            </button>
          </div>
          <div class="grid-wrapper ag-theme-alpine">{rowData().length > 0 ? <AgGridSolid columnDefs={columnDefs} rowData={rowData()} defaultColDef={defaultColDef} onCellValueChanged={onCellValueChanged} /> : <p>Loading...</p>}</div>
        </div>

        <div class="maps">
          <Maps />
        </div>
        {showDeletePopup() && (
          <div class="popup-overlay">
            <div class="popup">
              <h2>
                <FiAlertCircle size={80} style={{ color: "red" }} />
              </h2>
              <p>Are you sure you want to delete this user?</p>
              <div class="popup-buttons">
                <button onClick={deleteUser} class="popup-button confirm">
                  Yes
                </button>
                <button onClick={closePopup} class="popup-button cancel">
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
