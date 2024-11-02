export function init() {
  const inputs = document.querySelectorAll(".input-field");
  const toggleBtn = document.querySelectorAll(".toggle");
  const section = document.querySelector("section");
  const bullets = document.querySelectorAll(".bullets span");
  const images = document.querySelectorAll(".image");

  console.log("Section:", section); // Log untuk memastikan section ada

  if (inputs.length > 0) {
    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => {
        inp.classList.add("active");
        inp.closest(".input-wrapp").classList.add("active"); // Menambahkan kelas animasi pada elemen .input-wrapp
      });
      inp.addEventListener("blur", () => {
        if (inp.value !== "") return;
        inp.classList.remove("active");
        inp.closest(".input-wrapp").classList.remove("active"); // Menghapus kelas animasi
      });
    });
  }

  if (toggleBtn.length > 0) {
    toggleBtn.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault(); // Menghindari navigasi ulang
        console.log("Toggle button clicked"); // Log saat tombol toggle diklik
        section.classList.toggle("sign-up-mode");

        // Menambahkan logika untuk navigasi ke halaman lain setelah animasi selesai
        setTimeout(() => {
          const nextPage = btn.getAttribute("href");
          if (nextPage) {
            window.location.href = nextPage;
          }
        }, 500); // Sesuaikan dengan durasi animasi slide
      });
    });
  }

  function moveSlider() {
    let index = this.dataset.value;
    console.log("Moving slider to index:", index); // Log saat slider bergerak

    let currentImage = document.querySelector(`.img-${index}`);
    if (currentImage) {
      images.forEach((img) => img.classList.remove("show"));
      currentImage.classList.add("show");

      const textSlider = document.querySelector(".text-group");
      if (textSlider) {
        textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;
      }

      bullets.forEach((bull) => bull.classList.remove("active"));
      this.classList.add("active");
    }
  }

  if (bullets.length > 0) {
    bullets.forEach((bullet) => {
      bullet.addEventListener("click", moveSlider);
    });
  }
}
