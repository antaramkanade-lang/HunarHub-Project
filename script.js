/* =========================================================
   HUNARHUB - MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const productsContainer =
    document.getElementById("productsContainer");

const showAllProductsButton =
    document.getElementById("showAllProducts");

const cartLink =
    document.getElementById("cartLink");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartSection =
    document.getElementById("cartSection");

const checkoutSection =
    document.getElementById("checkoutSection");

const profileSection =
    document.getElementById("profileSection");

const profileContent =
    document.getElementById("profileContent");

const closeProfile =
    document.getElementById("closeProfile");

const productDetailsSection =
    document.getElementById("productDetailsSection");

const productDetailsContent =
    document.getElementById("productDetailsContent");

const closeDetails =
    document.getElementById("closeDetails");

const authGate =
    document.getElementById("authGate");


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let products = [];

let cart = [];


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */


/* Safely insert text into HTML */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* Product image URL */

function getImageUrl(image) {

    if (!image) {
        return "";
    }

    const imageValue = String(image);

    if (
        imageValue.startsWith("http://") ||
        imageValue.startsWith("https://")
    ) {
        return imageValue;
    }

    if (imageValue.startsWith("/")) {
        return API_BASE_URL + imageValue;
    }

    if (imageValue.startsWith("uploads/")) {
        return API_BASE_URL + "/" + imageValue;
    }

    return imageValue;
}


/* Scroll to section */

function scrollToSection(id) {

    const section =
        document.getElementById(id);

    if (!section) {
        return;
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* Toast */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.style.opacity = "1";

    toast.style.transform =
        "translateX(-50%) translateY(-5px)";

    clearTimeout(showToast.timeout);

    showToast.timeout =
        setTimeout(function () {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateX(-50%)";

        }, 2500);
}


/* =========================================================
   SELLER AVATAR / BITMOJI
   ========================================================= */

    function getSellerEmoji(category) {

    const value =
        String(category || "")
            .trim()
            .toLowerCase();

    if (
        value === "food" ||
        value.includes("food") ||
        value.includes("kitchen") ||
        value.includes("snack") ||
        value.includes("baking") ||
        value.includes("cooking") ||
        value.includes("bakery")
    ) {
        return "👨🏻‍🍳";
    }

    if (
        value === "handmade crafts" ||
        value.includes("craft") ||
        value.includes("pottery") ||
        value.includes("handmade")
    ) {
        return "👩🏻‍🎨";
    }

    if (
        value === "jewellery" ||
        value === "jewelry" ||
        value.includes("jewellery") ||
        value.includes("jewelry")
    ) {
        return "👩🏻‍💻";
    }

    if (value.includes("fashion")) {
        return "👗";
    }

    if (
        value === "art" ||
        value.includes("painting") ||
        value.includes("drawing")
    ) {
        return "🎨";
    }

    if (value.includes("gift")) {
        return "🎁";
    }

    if (value.includes("decor")) {
        return "🪴";
    }

    return "🧑🏻‍🎨";
}


/* =========================================================
   PRODUCTS
   ========================================================= */


/* Create a product card */

function createProductCard(
    product,
    container
) {

    const productCard =
        document.createElement("div");

    productCard.classList.add(
        "product-card"
    );


    const imageUrl =
        getImageUrl(product.image);


    const imageContent = imageUrl
        ? `
            <img
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(product.name)}"
            >
        `
        : `
            <span style="font-size:70px;">
                🛍️
            </span>
        `;


    productCard.innerHTML = `

        <div class="product-image">
            ${imageContent}
        </div>

        <div class="product-info">

            <p class="product-category">
                ${escapeHtml(product.category)}
            </p>

            <h3>
                ${escapeHtml(product.name)}
            </h3>

            <p class="seller">
                By ${escapeHtml(product.seller)}
            </p>

            <div class="product-bottom">

                <strong>
                    ₹${Number(product.price || 0)
                        .toLocaleString("en-IN")}
                </strong>

                <button
                    class="add-to-cart"
                    data-name="${escapeHtml(product.name)}"
                    type="button"
                >
                    Add to Cart
                </button>

                <button
                    class="view-details"
                    data-name="${escapeHtml(product.name)}"
                    type="button"
                >
                    View Details
                </button>

            </div>

        </div>
    `;


    container.appendChild(
        productCard
    );
}


/* Display products */

function displayProducts(
    productList,
    showAllButton = false
) {

    if (!productsContainer) {
        return;
    }


    productsContainer.innerHTML = "";


    if (
        !productList ||
        productList.length === 0
    ) {

        productsContainer.innerHTML = `
            <p class="no-results">
                No products found.
            </p>
        `;

        if (showAllProductsButton) {

            showAllProductsButton.style.display =
                "none";

        }

        return;
    }


    productList.forEach(
        function (product) {

            createProductCard(
                product,
                productsContainer
            );

        }
    );


    if (showAllProductsButton) {

        showAllProductsButton.style.display =
            showAllButton
                ? "block"
                : "none";

    }
}


/* Load products from MongoDB */

async function loadProducts() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                `Products API returned ${response.status}`
            );

        }


        products =
            await response.json();


        console.log(
            "Products received from backend:",
            products
        );


        /* Show first 3 products */

        displayProducts(
            products.slice(0, 3),
            true
        );


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        if (productsContainer) {

            productsContainer.innerHTML = `
                <p class="no-results">
                    Unable to load products right now.
                </p>
            `;

        }

    }
}


