const User = require("../models/User");
const bcrypt = require("bcrypt");


const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    // ... (existing code)

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updatedFields,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    // ... (existing code)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


const verifyAadhaar = async (req, res) => {
  try {
    const { aadhaar } = req.body;

    // #region agent log
    fetch('http://127.0.0.1:7618/ingest/57d90a2e-7703-4985-a0ce-0917a8f0cfd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4cb0d'},body:JSON.stringify({sessionId:'a4cb0d',location:'UserController.js:verifyAadhaar',message:'aadhaar verify attempt',data:{userId:req.params.userId,aadhaarLen:aadhaar?String(aadhaar).length:0},timestamp:Date.now(),hypothesisId:'A',runId:'post-fix'})}).catch(()=>{});
    // #endregion

    if (!aadhaar || !/^\d{12}$/.test(String(aadhaar))) {
      return res.status(400).json({ message: "Invalid Aadhaar number. Must be 12 digits.", success: false });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { aadhaar: String(aadhaar), isVerified: true },
      { new: true }
    );

    if (!updatedUser.isVerified) {
      return res.status(500).json({ message: "Aadhaar verification failed", success: false });
    }

    res.status(201).json({
      message: "Aadhaar verified successfully",
      success: true,
      isVerified: updatedUser.isVerified
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Something went wrong, try again later", success: false });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credential", success: false });
    }
    const saltRounds = 5;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { password: hashedPassword },
      { new: true }
    );
    res.status(201).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong, try again later", success: false });
  }
};



module.exports = {
  getUser,
  updateUser,
  verifyAadhaar,
  updatePassword
};
