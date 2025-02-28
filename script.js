const productList = document.getElementById('productList');
const cartList = document.getElementById('cartList');
const totalPriceElement = document.getElementById('totalPrice');
let cart = [];

// Fetch product data from PHP API
fetch('http://localhost/storefront/products.php')  // Use correct path
    .then(response => response.json())
    .then(data => {
        console.log("Fetched Products:", data);
        displayProducts(data);
        populateCategories(data);
    })
    .catch(error => console.error('Error fetching data:', error));

    
// Display products on the page
function displayProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product');
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" width="150">
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <select class="varietySelect">
                ${product.varieties.map(variety => 
                    `<option value="${variety.id}" data-price="${variety.price}">${variety.name} - ₹${variety.price}</option>`).join('')}
            </select>
            <button onclick="addToCart('${product.id}', '${product.name}')">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

// Populate category filter options
function populateCategories(products) {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        if (selectedCategory === 'all') {
            displayProducts(products);
        } else {
            displayProducts(products.filter(p => p.category === selectedCategory));
        }
    });
}

// Add product to cart
function addToCart(productId, productName) {
    const selectedVariety = document.querySelector(`[data-price]`).selectedOptions[0];
    const varietyId = selectedVariety.value;
    const varietyPrice = parseInt(selectedVariety.getAttribute('data-price'));

    const existingItem = cart.find(item => item.varietyId === varietyId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, productName, varietyId, varietyPrice, quantity: 1 });
    }
    updateCart();
}

// Update the cart UI
function updateCart() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.varietyPrice * item.quantity;
        const listItem = document.createElement('li');
        listItem.classList.add('cart-item');
        listItem.innerHTML = `
            ${item.productName} (${item.quantity}) - ₹${item.varietyPrice * item.quantity}
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartList.appendChild(listItem);
    });
    totalPriceElement.textContent = total;
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', () => {
    alert(`Total Price: ₹${totalPriceElement.textContent}`);
    cart = [];
    updateCart();
});
