const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

const transferMoney = async (req, res) => {
  try {
    const senderWallet = await Wallet.findOne({ user: req.params.userId });
    const recipientWallet = await Wallet.findOne({ user: req.body.toAccount });

    if (senderWallet.user.toString() === recipientWallet.user.toString()) {
      return res
        .status(400)
        .json({ message: "You can't transfer to yourself!", success: false });
    }

    if (senderWallet.balance < req.body.amountToSend) {
      return res
        .status(400)
        .json({ message: "Insufficient balance!", success: false });
    }

    const amount = Number(req.body.amountToSend);
    senderWallet.balance = Number(senderWallet.balance) - amount;
    recipientWallet.balance = Number(recipientWallet.balance) + amount;

    await senderWallet.save();
    await recipientWallet.save();

    const transaction = await Transaction.create({
      from: req.params.userId,
      to: req.body.toAccount,
      amount: req.body.amountToSend,
      transactionType: "transfer"
    });

    res
      .status(200)
      .json({ message: "Transaction completed successfully!", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({message: error.message, success: false});
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user's wallet
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({message: "User not found!", success: false});
    }

    // Find transactions involving the user
    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }]
    });

    res.status(200).send(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).send({message: error.message, success: false});
  }
};

module.exports = {
  transferMoney,
  getTransactions
};
