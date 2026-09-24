/* =========================================================
   HUNARHUB BACKEND SERVER
   ========================================================= */

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


/* =========================================================
   APP CONFIGURATION
   ========================================================= */

const app = express();

const PORT = process.env.PORT || 5000;

const PROJECT_ROOT =
    path.resolve(__dirname, "..");

const UPLOAD_FOLDER =
    path.join(__dirname, "uploads");


/* =========================================================
   MONGODB
   ========================================================= */

/*
 * Set your existing MongoDB connection string in the
 * MONGODB_URI environment variable.
 *
 * Do NOT put your database password directly into
 * server.js when submitting/publishing this project.
 */

const MONGODB_URI =
    process.env.MONGODB_URI;

if (!MONGODB_URI) {

    console.error(
        "❌ MONGODB_URI is not set."
    );

    console.error(
        "Set your MongoDB connection string before starting the server."
    );

    process.exit(1);
}


const client =
    new MongoClient(MONGODB_URI);


let db = null;

let productsCollection = null;


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
    cors()
);

app.use(
    express.json()
);


/*
 * Serve the main HunarHub website.
 * server.js is inside /backend, so the website
 * files are one folder above it.
 */

app.use(
    express.static(PROJECT_ROOT)
);


/*
 * Make uploaded product images available at:
 *
 * http://localhost:5000/uploads/filename.jpg
 */

app.use(
    "/uploads",
    express.static(UPLOAD_FOLDER)
);


/* =========================================================
   UPLOAD FOLDER
   ========================================================= */

if (!fs.existsSync(UPLOAD_FOLDER)) {

    fs.mkdirSync(
        UPLOAD_FOLDER,
        {
            recursive: true
        }
    );

}


/* =========================================================
   MULTER IMAGE UPLOAD
   ========================================================= */

const storage =
    multer.diskStorage({

        destination:
            function (req, file, cb) {

                cb(
                    null,
                    UPLOAD_FOLDER
                );

            },


        filename:
            function (req, file, cb) {

                const safeName =
                    file.originalname
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            "-"
                        );


                const uniqueName =
                    Date.now() +
                    "-" +
                    safeName;


                cb(
                    null,
                    uniqueName
                );

            }

    });


const upload =
    multer({

        storage: storage,

        limits: {
            fileSize:
                5 * 1024 * 1024
        },

        fileFilter:
            function (req, file, cb) {

                const allowedTypes = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ];


                if (
                    allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Only image files are allowed."
                        )
                    );

                }

            }

    });


/* =========================================================
   INITIAL PRODUCTS
   ========================================================= */

const products = [

    {
        id: 1,

        name:
            "Handmade Terracotta Vase",

        category:
            "Home Decor",

        seller:
            "Priya Crafts",

        price:
            799,

        image:
            "vase.jpg",

        description:
            "A beautiful handmade terracotta vase created by Priya Crafts."

    },


    {
        id: 2,

        name:
            "Handmade Necklace",

        category:
            "Jewellery",

        seller:
            "Aisha Designs",

        price:
            599,

        image:
            "necklace.jpg",

        description:
            "A unique handmade necklace designed by Aisha Designs."

    },


    {
        id: 3,

        name:
            "Hand Painted Artwork",

        category:
            "Art",

        seller:
            "Art With Riya",

        price:
            1299,

        image:
            "artwork.jpg",

        description:
            "Beautiful hand painted artwork created by Art With Riya."

    },


    {
        id: 4,

        name:
            "Traditional Handmade Dress",

        category:
            "Fashion",

        seller:
            "Meera Fashion",

        price:
            1499,

        image:
            "dress.jpg",

        description:
            "A traditional handmade dress created by Meera Fashion."

    },


    {
        id: 5,

        name:
            "Homemade Snacks",

        category:
            "Food",

        seller:
            "Rahul's Kitchen",

        price:
            399,

        image:
            "snacks.jpg",

        description:
            "Delicious homemade snacks prepared by Rahul's Kitchen."

    },


    {
        id: 6,

        name:
            "Customized Gift Box",

        category:
            "Custom Gifts",

        seller:
            "Gift Studio",

        price:
            699,

        image:
            "gift-box.jpg",

        description:
            "A personalized gift box prepared by Gift Studio."

    }

];


/* =========================================================
   HOME / HEALTH CHECK
   ========================================================= */

app.get(
    "/",
    function (req, res) {

        res.send(
            "HunarHub Backend is running!"
        );

    }
);


app.get(
    "/api/health",
    function (req, res) {

        res.json({

            success: true,

            message:
                "HunarHub API is working.",

            database:
                db
                    ? "connected"
                    : "not connected"

        });

    }
);


/* =========================================================
   GET ALL PRODUCTS
   ========================================================= */

app.get(
    "/api/products",
    async function (req, res) {

        try {

            const productsFromDB =
                await productsCollection
                    .find({})
                    .toArray();


            res.json(
                productsFromDB
            );


        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );


            res.status(500).json({

                error:
                    "Failed to fetch products."

            });

        }

    }
);


/* =========================================================
   GET PRODUCTS OF ONE SELLER
   ========================================================= */

app.get(
    "/api/products/seller/:sellerName",
    async function (req, res) {

        try {

            const sellerName =
                req.params.sellerName;


            const decodedSellerName =
                decodeURIComponent(
                    sellerName
                );


            const sellerProducts =
                await productsCollection
                    .find({
                        seller:
                            decodedSellerName
                    })
                    .toArray();


            res.json(
                sellerProducts
            );


        } catch (error) {

            console.error(
                "Error fetching seller products:",
                error
            );


            res.status(500).json({

                error:
                    "Failed to fetch seller products."

            });

        }

    }
);