/* Show all products */

if (showAllProductsButton) {

    showAllProductsButton.addEventListener(
        "click",
        function () {

            displayProducts(
                products,
                false
            );


            if (productsContainer) {

                productsContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function performSearch() {

    const searchInput =
        document.getElementById("searchInput");

    const productsContainer =
        document.getElementById("productsContainer");

    const showAllProductsButton =
        document.getElementById("showAllProducts");

    if (!searchInput || !productsContainer) {
        console.error("Search elements not found.");
        return;
    }

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    /* Empty search */
    if (searchText === "") {

        displayProducts(
            products.slice(0, 3),
            true
        );

        return;
    }


    /* Related words */

    const relatedWords = {
        pot: [
            "pots",
            "pottery",
            "vase",
            "clay",
            "ceramic",
            "terracotta",
            "craft",
            "handmade",
            "decor",
            "home decor"
        ],

        pots: [
            "pot",
            "pottery",
            "vase",
            "clay",
            "ceramic",
            "terracotta",
            "craft",
            "handmade",
            "decor",
            "home decor"
        ],

        pottery: [
            "pot",
            "clay",
            "ceramic",
            "vase",
            "craft"
        ],

        vase: [
            "pot",
            "pottery",
            "clay",
            "ceramic",
            "decor",
            "decoration"
        ],

        jewellery: [
            "jewelry",
            "necklace",
            "accessory",
            "ornament"
        ],

        jewelry: [
            "jewellery",
            "necklace",
            "accessory",
            "ornament"
        ],

        necklace: [
            "jewellery",
            "jewelry",
            "accessory"
        ],

        art: [
            "painting",
            "artwork",
            "drawing",
            "canvas"
        ],

        painting: [
            "art",
            "artwork",
            "drawing",
            "canvas"
        ],

        artwork: [
            "art",
            "painting",
            "drawing",
            "canvas"
        ],

        fashion: [
            "dress",
            "clothing",
            "outfit",
            "wear"
        ],

        dress: [
            "fashion",
            "clothing",
            "outfit",
            "wear",
            "traditional"
        ],

        food: [
            "snack",
            "snacks",
            "homemade",
            "cooking",
            "baking",
            "bakery"
        ],

        snack: [
            "food",
            "homemade",
            "cooking",
            "baking"
        ],

        homemade: [
            "food",
            "snack",
            "cooking"
        ],

        gift: [
            "present",
            "custom",
            "customized"
        ],

        handmade: [
            "craft",
            "crafts",
            "pottery",
            "handicraft",
            "pots",
            "pot",
            "vase"
        ],

        craft: [
            "handmade",
            "pottery",
            "handicraft"
        ]

    };


    /* Create search terms */

    const searchWords =
        searchText
            .split(/\s+/)
            .filter(Boolean);


    const searchTerms = new Set(
        searchWords
    );


    searchWords.forEach(
        function (word) {

            if (relatedWords[word]) {

                relatedWords[word].forEach(
                    function (relatedWord) {

                        searchTerms.add(
                            relatedWord
                        );

                    }
                );

            }

        }
    );


    /* Find matching products */

    const results =
        products.filter(
            function (product) {

                const searchableText = [

                    product.name,
                    product.category,
                    product.seller,
                    product.description

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return Array.from(
                    searchTerms
                ).some(
                    function (term) {

                        return searchableText.includes(
                            term
                        );

                    }
                );

            }
        );


    /* Display results */

    displayProducts(
        results,
        false
    );


    if (showAllProductsButton) {
        showAllProductsButton.style.display =
            "none";
    }


    productsContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* Search button */

const searchButtonElement =
    document.getElementById("searchButton");


if (searchButtonElement) {

    searchButtonElement.addEventListener(
        "click",
        function () {

            console.log("Search button clicked");

            performSearch();

        }
    );

}


/* Press Enter */

const searchInputElement =
    document.getElementById("searchInput");


if (searchInputElement) {

    searchInputElement.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );


categoryCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                const category =
                    card.getAttribute(
                        "data-category"
                    );


                const results =
                    products.filter(
                        function (product) {

                            return (
                                String(
                                    product.category || ""
                                )
                                    .toLowerCase() ===

                                String(
                                    category || ""
                                )
                                    .toLowerCase()
                            );

                        }
                    );


                displayProducts(
                    results,
                    false
                );


                scrollToSection(
                    "exploreSection"
                );

            }
        );

    }
);


/* =========================================================
   CART
   ========================================================= */


/* Load saved cart */

function loadCart() {

    const savedCart =
        localStorage.getItem(
            "hunarhubCart"
        );


    if (!savedCart) {
        return;
    }


    try {

        const parsedCart =
            JSON.parse(savedCart);


        if (Array.isArray(parsedCart)) {

            cart = parsedCart;

        }

    } catch (error) {

        console.error(
            "Could not load saved cart:",
            error
        );

        cart = [];

    }
}


/* Save cart */

function saveCart() {

    localStorage.setItem(
        "hunarhubCart",
        JSON.stringify(cart)
    );

}


/* Update cart count */

function updateCartCount() {

    let totalItems = 0;


    cart.forEach(
        function (item) {

            totalItems += Number(
                item.quantity || 0
            );

        }
    );


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }
}


/* Show cart */

function showCart() {

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    /* Empty cart */

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p>
                Your cart is empty.
            </p>
        `;


        updateCartCount();

        saveCart();

        return;
    }


    let total = 0;


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;


            total += itemTotal;


            const cartItem =
                document.createElement("div");


            cartItem.classList.add(
                "cart-item"
            );


            cartItem.innerHTML = `

                <p>
                    ${escapeHtml(item.name)}
                    - ₹${price.toLocaleString("en-IN")}
                </p>

                <div class="cart-controls">

                    <button
                        class="decrease"
                        data-name="${escapeHtml(item.name)}"
                        type="button"
                    >
                        -
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        class="increase"
                        data-name="${escapeHtml(item.name)}"
                        type="button"
                    >
                        +
                    </button>

                    <button
                        class="remove-item"
                        data-name="${escapeHtml(item.name)}"
                        type="button"
                    >
                        Remove
                    </button>

                </div>
            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    /* Total */

    const totalAmount =
        document.createElement("h3");


    totalAmount.textContent =
        `Total: ₹${total.toLocaleString("en-IN")}`;


    cartItems.appendChild(
        totalAmount
    );


    /* Checkout */

    const checkoutButton =
        document.createElement("button");


    checkoutButton.textContent =
        "Proceed to Checkout";


    checkoutButton.classList.add(
        "checkout-button"
    );


    checkoutButton.type = "button";


    cartItems.appendChild(
        checkoutButton
    );


    updateCartCount();

    saveCart();

}


/* Cart link */

if (cartLink) {

    cartLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showCart();

            scrollToSection(
                "cartSection"
            );

        }
    );

}


