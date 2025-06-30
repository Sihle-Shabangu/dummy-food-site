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

// Convert data array to string for Payfast
function dataToString(dataArray) {
    let pfParamString = '';
    for (let key in dataArray) {
        if (dataArray.hasOwnProperty(key) && dataArray[key] !== null && dataArray[key] !== undefined) {
            pfParamString += `${key}=${encodeURIComponent(dataArray[key].toString().trim()).replace(/%20/g, '+')}&`;
        }
    }
    return pfParamString.slice(0, -1);
}

// Generate Payfast signature
function generateSignature(data, passPhrase) {
    let pfParamString = dataToString(data);
    if (passPhrase) {
        pfParamString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
    }
    return md5(pfParamString);
}

// Generate Payfast payment identifier
async function generatePaymentIdentifier(pfParamString) {
    try {
        const response = await axios.post('https://sandbox.payfast.co.za/onsite/process', pfParamString, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log('Payfast response:', response.data); // Log response for debugging
        return response.data.uuid || null;
    } catch (error) {
        console.error('Error generating payment identifier:', error);
        if (error.response) {
            console.error('Payfast error response:', error.response.data); // Log Payfast error details
            alert(`Payment error: ${error.response.data || 'Failed to generate payment identifier. Please check your merchant details and try again.'}`);
        } else {
            alert('Payment error: Unable to connect to Payfast. Please try again later.');
        }
        return null;
    }
}

// Handle checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Check if md5 is defined
    if (typeof md5 === 'undefined') {
        console.error('MD5 library not loaded');
        alert('Payment processing error: MD5 library not loaded. Please try again later.');
        return;
    }

    // Check if axios is defined
    if (typeof axios === 'undefined') {
        console.error('Axios library not loaded');
        alert('Payment processing error: Axios library not loaded. Please try again later.');
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (paymentMethod === 'payfast') {
        // Payfast Onsite Payment
        const passPhrase = 'LetU5DefGo123'; // Replace with your Payfast sandbox passphrase

        const data = {
            merchant_id: '10039982', // Replace with your Payfast sandbox merchant ID
            merchant_key: 'u4exfl3c1ruhy', // Replace with your Payfast sandbox merchant key
            return_url: window.location.origin + '/success.html',
            cancel_url: window.location.origin + '/cancel.html',
            notify_url: window.location.origin + '/notify.html',
            name_first: name,
            email_address: email,
            cell_number: phone,
            m_payment_id: 'ORDER_' + Date.now(),
            amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
            item_name: 'Food Order',
            item_description: cart.map(item => `${item.name} x${item.quantity}`).join(', '),
            payment_method: 'cc' // Required for Onsite Payment (credit card)
        };

        // Generate Payfast signature
        data.signature = generateSignature(data, passPhrase);

        // Convert data to string
        const pfParamString = dataToString(data);
        console.log('Payfast request payload:', pfParamString); // Log payload for debugging

        // Generate payment identifier
        const identifier = await generatePaymentIdentifier(pfParamString);
        if (identifier) {
            window.payfast_do_onsite_payment({ uuid: identifier }, (result) => {
                if (result) {
                    console.log('Payment completed:', result);
                    cart = [];
                    updateCart();
                    document.getElementById('checkout-form').reset();
                    window.location.href = '/success.html';
                } else {
                    console.log('Payment cancelled or failed');
                    window.location.href = '/cancel.html';
                }
            });
        }
    } else {
        alert('Order placed successfully! You chose Cash on Delivery.');
        cart = [];
        updateCart();
        document.getElementById('checkout-form').reset();
    }
});

// Initialize products
document.addEventListener('DOMContentLoaded', () => {
    if (typeof md5 === 'undefined') {
        console.warn('MD5 library not loaded yet, retrying...');
        setTimeout(displayProducts, 1000); // Retry after 1 second
    } else {
        displayProducts();
    }
});