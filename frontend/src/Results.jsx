import { useEffect, useState } from "react";
import "./Results.css";
import axios from "axios";
const Results = () => {
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    async function getTeams() {
      try {
        const { data } = await axios.get("http://localhost:3000/teams");
        if (data) {
          let Data = data.teams;
          for (let i = 0; i < Data.length; i++) {
            let score = 0;
            for (let j = 0; j < Data[i].scores.length; j++) {
              score += Data[i].scores[j].score;
            }
            Data[i].score = score;
            Data[i] = { name: Data[i].name, score: Data[i].score };
          }
          const sorted = Data.sort((a, b) => b.score - a.score);
          setTeams(sorted);
        }
      } catch (error) {
        console.error("Error fetching teams data:", error);
      }
    }

    getTeams();

    const intervalId = setInterval(getTeams, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {teams && (
        <div className="table-wrapper">
          <table className="fl-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index}>
                  <td>{team.name}</td>
                  <td>{team.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Results;