/* =========================================================
   CART EVENT HANDLING
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {


        /* Add to cart */

        const addButton =
            event.target.closest(
                ".add-to-cart"
            );


        if (addButton) {

            const productName =
                addButton.getAttribute(
                    "data-name"
                );


            const product =
                products.find(
                    function (item) {

                        return (
                            item.name ===
                            productName
                        );

                    }
                );


            if (!product) {

                console.error(
                    "Product not found:",
                    productName
                );

                return;
            }


            const existingProduct =
                cart.find(
                    function (item) {

                        return (
                            item.name ===
                            product.name
                        );

                    }
                );


            if (existingProduct) {

                existingProduct.quantity += 1;

            } else {

                cart.push({

                    ...product,

                    quantity: 1

                });

            }


            showCart();

            scrollToSection(
                "cartSection"
            );


            showToast(
                "Product added to cart."
            );


            return;
        }


        /* Increase */

        const increaseButton =
            event.target.closest(
                ".increase"
            );


        if (increaseButton) {

            const productName =
                increaseButton.getAttribute(
                    "data-name"
                );


            const product =
                cart.find(
                    function (item) {

                        return (
                            item.name ===
                            productName
                        );

                    }
                );


            if (product) {

                product.quantity += 1;

                showCart();

            }

            return;
        }


        /* Decrease */

        const decreaseButton =
            event.target.closest(
                ".decrease"
            );


        if (decreaseButton) {

            const productName =
                decreaseButton.getAttribute(
                    "data-name"
                );


            const product =
                cart.find(
                    function (item) {

                        return (
                            item.name ===
                            productName
                        );

                    }
                );


            if (product) {

                if (product.quantity > 1) {

                    product.quantity -= 1;

                }

                showCart();

            }

            return;
        }


        /* Remove */

        const removeButton =
            event.target.closest(
                ".remove-item"
            );


        if (removeButton) {

            const productName =
                removeButton.getAttribute(
                    "data-name"
                );


            cart =
                cart.filter(
                    function (item) {

                        return (
                            item.name !==
                            productName
                        );

                    }
                );


            showCart();

            return;
        }

    }
);


/* =========================================================
   CHECKOUT
   ========================================================= */

function showCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    if (
        !checkoutItems ||
        !checkoutTotal
    ) {
        return;
    }


    checkoutItems.innerHTML = "";


    let total = 0;


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;


            total += itemTotal;


            const itemElement =
                document.createElement("p");


            itemElement.textContent =
                `${item.name} x ${quantity} - ₹${itemTotal.toLocaleString("en-IN")}`;


            checkoutItems.appendChild(
                itemElement
            );

        }
    );


    checkoutTotal.textContent =
        `Total: ₹${total.toLocaleString("en-IN")}`;

}


/* Checkout button */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".checkout-button"
            );


        if (!button) {
            return;
        }


        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }


        showCheckout();


        if (checkoutSection) {

            checkoutSection.style.display =
                "block";


            checkoutSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }
);


/* Place order */

const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );


if (placeOrderButton) {

    placeOrderButton.addEventListener(
        "click",
        function () {

            const name =
                document
                    .getElementById(
                        "checkoutName"
                    )
                    .value
                    .trim();


            const address =
                document
                    .getElementById(
                        "checkoutAddress"
                    )
                    .value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "checkoutPhone"
                    )
                    .value
                    .trim();


            const payment =
                document
                    .getElementById(
                        "paymentMethod"
                    )
                    .value;


            if (
                name === "" ||
                address === "" ||
                phone === "" ||
                payment === ""
            ) {

                alert(
                    "Please fill in all checkout details."
                );

                return;
            }


            alert(
                "✅ Order placed successfully! Thank you for shopping with HunarHub."
            );


            /* Clear cart */

            cart = [];


            localStorage.removeItem(
                "hunarhubCart"
            );


            updateCartCount();

            showCart();


            /* Clear checkout form */

            document.getElementById(
                "checkoutName"
            ).value = "";

            document.getElementById(
                "checkoutAddress"
            ).value = "";

            document.getElementById(
                "checkoutPhone"
            ).value = "";

            document.getElementById(
                "paymentMethod"
            ).value = "";


            /* Hide checkout */

            if (checkoutSection) {

                checkoutSection.style.display =
                    "none";

            }


            scrollToSection(
                "cartSection"
            );

        }
    );

}


