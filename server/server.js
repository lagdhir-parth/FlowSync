import app from "./app.js";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";

const PORT = env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
