require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const {JWT_SECRET} = require('../keys');
const mysql = require("mysql");
const uuid = require("uuid");
const e = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

const pool = mysql.createPool({
  host: "localhost",
  user: "mnz",
  password: "6969",
  database: "nodejs",
});

/**
 *
 * @param {Object} user -
 *  Object to be signed with the
 *  access token.
 * @param {string} user.name -
 *  Name of the user.
 * @returns {string} -
 *  Newly signed access token.
 */
const createToken = (user) => {
  //Change expiry to a longer period after testing
  return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "10s" });
};

/**
 *
 * @param {e.Request} req -
 *  Contains the access token to validate.
 * @param {e.Response} res -
 *  Send response.
 * @param {e.NextFunction} next -
 *  Continue after validation.
 * @returns
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus("401");
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus("403");
    req.user = user;
    next();
  });
};

/**
 * /watchlist:
 *   post:
 *     summary: Retrieve the watchlist of the user.
 *     requestHeader:
 *       required: true
 *       content:
 *         name: Authorization
 *         value: Bearer $accessToken
 *     responses:
 *       200:
 *         description: Respond with the watchlist.
 *         content:
 *           html/text:
 *              type: string
 *              example: "BIDU,GOOG"
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
app.post("/watchlist", authenticateToken, (req, res) => {
  pool.getConnection(async (err, connection) => {
    connection.query(
      `SELECT watchlist FROM users WHERE username='${req.user.name}'`,
      (err, rows) => {
        if (err) {
          console.warn(err);
          res.send("Database operation failed");
        } else {
          const result = rows[0].watchlist;
          res.send(result);
        }
      }
    );
    connection.release();
  });
});

/**
 * /updateWatchlist:
 *   post:
 *     summary: Update the watchlist stored in the database.
 *    requestHeader:
 *       required: true
 *       content:
 *         name: Authorization
 *         value: Bearer $accessToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               watchlist:
 *                 type: string
 *                 description: Watchlist sent by the user.
 *                 example: "BIDU,GOOG"
 *     responses:
 *       200:
 *         description: Result of signup request.
 *         content:
 *           html/text:
 *              type: string
 *              example: Success
 */
app.post("/updateWatchlist", authenticateToken, (req, res) => {
  // console.log(req.body);
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
    }
    if (req.body?.watchlist == undefined) {
      res.send("No watchlist provided");
    } else {
      connection.query(
        `UPDATE users SET watchlist = '${req.body.watchlist}' WHERE username = '${req.user.name}'`,
        (err, rows) => {
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
            return;
          } else res.send("Success");
        }
      );
    }
    connection.release();
  });
});

/**
 * /signup:
 *   post:
 *     summary: Add a new user to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's name.
 *                 example: pizza@localhost.com
 *               password:
 *                 type: string
 *                 description: The user' password.
 *                 example: we128!@3u!jds
 *     responses:
 *       200:
 *         description: Result of signup request.
 *         content:
 *           html/text:
 *              type: string
 *              example: Success | Duplicate
 */
app.post("/signup", (req, res) => {
  console.log(req.body);
  pool.getConnection(async (err, connection) => {
    if (err) {
      res.send("Connection failed");
    }
    const { username, password } = req.body;
    if (username == undefined) {
      res.send("No username provided");
    } else if (password == undefined) {
      res.send("No password provided");
    } else {
      connection.query(
        `SELECT count(*) AS taken FROM users WHERE username = '${username}'`,
        async (err, rows) => {
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
          } else {
            if (rows[0].taken) {
              res.send("Duplicate");
              return;
            } else {
              // console.log(req.body);
              const newId = uuid.v4().slice(0, 8);
              const encryptedPass = await bcrypt.hash(req.body.password, 10);
              connection.query(
                `INSERT INTO users(id, username, password) VALUES('${newId}', '${req.body.username}', '${encryptedPass}')`,
                (err, rows) => {
                  if (err) {
                    console.warn(err);
                    res.send("Database operation failed");
                  } else res.send("Success");
                }
              );
            }
          }
        }
      );
    }
    connection.release();
  });
});

/**
 * /login:
 *   post:
 *     summary: Log in to an existing account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's name.
 *                 example: pizza@localhost.com
 *               password:
 *                 type: string
 *                 description: The user' password.
 *                 example: we128!@3u!jds
 *     responses:
 *       200:
 *         description: Result of login request.
 *         content:
 *           application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: New access token.
 *               RefreshToken:
 *                 type: string
 *                 description: New refresh token.
 *       401:
 *         description: Unauthorized.
 */
app.post("/login", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      res.send("Connection failed");
    }
    const { username, password } = req.body;
    if (username == undefined) {
      res.send("No username provided");
    } else if (password == undefined) {
      res.send("No password provided");
    } else {
      connection.query(
        `SELECT password FROM users WHERE username='${username}'`,
        (err, response) => {
          // console.log(req.body);
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
          } else if (response[0] == undefined) {
            res.sendStatus("401");
            return;
          } else {
            // console.log(typeof response[0].password);
            hashedPass = response[0].password;
            bcrypt
              .compare(password, hashedPass)
              .then((doMatch) => {
                if (doMatch) {
                  // res.json({message:"SignIn successfull"})
                  const user = { name: username };
                  const accessToken = createToken(user);
                  const refreshToken = jwt.sign(
                    user,
                    process.env.REFRESH_TOKEN,
                    { expiresIn: "30d" }
                  );
                  //Invalidate refresh token in one month
                  connection.query(
                    `UPDATE users SET refreshToken = '${refreshToken}' WHERE username = '${username}'`,
                    (err, row) => {
                      if (err) {
                        console.warn(err);
                        res.send("Database operation failed");
                      }
                    }
                  );
                  // console.log(token);
                  // const {_id,name,email,role} = savedUser
                  res.send({
                    username: user.name,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                  });
                } else {
                  res.sendStatus("401");
                }
              })
              .catch((err) => {
                console.warn(err);
              });
          }
        }
      );
    }
    connection.release();
  });
});