/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".view-details"
            );


        if (!button) {
            return;
        }


        const productName =
            button.getAttribute(
                "data-name"
            );


        const product =
            products.find(
                function (item) {

                    return (
                        item.name ===
                        productName
                    );

                }
            );


        if (!product) {

            alert(
                "Product details could not be found."
            );

            return;
        }


        const imageUrl =
            getImageUrl(product.image);


        const imageContent =
            imageUrl

                ? `
                    <img
                        src="${escapeHtml(imageUrl)}"
                        alt="${escapeHtml(product.name)}"
                    >
                `

                : `
                    <span style="font-size:70px;">
                        🛍️
                    </span>
                `;


        productDetailsContent.innerHTML = `

            <div class="product-image">
                ${imageContent}
            </div>

            <h2>
                ${escapeHtml(product.name)}
            </h2>

            <p>
                <strong>Category:</strong>
                ${escapeHtml(product.category)}
            </p>

            <p>
                <strong>Seller:</strong>
                ${escapeHtml(product.seller)}
            </p>

            <p>
                <strong>Price:</strong>
                ₹${Number(product.price || 0)
                    .toLocaleString("en-IN")}
            </p>

            <p>
                ${escapeHtml(
                    product.description ||
                    "No description available."
                )}
            </p>

            <button
                class="add-to-cart details-add-cart"
                data-name="${escapeHtml(product.name)}"
                type="button"
            >
                Add to Cart
            </button>

        `;


        if (productDetailsSection) {

            productDetailsSection.style.display =
                "block";


            productDetailsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }
);


/* Close product details */

