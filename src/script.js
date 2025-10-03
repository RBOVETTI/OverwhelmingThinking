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
        
        // Hero section
        heroWelcome: "Benvenuto",
        heroIntro: "Pittore contemporaneo che esplora l'intersezione tra realtà e astrazione. Ogni opera è un viaggio tra forma, colore ed emozione.",
        heroButton: "Scopri di più",
        
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
        interestedIn: "I am interested in the following artworks:\n\n",
        
        // Hero section
        heroWelcome: "Welcome",
        heroIntro: "Contemporary painter exploring the intersection between reality and abstraction. Each artwork is a journey through form, color and emotion.",
        heroButton: "Learn More"
    }
};

// ============================================
// ARTWORK DATA - Will be loaded from Paintings.json
// ============================================
let artworks = [];

// ============================================
// GLOBAL VARIABLES
// ============================================
let cart = [];
let currentCategory = 'all';
let currentLanguage = 'it'; // Default language: Italian
let slideshowInterval = null;
let currentSlideIndex = 0;

// ============================================
// LOAD ARTWORK DATA FROM JSON
// ============================================
async function loadArtworks() {
    try {
        const response = await fetch('Paintings.json');
        if (!response.ok) {
            throw new Error('Impossibile caricare i dipinti');
        }
        artworks = await response.json();
        console.log('Dipinti caricati con successo:', artworks.length);
    } catch (error) {
        console.error('Errore nel caricamento dei dipinti:', error);
        alert('Errore nel caricamento delle opere. Verifica che il file Paintings.json sia presente.');
    }
}

// ============================================
// INITIALIZATION
// ============================================
// Load artworks and then initialize the page
(async function init() {
    await loadArtworks();
    loadHome();
    startSlideshow();
})();

// ============================================
// SLIDESHOW FUNCTIONS
// ============================================

function startSlideshow() {
    if (artworks.length === 0) return;
    
    // Show first image
    updateSlideshow();
    
    // Change image every 60 seconds
    slideshowInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % artworks.length;
        updateSlideshow();
    }, 60000); // 60 seconds
}

function updateSlideshow() {
    if (artworks.length === 0) return;
    
    const artwork = artworks[currentSlideIndex];
    const title = typeof artwork.title === 'object' ? artwork.title[currentLanguage] : artwork.title;
    const category = getCategoryName(artwork.category);
    
    const imageElement = document.getElementById('slideshowImage');
    const titleElement = document.getElementById('slideshowTitle');
    const categoryElement = document.getElementById('slideshowCategory');
    
    if (imageElement && titleElement && categoryElement) {
        // Fade out
        imageElement.style.opacity = '0';
        
        setTimeout(() => {
            imageElement.src = artwork.image;
            titleElement.textContent = title;
            categoryElement.textContent = category;
            
            // Fade in
            imageElement.style.opacity = '1';
        }, 500);
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

function showHeroSection() {
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        heroSection.classList.remove('hidden');
        if (!slideshowInterval) {
            startSlideshow();
        }
    }
}

function hideHeroSection() {
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        heroSection.classList.add('hidden');
        stopSlideshow();
    }
}

function updateHeroLanguage() {
    const t = translations[currentLanguage];
    const titleElement = document.getElementById('artistIntroTitle');
    const textElement = document.getElementById('artistIntroText');
    const buttonElement = document.getElementById('artistIntroBtn');
    
    if (titleElement) titleElement.textContent = t.heroWelcome;
    if (textElement) textElement.textContent = t.heroIntro;
    if (buttonElement) buttonElement.textContent = t.heroButton;
    
    // Update slideshow text
    updateSlideshow();
}

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
    
    // Update hero section
    updateHeroLanguage();
    
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
    
    // Show hero section
    showHeroSection();
    
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
    
    // Hide hero section
    hideHeroSection();
    
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
    
    // Hide hero section
    hideHeroSection();
    
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
    
    // Hide hero section
    hideHeroSection();
    
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