const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = db.Customer;
const User = db.User; // Admin/Staff User model
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

// Register a new customer
exports.register = async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;

  try {
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newCustomer = await Customer.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
    });

    const payload = {
      user: {
        id: newCustomer.customer_id,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        role: 'customer', // Explicitly set role for customers
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { // This structure should match frontend's User type expectations
        user_id: newCustomer.customer_id,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        role: 'customer',
      },
      message: 'Customer registered successfully',
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// Login for both Admins (User model) and Customers (Customer model)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Attempt to log in as an Admin/Staff (User model)
    let adminUser = await User.findOne({ where: { email } });
    if (adminUser) {
      if (!adminUser.password_hash) {
         return res.status(400).json({ message: 'Admin account is not fully set up for password login.' });
      }
      const isMatch = await bcrypt.compare(password, adminUser.password_hash);
      if (isMatch) {
        const payload = {
          user: {
            id: adminUser.user_id,
            email: adminUser.email,
            username: adminUser.username,
            role: adminUser.role, // 'admin', 'staff', 'viewer'
          },
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
          token,
          user: { // This structure should match frontend's User type expectations
            user_id: adminUser.user_id,
            email: adminUser.email,
            username: adminUser.username,
            role: adminUser.role,
          },
          message: 'Admin login successful',
        });
      }
      // If admin user exists but password doesn't match, fall through to check customer or return error.
      // For security, if email matches admin but password fails, we might not want to try customer.
      // However, for simplicity here, we proceed. A more robust system might separate admin/customer login endpoints.
    }

    // 2. Attempt to log in as a Customer
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }
    if (!customer.password_hash) {
        return res.status(400).json({ message: 'Customer account is not fully set up for password login.' });
    }
    const isCustomerMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isCustomerMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    const customerPayload = {
      user: {
        id: customer.customer_id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: 'customer', // Explicitly set role for customers
      },
    };
    const customerToken = jwt.sign(customerPayload, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      token: customerToken,
      user: { // This structure should match frontend's User type expectations
        user_id: customer.customer_id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: 'customer',
      },
      message: 'Customer login successful',
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// Get current logged-in user details (Admin or Customer)
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ message: 'User not authenticated or ID/role missing in token.' });
    }

    let userDetails;
    let userForFrontend;

    if (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'viewer') {
      userDetails = await User.findByPk(req.user.id, {
        attributes: ['user_id', 'username', 'email', 'role', 'is_active', 'created_at'],
      });
      if (userDetails) {
        userForFrontend = {
            user_id: userDetails.user_id,
            email: userDetails.email,
            username: userDetails.username,
            role: userDetails.role,
            is_active: userDetails.is_active,
            created_at: userDetails.created_at
        };
      }
    } else if (req.user.role === 'customer') {
      userDetails = await Customer.findByPk(req.user.id, {
        attributes: ['customer_id', 'first_name', 'last_name', 'email', 'phone_number', 'created_at'],
      });
      if (userDetails) {
         userForFrontend = {
            user_id: userDetails.customer_id,
            email: userDetails.email,
            first_name: userDetails.first_name,
            last_name: userDetails.last_name,
            phone_number: userDetails.phone_number,
            role: 'customer', // Ensure role is part of the response
            created_at: userDetails.created_at
        };
      }
    } else {
        return res.status(400).json({ message: 'Invalid user role in token.' });
    }
    
    if (!userDetails) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(userForFrontend);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};