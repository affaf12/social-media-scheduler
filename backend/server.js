import express from "express";
import fs from "fs";
import cron from "node-cron";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Load scheduled posts
let posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf8"));

// Save new post
app.post("/add-post", (req, res) => {
  const newPost = req.body;
  posts.push(newPost);
  fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 2));
  res.json({ message: "Post scheduled successfully!" });
});

// Cron job runs every minute
cron.schedule("* * * * *", () => {
  const now = new Date();
  posts.forEach((post, index) => {
    if (new Date(post.time) <= now && !post.posted) {
      console.log("Posting:", post.text);

      // Call each platform API (we’ll add later)
      postToPlatform(post);

      post.posted = true;
      fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 2));
    }
  });
});

async function postToPlatform(post) {
  if (post.platform === "linkedin") {
    // TODO: Add LinkedIn API call here
  } else if (post.platform === "facebook") {
    // TODO: Add Facebook API call here
  }
  console.log(`✅ Posted to ${post.platform}`);
}

app.listen(5000, () => console.log("Server running on port 5000"));