/**
 * /refreshToken:
 *   post:
 *     summary: Create new access token for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token of the user.
 *     responses:
 *       200:
 *         description: Respond with the new access token.
 *         content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: New access token.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
app.post("/refreshToken", (req, res) => {
  // console.log(req.body);
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
    } else {
      const refreshToken = req.body.token;
      if (refreshToken == null) res.sendStatus("401");
      else {
        connection.query(
          `SELECT count(*) AS valid from users WHERE refreshToken = '${refreshToken}'`,
          (err, rows) => {
            if (err) {
              console.warn(err);
              res.send("Database operation failed");
            }
            console.log(rows);
            if (!rows[0].valid) {
              res.sendStatus("403");
            } else {
              jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN,
                (err, user) => {
                  if (err) res.sendStatus("403");
                  else {
                    const accessToken = createToken(
                      { name: user.name },
                      process.env.ACCESS_TOKEN
                    );
                    res.json({ accessToken: accessToken });
                  }
                }
              );
            }
          }
        );
      }
    }
    connection.release();
  });
});

/**
 * /logout:
 *   post:
 *     summary: Delete user's refresh token from the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token of the user.
 *     responses:
 *       204:
 *         description: Respond with success or failure.
 *         content:
 *           html/text:
 *              type: string
 */
app.delete("/logout", (req, res) => {
  // console.log(req.body);
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
    } else {
      connection.query(
        `UPDATE users SET refreshToken = NULL WHERE refreshToken = '${req.body.token}'`,
        (err, rows) => {
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
          } else res.send("204");
        }
      );
    }
    connection.release();
  });
});

/************************TEST-AREA********************/
app.get("/", (req, res) => {
  console.log("fetch req");
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
      return;
    }
    connection.query("SELECT * from users", (err, rows) => {
      // console.log(rows);
      if (err) {
        console.warn(err);
        res.send("Database operation failed");
        return;
      } else res.send(rows);
    });
    connection.release();
  });
});

app.get("/games", async (req, res) => {
  const clientID = "94rki842n43yqh0lxkuzomhw7d8onn";
  const accessToken = "lzz8ubusq9t6nu2wjw20thbk44d8r7";
  const url = "https://api.igdb.com/v4/games";
  try {
    console.log(req.body.name);
    const response = await fetch(url, {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        // "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": clientID,
        "Access-Control-Allow-Origin": "*",
      }),
      body: `fields name;
      limit 10;
      search "${req.body.name}";`,
    });
    const result = await response.json();
    console.log(result);
  } catch (e) {
    console.log(e);
  }
});

app.post("/drop", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
      return;
    }
    connection.query("DELETE FROM users", (err, rows) => {
      if (err) {
        console.warn(err);
        res.send("Database operation failed");
        return;
      } else res.send("Success");
    });
    connection.release();
  });
});

app.post("/update", (req, res) => {
  // console.log(req.body);
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
    }
    if (req.body?.username == undefined) {
      res.send("No username provided");
    } else if (
      req.body?.watchlist == undefined ||
      req.body?.watchlist?.length == 0
    ) {
      res.send("No watchlist provided");
    } else {
      connection.query(
        `UPDATE users SET watchlist = '${req.body.watchlist}' WHERE username = '${req.body.username}'`,
        (err, rows) => {
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
            return;
          } else res.send("Success");
        }
      );
    }
    connection.release();
  });
});

app.post("/details", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.warn(err);
      res.send("Connection failed");
      return;
    }
    if (req.body?.username !== undefined) {
      connection.query(
        `SELECT * from users WHERE username = '${req.body.username}'`,
        (err, rows) => {
          if (err) {
            console.warn(err);
            res.send("Database operation failed");
          } else res.send("Success");
        }
      );
    } else {
      res.send("No username provided");
    }
    connection.release();
  });
});

/*****************************************************/

// connection.connect((err) => {
//     if (err) console.log(err);
//     else console.log('Connected to MySQL Server!');
// });

// app.post("/", (req,res) => {
//     //res.send(JSON.stringify(req.body));
//     pool.getConnection((err, connection) => {
//         if(err) return;
//         connection.query('SELECT * from users', (err, rows) => {
//             if (err) res.send(err);
//             else res.send(rows);
//         });
//     });
// });

// app.put("/insert",(req, res) => {
//     pool.getConnection((err, connection) => {
//         if(err) return;
//         if(req.body?.username !== undefined && req.body?.newUsername !== undefined){
//             connection.query(`UPDATE users SET username = '${req.body.newUsername}' WHERE username = '${req.body.username}'`, (err, rows) => {
//                 if (err) res.send(err);
//                 else res.send(rows);
//             });
//         } else {
//             res.send("No username provided");
//         }
//     });
// });

// app.get("/insert",(req,res) => {
//     pool.getConnection((err, connection) => {
//         if(err) return;
//         req.query.username !== undefined &&
//         connection.query(`INSERT INTO users(username) VALUES('${req.query.username}')`, (err, rows) => {
//             if (err) res.send(err);
//             else res.send(rows);
//         });
//     });
// });

// app.get("/drop",(req,res) => {
//     pool.getConnection((err, connection) => {
//         if(err) return;
//         connection.query("DELETE FROM users",(err, rows) => {
//             if (err) res.send(err);
//             else res.send(rows);
//         });
//     });
// });
