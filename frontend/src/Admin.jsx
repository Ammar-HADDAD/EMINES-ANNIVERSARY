import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Results.css";
const Admin = () => {
  const [key, setKey] = useState("");
  const [club, setClub] = useState(null);
  const [teams, setTeams] = useState(null);

  const threshold = 5;

  console.log(teams);
  useEffect(() => {
    Swal.fire({
      title: "Enter your code",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Enter",
      showLoaderOnConfirm: true,
      preConfirm: async (key) => {
        try {
          const response = await axios.post(
            "http://localhost:3000/login",
            { key },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const { data } = await response;
          if (data) {
            setKey(key);
            console.log(data);
            setClub(data);
          }
        } catch (error) {
          Swal.showValidationMessage(`
                  Request failed: ${error}
                `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }, []);

  useEffect(() => {
    async function getTeams() {
      const { data } = await axios.post(
        "http://localhost:3000/admin/teams",
        { key },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setTeams(data);
    }

    getTeams();
  }, [club, key]);
  async function updateScore(team, value) {
    const { data } = await axios.post(
      "http://localhost:3000/admin/update",
      { key, team: team.id, club: club.id, value },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (data) {
      console.log(data);
      setTeams((prevTeams) => {
        const updatedTeams = prevTeams.map((t) => {
          if (t.id === team.id) {
            return {
              ...t,
              score: Math.max(Math.min(t.score + value, threshold - 1), 0),
            };
          }
          return t;
        });
        return updatedTeams;
      });
    }
  }

  return (
    <>
      {teams && (
        <div className="table-wrapper">
          <h3>Club : {club?.stand}</h3>
          <table className="fl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Team</th>
                <th>Score</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index}>
                  <td>{team.id}</td>
                  <td>{team.name}</td>
                  <td>{team.score}</td>
                  <td>
                    <button onClick={() => updateScore(team, -1)}>
                      -1 point
                    </button>
                  </td>
                  <td>
                    <button onClick={() => updateScore(team, 1)}>
                      +1 point
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Admin;
