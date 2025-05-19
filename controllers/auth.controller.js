const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });
  }

  try {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE username = @username OR email = @email');

    if (check.recordset.length > 0) {
      return res.status(400).json({ message: 'Username hoặc Email đã tồn tại' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password_hash)
      .query('INSERT INTO users (username, email, password_hash) VALUES (@username, @email, @password_hash)');

    res.json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin đăng nhập' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usernameOrEmail', sql.NVarChar, usernameOrEmail)
      .query('SELECT * FROM users WHERE username = @usernameOrEmail OR email = @usernameOrEmail');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Sai username/email hoặc password' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Sai username/email hoặc password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, username, email, created_at FROM users');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
