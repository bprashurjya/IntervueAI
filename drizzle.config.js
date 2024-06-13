/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview-mocker_owner:F9wfsmgkW2LC@ep-sweet-haze-a5j7zflj.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };