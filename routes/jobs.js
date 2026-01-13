const jobs = []  
const applications = [] 
let jobIdCounter = 1

module.exports = async function jobRoutes(fastify, options) {

  // EMPLOYER ONLY - CREATE JOB
  fastify.post("/jobs", async (request, reply) => {
    try {
      // Verify JWT
      const decoded = await request.jwtVerify()
      request.user = decoded

      // Role check
      if (request.user.role !== "EMPLOYER") {
        reply.code(403)
        return { error: "Only employers can create jobs" }
      }

      // Read job data
      const { title, description, company } = request.body || {}

      if (!title || !description || !company) {
        reply.code(400)
        return { error: "Title, description, and company are required" }
      }

      // Create job
      const newJob = {
        id: jobIdCounter++,
        title,
        description,
        company,
        createdBy: request.user.email
      }
            const duplicateJob = jobs.find(j =>
        j.title === title &&
        j.company === company &&
        j.createdBy === request.user.email
      );

      if (duplicateJob) {
        reply.code(409);
        return { error: "Job already exists" };
      }
      
      jobs.push(newJob)

      // Response
      return {
        message: "Job created successfully",
        job: newJob
      }

    } catch (err) {
      reply.code(401)
      return { error: "Unauthorized" }
    }
  })
  // PUBLIC - GET ALL JOBS
    fastify.get("/jobs", async (request, reply) => {
    return {
        count: jobs.length,
        jobs: jobs
    }
})

// JOB SEEKER - APPLY FOR JOB
fastify.post("/jobs/:id/apply", async (request, reply) => {
  try {
    // Verify JWT
    const decoded = await request.jwtVerify()
    request.user = decoded

    // Role check
    if (request.user.role !== "JOB_SEEKER") {
      reply.code(403)
      return { error: "Only job seekers can apply for jobs" }
    }

    // Get job ID from URL
    const jobId = parseInt(request.params.id)

    // Check if job exists
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      reply.code(404)
      return { error: "Job not found" }
    }

    // Prevent duplicate application
    const alreadyApplied = applications.find(
      a => a.jobId === jobId && a.applicantEmail === request.user.email
    )

    if (alreadyApplied) {
      reply.code(409)
      return { error: "You have already applied for this job" }
    }

    // Save application
    const newApplication = {
      jobId: jobId,
      applicantEmail: request.user.email
    }

    applications.push(newApplication)

    // Response
    return {
      message: "Application submitted successfully"
    }

  } catch (err) {
    reply.code(401)
    return { error: "Unauthorized" }
  }
})
// EMPLOYER - VIEW APPLICANTS FOR A JOB
fastify.get("/jobs/:id/applicants", async (request, reply) => {
  try {
    // Verify JWT
    const decoded = await request.jwtVerify()
    request.user = decoded

    // Role check
    if (request.user.role !== "EMPLOYER") {
      reply.code(403)
      return { error: "Only employers can view applicants" }
    }

    // Read job ID
    const jobId = parseInt(request.params.id)

    // Check if job exists
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      reply.code(404)
      return { error: "Job not found" }
    }

    // Ownership check
    if (job.createdBy !== request.user.email) {
      reply.code(403)
      return { error: "You are not allowed to view applicants for this job" }
    }

    // Get applicants for this job
    const jobApplicants = applications
      .filter(app => app.jobId === jobId)
      .map(app => ({
  email: app.applicantEmail,
  status: app.status
}))

    // Response
    return {
      jobId,
      applicantsCount: jobApplicants.length,
      applicants: jobApplicants
    }

  } catch (err) {
    console.error(err)
    reply.code(401)
    return { error: "Unauthorized" }
  }
})
// JOB SEEKER - VIEW MY APPLICATIONS
fastify.get("/my-applications", async (request, reply) => {
  try {
    // Verify token
    const user = await request.jwtVerify();

    // Role check
    if (user.role !== "JOB_SEEKER") {
      reply.code(403);
      return { error: "Only job seekers can view their applications" };
    }

    // Filter applications
    const myApplications = applications.filter(
      app => app.applicantEmail === user.email
    );

    // Always return safely
    return {
      count: myApplications.length,
      applications: myApplications
    };

  } catch (err) {
    console.error(err);
    reply.code(401);
    return { error: "Unauthorized" };
  }
})

