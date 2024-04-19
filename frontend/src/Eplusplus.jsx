import { useEffect, useRef, useState } from "react";
import CodeFlask from "codeflask";
import Swal from "sweetalert2";
import axios from "axios";
import Prism from "prismjs";
import { FaStar } from "react-icons/fa";
import "./App.css";
import "@fontsource/montserrat";

const Eplusplus = () => {
  const [team, setTeam] = useState(false);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState(null);
  const [isloading, setIsLoading] = useState(true);

  const editorRef = useRef(null);
  useEffect(() => {
    async function getData() {
      const { data } = await axios.get("http://localhost:3000/team");
      setTeam(data);
      const response = await axios.get("http://localhost:3000/");
      setCodes(response?.data);
    }

    getData();
  }, []);

  useEffect(() => {
    if (team && codes && team.level < 5) {
      const level_Code = codes[team.level].code;
      setCode(level_Code);
      iniFlask(level_Code);
    }
    setIsLoading(false);
  }, [team, codes]);

  const iniFlask = (level_Code) => {
    const flask = new CodeFlask(editorRef.current, {
      language: "js",
    });
    flask.addLanguage("python", Prism.languages["python"]);
    flask.updateCode(level_Code);
    flask.onUpdate((code) => {
      setCode(code);
    });
  };

  const executePython = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/execute-python",
        { code, team },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // Timeout after 5 seconds (adjust as needed)
        }
      );
      const { data } = await response;
      if (data) {
        setTeam(data);
        return {
          success: true,
          header: "Correct!",
          content: "Your team just earned 1 point",
        };
      } else {
        throw Error;
      }
    } catch (error) {
      return {
        success: false,
        header: "Oops!",
        content: "It seems there's a mistake in your code, please try again.",
      };
    }
  };

  async function handleRun() {
    setIsLoading(true);
    const { success, header, content } = await executePython();
    setIsLoading(false);
    Swal.fire({
      icon: success ? "success" : "error",
      title: header,
      text: content,
      confirmButtonColor: "#0070f3",
    });
  }

  return (
    <>
      <div className="overlay" style={{ display: isloading ? "" : "none" }}>
        <div className="loader"></div>
      </div>

      {team ? (
        <div>
          {team.level < 5 ? (
            <>
              <h3 className="team">{team.name}</h3>
              <h3 className="score">Score : {team.level * 20}%</h3>
              <div className="container">
                <header className="code-header">
                  <span>
                    {"LEVEL "}
                    {Array.from({ length: team.level + 1 }, (_, index) => (
                      <FaStar key={index} />
                    ))}
                  </span>
                  <button className="code-btn" onClick={handleRun}>
                    Run
                  </button>
                </header>

                <div ref={editorRef} className="code-editor" />
              </div>
            </>
          ) : (
            <div className="team-alert">Challenge completed!</div>
          )}
        </div>
      ) : (
        <div className="team-alert">
          Please ask one of the board members to initiate the challenge!
        </div>
      )}
    </>
  );
};

export default Eplusplus;
