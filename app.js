require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const path = require("path");

const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");

const session = require("express-session");

const MongoStore = require("connect-mongo");

const flash = require("connect-flash");

const passport = require("passport");

const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

// Routes
const listingRouter =
  require("./routes/listing.js");

const reviewRouter =
  require("./routes/review.js");

const userRouter =
  require("./routes/user.js");

const bookingRouter =
  require("./routes/booking.js");

const itineraryRouter =
  require("./routes/itinerary.js");

// DB URL
const dbUrl =
  process.env.ATLASDB_URL;

// ================= DATABASE =================

async function main() {

  await mongoose.connect(dbUrl);
}

main()
.then(() => {

  console.log("Connected to Atlas DB");

})
.catch((err) => {

  console.log(err);
});

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "views")
);

app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================

app.use(
  express.urlencoded({
    extended: true,
  })
);

// IMPORTANT FOR RAZORPAY
app.use(express.json());

app.use(
  methodOverride("_method")
);

app.use(
  express.static(
    path.join(__dirname, "/public")
  )
);

// ================= SESSION =================

const store = MongoStore.create({

  mongoUrl: dbUrl,

  touchAfter: 24 * 3600,
});

store.on("error", () => {

  console.log(
    "Mongo Session Store Error"
  );
});

const sessionOptions = {

  store,

  secret:
    process.env.SECRET || "mysupersecret",

  resave: false,

  saveUninitialized: false,

  cookie: {

    expires:
      Date.now() +
      7 * 24 * 60 * 60 * 1000,

    maxAge:
      7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

app.use(
  session(sessionOptions)
);

app.use(flash());

// ================= PASSPORT =================

app.use(
  passport.initialize()
);

app.use(
  passport.session()
);

passport.use(
  new LocalStrategy(
    User.authenticate()
  )
);

passport.serializeUser(
  User.serializeUser()
);

passport.deserializeUser(
  User.deserializeUser()
);

// ================= LOCALS =================

app.use((req, res, next) => {

  res.locals.success =
    req.flash("success");

  res.locals.error =
    req.flash("error");

  res.locals.currUser =
    req.user;

  next();
});

// ================= HOME ROUTE =================

app.get("/", (req, res) => {

  res.redirect("/listings");
});

// ================= ROUTES =================

app.use(
  "/listings",
  listingRouter
);

app.use(
  "/listings/:id/reviews",
  reviewRouter
);

app.use(
  "/itinerary",
  itineraryRouter
);

app.use(
  "/booking",
  bookingRouter
);

app.use(
  "/",
  userRouter
);

// ================= SERVER =================

const port =
  process.env.PORT || 8080;

app.listen(port, () => {

  console.log(
    `Server running on port ${port}`
  );
});