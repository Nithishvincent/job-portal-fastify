const db = require("../db");

module.exports = async function jobRoutes(fastify, options) {

  // --------------------
  // EMPLOYER - CREATE JOB
  // --------------------
  fastify.post("/jobs", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "EMPLOYER") {
        reply.code(403);
        return { error: "Only employers can create jobs" };
      }

      const { title, description, company } = request.body || {};

      if (!title || !description || !company) {
        reply.code(400);
        return { error: "All fields are required" };
      }

      await db.query(
        "INSERT INTO jobs (title, description, company, created_by) VALUES (?, ?, ?, ?)",
        [title, description, company, user.email]
      );

      return { message: "Job created successfully" };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // PUBLIC - GET ALL JOBS
  // --------------------
  fastify.get("/jobs", async () => {
    const [jobs] = await db.query("SELECT * FROM jobs");
    return { count: jobs.length, jobs };
  });

  // --------------------
  // JOB SEEKER - APPLY FOR JOB
  // --------------------
  fastify.post("/jobs/:id/apply", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "JOB_SEEKER") {
        reply.code(403);
        return { error: "Only job seekers can apply" };
      }

      const jobId = Number(request.params.id);

      try {
        await db.query(
          "INSERT INTO applications (job_id, applicant_email) VALUES (?, ?)",
          [jobId, user.email]
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          reply.code(409);
          return { error: "You have already applied for this job" };
        }
        throw err;
      }

      return { message: "Application submitted successfully" };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // EMPLOYER - VIEW APPLICANTS
  // --------------------
  fastify.get("/jobs/:id/applicants", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "EMPLOYER") {
        reply.code(403);
        return { error: "Only employers can view applicants" };
      }

      const jobId = Number(request.params.id);

      const [job] = await db.query(
        "SELECT * FROM jobs WHERE id = ? AND created_by = ?",
        [jobId, user.email]
      );

      if (job.length === 0) {
        reply.code(403);
        return { error: "Unauthorized job access" };
      }

      const [apps] = await db.query(
        "SELECT applicant_email AS email, status FROM applications WHERE job_id = ?",
        [jobId]
      );

      return {
        jobId,
        applicantsCount: apps.length,
        applicants: apps
      };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // EMPLOYER - UPDATE APPLICATION STATUS
  // --------------------
  fastify.put("/jobs/:id/applications/:email", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "EMPLOYER") {
        reply.code(403);
        return { error: "Only employers can update status" };
      }

      const jobId = Number(request.params.id);
      const applicantEmail = request.params.email;
      const { status } = request.body;

      if (!["ACCEPTED", "REJECTED"].includes(status)) {
        reply.code(400);
        return { error: "Invalid status" };
      }

      const [job] = await db.query(
        "SELECT id FROM jobs WHERE id = ? AND created_by = ?",
        [jobId, user.email]
      );

      if (job.length === 0) {
        reply.code(403);
        return { error: "Unauthorized job access" };
      }

      await db.query(
        "UPDATE applications SET status = ? WHERE job_id = ? AND applicant_email = ?",
        [status, jobId, applicantEmail]
      );

      return { message: `Application ${status.toLowerCase()}` };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // JOB SEEKER - MY APPLICATIONS
  // --------------------
  fastify.get("/my-applications", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "JOB_SEEKER") {
        reply.code(403);
        return { error: "Only job seekers allowed" };
      }

      const [apps] = await db.query(
        "SELECT job_id, status FROM applications WHERE applicant_email = ?",
        [user.email]
      );

      return {
        count: apps.length,
        applications: apps
      };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // EMPLOYER - MY JOBS
  // --------------------
  fastify.get("/my-jobs", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "EMPLOYER") {
        reply.code(403);
        return { error: "Only employers allowed" };
      }

      const [jobs] = await db.query(
        "SELECT * FROM jobs WHERE created_by = ?",
        [user.email]
      );

      return {
        count: jobs.length,
        jobs
      };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

  // --------------------
  // EMPLOYER - DELETE JOB
  // --------------------
  fastify.delete("/jobs/:id", async (request, reply) => {
    try {
      const user = await request.jwtVerify();

      if (user.role !== "EMPLOYER") {
        reply.code(403);
        return { error: "Only employers can delete jobs" };
      }

      const jobId = Number(request.params.id);

      await db.query(
        "DELETE FROM jobs WHERE id = ? AND created_by = ?",
        [jobId, user.email]
      );

      return { message: "Job deleted successfully" };

    } catch (err) {
      reply.code(401);
      return { error: "Unauthorized" };
    }
  });

};