const fastify = require("fastify")({ logger: true })

// Enable CORS
fastify.register(require("@fastify/cors"), {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
});

// JWT (only for signing & verifying)
fastify.register(require("@fastify/jwt"), {
  secret: "supersecretkey"
})

// Routes
fastify.register(require("./routes/home"))
fastify.register(require("./routes/users"))
fastify.register(require("./routes/jobs"))

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    console.log("Server running on", fastify.server.address().port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
