/* =========================================================
   HUNARHUB BACKEND SERVER
   MongoDB + Cloudinary + Express
   ========================================================= */

const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");


/* =========================================================
   APP CONFIGURATION
   ========================================================= */

const app = express();

const PORT =
    process.env.PORT || 5000;

const PROJECT_ROOT =
    path.resolve(__dirname, "..");


/* =========================================================
   ENVIRONMENT VARIABLES
   ========================================================= */

const MONGODB_URI =
    process.env.MONGODB_URI;

const CLOUDINARY_CLOUD_NAME =
    process.env.CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_API_KEY =
    process.env.CLOUDINARY_API_KEY;

const CLOUDINARY_API_SECRET =
    process.env.CLOUDINARY_API_SECRET;


if (!MONGODB_URI) {

    console.error(
        "❌ MONGODB_URI is not set."
    );

    console.error(
        "Set MONGODB_URI in your environment variables."
    );

    process.exit(1);
}


const cloudinaryConfigured =
    Boolean(
        CLOUDINARY_CLOUD_NAME &&
        CLOUDINARY_API_KEY &&
        CLOUDINARY_API_SECRET
    );


if (!cloudinaryConfigured) {

    console.warn(
        "⚠️ Cloudinary environment variables are not fully set."
    );

    console.warn(
        "Product image uploads will not work until they are set."
    );

}


/* =========================================================
   CLOUDINARY CONFIGURATION
   ========================================================= */

cloudinary.config({

    cloud_name:
        CLOUDINARY_CLOUD_NAME,

    api_key:
        CLOUDINARY_API_KEY,

    api_secret:
        CLOUDINARY_API_SECRET

});


/* =========================================================
   MONGODB
   ========================================================= */

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
   Serve the complete HunarHub website.
   server.js is inside /backend,
   so the main project folder is one level above.
*/

app.use(
    express.static(PROJECT_ROOT)
);


/* =========================================================
   MULTER IMAGE UPLOAD
   ========================================================= */

/*
   Images are kept temporarily in memory
   and then uploaded directly to Cloudinary.
*/

const upload =
    multer({

        storage:
            multer.memoryStorage(),

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

const initialProducts = [

    {
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
            "A beautiful handmade terracotta vase created by Priya Crafts.",

        createdAt:
            new Date()
    },


    {
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
            "A unique handmade necklace designed by Aisha Designs.",

        createdAt:
            new Date()
    },


    {
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
            "Beautiful hand painted artwork created by Art With Riya.",

        createdAt:
            new Date()
    },


    {
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
            "A traditional handmade dress created by Meera Fashion.",

        createdAt:
            new Date()
    },


    {
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
            "Delicious homemade snacks prepared by Rahul's Kitchen.",

        createdAt:
            new Date()
    },


    {
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
            "A personalized gift box prepared by Gift Studio.",

        createdAt:
            new Date()
    }

];


/* =========================================================
   HOME ROUTE
   ========================================================= */

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                PROJECT_ROOT,
                "index.html"
            )
        );

    }
);


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
    "/api/health",
    function (req, res) {

        res.json({

            success:
                true,

            message:
                "HunarHub API is working.",

            database:
                db
                    ? "connected"
                    : "not connected",

            cloudinary:
                cloudinaryConfigured
                    ? "configured"
                    : "not configured"

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
                    .sort({
                        createdAt: 1
                    })
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
                    .sort({
                        createdAt: 1
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
   CLOUDINARY UPLOAD HELPER
   ========================================================= */

function uploadToCloudinary(fileBuffer) {

    return new Promise(
        function (resolve, reject) {

            const stream =
                cloudinary.uploader.upload_stream(

                    {
                        folder:
                            "hunarhub/products",

                        resource_type:
                            "image"
                    },

                    function (error, result) {

                        if (error) {

                            reject(error);

                        } else {

                            resolve(result);

                        }

                    }

                );


            stream.end(
                fileBuffer
            );

        }
    );

}


/* =========================================================
   ADD SELLER PRODUCT
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

                seller,

                sellerCategory

            } = req.body;


            /* -----------------------------------------
               VALIDATE PRODUCT DETAILS
               ----------------------------------------- */

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


            /* -----------------------------------------
               VALIDATE IMAGE
               ----------------------------------------- */

            if (!req.file) {

                return res.status(400).json({

                    error:
                        "Please upload a product image."

                });

            }


            /* -----------------------------------------
               VALIDATE PRICE
               ----------------------------------------- */

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


            /* -----------------------------------------
               CHECK CLOUDINARY
               ----------------------------------------- */

            if (!cloudinaryConfigured) {

                return res.status(500).json({

                    error:
                        "Cloudinary is not configured on the server."

                });

            }


            /* -----------------------------------------
               UPLOAD IMAGE TO CLOUDINARY
               ----------------------------------------- */

            const uploadedImage =
                await uploadToCloudinary(
                    req.file.buffer
                );


            if (

                !uploadedImage ||

                !uploadedImage.secure_url

            ) {

                throw new Error(
                    "Cloudinary did not return an image URL."
                );

            }


            /* -----------------------------------------
               CREATE PRODUCT
               ----------------------------------------- */

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

                sellerCategory:
                    sellerCategory
                        ? sellerCategory.trim()
                        : category.trim(),

                image:
                    uploadedImage.secure_url,

                cloudinaryPublicId:
                    uploadedImage.public_id,

                createdAt:
                    new Date()

            };


            /* -----------------------------------------
               SAVE PRODUCT TO MONGODB
               ----------------------------------------- */

            const result =
                await productsCollection
                    .insertOne(
                        newProduct
                    );


            /* -----------------------------------------
               RESPONSE
               ----------------------------------------- */

            res.status(201).json({

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
                        initialProducts
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
            client.db(
                "HunarHub"
            );


        productsCollection =
            db.collection(
                "products"
            );


        console.log(
            "✅ MongoDB connected successfully!"
        );


        app.listen(

            PORT,

            "0.0.0.0",

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

                console.log(
                    `✅ API health: http://localhost:${PORT}/api/health`
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