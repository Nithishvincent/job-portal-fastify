const users = [] // in-memory storage

module.exports = async function userRoutes(fastify, options) {

  // REGISTER
  fastify.post("/users/register", async (request, reply) => {
    const { email, password, role } = request.body || {}

    if (!email || !password || !role) {
      reply.code(400)
      return { error: "Email, password and role are required" }
    }

    if (!["EMPLOYER", "JOB_SEEKER"].includes(role)) {
      reply.code(400)
      return { error: "Invalid role" }
    }

    const exists = users.find(u => u.email === email)
    if (exists) {
      reply.code(409)
      return { error: "Email already registered" }
    }

    users.push({ email, password, role })

    return {
      message: "User registered successfully",
      user: { email, role }
    }
  })


  // LOGIN
  fastify.post("/users/login", async (request, reply) => {
    const { email, password } = request.body || {}

    if (!email || !password) {
      reply.code(400)
      return { error: "Email and password are required" }
    }

    const user = users.find(u => u.email === email)
    if (!user || user.password !== password) {
      reply.code(401)
      return { error: "Invalid email or password" }
    }

    // Create JWT token
    const token = fastify.jwt.sign({
    email: user.email,
    role: user.role
  })

    return {
      message: "Login successful",
      token
    }
  })

}