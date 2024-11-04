const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const port = 5000;

const app = express();
app.use(express.json());
app.use(cors());

// File paths
const usersPath = path.join(__dirname, 'data', 'users.json');
const postsPath = path.join(__dirname, 'data', 'posts.json');
const requestsPath = path.join(__dirname, 'data', 'requests.json');

// Utility functions for file operations
const loadJSON = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const content = fs.readFileSync(filePath);
    return JSON.parse(content);
};

const saveJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Middleware for request verification
const authenticate = (req, res, next) => {
    // Implement your authentication logic here
    next();
};

// User registration
const registerUser = (req, res) => {
    const users = loadJSON(usersPath);
    const newUser = { id: Date.now(), ...req.body };
    users.push(newUser);
    saveJSON(usersPath, users);
    res.status(201).json(newUser);
};

// User login
const userLogin = (req, res) => {
    const users = loadJSON(usersPath);
    const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// Fetch all users
const getAllUsers = (req, res) => {
    const users = loadJSON(usersPath);
    res.json(users);
};

// Handle requests
const createRequest = (req, res) => {
    const requests = loadJSON(requestsPath);
    const newRequest = { id: Date.now(), ...req.body };
    requests.push(newRequest);
    saveJSON(requestsPath, requests);
    res.status(201).json(newRequest);
};

// Get pending requests
const listPendingRequests = (req, res) => {
    const requests = loadJSON(requestsPath);
    const pending = requests.filter(r => !r.accepted); // Assuming a field 'accepted'
    res.json(pending);
};

// Accept a request
const approveRequest = (req, res) => {
    const requests = loadJSON(requestsPath);
    const request = requests.find(r => r.id === req.body.id);
    if (request) {
        request.accepted = true;
        saveJSON(requestsPath, requests);
        res.status(200).json(request);
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
};

// Create a new post
const createPost = (req, res) => {
    const posts = loadJSON(postsPath);
    const newPost = { id: Date.now(), ...req.body };
    posts.push(newPost);
    saveJSON(postsPath, posts);
    res.status(201).json(newPost);
};

// Retrieve all posts
const getAllPosts = (req, res) => {
    const posts = loadJSON(postsPath);
    res.json(posts);
};

// Get user's posts
const getUserPosts = (req, res) => {
    const posts = loadJSON(postsPath);
    const userPosts = posts.filter(post => post.userId === req.body.userId);
    res.json(userPosts);
};

// Update user's private settings
const updatePrivacySettings = (req, res) => {
    const users = loadJSON(usersPath);
    const user = users.find(u => u.id === req.body.userId);
    if (user) {
        user.privateSetting = req.body.privateSetting;
        saveJSON(usersPath, users);
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Delete a post
const removePost = (req, res) => {
    let posts = loadJSON(postsPath);
    posts = posts.filter(post => post.id !== req.body.id);
    saveJSON(postsPath, posts);
    res.status(204).send();
};

// Add a like to a post
const likePost = (req, res) => {
    const posts = loadJSON(postsPath);
    const post = posts.find(p => p.id === req.body.postId);
    if (post) {
        post.likes = post.likes ? post.likes + 1 : 1;
        saveJSON(postsPath, posts);
        res.status(200).json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
};

// Add a comment to a post
const commentOnPost = (req, res) => {
    const posts = loadJSON(postsPath);
    const post = posts.find(p => p.id === req.body.postId);
    if (post) {
        post.comments = post.comments || [];
        post.comments.push(req.body.comment);
        saveJSON(postsPath, posts);
        res.status(200).json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
};

// Define routes
app.post("/register", registerUser);
app.post("/login", userLogin);
app.post("/users", authenticate, getAllUsers);
app.post("/request", authenticate, createRequest);
app.post("/pending-requests", authenticate, listPendingRequests);
app.post("/approve-request", authenticate, approveRequest);
app.post("/post", authenticate, createPost);
app.post("/posts", authenticate, getAllPosts);
app.post("/user-posts", authenticate, getUserPosts);
app.post("/update-privacy", authenticate, updatePrivacySettings);
app.post("/delete-post", authenticate, removePost);
app.post("/like-post", authenticate, likePost);
app.post("/comment", authenticate, commentOnPost);

// Start the server
app.listen(port, () => {
    console.log("Server is running on port -> " + port);
});
