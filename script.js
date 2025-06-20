const products = [
    { id: 1, name: 'Margherita Pizza', price: 120, image: 'https://via.placeholder.com/280x200?text=Margherita+Pizza' },
    { id: 2, name: 'Pasta Carbonara', price: 80, image: 'https://via.placeholder.com/280x200?text=Pasta+Carbonara' },
    { id: 3, name: 'Caesar Salad', price: 60, image: 'https://via.placeholder.com/280x200?text=Caesar+Salad' },
    { id: 4, name: 'Chocolate Lava Cake', price: 45, image: 'https://via.placeholder.com/280x200?text=Chocolate+Lava+Cake' },
    { id: 5, name: 'Grilled Chicken Panini', price: 75, image: 'https://via.placeholder.com/280x200?text=Chicken+Panini' },
    { id: 6, name: 'Avocado Toast', price: 55, image: 'https://via.placeholder.com/280x200?text=Avocado+Toast' },
    { id: 7, name: 'Croissant Sandwich', price: 65, image: 'https://via.placeholder.com/280x200?text=Croissant+Sandwich' },
    { id: 8, name: 'Fruit Smoothie', price: 40, image: 'https://via.placeholder.com/280x200?text=Fruit+Smoothie' },
    { id: 9, name: 'Cappuccino', price: 35, image: 'https://via.placeholder.com/280x200?text=Cappuccino' },
    { id: 10, name: 'Cheese Platter', price: 90, image: 'https://via.placeholder.com/280x200?text=Cheese+Platter' },
    { id: 11, name: 'Veggie Wrap', price: 60, image: 'https://via.placeholder.com/280x200?text=Veggie+Wrap' },
    { id: 12, name: 'Brownie Bites', price: 30, image: 'https://via.placeholder.com/280x200?text=Brownie+Bites' }
];

let cart = [];

// Display products
function displayProducts() {
    const productsSection = document.getElementById('products');
    productsSection.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>R${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsSection.appendChild(productCard);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;
        const itemElement = document.createElement('div');
        itemElement.innerHTML = `
            ${item.name} - R${item.price} x ${item.quantity}
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(itemElement);
    });

    cartCount.textContent = itemCount;
    cartTotal.textContent = total;
}

// Remove from cart
function removeFromCart(productId) {
    const cartItemIndex = cart.findIndex(item => item.id === productId);
    if (cartItemIndex !== -1) {
        if (cart[cartItemIndex].quantity > 1) {
            cart[cartItemIndex].quantity--;
        } else {
            cart.splice(cartItemIndex, 1);
        }
        updateCart();
    }
}

// Handle checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (paymentMethod === 'payfast') {
        // Payfast integration
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payfast.co.za/eng/process'; // Use sandbox for testing

        const fields = {
            merchant_id: '10000100', // Replace with your Payfast merchant ID
            merchant_key: '46f0cd694581a', // Replace with your Payfast merchant key
            return_url: window.location.origin + '/success.html',
            cancel_url: window.location.origin + '/cancel.html',
            notify_url: window.location.origin + '/notify.html',
            name_first: name,
            email_address: email,
            cell_number: phone,
            m_payment_id: 'ORDER_' + Date.now(),
            amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            item_name: 'Food Order',
            item_description: cart.map(item => `${item.name} x${item.quantity}`).join(', ')
        };

        for (const [key, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        // Generate Payfast signature
        const signature = generatePayfastSignature(fields);
        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = signature;
        form.appendChild(signatureInput);

        document.body.appendChild(form);
        form.submit();
    } else {
        alert('Order placed successfully! You chose Cash on Delivery.');
        cart = [];
        updateCart();
        document.getElementById('checkout-form').reset();
    }
});

// Generate Payfast signature
function generatePayfastSignature(fields) {
    const sortedKeys = Object.keys(fields).sort();
    let signatureString = '';
    for (const key of sortedKeys) {
        if (fields[key]) {
            signatureString += `${key}=${encodeURIComponent(fields[key]).replace(/%20/g, '+')}&`;
        }
    }
    signatureString = signatureString.slice(0, -1); // Remove trailing &
    return md5(signatureString);
}

// Initialize products
displayProducts();