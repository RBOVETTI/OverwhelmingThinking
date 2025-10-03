// ============================================
// ARTWORK DATA - Edit this section to add/modify your artworks
// ============================================
const artworks = [
    {
        id: 1,
        title: "Bull in Motion",
        category: "Cows and Bulls",
        price: 1200,
        dimensions: "100x70cm",
        description: "A dynamic representation of a bull in full motion, capturing the raw power and energy of this magnificent animal.",
        image: "https://images.unsplash.com/photo-1516781593389-780b81c25bd1?w=600"
    },
    {
        id: 2,
        title: "Peaceful Cow",
        category: "Cows and Bulls",
        price: 950,
        dimensions: "80x60cm",
        description: "A serene portrait of a cow in a pastoral setting, emphasizing the peaceful nature of these gentle creatures.",
        image: "https://images.unsplash.com/photo-1544965850-a7fd82367ab7?w=600"
    },
    {
        id: 3,
        title: "Abstract Rhythm",
        category: "Pure Abstract",
        price: 1500,
        dimensions: "120x90cm",
        description: "An exploration of color, form, and movement through purely abstract expression. This piece invites viewers to find their own meaning.",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600"
    },
    {
        id: 4,
        title: "Color Symphony",
        category: "Pure Abstract",
        price: 1350,
        dimensions: "100x100cm",
        description: "A vibrant celebration of color and texture, this abstract work creates a visual symphony on canvas.",
        image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600"
    },
    {
        id: 5,
        title: "Urban Dreams",
        category: "Semi Abstract",
        price: 1100,
        dimensions: "90x70cm",
        description: "A semi-abstract interpretation of urban landscapes, blending recognizable forms with abstract elements.",
        image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600"
    },
    {
        id: 6,
        title: "Nature's Whisper",
        category: "Semi Abstract",
        price: 1250,
        dimensions: "110x80cm",
        description: "Natural forms dissolve into abstract patterns in this contemplative piece about the relationship between reality and imagination.",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600"
    },
    {
        id: 7,
        title: "Highland Bull",
        category: "Cows and Bulls",
        price: 1400,
        dimensions: "100x80cm",
        description: "A majestic highland bull portrayed with bold brushstrokes and dramatic lighting.",
        image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600"
    },
    {
        id: 8,
        title: "Cosmic Flow",
        category: "Pure Abstract",
        price: 1600,
        dimensions: "130x100cm",
        description: "An exploration of space and energy through abstract forms and cosmic color palettes.",
        image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600"
    }
];

// ============================================
// GLOBAL VARIABLES
// ============================================
let cart = [];
let currentCategory = 'all';

// ============================================
// INITIALIZATION
// ============================================
// Load home page when the website starts
loadHome();

// ============================================
// PAGE LOADING FUNCTIONS
// ============================================

function loadHome() {
    currentCategory = 'all';
    const content = `
        <div class="category-filter">
            <button class="category-btn active" onclick="filterCategory('all')">All Artworks</button>
            <button class="category-btn" onclick="filterCategory('Cows and Bulls')">Cows and Bulls</button>
            <button class="category-btn" onclick="filterCategory('Pure Abstract')">Pure Abstract</button>
            <button class="category-btn" onclick="filterCategory('Semi Abstract')">Semi Abstract</button>
        </div>
        <div class="gallery-grid" id="galleryGrid">
            ${renderGallery()}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadAbout() {
    const content = `
        <div class="page-content">
            <h1>About the Artist</h1>
            <p>Welcome to my artistic journey. As a contemporary painter, I explore the intersection of reality and abstraction, finding beauty in both the natural world and pure form.</p>
            <p>My work spans three main collections: the powerful and majestic world of Cows and Bulls, the boundless realm of Pure Abstract expression, and the intriguing space of Semi Abstract interpretation where reality meets imagination.</p>
            <p>Each piece is created with passion and attention to detail, aiming to evoke emotion and contemplation in the viewer. Thank you for taking the time to explore my work.</p>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadContact() {
    const cartItems = cart.map(item => `${item.title} (€${item.price})`).join('\n');
    const content = `
        <div class="page-content">
            <h1>Contact</h1>
            <p>Interested in purchasing an artwork or commissioning a piece? Please fill out the form below and I'll get back to you as soon as possible.</p>
            <form class="contact-form" onsubmit="handleContact(event)">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" required>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea required>${cartItems ? 'I am interested in the following artworks:\n\n' + cartItems : ''}</textarea>
                </div>
                <button type="submit" class="btn-primary">Send Message</button>
            </form>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadDetail(id) {
    const artwork = artworks.find(art => art.id === id);
    const content = `
        <div class="detail-view">
            <button class="btn-secondary" onclick="loadHome()" style="margin-bottom: 2rem;">← Back to Gallery</button>
            <div class="detail-content">
                <div>
                    <img src="${artwork.image}" alt="${artwork.title}" class="detail-image">
                </div>
                <div class="detail-info">
                    <h1>${artwork.title}</h1>
                    <span class="category-tag">${artwork.category}</span>
                    <p class="description">${artwork.description}</p>
                    <p class="dimensions">Dimensions: ${artwork.dimensions}</p>
                    <div class="price">€${artwork.price}</div>
                    <button class="btn-primary" onclick="addToCart(${artwork.id})">Add to Cart</button>
                    <button class="btn-secondary" onclick="loadContact()">Contact Artist</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

// ============================================
// GALLERY FUNCTIONS
// ============================================

function renderGallery() {
    const filtered = currentCategory === 'all' 
        ? artworks 
        : artworks.filter(art => art.category === currentCategory);
    
    return filtered.map(art => `
        <div class="artwork-card" onclick="loadDetail(${art.id})">
            <img src="${art.image}" alt="${art.title}" class="artwork-image">
            <div class="artwork-info">
                <div class="artwork-title">${art.title}</div>
                <div class="artwork-category">${art.category}</div>
                <div class="artwork-price">€${art.price}</div>
            </div>
        </div>
    `).join('');
}

function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    document.getElementById('galleryGrid').innerHTML = renderGallery();
}

// ============================================
// SHOPPING CART FUNCTIONS
// ============================================

function addToCart(id) {
    const artwork = artworks.find(art => art.id === id);
    if (!cart.find(item => item.id === id)) {
        cart.push(artwork);
        updateCart();
        alert('Added to cart!');
    } else {
        alert('This item is already in your cart.');
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    document.getElementById('cartCount').textContent = cart.length;
    
    if (cart.length === 0) {
        document.getElementById('cartItems').innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.getElementById('cartTotal').textContent = '€0';
    } else {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cartItems').innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">€${item.price}</div>
                    <div class="remove-item" onclick="removeFromCart(${item.id})">Remove</div>
                </div>
            </div>
        `).join('');
        document.getElementById('cartTotal').textContent = `€${total}`;
    }
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
}

function contactForPurchase() {
    toggleCart();
    loadContact();
}

// ============================================
// FORM HANDLING
// ============================================

function handleContact(event) {
    event.preventDefault();
    alert('Thank you for your message! I will contact you soon.');
    event.target.reset();
}