// EMPLOYER - VIEW OWN JOBS
fastify.get("/my-jobs", async (request, reply) => {
  try {
    // Verify token
    const user = await request.jwtVerify();

    //  Role check
    if (user.role !== "EMPLOYER") {
      reply.code(403);
      return { error: "Only employers can view their jobs" };
    }

    // Filter jobs by creator
    const myJobs = jobs.filter(
      job => job.createdBy === user.email
    );

    return {
      count: myJobs.length,
      jobs: myJobs
    };

  } catch (err) {
    console.error(err);
    reply.code(401);
    return { error: "Unauthorized" };
  }
});
// EMPLOYER - DELETE JOB
fastify.delete("/jobs/:id", async (request, reply) => {
  try {
    const user = await request.jwtVerify();

    if (user.role !== "EMPLOYER") {
      reply.code(403);
      return { error: "Only employers can delete jobs" };
    }

    const jobId = Number(request.params.id);
    const jobIndex = jobs.findIndex(j => j.id === jobId);

    if (jobIndex === -1) {
      reply.code(404);
      return { error: "Job not found" };
    }

    // Ownership check
    if (jobs[jobIndex].createdBy !== user.email) {
      reply.code(403);
      return { error: "You do not own this job" };
    }

    // Remove job
    jobs.splice(jobIndex, 1);

    // Remove related applications
    for (let i = applications.length - 1; i >= 0; i--) {
      if (applications[i].jobId === jobId) {
        applications.splice(i, 1);
      }
    }

    return { message: "Job deleted successfully" };

  } catch (err) {
    reply.code(401);
    return { error: "Unauthorized" };
  }
});

// EMPLOYER - EDIT JOB
fastify.put("/jobs/:id", async (request, reply) => {
  try {
    const user = await request.jwtVerify();

    if (user.role !== "EMPLOYER") {
      reply.code(403);
      return { error: "Only employers can edit jobs" };
    }

    const jobId = Number(request.params.id);
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      reply.code(404);
      return { error: "Job not found" };
    }

    // Ownership check
    if (job.createdBy !== user.email) {
      reply.code(403);
      return { error: "You do not own this job" };
    }

    const { title, description, company } = request.body;

    if (!title || !description || !company) {
      reply.code(400);
      return { error: "All fields are required" };
    }

    // Update job
    job.title = title;
    job.description = description;
    job.company = company;

    return { message: "Job updated successfully", job };

  } catch (err) {
    reply.code(401);
    return { error: "Unauthorized" };
  }
});
// EMPLOYER - UPDATE APPLICATION STATUS
fastify.put("/jobs/:id/applications/:email", async (request, reply) => {
  try {
    const user = await request.jwtVerify();

    if (user.role !== "EMPLOYER") {
      reply.code(403);
      return { error: "Only employers can update application status" };
    }

    const jobId = Number(request.params.id);
    const applicantEmail = request.params.email;
    const { status } = request.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      reply.code(400);
      return { error: "Invalid status" };
    }

    const job = jobs.find(j => j.id === jobId);
    if (!job || job.createdBy !== user.email) {
      reply.code(403);
      return { error: "Unauthorized job access" };
    }

    const application = applications.find(
      a => a.jobId === jobId && a.applicantEmail === applicantEmail
    );

    if (!application) {
      reply.code(404);
      return { error: "Application not found" };
    }

    application.status = status;

    return {
      message: `Application ${status.toLowerCase()}`,
      application
    };

  } catch (err) {
    reply.code(401);
    return { error: "Unauthorized" };
  }
});

}
