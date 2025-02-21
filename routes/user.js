const express = require("express");
const { ObjectId } = require("mongodb");
// const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const userCollection = db.collection("userCollection");

  // Add user
  router.post("/add-user-data", async (req, res) => {
    try {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //add google auth user data
  router.post("/add-google-user-data", async (req, res) => {
    try {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ success: true });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //get all users
  router.get("/get-all-users", async (req, res) => {
    try {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    } catch (error) {
      res.status(500).send({ error: "Failed to get users" });
    }
  });

  //get single user by email
  router.get("/get-user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };

      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: "Failed to get user" });
    }
  });

  //-------------------post task----------------
  router.post("/post-task/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const newTask = Array.isArray(req.body.task)
        ? req.body.task
        : [req.body.task];
      const update = {
        $set: {
          task: user && user.task ? [...user.task, ...newTask] : newTask,
        },
      };
      const result = await userCollection.updateOne(query, update, {
        upsert: true,
      });
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to update task" });
    }
  });

  //------------------get task-------------------
  router.get("/get-task/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user.task);
    } catch (error) {
      res.status(500).send({ error: "Failed to get task" });
    }
  });

  // Edit task
  router.patch("/edit-task/:email/:taskId", async (req, res) => {
    try {
      const { email, taskId } = req.params; // Extract email and taskId from params
      const updatedTaskData = req.body; // Get updated task data from the request body

      // Convert taskId to number since it's stored as a number in the database
      const taskIdNum = Number(taskId);

      // Find the user with the given email
      const query = { email };
      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Update the specific task in the task array
      const updatedTasks = user.task.map((task) => {
        if (task.taskId === taskIdNum) {
          // Ensure type matches
          return { ...task, ...updatedTaskData }; // Merge updated task data
        }
        return task;
      });

      // Update the user document in the database
      const update = { $set: { task: updatedTasks } };
      const result = await userCollection.updateOne(query, update);

      if (result.modifiedCount === 0) {
        return res.status(400).send({ error: "Failed to update task" });
      }

      res.send({ message: "Task updated successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Delete task
  router.delete("/delete-task/:email/:taskId", async (req, res) => {
    try {
      const { email, taskId } = req.params; // Extract email and taskId from params
      //convert task id to number
      const taskIdNum = Number(taskId);

      // Find the user by email
      const query = { email };
      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Filter out the task with the given taskId
      const updatedTasks = user.task.filter(
        (task) => task.taskId !== taskIdNum
      );

      if (updatedTasks.length === user.task.length) {
        return res.status(404).send({ error: "task not found" });
      }

      // Update the user's task array in the database
      const update = { $set: { task: updatedTasks } };
      const result = await userCollection.updateOne(query, update);

      if (result.modifiedCount === 0) {
        return res.status(400).send({ error: "Failed to delete task" });
      }

      res.send({ message: "task deleted successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  });

  return router;
};