if (closeDetails) {

    closeDetails.addEventListener(
        "click",
        function () {

            if (productDetailsSection) {

                productDetailsSection.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   DEFAULT SELLER INFORMATION
   ========================================================= */

const defaultSellerInfo = {

    "Priya Crafts": {

        skill: "Handmade Crafts",

        description:
            "Priya creates beautiful handmade crafts using traditional techniques.",

        contact: "",

        emoji: "👩🏻‍🎨",

        rating: "4.8"

    },


    "Rahul's Kitchen": {

        skill: "Homemade Food",

        description:
            "Rahul prepares delicious homemade snacks and traditional food products.",

        contact: "",

        emoji: "👨🏻‍🍳",

        rating: "4.7"

    },


    "Aisha Designs": {

        skill: "Custom Designs",

        description:
            "Aisha creates unique handmade jewellery and customized designs.",

        contact: "",

        emoji: "👩🏻‍💻",

        rating: "4.9"

    }

};


/* =========================================================
   SELLER PROFILE
   ========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".view-profile"
            );


        if (!button) {
            return;
        }


        const sellerName =
            button.getAttribute(
                "data-seller"
            );


        let sellerInfo =
            defaultSellerInfo[sellerName];


        /* Find database seller */

        if (!sellerInfo) {

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/sellers`
                    );


                if (!response.ok) {

                    throw new Error(
                        `Sellers API returned ${response.status}`
                    );

                }


                const sellers =
                    await response.json();


                sellerInfo =
                    sellers.find(
                        function (seller) {

                            return (

                                String(
                                    seller.businessName || ""
                                )
                                    .trim()
                                    .toLowerCase()

                                ===

                                String(
                                    sellerName || ""
                                )
                                    .trim()
                                    .toLowerCase()

                            );

                        }
                    );


            } catch (error) {

                console.error(
                    "Could not load seller information:",
                    error
                );

            }

        }


        if (!sellerInfo) {

            alert(
                "Seller information not found."
            );

            return;
        }


        const skill =
            sellerInfo.skill ||
            sellerInfo.sellerSkill ||
            "Local Creator";


        const description =
            sellerInfo.description ||
            sellerInfo.businessDescription ||
            "Local entrepreneur on HunarHub.";


        const contact =
            sellerInfo.contact ||
            sellerInfo.sellerContact ||
            "";


        /* Generate avatar from current skill */

        let emoji;

/* Original sellers keep their fixed avatars */

if (defaultSellerInfo[sellerName]) {

    emoji =
        defaultSellerInfo[sellerName].emoji;

} else {

    /* New seller → find their product category */

    try {

        const productResponse =
            await fetch(
                `${API_BASE_URL}/api/products`
            );

        if (productResponse.ok) {

            const allProducts =
                await productResponse.json();

            const sellerProduct =
                allProducts.find(function (product) {

                    return (
                        String(
                            product.seller || ""
                        )
                            .trim()
                            .toLowerCase()
                        ===
                        String(
                            sellerName || ""
                        )
                            .trim()
                            .toLowerCase()
                    );

                });


            const category =
                sellerInfo.sellerCategory ||
                (sellerProduct
                    ? sellerProduct.category
                    : "") ||
                skill;


            emoji =
                getSellerEmoji(category);

        } else {

            emoji =
                getSellerEmoji(skill);

        }

    } catch (error) {

        console.error(
            "Could not determine seller avatar:",
            error
        );

        emoji =
            getSellerEmoji(skill);

    }

}


        const rating =
            sellerInfo.rating ||
            "5.0";


        profileContent.innerHTML = `

            <div class="profile-image">
                ${emoji}
            </div>

            <h2>
                ${escapeHtml(sellerName)}
            </h2>

            <p>
                <strong>
                    Speciality:
                </strong>

                ${escapeHtml(skill)}
            </p>

            <p>
                ${escapeHtml(description)}
            </p>

            ${
                contact
                    ? `
                        <p>
                            📞
                            ${escapeHtml(contact)}
                        </p>
                    `
                    : ""
            }

            <p>
                ⭐
                ${escapeHtml(rating)}
                Rating
            </p>

            <button
                class="view-seller-products"
                data-seller="${escapeHtml(sellerName)}"
                type="button"
            >
                🛍️ View Products
            </button>

        `;


        if (profileSection) {

            profileSection.style.display =
                "block";


            profileSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }
);


/* Close profile */

if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        function () {

            if (profileSection) {

                profileSection.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   VIEW SELLER PRODUCTS
   ========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".view-seller-products"
            );


        if (!button) {
            return;
        }


        const sellerName =
            button.getAttribute(
                "data-seller"
            );


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/products`
                );


            if (!response.ok) {

                throw new Error(
                    `Products API returned ${response.status}`
                );

            }


            const allProducts =
                await response.json();


            const sellerProducts =
                allProducts.filter(
                    function (product) {

                        const productSeller =
                            String(
                                product.seller || ""
                            )
                                .trim()
                                .toLowerCase();


                        const selectedSeller =
                            String(
                                sellerName || ""
                            )
                                .trim()
                                .toLowerCase();


                        return (
                            productSeller ===
                            selectedSeller
                        );

                    }
                );


            if (profileSection) {

                profileSection.style.display =
                    "none";

            }


            if (sellerProducts.length === 0) {

                productsContainer.innerHTML = `

                    <p class="no-results">
                        No products listed by
                        ${escapeHtml(sellerName)}
                        yet.
                    </p>

                `;

            } else {

                displayProducts(
                    sellerProducts,
                    false
                );

            }


            scrollToSection(
                "exploreSection"
            );


        } catch (error) {

            console.error(
                "VIEW SELLER PRODUCTS ERROR:",
                error
            );


            alert(
                "Could not load seller's products."
            );

        }

    }
);


/* =========================================================
   SELLER REGISTRATION
   ========================================================= */

const sellerButton =
    document.getElementById(
        "sellerButton"
    );


if (sellerButton) {

    sellerButton.addEventListener(
        "click",
        function () {

            scrollToSection(
                "sellerFormSection"
            );

        }
    );

}


const sellerSubmitButton =
    document.getElementById(
        "sellerSubmitButton"
    );


if (sellerSubmitButton) {

    sellerSubmitButton.addEventListener(
        "click",
        async function () {


            /* =================================================
               READ SELLER DETAILS
               ================================================= */

            const businessName =
                document
                    .getElementById(
                        "businessName"
                    )
                    .value
                    .trim();


            const sellerSkill =
                document
                    .getElementById(
                        "sellerSkill"
                    )
                    .value
                    .trim();


            const businessDescription =
                document
                    .getElementById(
                        "businessDescription"
                    )
                    .value
                    .trim();


            const sellerContact =
                document
                    .getElementById(
                        "sellerContact"
                    )
                    .value
                    .trim();


            /* =================================================
               READ PRODUCT DETAILS
               ================================================= */

            const productName =
                document
                    .getElementById(
                        "productName"
                    )
                    .value
                    .trim();


            const productPrice =
                document
                    .getElementById(
                        "productPrice"
                    )
                    .value
                    .trim();


            const productCategory =
                document
                    .getElementById(
                        "productCategory"
                    )
                    .value;


            const productDescription =
                document
                    .getElementById(
                        "productDescription"
                    )
                    .value
                    .trim();


            const productImage =
                document
                    .getElementById(
                        "productImage"
                    )
                    .files[0];


            /* =================================================
               VALIDATION
               ================================================= */

            if (
                businessName === "" ||
                sellerSkill === "" ||
                businessDescription === "" ||
                sellerContact === "" ||
                productName === "" ||
                productPrice === "" ||
                productCategory === "" ||
                productDescription === ""
            ) {

                alert(
                    "Please fill in all seller and product details."
                );

                return;
            }


            if (!productImage) {

                alert(
                    "Please select a product image."
                );

                return;
            }


            if (
                Number(productPrice) <= 0
            ) {

                alert(
                    "Please enter a valid product price."
                );

                return;
            }


            try {

                /* =================================================
                   SAVE SELLER
                   ================================================= */

                const sellerResponse =
                    await fetch(
                        `${API_BASE_URL}/api/sellers`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                businessName:
                                    businessName,

                                sellerSkill:
                                    sellerSkill,

                                businessDescription:
                                    businessDescription,

                                sellerContact:
                                    sellerContact,

                                rating:
                                    "5.0"

                            })

                        }
                    );


                const sellerResult =
                    await sellerResponse.json();


                if (!sellerResponse.ok) {

                    throw new Error(
                        sellerResult.error ||
                        "Failed to register seller"
                    );

                }


                /* =================================================
                   SAVE PRODUCT + IMAGE
                   ================================================= */

                const productFormData =
                    new FormData();


                productFormData.append(
                    "name",
                    productName
                );


                productFormData.append(
                    "category",
                    productCategory
                );


                productFormData.append(
                    "price",
                    productPrice
                );


                productFormData.append(
                    "description",
                    productDescription
                );


                productFormData.append(
                    "seller",
                    businessName
                );


                productFormData.append(
                    "image",
                    productImage
                );


                const productResponse =
                    await fetch(
                        `${API_BASE_URL}/api/products`,
                        {
                            method: "POST",

                            body:
                                productFormData
                        }
                    );


                const productResult =
                    await productResponse.json();


                if (!productResponse.ok) {

                    throw new Error(
                        productResult.error ||
                        "Failed to add product"
                    );

                }


                /* =================================================
                   SUCCESS
                   ================================================= */

                alert(
                    "✅ Seller registered and product added successfully!"
                );


                console.log(
                    "Seller:",
                    sellerResult
                );


                console.log(
                    "Product:",
                    productResult
                );


                /* =================================================
                   CLEAR FORM
                   ================================================= */

                document.getElementById(
                    "businessName"
                ).value = "";


                document.getElementById(
                    "sellerSkill"
                ).value = "";


                document.getElementById(
                    "businessDescription"
                ).value = "";


                document.getElementById(
                    "sellerContact"
                ).value = "";


                document.getElementById(
                    "productName"
                ).value = "";


                document.getElementById(
                    "productPrice"
                ).value = "";


                document.getElementById(
                    "productCategory"
                ).value = "";


                document.getElementById(
                    "productDescription"
                ).value = "";


                document.getElementById(
                    "productImage"
                ).value = "";


                /* =================================================
                   REFRESH SELLERS AND PRODUCTS
                   ================================================= */

                await loadSellers();

                await loadProducts();


                scrollToSection(
                    "entrepreneursContainer"
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                alert(
                    "❌ Registration failed:\n\n" +
                    error.message
                );

            }

        }
    );

}


