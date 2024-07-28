document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Robusta Brazil", img: "kopi1.png", price: 20000 },
      { id: 2, name: "Arabica Blend", img: "kopi2.png", price: 25000 },
      { id: 3, name: "Primo Passo", img: "kopi6.png", price: 30000 },
      { id: 4, name: "Aceh Gayo", img: "kopi4.png", price: 35000 },
      { id: 5, name: "Sumatra Mandheling", img: "kopi5.png", price: 40000 },
    ],
  }));
  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItmes) {
      // cek apakah ada barang yang sama di cart nya
      const cartItem = this.items.find((item) => item.id === newItmes.id);

      // jika belum ada / masih kosong
      if (!cartItem) {
        this.items.push({ ...newItmes, quantity: 1, total: newItmes.price });
        this.quantity++;
        this.total += newItmes.price;
      } else {
        // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          // jika barang berbeda
          if (item.id !== newItmes.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan semua total nya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item yang mau di remove berdasarkan id nya
      const cartItem = this.items.find((item) => item.id === id);
      // jika item lebih dari 1
      if (cartItem.quantity > 1) {
        // telusuri 1 1
        this.items = this.items.map((item) => {
          // jika bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total = cartItem.price;
      }
    },
  });
});

// form Validation

const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");
form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMassage(objData)
  // window.open("https://wa.me/6285794167189?text=" + encodeURIComponent(message))

  // minta transaction token menggunakan ajax / fetch
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// form pesan wa
const formatMassage = (obj) => {
  return `
    Data Customer
    Nama  : ${obj.name}
    Email : ${obj.email}
    No Hp : ${obj.phone}
    Data Pesanan :
    ${JSON.parse(obj.items).map((item) => `\n${item.name} (${item.quantity} x ${rupiah(item.total)})`)}
    Total : ${rupiah(obj.total)}
    Terima Kasih.
    `;
};

// konversi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
