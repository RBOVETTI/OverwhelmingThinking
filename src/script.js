// ============================================
// TRANSLATIONS - Traduzioni
// ============================================
const translations = {
    it: {
        // Navigation
        navHome: "Home",
        navAbout: "Chi Sono",
        navContact: "Contatti",
        
        // Categories
        allArtworks: "Tutte le Opere",
        cowsBulls: "Mucche e Tori",
        pureAbstract: "Astratto Puro",
        semiAbstract: "Semi Astratto",
        
        // Cart
        cartTitle: "Carrello",
        cartTotal: "Totale:",
        cartEmpty: "Il tuo carrello è vuoto",
        cartContactBtn: "Contatta per l'Acquisto",
        addedToCart: "Aggiunto al carrello!",
        alreadyInCart: "Questo articolo è già nel carrello.",
        removeBtn: "Rimuovi",
        
        // Detail page
        backToGallery: "← Torna alla Galleria",
        dimensions: "Dimensioni:",
        addToCart: "Aggiungi al Carrello",
        contactArtist: "Contatta l'Artista",
        
        // About page
        aboutTitle: "Chi Sono",
        aboutText1: "Benvenuto nel mio percorso artistico. Come pittore contemporaneo, esploro l'intersezione tra realtà e astrazione, trovando bellezza sia nel mondo naturale che nella forma pura.",
        aboutText2: "Il mio lavoro si estende su tre collezioni principali: il mondo potente e maestoso di Mucche e Tori, il regno sconfinato dell'espressione Astratta Pura, e lo spazio intrigante dell'interpretazione Semi Astratta dove la realtà incontra l'immaginazione.",
        aboutText3: "Ogni opera è creata con passione e attenzione ai dettagli, mirando a evocare emozione e contemplazione nello spettatore. Grazie per aver dedicato del tempo a esplorare il mio lavoro.",
        
        // Contact page
        contactTitle: "Contatti",
        contactText: "Interessato ad acquistare un'opera o a commissionare un pezzo? Compila il modulo qui sotto e ti risponderò il prima possibile.",
        contactName: "Nome",
        contactEmail: "Email",
        contactSubject: "Oggetto",
        contactMessage: "Messaggio",
        contactSend: "Invia Messaggio",
        contactSuccess: "Grazie per il tuo messaggio! Ti contatterò presto.",
        interestedIn: "Sono interessato alle seguenti opere:\n\n"
    },
    en: {
        // Navigation
        navHome: "Home",
        navAbout: "About",
        navContact: "Contact",
        
        // Categories
        allArtworks: "All Artworks",
        cowsBulls: "Cows and Bulls",
        pureAbstract: "Pure Abstract",
        semiAbstract: "Semi Abstract",
        
        // Cart
        cartTitle: "Shopping Cart",
        cartTotal: "Total:",
        cartEmpty: "Your cart is empty",
        cartContactBtn: "Contact for Purchase",
        addedToCart: "Added to cart!",
        alreadyInCart: "This item is already in your cart.",
        removeBtn: "Remove",
        
        // Detail page
        backToGallery: "← Back to Gallery",
        dimensions: "Dimensions:",
        addToCart: "Add to Cart",
        contactArtist: "Contact Artist",
        
        // About page
        aboutTitle: "About the Artist",
        aboutText1: "Welcome to my artistic journey. As a contemporary painter, I explore the intersection of reality and abstraction, finding beauty in both the natural world and pure form.",
        aboutText2: "My work spans three main collections: the powerful and majestic world of Cows and Bulls, the boundless realm of Pure Abstract expression, and the intriguing space of Semi Abstract interpretation where reality meets imagination.",
        aboutText3: "Each piece is created with passion and attention to detail, aiming to evoke emotion and contemplation in the viewer. Thank you for taking the time to explore my work.",
        
        // Contact page
        contactTitle: "Contact",
        contactText: "Interested in purchasing an artwork or commissioning a piece? Please fill out the form below and I'll get back to you as soon as possible.",
        contactName: "Name",
        contactEmail: "Email",
        contactSubject: "Subject",
        contactMessage: "Message",
        contactSend: "Send Message",
        contactSuccess: "Thank you for your message! I will contact you soon.",
        interestedIn: "I am interested in the following artworks:\n\n"
    }
};

