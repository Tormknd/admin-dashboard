module.exports = {
  apps: [{
    name: "admin-dashboard",
    script: "npm",
    args: "start",
    env: {
      PORT: 8888,
      NODE_ENV: "production"
    }
  }]
}

