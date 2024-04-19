const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

const threshold = 5;
let { codes } = require("./config/codes");
const ini_teams = JSON.parse(fs.readFileSync("./config/teams.json", "utf8"));
const ini_clubs = JSON.parse(fs.readFileSync("./config/clubs.json", "utf8"));

const readScores = () => {
  let Data;
  try {
    Data = JSON.parse(fs.readFileSync("scores.json", "utf8"));
  } catch (error) {
    Data = [];
  }
  return Data;
};

const initializeScores = () => {
  const Data = readScores();
  if (Data.length === 0) {
    const scores = [];
    for (let j = 0; j < ini_clubs.length; j++) {
      scores.push({ id: j + 1, stand: ini_clubs[j], score: 0 });
    }

    const teams = [];

    for (let i = 0; i < ini_teams.length; i++) {
      const team = {
        id: i + 1,
        name: ini_teams[i],
        scores,
        level: 0,
      };
      teams.push(team);
    }

    fs.writeFileSync("scores.json", JSON.stringify(teams));
    console.log("Scores initiated");
  } else {
    console.log("Already initiated");
  }
};
let teams = readScores();
let selectedTeam = false;

async function initialize() {
  initializeScores();
  for (let i = 0; i < codes.length; i++) {
    try {
      const pythonProcess = spawn("python", [codes[i].path]);
      pythonProcess.stdout.on("data", (data) => {
        codes[i].output = data.toString().trim();
        console.log("Code", i, " successfull");
      });
      pythonProcess.stderr.on("data", (data) => {
        throw Error('"Error executing base codes"');
      });
    } catch (error) {
      console.log(error);
    }
  }
}

const getClub = (key) => {
  const Data = readScores();
  const clubIndex = Data[0].scores.findIndex(
    (obj) => CryptoJS.MD5(obj.stand + obj.id).toString() === key
  );

  if (clubIndex !== -1) {
    const { id, stand } = Data[0].scores[clubIndex];
    return { id, stand };
  } else {
    return false;
  }
};
initialize().then(() => {
  app.get("/", (req, res) => {
    res.send(codes.map(({ level, broken }) => ({ level, code: broken })));
  });

  app.post("/select", (req, res) => {
    const { selected } = req.body || false;
    selectedTeam = selected;
    res.send(selected);
  });

  app.post("/login", (req, res) => {
    const { key } = req.body;
    const club = getClub(key);
    if (club) {
      res.send(club);
    } else {
      res.status(401).send("Invalid key");
    }
  });

  app.get("/team", (req, res) => {
    if (selectedTeam) {
      res.send(teams[selectedTeam - 1]);
    } else {
      res.send(false);
    }
  });

  app.post("/admin/update", (req, res) => {
    const { key, club, team, value } = req.body;
    const clubData = getClub(key);
    if (clubData && clubData.id === club) {
      let Data = readScores();

      const prevVal = Data[team - 1].scores[club - 1].score;
      if (prevVal + value < threshold) {
        Data[team - 1].scores[club - 1].score = Math.max(0, prevVal + value);
        fs.writeFileSync("scores.json", JSON.stringify(Data));
      }
      res.send(Data);
    } else {
      res.send(false);
    }
  });

  app.post("/admin/teams", (req, res) => {
    const { key } = req.body || "";
    const club = getClub(key);
    if (club) {
      let Data = readScores();
      for (let i = 0; i < Data.length; i++) {
        const clubIndex = Data[i].scores.findIndex(
          (obj) => obj.stand === club.stand
        );
        Data[i].score = Data[i].scores[clubIndex].score;

        Data[i] = { id: Data[i].id, name: Data[i].name, score: Data[i].score };
      }
      res.send(Data);
    } else {
      res.send(false);
    }
  });
  app.get("/teams", (req, res) => {
    res.send({ selectedTeam, teams });
  });
  app.post("/execute-python", (req, res) => {
    let stderrData = "";
    let stdoutData = "";
    try {
      const { code, team } = req.body;

      fs.writeFileSync("codes/tmpCode.py", code.toString());
      const pythonProcess = spawn("python", ["codes/tmpCode.py"]);
      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (stderrData) {
          res.send(false);
        } else {
          if (stdoutData.trim() === codes[team.level].output) {
            const targetTeam = teams.findIndex((obj) => obj.id === team.id);
            const targetClub = teams[targetTeam].scores.findIndex(
              (obj) => obj.stand === "E++"
            );
            if (team.level < threshold) {
              teams[targetTeam].level += 1;
              teams[targetTeam].scores[targetClub].score += 1;
            }

            fs.writeFileSync("scores.json", JSON.stringify(teams));
            res.send(teams[targetTeam]);
          } else {
            res.send(false);
          }
        }
      });
    } catch (error) {
      res.status(500).send(false);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
