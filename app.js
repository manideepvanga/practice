const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http:/localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

//
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");
const format = require("date-fns/format");

const checkRequest = async (request, response, next) => {
  const { todo, category, priority, status, search_q, date } = request.query;
  if (category !== undefined) {
    const categoryarray = ["WORK", "HOME", "LEARNING"];
    const check = categoryarray.includes(category);
    if (check === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (priority !== undefined) {
    const priorityarray = ["HIGH", "LOW", "MEDIUM"];
    const check = priorityarray.includes(priority);
    if (check === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (status !== undefined) {
    const statusarray = ["TO DO", "DONE", "IN PROGRESS"];
    const check = statusarray.includes(status);
    if (check === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo status");
    }
  }
  if (date !== undefined) {
    try {
      const mydate = new Date(date);
      const formatDate = format(mydate, "yyyy-MM-dd");
      console.log(formatDate);
      const result = toDate(
        new Date(
          `${mydate.getFullYear()}-${mydate.getMonth() + 1}-${mydate.getDate()}`
        )
      );

      const isvaliddate = await isValid(result);
      if (isValid === true) {
        request.date = formatDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
  next();
  request.search_q = search_q;
}; //end fun

app.get("/todos/", checkRequest, async (request, response) => {
  const { status = "", search_q = "", priority = "", category = "" } = request;
  console.log(status, search_q, priority, category);
  const getTodosQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo
        WHERE 
        todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;

  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});
