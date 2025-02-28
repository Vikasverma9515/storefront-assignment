document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("productList");
    const cartList = document.getElementById("cartList");
    const totalPriceElement = document.getElementById("totalPrice");
    const searchBox = document.getElementById("searchBox");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortLowHigh = document.getElementById("sortLowHigh");
    const sortHighLow = document.getElementById("sortHighLow");
    const checkoutBtn = document.getElementById("checkoutBtn");

    let products = []; // Store fetched products
    let cart = JSON.parse(localStorage.getItem("cart")) || []; // Load cart from localStorage

    // Fetch product data from PHP API
    function fetchProducts() {
        fetch("http://localhost/storefront/products.php") // Update with correct path
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Products:", data);
                products = data;
                displayProducts(products);
                populateCategories(products);
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    // Display products
    function displayProducts(filteredProducts) {
        productList.innerHTML = "";
        filteredProducts.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product");
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" width="150">
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <select class="varietySelect">
                    ${product.varieties.map(variety => 
                        `<option value="${variety.id}" data-price="${variety.price}">${variety.name} - ₹${variety.price}</option>`).join("")}
                </select>
                <button class="addToCartBtn" data-id="${product.id}" data-name="${product.name}">Add to Cart</button>
            `;
            productList.appendChild(productCard);
        });

        // Attach event listeners to Add to Cart buttons
        document.querySelectorAll(".addToCartBtn").forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.dataset.id;
                const productName = this.dataset.name;
                const parent = this.parentElement;
                const varietySelect = parent.querySelector(".varietySelect");
                const varietyId = varietySelect.value;
                const varietyPrice = varietySelect.options[varietySelect.selectedIndex].dataset.price;
                addToCart(productId, productName, varietyId, varietyPrice);
            });
        });
    }

    // Populate category filter options
    function populateCategories(products) {
        const categories = [...new Set(products.map(p => p.category))];
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        categoryFilter.addEventListener("change", function () {
            const selectedCategory = categoryFilter.value;
            const filteredProducts = selectedCategory === "all" 
                ? products 
                : products.filter(p => p.category === selectedCategory);
            displayProducts(filteredProducts);
        });
    }

    // Add product to cart
    function addToCart(productId, productName, varietyId, varietyPrice) {
        let item = cart.find(i => i.varietyId === varietyId);

        if (item) {
            item.quantity++;
        } else {
            cart.push({
                productId,
                varietyId,
                name: productName,
                price: parseFloat(varietyPrice),
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
    }

    // Update cart UI
    function updateCart() {
        cartList.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement("li");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                ${item.name} (₹${item.price}) x ${item.quantity}
                <button class="increaseQty" data-index="${index}">+</button>
                <button class="decreaseQty" data-index="${index}">-</button>
                <button class="removeItem" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(cartItem);
        });

        totalPriceElement.textContent = total.toFixed(2);
        localStorage.setItem("cart", JSON.stringify(cart));

        attachCartEventListeners();
    }

    // Attach event listeners to cart buttons
    function attachCartEventListeners() {
        document.querySelectorAll(".increaseQty").forEach(button => {
            button.addEventListener("click", function () {
                cart[this.dataset.index].quantity++;
                updateCart();
            });
        });

        document.querySelectorAll(".decreaseQty").forEach(button => {
            button.addEventListener("click", function () {
                if (cart[this.dataset.index].quantity > 1) {
                    cart[this.dataset.index].quantity--;
                } else {
                    cart.splice(this.dataset.index, 1);
                }
                updateCart();
            });
        });

        document.querySelectorAll(".removeItem").forEach(button => {
            button.addEventListener("click", function () {
                cart.splice(this.dataset.index, 1);
                updateCart();
            });
        });
    }

    // Search products
    searchBox.addEventListener("input", function () {
        const searchTerm = searchBox.value.toLowerCase();
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));
        displayProducts(filteredProducts);
    });

    // Sorting functions
    sortLowHigh.addEventListener("click", function () {
        const sortedProducts = [...products].sort((a, b) => a.varieties[0].price - b.varieties[0].price);
        displayProducts(sortedProducts);
    });

    sortHighLow.addEventListener("click", function () {
        const sortedProducts = [...products].sort((a, b) => b.varieties[0].price - a.varieties[0].price);
        displayProducts(sortedProducts);
    });

    // Checkout
    checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        alert(`Total Price: ₹${totalPriceElement.textContent}\nProceeding to checkout...`);
        cart = [];
        updateCart();
    });

    // Load cart from localStorage on page load
    updateCart();
    fetchProducts();
});
