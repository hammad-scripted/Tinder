import { User } from '../models/users.model.js';
import { generateToken } from '../lib/token.js';
export const signup = async (req, res, next) => {
  const { name, email, password, age, gender, genderPreference } = req.body;

  if (!name || !email || !password || !age || !gender || !genderPreference) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required' });
  }

  const numericAge = Number(age);
  if (Number.isNaN(numericAge) || numericAge < 18) {
    return res.status(400).json({
      success: false,
      message: 'You must be at least 18 years old to sign up',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  try {
    //? Check if the email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }

    //? Create a new user
    const newUser = new User({
      name,
      email,
      password,
      age: numericAge,
      gender,
      genderPreference,
    });

    await newUser.save();

    //* Generate a token for the new user
    const token = generateToken(newUser._id);

    //* Set the cookie with the token
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // // Strip password before sending user back
    // const userResponse = newUser.toObject();
    // delete userResponse.password;

    //? Fetch the user again to exclude the password field
    const userResponse = await User.findById(newUser._id).select('-password');

    return res
      .status(201)
      .json({ success: true, message: 'User created', user: userResponse });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email },
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt');
    return res
      .status(200)
      .json({ success: true, message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