/* =========================================================
   REGISTER SELLER
   ========================================================= */

app.post(
    "/api/sellers",
    async function (req, res) {

        try {

            const {
                businessName,
                sellerSkill,
                sellerCategory,
                businessDescription,
                sellerContact,
                rating
            } = req.body;


            if (
                !businessName ||
                !sellerSkill ||
                !businessDescription ||
                !sellerContact
            ) {

                return res.status(400).json({

                    error:
                        "Please fill in all seller details."

                });

            }


            const sellerData = {

                businessName:
                    businessName.trim(),

                sellerSkill:
                    sellerSkill.trim(),

                sellerCategory:
                    sellerCategory
                        ? sellerCategory.trim()
                        : "",

                businessDescription:
                    businessDescription.trim(),

                sellerContact:
                    sellerContact.trim(),

                rating:
                    rating || "5.0",

                createdAt:
                    new Date()

            };


            const result =
                await db
                    .collection("sellers")
                    .insertOne(
                        sellerData
                    );


            res.json({

                message:
                    "Seller registered successfully!",

                sellerId:
                    result.insertedId,

                seller:
                    sellerData

            });


        } catch (error) {

            console.error(
                "Error registering seller:",
                error
            );


            res.status(500).json({

                error:
                    "Failed to register seller."

            });

        }

    }
);


/* =========================================================
   GET ALL SELLERS
   ========================================================= */

app.get(
    "/api/sellers",
    async function (req, res) {

        try {

            const sellers =
                await db
                    .collection("sellers")
                    .find({})
                    .sort({
                        createdAt: 1
                    })
                    .toArray();


            res.json(
                sellers
            );


        } catch (error) {

            console.error(
                "Error fetching sellers:",
                error
            );


            res.status(500).json({

                error:
                    "Failed to fetch sellers."

            });

        }

    }
);


/* =========================================================
   ADD SELLER PRODUCT + IMAGE
   ========================================================= */

app.post(
    "/api/products",
    upload.single("image"),
    async function (req, res) {

        try {

            const {
                name,
                category,
                price,
                description,
                seller
            } = req.body;


            /* Validate text fields */

            if (
                !name ||
                !category ||
                !price ||
                !description ||
                !seller
            ) {

                return res.status(400).json({

                    error:
                        "Please fill in all product details."

                });

            }


            /* Validate image */

            if (!req.file) {

                return res.status(400).json({

                    error:
                        "Please upload a product image."

                });

            }


            const numericPrice =
                Number(price);


            if (
                Number.isNaN(
                    numericPrice
                ) ||
                numericPrice <= 0
            ) {

                return res.status(400).json({

                    error:
                        "Please enter a valid product price."

                });

            }


            const newProduct = {

                name:
                    name.trim(),

                category:
                    category.trim(),

                price:
                    numericPrice,

                description:
                    description.trim(),

                seller:
                    seller.trim(),

                image:
                    "/uploads/" +
                    req.file.filename,

                createdAt:
                    new Date()

            };


            const result =
                await productsCollection
                    .insertOne(
                        newProduct
                    );


            res.json({

                message:
                    "Product added successfully!",

                product: {

                    _id:
                        result.insertedId,

                    ...newProduct

                }

            });


        } catch (error) {

            console.error(
                "Error adding product:",
                error
            );


            /* Remove uploaded file if DB insert fails */

            if (
                req.file &&
                req.file.path &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (deleteError) {

                    console.error(
                        "Could not delete failed upload:",
                        deleteError
                    );

                }

            }


            res.status(500).json({

                error:
                    error.message ||
                    "Failed to add product."

            });

        }

    }
);


/* =========================================================
   SEED INITIAL PRODUCTS
   ========================================================= */

app.get(
    "/api/seed-products",
    async function (req, res) {

        try {

            const existingProducts =
                await productsCollection
                    .countDocuments();


            if (
                existingProducts > 0
            ) {

                return res.json({

                    message:
                        "Products already exist in MongoDB.",

                    count:
                        existingProducts

                });

            }


            const result =
                await productsCollection
                    .insertMany(
                        products
                    );


            res.json({

                message:
                    "Products inserted successfully!",

                insertedCount:
                    result.insertedCount

            });


        } catch (error) {

            console.error(
                "Error inserting products:",
                error
            );


            res.status(500).json({

                error:
                    "Failed to insert products."

            });

        }

    }
);


/* =========================================================
   MULTER / GENERAL ERROR HANDLER
   ========================================================= */

app.use(
    function (error, req, res, next) {

        console.error(
            "Server error:",
            error
        );


        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code === "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    error:
                        "Image must be smaller than 5 MB."

                });

            }


            return res.status(400).json({

                error:
                    error.message

            });

        }


        if (
            error &&
            error.message
        ) {

            return res.status(400).json({

                error:
                    error.message

            });

        }


        res.status(500).json({

            error:
                "Internal server error."

        });

    }
);


/* =========================================================
   START SERVER
   ========================================================= */

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await client.connect();


        db =
            client.db("HunarHub");


        productsCollection =
            db.collection("products");


        console.log(
            "✅ MongoDB connected successfully!"
        );


        app.listen(
            PORT,
            function () {

                console.log(
                    `✅ HunarHub server running on http://localhost:${PORT}`
                );

                console.log(
                    `✅ API products: http://localhost:${PORT}/api/products`
                );

                console.log(
                    `✅ API sellers: http://localhost:${PORT}/api/sellers`
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ Failed to start HunarHub server:",
            error
        );


        process.exit(1);

    }

}


startServer();