// ============================================
// ARTWORK DATA - Edit this section to add/modify your artworks
// ============================================
const artworks = [
    {
        id: 1,
        title: {
            it: "Toro in Movimento",
            en: "Bull in Motion"
        },
        category: "Cows and Bulls",
        price: 1200,
        dimensions: "100x70cm",
        description: {
            it: "Una rappresentazione dinamica di un toro in pieno movimento, catturando la potenza grezza e l'energia di questo magnifico animale.",
            en: "A dynamic representation of a bull in full motion, capturing the raw power and energy of this magnificent animal."
        },
        image: "IMG/bull-motion.jpg"
    },
    {
        id: 2,
        title: {
            it: "Mucca Pacifica",
            en: "Peaceful Cow"
        },
        category: "Cows and Bulls",
        price: 950,
        dimensions: "80x60cm",
        description: {
            it: "Un ritratto sereno di una mucca in un ambiente pastorale, enfatizzando la natura pacifica di queste creature gentili.",
            en: "A serene portrait of a cow in a pastoral setting, emphasizing the peaceful nature of these gentle creatures."
        },
        image: "IMG/peaceful-cow.jpg"
    },
    {
        id: 3,
        title: {
            it: "Ritmo Astratto",
            en: "Abstract Rhythm"
        },
        category: "Pure Abstract",
        price: 1500,
        dimensions: "120x90cm",
        description: {
            it: "Un'esplorazione di colore, forma e movimento attraverso un'espressione puramente astratta. Quest'opera invita gli spettatori a trovare il proprio significato.",
            en: "An exploration of color, form, and movement through purely abstract expression. This piece invites viewers to find their own meaning."
        },
        image: "IMG/abstract-rhythm.jpg"
    },
    {
        id: 4,
        title: {
            it: "Sinfonia di Colori",
            en: "Color Symphony"
        },
        category: "Pure Abstract",
        price: 1350,
        dimensions: "100x100cm",
        description: {
            it: "Una vibrante celebrazione di colore e texture, quest'opera astratta crea una sinfonia visiva sulla tela.",
            en: "A vibrant celebration of color and texture, this abstract work creates a visual symphony on canvas."
        },
        image: "IMG/color-symphony.jpg"
    },
    {
        id: 5,
        title: {
            it: "Sogni Urbani",
            en: "Urban Dreams"
        },
        category: "Semi Abstract",
        price: 1100,
        dimensions: "90x70cm",
        description: {
            it: "Un'interpretazione semi-astratta di paesaggi urbani, mescolando forme riconoscibili con elementi astratti.",
            en: "A semi-abstract interpretation of urban landscapes, blending recognizable forms with abstract elements."
        },
        image: "IMG/urban-dreams.jpg"
    },
    {
        id: 6,
        title: {
            it: "Sussurro della Natura",
            en: "Nature's Whisper"
        },
        category: "Semi Abstract",
        price: 1250,
        dimensions: "110x80cm",
        description: {
            it: "Le forme naturali si dissolvono in schemi astratti in questo pezzo contemplativo sul rapporto tra realtà e immaginazione.",
            en: "Natural forms dissolve into abstract patterns in this contemplative piece about the relationship between reality and imagination."
        },
        image: "IMG/nature-whisper.jpg"
    },
    {
        id: 7,
        title: {
            it: "Toro delle Highland",
            en: "Highland Bull"
        },
        category: "Cows and Bulls",
        price: 1400,
        dimensions: "100x80cm",
        description: {
            it: "Un maestoso toro delle highland ritratto con pennellate audaci e illuminazione drammatica.",
            en: "A majestic highland bull portrayed with bold brushstrokes and dramatic lighting."
        },
        image: "IMG/highland-bull.jpg"
    },
    {
        id: 8,
        title: {
            it: "Flusso Cosmico",
            en: "Cosmic Flow"
        },
        category: "Pure Abstract",
        price: 1600,
        dimensions: "130x100cm",
        description: {
            it: "Un'esplorazione dello spazio e dell'energia attraverso forme astratte e palette di colori cosmici.",
            en: "An exploration of space and energy through abstract forms and cosmic color palettes."
        },
        image: "IMG/cosmic-flow.jpg"
    }
];

// ============================================
// GLOBAL VARIABLES
// ============================================
let cart = [];
let currentCategory = 'all';
let currentLanguage = 'it'; // Default language: Italian

// ============================================
// INITIALIZATION
// ============================================
// Load home page when the website starts
loadHome();

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update navigation
    updateNavigation();
    
    // Update cart
    updateCartLanguage();
    
    // Reload current page content
    const mainContent = document.getElementById('mainContent');
    if (mainContent.querySelector('.gallery-grid')) {
        loadHome();
    } else if (mainContent.querySelector('.page-content h1')?.textContent.includes('Chi Sono') || 
               mainContent.querySelector('.page-content h1')?.textContent.includes('About')) {
        loadAbout();
    } else if (mainContent.querySelector('.contact-form')) {
        loadContact();
    } else if (mainContent.querySelector('.detail-view')) {
        // If on detail page, find the artwork ID and reload
        const backBtn = mainContent.querySelector('.btn-secondary');
        if (backBtn) {
            // Try to find artwork ID from the page
            const priceElement = mainContent.querySelector('.price');
            if (priceElement) {
                const price = parseInt(priceElement.textContent.replace('€', ''));
                const artwork = artworks.find(art => art.price === price);
                if (artwork) {
                    loadDetail(artwork.id);
                }
            }
        }
    }
}

function updateNavigation() {
    const t = translations[currentLanguage];
    document.getElementById('nav-home').textContent = t.navHome;
    document.getElementById('nav-about').textContent = t.navAbout;
    document.getElementById('nav-contact').textContent = t.navContact;
}

function updateCartLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('cart-title').textContent = t.cartTitle;
    document.getElementById('cart-total-label').textContent = t.cartTotal;
    document.getElementById('cart-contact-btn').textContent = t.cartContactBtn;
    
    // Update cart items if any
    if (cart.length > 0) {
        updateCart();
    } else {
        document.getElementById('cartItems').innerHTML = `<div class="empty-cart">${t.cartEmpty}</div>`;
    }
}

function getCategoryName(category) {
    const t = translations[currentLanguage];
    const categoryMap = {
        'Cows and Bulls': t.cowsBulls,
        'Pure Abstract': t.pureAbstract,
        'Semi Abstract': t.semiAbstract
    };
    return categoryMap[category] || category;
}

// ============================================
// PAGE LOADING FUNCTIONS
// ============================================

function loadHome() {
    currentCategory = 'all';
    const t = translations[currentLanguage];
    const content = `
        <div class="category-filter">
            <button class="category-btn active" onclick="filterCategory('all')">${t.allArtworks}</button>
            <button class="category-btn" onclick="filterCategory('Cows and Bulls')">${t.cowsBulls}</button>
            <button class="category-btn" onclick="filterCategory('Pure Abstract')">${t.pureAbstract}</button>
            <button class="category-btn" onclick="filterCategory('Semi Abstract')">${t.semiAbstract}</button>
        </div>
        <div class="gallery-grid" id="galleryGrid">
            ${renderGallery()}
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadAbout() {
    const t = translations[currentLanguage];
    const content = `
        <div class="page-content">
            <h1>${t.aboutTitle}</h1>
            <p>${t.aboutText1}</p>
            <p>${t.aboutText2}</p>
            <p>${t.aboutText3}</p>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadContact() {
    const t = translations[currentLanguage];
    const cartItems = cart.map(item => {
        const title = typeof item.title === 'object' ? item.title[currentLanguage] : item.title;
        return `${title} (€${item.price})`;
    }).join('\n');
    const content = `
        <div class="page-content">
            <h1>${t.contactTitle}</h1>
            <p>${t.contactText}</p>
            <form class="contact-form" onsubmit="handleContact(event)">
                <div class="form-group">
                    <label>${t.contactName}</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>${t.contactEmail}</label>
                    <input type="email" required>
                </div>
                <div class="form-group">
                    <label>${t.contactSubject}</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>${t.contactMessage}</label>
                    <textarea required>${cartItems ? t.interestedIn + cartItems : ''}</textarea>
                </div>
                <button type="submit" class="btn-primary">${t.contactSend}</button>
            </form>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = content;
}

function loadDetail(id) {
    const artwork = artworks.find(art => art.id === id);
    const t = translations[currentLanguage];
    const title = typeof artwork.title === 'object' ? artwork.title[currentLanguage] : artwork.title;
    const description = typeof artwork.description === 'object' ? artwork.description[currentLanguage] : artwork.description;
    
    const content = `
        <div class="detail-view">
            <button class="btn-secondary" onclick="loadHome()" style="margin-bottom: 2rem;">${t.backToGallery}</button>
            <div class="detail-content">
                <div>
                    <img src="${artwork.image}" alt="${title}" class="detail-image">
                </div>
                <div class="detail-info">
                    <h1>${title}</h1>
                    <span class="category-tag">${getCategoryName(artwork.category)}</span>
                    <p class="description">${description}</p>
                    <p class="dimensions">${t.dimensions} ${artwork.dimensions}</p>
                    <div class="price">€${artwork.price}</div>
                    <button class="btn-primary" onclick="addToCart(${artwork.id})">${t.addToCart}</button>
                    <button class="btn-secondary" onclick="loadContact()">${t.contactArtist}</button>
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
    
    return filtered.map(art => {
        const title = typeof art.title === 'object' ? art.title[currentLanguage] : art.title;
        return `
            <div class="artwork-card" onclick="loadDetail(${art.id})">
                <img src="${art.image}" alt="${title}" class="artwork-image">
                <div class="artwork-info">
                    <div class="artwork-title">${title}</div>
                    <div class="artwork-category">${getCategoryName(art.category)}</div>
                    <div class="artwork-price">€${art.price}</div>
                </div>
            </div>
        `;
    }).join('');
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
    const t = translations[currentLanguage];
    const artwork = artworks.find(art => art.id === id);
    if (!cart.find(item => item.id === id)) {
        cart.push(artwork);
        updateCart();
        alert(t.addedToCart);
    } else {
        alert(t.alreadyInCart);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const t = translations[currentLanguage];
    document.getElementById('cartCount').textContent = cart.length;
    
    if (cart.length === 0) {
        document.getElementById('cartItems').innerHTML = `<div class="empty-cart">${t.cartEmpty}</div>`;
        document.getElementById('cartTotal').textContent = '€0';
    } else {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cartItems').innerHTML = cart.map(item => {
            const title = typeof item.title === 'object' ? item.title[currentLanguage] : item.title;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${title}</div>
                        <div class="cart-item-price">€${item.price}</div>
                        <div class="remove-item" onclick="removeFromCart(${item.id})">${t.removeBtn}</div>
                    </div>
                </div>
            `;
        }).join('');
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
    const t = translations[currentLanguage];
    event.preventDefault();
    alert(t.contactSuccess);
    event.target.reset();
}