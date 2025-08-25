const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderWallet = await Wallet.findOne({ user: req.params.userId }).session(session);
    const recipientWallet = await Wallet.findOne({ user: req.body.toAccount }).session(session);

    if (!senderWallet || !recipientWallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Wallet not found!", success: false });
    }

    if (senderWallet.user.toString() === recipientWallet.user.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "You can't transfer to yourself!", success: false });
    }

    if (senderWallet.balance < req.body.amountToSend) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance!", success: false });
    }

    const amount = Number(req.body.amountToSend);

    // Update balances
    senderWallet.balance = Number(senderWallet.balance) - amount;
    recipientWallet.balance = Number(recipientWallet.balance) + amount;

    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    // Record transaction
    await Transaction.create([{
      from: req.params.userId,
      to: req.body.toAccount,
      amount,
      transactionType: "transfer"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Transaction completed successfully!", success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).send({ message: error.message, success: false });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found!", success: false });
    }

    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }]
    });

    res.status(200).send(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message, success: false });
  }
};

module.exports = {
  transferMoney,
  getTransactions
};
