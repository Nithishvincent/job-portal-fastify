module.exports = async function homeRoute(fastify, options) {

  // Public route
  fastify.get("/", async () => {
    return { message: "Public route: no login required" }
  })

  // Protected route (JWT verified HERE)
  fastify.get("/protected", async (request, reply) => {
    try {
      const decoded = await request.jwtVerify()
      request.user = decoded

      return {
        message: "You accessed a protected route",
        user: request.user
      }
    } catch (err) {
      reply.code(401)
      return { error: "Unauthorized" }
    }
  })
  // EMPLOYER ONLY
  fastify.get("/employer-only", async (request, reply) => {
    try {
      const decoded = await request.jwtVerify()
      request.user = decoded

      if (request.user.role !== "EMPLOYER") {
        reply.code(403)
        return { error: "Access denied: Employers only" }
      }

      return {
        message: "Welcome Employer",
        user: request.user
      }
    } catch (err) {
      reply.code(401)
      return { error: "Unauthorized" }
    }
  })

}
