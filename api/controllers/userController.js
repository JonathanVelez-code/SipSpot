const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

//generate token using user ID 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // expires 1 day
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, login, password } = req.body;
  const email = login; //frontend need to change login to email

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  //create new users
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  // generate token
  const token = generateToken(user._id);

  //send cookie to the frontend to prevent saving token in local storage 
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1 day expires
    sameSite: "none",
    secure: true,
  });


  if (user) {
    const { _id, firstName, lastName, email, password } = user;
    res.status(201).json({
      _id, firstName, lastName, email, password, token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;
  const email = login; //frontend need to change login to email

  //validate request
  if (!email || !password) {
    res.status(400);
    throw new Error("please add email and password");
  }

  const user = await User.findOne({ email });

  //check if user exists in DB
  if (!user) {
    res.status(400);
    throw new Error("user not found");
  }

  // compares user entered password to the database password. APi request won't work anymore due to unhashed requested
  if (password != user.password) {
    res.status(400);
    throw new Error("Invalid Entry: email or password incorrect.");
  }

  // generate token
  const token = generateToken(user._id);

  //send cookie to the frontend to prevent saving token in local storage 
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1 day expires
    sameSite: "none",
    secure: true,
  });

  if (user && password) {
    const { _id, firstName, lastName, email, password, } = user;
    res.status(201).json({
      _id, firstName, lastName, email, password, token,
    });
  }
  else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

//Logout user, frontend need to call the logout function to remove token access. 
const logOut = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), //the token expires making the user logout.
    sameSite: "none",
    secure: true
  });
  return res.status(200).json({ message: "Success Logged Out." });
});

module.exports = {
  registerUser,
  loginUser,
  logOut,
};