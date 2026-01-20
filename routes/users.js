const db = require("../db");
const bcrypt = require("bcrypt");

module.exports = async function userRoutes(fastify, options) {

  // REGISTER
  fastify.post("/users/register", async (request, reply) => {
    const { email, password, role } = request.body || {};

    if (!email || !password || !role) {
      reply.code(400);
      return { error: "Email, password and role are required" };
    }

    if (!["EMPLOYER", "JOB_SEEKER", "ADMIN"].includes(role)) {
      reply.code(400);
      return { error: "Invalid role" };
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      reply.code(409);
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role]
    );

    return { message: "User registered successfully" };
  });

  // LOGIN
  fastify.post("/users/login", async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      reply.code(400);
      return { error: "Email and password are required" };
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      reply.code(401);
      return { error: "Invalid email or password" };
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      reply.code(401);
      return { error: "Invalid email or password" };
    }

    const token = fastify.jwt.sign({
      email: user.email,
      role: user.role
    });

    return {
      message: "Login successful",
      token
    };
  });

};