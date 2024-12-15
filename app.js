import express from "express";
import bodyParser from "body-parser";
import connect from "./db.js";
import dotenv from "dotenv";
import User from "./models/User.js";
import Order from "./models/Order.js";
import { v4 as uuidv4 } from "uuid";
import africastalking from "africastalking";

dotenv.config();
connect();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Africa's Talking SMS initialization
const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

//Africa's Talking Main USSD Logic
app.post("/ussd", async (req, res) => {
  const { sessionId, text, phoneNumber } = req.body; //AT parameters
  const inputs = text.split("*");
  const action = inputs[0];
  const subAction = inputs[1];
  const subSubAction = inputs[2];

  let resMessage = "";

  try {
    let user = await User.findOne({ phoneNumber });

    // Main Menu
    if (action === "") {
      resMessage = `CON Welcome to Swiften!\n1. Place an Order\n2. Track Delivery\n3. Cancel Order\n4. Support\n0. Exit`;
    }

    // Registration
    else if (action === "1" && !user) {
      if (!subAction) {
        resMessage = `CON Enter your full name:`;
      } else if (!inputs[2]) {
        //   const fullName = subAction;
        resMessage = `CON Enter a 4-digit PIN:`;
      } else if (!inputs[3]) {
        //   const pin = subSubAction;
        resMessage = `CON Re-enter your PIN to confirm:`;
      } else {
        const fullName = subAction;
        const pin = inputs[2];
        const confirmPin = inputs[3];

        if (pin !== confirmPin) {
          resMessage = `END PINs do not match. Registration failed.`;
        } else {
          await User.create({ phoneNumber, fullName, pin });
          resMessage = `END Registration successful! Use your PIN to login. Press 0 to return to the main menu.`;
        }
      }
    }

    // Place Order
    else if (action === "1" && user) {
      if (!subAction) {
        resMessage = `CON Enter pickup location:`;
      } else if (!inputs[2]) {
        resMessage = `CON Enter delivery location:`;
      } else if (!inputs[3]) {
        resMessage = `CON Select package type:\n1. Small\n2. Medium\n3. Large`;
      } else if (!inputs[4]) {
        const pickupLocation = subAction;
        const deliveryLocation = inputs[2];
        const packageType = ["small", "medium", "large"][
          parseInt(inputs[3]) - 1
        ];
        const orderId = uuidv4();

        await Order.create({
          userId: user._id,
          orderId,
          pickupLocation,
          deliveryLocation,
          packageType,
        });

        resMessage = `END Order placed successfully! Order ID: ${orderId}. Press 0 to return to the main menu.`;
      }
    }

    // Track Delivery
    else if (action === "2") {
      if (!subAction) {
        resMessage = `CON Enter your order ID:`;
      } else {
        const order = await Order.findOne({ orderId: subAction });
        if (order) {
          resMessage = `END Order Status: ${order.status}\nPickup: ${order.pickupLocation}\nDelivery: ${order.deliveryLocation}`;
        } else {
          resMessage = `END Order not found.`;
        }
      }
    }
    // Cancel Order
    else if (action === "3") {
      resMessage = `CON Enter your order ID to cancel:`;
    }

    // support
    else if (action === "4") {
      resMessage = `END Contact Support: 0505304570 or support@swiften.com.`;
    }

    // send response
    res.set("Content-Type", "text/plain");
    res.send(resMessage);
  } catch (error) {
    console.error("Error processing USSD request:", error);
    res.set("Content-Type", "text/plain");
    res.send(resMessage);
  }
});

//  Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`USSD app running on port ${PORT}`));
