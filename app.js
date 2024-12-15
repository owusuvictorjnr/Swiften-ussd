import express from "express";
import bodyParser from "body-parser";
import connect from "./db";
import dotenv from "dotenv";
import User from "./models/User.js";
import Order from "./models/Order.js";




dotenv.config();
connect();

const app = express();
app.use(urlencoded({ extended: false }));


//Twilio Main USSD Logic
app.post("/ussd", async (req, res) => {
  const { Body: text, From: phoneNumber } = req.body;
  let responseMessage = "";
  let user = await User.findOne({ phoneNumber });

  const inputs = text.split("*");
  const action = inputs[0];
  const subAction = inputs[1];
  const subSubAction = inputs[2];

  // Main Menu
  if (!user && action === "") {
    responseMessage = `CON Welcome to Delivery Service\n1. Register\n2. Login\n3. Help`;
  }

  // Registration Flow
  else if (!user && action === "1") {
    if (!subAction) {
      responseMessage = `CON Enter your full name:`;
    } else if (!subSubAction) {
      const fullName = subAction;
      responseMessage = `CON Enter a 4-digit PIN:`;
    } else if (!inputs[3]) {
      const pin = subSubAction;
      responseMessage = `CON Re-enter your PIN to confirm:`;
    } else {
      const fullName = subAction;
      const pin = subSubAction;
      const confirmPin = inputs[3];

      if (pin !== confirmPin) {
        responseMessage = `END PINs do not match. Registration failed.`;
      } else {
        await User.create({ phoneNumber, fullName, pin });
        responseMessage = `END Registration successful! Use your PIN to login. Press 0 to return to the main menu.`;
      }
    }
  }

  // Login Flow
  else if (action === "2") {
    if (!user) {
      responseMessage = `END You need to register first.`;
    } else if (!subAction) {
      responseMessage = `CON Enter your 4-digit PIN:`;
    } else {
      const pin = subAction;
      if (user.pin === pin) {
        responseMessage = `CON Login successful!\n1. Order Parcel\n2. Order Food\n3. My Orders\n4. History\n5. Logout`;
      } else {
        responseMessage = `END Incorrect PIN.`;
      }
    }
  }

  // Post Login Menu
  else if (user && action === "2") {
    if (subAction === "1") {
      responseMessage = `END Parcel order placed successfully!`;
    } else if (subAction === "2") {
      responseMessage = `END Food order placed successfully!`;
    } else if (subAction === "3") {
      const orders = await Order.find({ userId: user._id, status: "pending" });
      responseMessage =
        `END Your Orders:\n` +
        orders.map((o) => `${o.type} - ${o.status}`).join("\n");
    } else if (subAction === "4") {
      const orders = await Order.find({ userId: user._id });
      responseMessage =
        `END Order History:\n` +
        orders.map((o) => `${o.type} - ${o.status}`).join("\n");
    } else if (subAction === "5") {
      responseMessage = `END Logged out successfully. Press 0 to return to the main menu.`;
    }
  }

  // Help
  else if (action === "3") {
    responseMessage = `END Contact support at +233505304570.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(responseMessage);
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`USSD app running on port ${PORT}`));
