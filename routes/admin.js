module.exports = async function adminRoutes(fastify, options) {

  // --------------------
  // ADMIN - GET ALL USERS
  // --------------------
  fastify.get("/admin/users", async (request, reply) => {
    try {
      const user = await request.jwtVerify();
        if (user.role !== "ADMIN") {
            reply.code(403);
            return { error: "Only admins can access this route" };
        }

      const [users] = await db.query("SELECT id, email, role FROM users");
      return { count: users.length, users };
    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }   
    });

    // --------------------
    // ADMIN - DELETE USER
    // --------------------
    fastify.delete("/admin/users/:id", async (request, reply) => {
        try {
            const user = await request.jwtVerify();
            if (user.role !== "ADMIN") {
                reply.code(403);
                return { error: "Only admins can delete users" };
            }
            const userId = request.params.id;

            await db.query("DELETE FROM users WHERE id = ?", [userId]);
            return { message: "User deleted successfully" };

        } catch (err) {
            reply.code(401);
            return { error: "Unauthorized" };
        }
    });

}