/* =========================================================
   SELLER LIST
   ========================================================= */

async function loadSellers() {

    const entrepreneursContainer =
        document.getElementById("entrepreneursContainer");

    if (!entrepreneursContainer) {
        return;
    }

    const defaultSellers = [
        {
            businessName: "Priya Crafts",
            sellerSkill: "Handmade Crafts",
            businessDescription:
                "Priya creates beautiful handmade crafts using traditional techniques.",
            sellerContact: "",
            rating: "4.8"
        },

        {
            businessName: "Rahul's Kitchen",
            sellerSkill: "Homemade Food",
            businessDescription:
                "Rahul prepares delicious homemade snacks and traditional food products.",
            sellerContact: "",
            rating: "4.7"
        },

        {
            businessName: "Aisha Designs",
            sellerSkill: "Custom Designs",
            businessDescription:
                "Aisha creates unique handmade jewellery and customized designs.",
            sellerContact: "",
            rating: "4.9"
        }
    ];

    let databaseSellers = [];
    let allProducts = [];

    try {

        const sellerResponse =
            await fetch(`${API_BASE_URL}/api/sellers`);

        if (sellerResponse.ok) {
            databaseSellers =
                await sellerResponse.json();
        }

    } catch (error) {

        console.error(
            "Error loading sellers:",
            error
        );

    }

    try {

        const productResponse =
            await fetch(`${API_BASE_URL}/api/products`);

        if (productResponse.ok) {
            allProducts =
                await productResponse.json();
        }

    } catch (error) {

        console.error(
            "Error loading products for seller avatars:",
            error
        );

    }


    const allSellers = [
        ...defaultSellers,
        ...databaseSellers
    ];


    const uniqueSellers = [];
    const sellerNames = new Set();


    allSellers.forEach(function (seller) {

        const sellerName =
            String(
                seller.businessName || ""
            ).trim();

        if (!sellerName) {
            return;
        }

        const normalizedName =
            sellerName.toLowerCase();

        if (sellerNames.has(normalizedName)) {
            return;
        }

        sellerNames.add(normalizedName);
        uniqueSellers.push(seller);

    });


    entrepreneursContainer.innerHTML = "";


    uniqueSellers.forEach(function (seller) {

        const sellerName =
            String(
                seller.businessName || ""
            ).trim();


        /*
         * Find this seller's product.
         * This also works for old sellers whose
         * MongoDB record does not contain sellerCategory.
         */

        const sellerProduct =
            allProducts.find(function (product) {

                return (
                    String(
                        product.seller || ""
                    ).trim().toLowerCase()

                    ===

                    sellerName.toLowerCase()
                );

            });


        let emoji;

/* Keep original HunarHub seller avatars */

if (defaultSellerInfo[seller.businessName]) {

    emoji =
        defaultSellerInfo[seller.businessName].emoji;

} else {

    /* New seller → use their product category */

    const category =
        seller.sellerCategory ||
        (sellerProduct
            ? sellerProduct.category
            : "") ||
        seller.sellerSkill;

    emoji =
        getSellerEmoji(category);
}


        const card =
            document.createElement("div");

        card.classList.add(
            "entrepreneur-card"
        );


        card.innerHTML = `

            <div class="profile-image">
                ${emoji}
            </div>

            <h3>
                ${escapeHtml(sellerName)}
            </h3>

            <p>
                ${escapeHtml(
                    seller.sellerSkill ||
                    category ||
                    "Local Creator"
                )}
            </p>

            <div class="rating">
                ⭐
                ${escapeHtml(
                    seller.rating || "5.0"
                )}
            </div>

            <button
                class="view-profile"
                data-seller="${escapeHtml(sellerName)}"
                type="button"
            >
                View Profile
            </button>

        `;


        entrepreneursContainer.appendChild(
            card
        );

    });

}

