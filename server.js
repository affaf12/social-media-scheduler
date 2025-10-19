
import express from "express";
import fs from "fs";
import cron from "node-cron";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(process.cwd(), "public")));

// Your existing backend routes
let posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf8"));

app.post("/add-post", (req, res) => {
  const newPost = req.body;
  posts.push(newPost);
  fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 2));
  res.json({ message: "Post scheduled successfully!" });
});

// Cron job (same as before)
cron.schedule("* * * * *", () => {
  const now = new Date();
  posts.forEach((post) => {
    if (new Date(post.time) <= now && !post.posted) {
      console.log("Posting:", post.text);
      post.posted = true;
      fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 2));
    }
  });
});

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/index.html"));
});

app.listen(5000, () => console.log("Server running on port 5000"));
