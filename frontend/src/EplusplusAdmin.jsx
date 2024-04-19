import axios from "axios";
import { useEffect, useState } from "react";

const EplusplusAdmin = () => {
  const [selected, setSelected] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function getData() {
      const { data } = await axios.get("http://localhost:3000/teams");

      setTeams(data.teams);
      setSelected(data.selectedTeam);
    }

    getData();
  }, []);
  console.log(selected);

  async function setSelectedTeam(selected) {
    const response = await axios.post(
      "http://localhost:3000/select",
      { selected },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response;

    setSelected(data);
  }
  async function handleSelectChange(e) {
    setSelectedTeam(e.target.value);
  }

  async function handleUnselect() {
    setSelectedTeam(false);
  }
  return (
    <div className="admin">
      {selected ? (
        <>
          <h3 className="score">Selected team {teams[selected - 1].name}</h3>
          <button onClick={handleUnselect}>Unselect</button>
        </>
      ) : (
        <>
          <select value={selected} onChange={handleSelectChange}>
            <option value="">-- Select a team --</option>
            {teams.map((team, index) => (
              <option key={index} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default EplusplusAdmin;
