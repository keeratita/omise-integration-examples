const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

// You can get your test keys on https://dashboard.omise.co/test/keys
const omise = require("omise")({
  publicKey: "pkey_test_5fzr2jki9na3ooq2qxg", // YOUR PUBLIC KEY
  secretKey: "skey_test_5fwa62a6nnfablgifxp" // YOUR SECRET KEY
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat", // set your secret here
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 }
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  req.orderReceivedUrl =
    req.protocol + "://" + req.headers.host + "/order-received";
  next();
});

/**
 * GET /
 * Display Hello World
 */
app.get("/", (req, res) => {
  res.render("index", { title: "Hello World!" });
});

/**
 * GET /credit-payment
 * Display a payment form
 */
app.get("/credit-payment", (req, res) => {
  res.render("credit-payment", { title: "Credit / Debit card" });
});

/**
 * POST /credit-payment
 */
app.post("/credit-payment", async (req, res, next) => {
  try {
    const order_id = getOrderId();
    const charge = await omise.charges.create({
      amount: 100000, //1,000 baht
      currency: "thb",
      card: req.body.omiseToken,
      description: "Test charge a card",
      metadata: {
        order_id
      },
      return_uri: req.orderReceivedUrl
    });

    /**
     * Store charge id, or order id in session
     * in this example will use charge id.. but in the real world, I recommend to use an order id.
     * Some people will add the order id to `return_uri`, and then check the charge status by associated `order_id` and `charge_id` in a database.
     * Whatever you choose....
     **/
    req.session.charge_id = charge.id;

    // charge status: https://www.omise.co/charging-cards#charge-status-(with-3-d-secure-enabled)
    if (charge.authorized === true) {
      res.redirect(req.orderReceivedUrl);
    } else if (charge.authorize_uri !== null) {
      res.redirect(charge.authorize_uri);
    } else {
      throw new Error("Error detects!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /internet-banking-payment
 * Display a payment form
 */
app.get("/internet-banking-payment", (req, res) => {
  res.render("internet-banking-payment", { title: "Internet Banking" });
});

/**
 * POST /internet-banking-payment
 */
app.post("/internet-banking-payment", async (req, res, next) => {
  try {
    const { sourceType } = req.body;
    const order_id = getOrderId();
    const charge = await omise.charges.create({
      amount: 100000, //1,000 baht
      currency: "thb",
      description: "Test internet banking",
      metadata: {
        order_id
      },
      return_uri: req.orderReceivedUrl,
      source: {
        type: sourceType
      }
    });

    // store charge id in session
    req.session.charge_id = charge.id;

    // charge status: https://www.omise.co/offsite-payment#charge-status
    if (charge.authorize_uri !== null) {
      res.redirect(charge.authorize_uri);
    } else {
      throw new Error("Error detects!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /order-received
 * Display an order status
 */
app.get("/order-received", async (req, res, next) => {
  const title = "Order received";
  let charge = null;

  try {
    const { charge_id } = req.session;
    if (charge_id != null) {
      charge = await omise.charges.retrieve(charge_id);
    }

    res.render("order-received", { title, charge });
  } catch (error) {
    next(error);
  }
});

/**
 * Webhook: use Ngrok to test a webhook in localhost
 *
 * Installation and usage on MacOS
 * > brew cask install ngrok
 * > ngrok http 3000
 *
 * copy Forwarding (https) url and paste it in https://dashboard.omise.co/test/webhooks/edit
 **/

app.post("/webhook", express.json(), (req, res) => {
  // DO SOMETHING
  console.log("WebHooks", JSON.stringify(req.body, null, 2));

  res.status(200);
  res.send({});
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(500);
  res.render("error", { error: err, title: "Error" });
});

// just a random number
// in a real world, please use order id, or something that is generated from your database
function getOrderId() {
  return Math.round(Math.random() * 1000000 + 1)
    .toString()
    .padStart(7, "0");
}
module.exports = app;
