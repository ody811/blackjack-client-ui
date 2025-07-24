import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://blackjack-api-l0ne.onrender.com");

function getCardImg(card) {
  return `/cards/${card}.png`;
}

export default function App() {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    socket.on("update", (data) => setGameState(data));
  }, []);

  const createGame = () => {
    socket.emit("create_game", { playerName }, ({ gameId, gameState }) => {
      setGameId(gameId);
      setGameState(gameState);
      setJoined(true);
    });
  };

  const joinGame = () => {
    socket.emit("join_game", { gameId, playerName }, ({ gameState }) => {
      setGameState(gameState);
      setJoined(true);
    });
  };

  const sendMove = (move) => {
    socket.emit("move", { gameId, move }, ({ gameState }) => setGameState(gameState));
  };

  if (!joined) {
    return (
      <div className="lobby">
        <h1>🃏 Blackjack</h1>
        <input placeholder="Ditt namn" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        <button onClick={createGame}>🎲 Skapa spel</button>
        <input placeholder="Spel-ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
        <button onClick={joinGame}>🔗 Gå med i spel</button>
      </div>
    );
  }

  return (
    <div className="table">
      <h2>Spel-ID: {gameId}</h2>
      <div className="dealer">
        <h3>Dealer</h3>
        <div className="cards">
          {gameState?.dealer.hand.map((card, i) => (
            <img src={getCardImg(card)} className="card" key={i} alt={card} />
          ))}
        </div>
      </div>

      <div className="players">
        {gameState?.players.map((p) => (
          <div className="player" key={p.socketId}>
            <h4>{p.name}</h4>
            <div className="cards">
              {p.hand.map((card, i) => (
                <img src={getCardImg(card)} className="card" key={i} alt={card} />
              ))}
            </div>
            <div className="chips">💰 {p.bet}</div>
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={() => sendMove("hit")}>Hit</button>
        <button onClick={() => sendMove("stand")}>Stand</button>
        <button onClick={() => sendMove("double")}>Double</button>
        <button onClick={() => sendMove("split")}>Split</button>
      </div>
    </div>
  );
}