/* =========================================================
   NAVIGATION
   ========================================================= */


/* Header Home */

const headerHomeLink =
    document.getElementById(
        "headerHomeLink"
    );


if (headerHomeLink) {

    headerHomeLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* Footer Home */

const homeLink =
    document.getElementById(
        "homeLink"
    );


if (homeLink) {

    homeLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* Footer Explore */

const footerExploreLink =
    document.getElementById(
        "footerExploreLink"
    );


if (footerExploreLink) {

    footerExploreLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            scrollToSection(
                "exploreSection"
            );

        }
    );

}


/* Footer About */

const footerAboutLink =
    document.getElementById(
        "footerAboutLink"
    );


if (footerAboutLink) {

    footerAboutLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            scrollToSection(
                "aboutSection"
            );

        }
    );

}


/* Footer Contact */

const footerContactLink =
    document.getElementById(
        "footerContactLink"
    );


if (footerContactLink) {

    footerContactLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            scrollToSection(
                "contactSection"
            );

        }
    );

}


/* =========================================================
   AUTHENTICATION
   ========================================================= */

const loginButton =
    document.getElementById(
        "loginButton"
    );

const signupButton =
    document.getElementById(
        "signupButton"
    );

const showSignupButton =
    document.getElementById(
        "showSignupButton"
    );

const showLoginButton =
    document.getElementById(
        "showLoginButton"
    );

const loginButtonNav =
    document.getElementById(
        "loginButtonNav"
    );

const signupButtonNav =
    document.getElementById(
        "signupButtonNav"
    );

const loginLink =
    document.getElementById(
        "loginLink"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   USER STORAGE
   ========================================================= */

function getUsers() {

    const savedUsers =
        localStorage.getItem(
            "hunarhubUsers"
        );


    if (!savedUsers) {
        return [];
    }


    try {

        const users =
            JSON.parse(savedUsers);


        return Array.isArray(users)
            ? users
            : [];


    } catch (error) {

        console.error(
            "Could not read users:",
            error
        );


        return [];

    }

}


function saveUsers(users) {

    localStorage.setItem(
        "hunarhubUsers",
        JSON.stringify(users)
    );

}


/* =========================================================
   AUTH SCREEN NAVIGATION
   ========================================================= */

function showLoginScreen() {

    if (!authGate) {
        return;
    }


    authGate.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showSignupScreen() {

    if (!authGate) {
        return;
    }


    const signupSection =
        document.getElementById(
            "signupSection"
        );


    if (!signupSection) {
        return;
    }


    authGate.scrollTo({
        top:
            signupSection.offsetTop,
        behavior: "smooth"
    });

}


/* =========================================================
   UPDATE AUTH NAVBAR
   ========================================================= */

function updateAuthNavbar() {

    const loggedIn =
        sessionStorage.getItem(
            "hunarhubLoggedIn"
        ) === "true";


    /* Hide navbar login/signup
       because auth gate handles them */

    if (loginButtonNav) {

        loginButtonNav.style.display =
            "none";

    }


    if (signupButtonNav) {

        signupButtonNav.style.display =
            "none";

    }


    if (loginLink) {

        loginLink.style.display =
            "none";

    }


    /* Show logout only after login */

    if (logoutButton) {

        logoutButton.style.display =
            loggedIn
                ? "inline-flex"
                : "none";

    }

}


/* =========================================================
   UNLOCK WEBSITE
   ========================================================= */

function unlockWebsite() {

    document.body.classList.remove(
        "auth-locked"
    );


    document.body.classList.add(
        "auth-unlocked"
    );


    sessionStorage.setItem(
        "hunarhubLoggedIn",
        "true"
    );


    if (authGate) {

        authGate.style.display =
            "none";

    }


    const siteContent =
        document.getElementById(
            "siteContent"
        );


    if (siteContent) {

        siteContent.style.display =
            "block";

    }


    updateAuthNavbar();


    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });

}


/* =========================================================
   LOCK WEBSITE
   ========================================================= */

function lockWebsite() {

    document.body.classList.remove(
        "auth-unlocked"
    );


    document.body.classList.add(
        "auth-locked"
    );


    if (authGate) {

        authGate.style.display =
            "block";

    }


    const siteContent =
        document.getElementById(
            "siteContent"
        );


    if (siteContent) {

        siteContent.style.display =
            "none";

    }


    updateAuthNavbar();

    showLoginScreen();

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        function () {

            const emailInput =
                document.getElementById(
                    "loginEmail"
                );

            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {
                return;
            }


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            if (
                email === "" ||
                password === ""
            ) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            const users =
                getUsers();


            const foundUser =
                users.find(
                    function (user) {

                        return (

                            String(
                                user.email || ""
                            )
                                .trim()
                                .toLowerCase()

                            ===

                            email

                            &&

                            String(
                                user.password || ""
                            )

                            ===

                            password

                        );

                    }
                );


            if (!foundUser) {

                alert(
                    "❌ Email or password is incorrect."
                );

                return;

            }


            sessionStorage.setItem(
                "hunarhubUserName",
                foundUser.name
            );


            sessionStorage.setItem(
                "hunarhubUserRole",
                foundUser.role
            );


            unlockWebsite();


            showToast(
                "Login successful! Welcome back, " +
                foundUser.name +
                "."
            );

        }
    );

}


/* =========================================================
   SIGN UP
   ========================================================= */

if (signupButton) {

    signupButton.addEventListener(
        "click",
        function () {

            const nameInput =
                document.getElementById(
                    "signupName"
                );

            const emailInput =
                document.getElementById(
                    "signupEmail"
                );

            const passwordInput =
                document.getElementById(
                    "signupPassword"
                );

            const roleInput =
                document.getElementById(
                    "signupRole"
                );


            if (
                !nameInput ||
                !emailInput ||
                !passwordInput ||
                !roleInput
            ) {
                return;
            }


            const name =
                nameInput.value.trim();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            const role =
                roleInput.value;


            if (
                !name ||
                !email ||
                !password ||
                !role
            ) {

                alert(
                    "Please fill in all signup details."
                );

                return;

            }


            if (
                password.length < 6
            ) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;

            }


            const users =
                getUsers();


            const existingUser =
                users.find(
                    function (user) {

                        return (

                            String(
                                user.email || ""
                            )
                                .trim()
                                .toLowerCase()

                            ===

                            email

                        );

                    }
                );


            if (existingUser) {

                alert(
                    "An account with this email already exists."
                );

                return;

            }


            const newUser = {

                name:
                    name,

                email:
                    email,

                password:
                    password,

                role:
                    role

            };


            users.push(
                newUser
            );


            saveUsers(users);


            sessionStorage.setItem(
                "hunarhubUserName",
                name
            );


            sessionStorage.setItem(
                "hunarhubUserRole",
                role
            );


            /* Clear signup form */

            nameInput.value = "";

            emailInput.value = "";

            passwordInput.value = "";

            roleInput.value = "";


            unlockWebsite();


            showToast(
                "Account created successfully!"
            );

        }
    );

}


/* =========================================================
   AUTH SWITCH
   ========================================================= */

if (showSignupButton) {

    showSignupButton.addEventListener(
        "click",
        function () {

            showSignupScreen();

        }
    );

}


if (showLoginButton) {

    showLoginButton.addEventListener(
        "click",
        function () {

            showLoginScreen();

        }
    );

}


/* =========================================================
   NAV LOGIN / SIGNUP
   ========================================================= */

if (loginButtonNav) {

    loginButtonNav.addEventListener(
        "click",
        function () {

            lockWebsite();

        }
    );

}


if (signupButtonNav) {

    signupButtonNav.addEventListener(
        "click",
        function () {

            lockWebsite();


            setTimeout(
                function () {

                    showSignupScreen();

                },
                50
            );

        }
    );

}


if (loginLink) {

    loginLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            lockWebsite();

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "hunarhubLoggedIn"
            );


            sessionStorage.removeItem(
                "hunarhubUserName"
            );


            sessionStorage.removeItem(
                "hunarhubUserRole"
            );


            lockWebsite();


            showToast(
                "You have been logged out."
            );

        }
    );

}


/* =========================================================
   INITIAL AUTH CHECK
   ========================================================= */

function initializeAuthentication() {

    const loggedIn =
        sessionStorage.getItem(
            "hunarhubLoggedIn"
        ) === "true";


    if (loggedIn) {

        unlockWebsite();

    } else {

        lockWebsite();

    }

}


/* =========================================================
   INITIAL AUTHENTICATION
   ========================================================= */

function initializeAuthentication() {

    const loggedIn =
        sessionStorage.getItem("hunarhubLoggedIn") === "true";

    if (loggedIn) {
        unlockWebsite();
    } else {
        lockWebsite();
    }
}


/* =========================================================
   INITIAL AUTHENTICATION
   ========================================================= */

function initializeAuthentication() {

    const loggedIn =
        sessionStorage.getItem("hunarhubLoggedIn") === "true";

    if (loggedIn) {
        unlockWebsite();
    } else {
        lockWebsite();
    }
}
/* =========================================================
   INITIAL AUTHENTICATION
   ========================================================= */

function initializeAuthentication() {

    const loggedIn =
        sessionStorage.getItem("hunarhubLoggedIn") === "true";

    if (loggedIn) {
        unlockWebsite();
    } else {
        lockWebsite();
    }
}


/* =========================================================
   INITIAL AUTHENTICATION
   ========================================================= */

function initializeAuthentication() {

    const loggedIn =
        sessionStorage.getItem("hunarhubLoggedIn") === "true";

    if (loggedIn) {
        unlockWebsite();
    } else {
        lockWebsite();
    }
}
/* =========================================================
   INITIALIZATION
   ========================================================= */

loadCart();
updateCartCount();
showCart();
loadProducts();
loadSellers();
initializeAuthentication();