import React, { useState, useRef, useEffect } from "react";

const WordleGrid = ({ roomId, user, onWin }) => {
  const numRows = 6;
  const numCols = 5;
  const finalword = "LIKES";

  const [grid, setGrid] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  const [colorGrid, setColorGrid] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  const [disabled, setDisabled] = useState(false);
  const [winner, setWinner] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, numRows * numCols);
  }, []);

  useEffect(() => {
    setDisabled(!!winner);
  }, [winner]);

  const handleChange = (row, col, value) => {
    if (disabled) return;
    if (value.length > 1) return;

    const newGrid = [...grid];
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    if (value && col < numCols - 1) {
      const nextIndex = row * numCols + col + 1;
      inputRefs.current[nextIndex]?.focus();
    }

    const isRowFilled = newGrid[row].every((cell) => cell !== "");
    if (isRowFilled) {
      const word = newGrid[row].join("");

      fetch(`https://api.datamuse.com/words?sp=${word.toLowerCase()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0 && data[0].word.toUpperCase() === word) {
            const newColorRow = Array(numCols).fill("gray");
            const finalWordArr = finalword.split("");

            const matched = Array(numCols).fill(false);
            for (let i = 0; i < numCols; i++) {
              if (newGrid[row][i] === finalword[i]) {
                newColorRow[i] = "green";
                matched[i] = true;
                finalWordArr[i] = null;
              }
            }

            for (let i = 0; i < numCols; i++) {
              if (newColorRow[i] !== "green") {
                const letterIndex = finalWordArr.indexOf(newGrid[row][i]);
                if (letterIndex !== -1) {
                  newColorRow[i] = "yellow";
                  finalWordArr[letterIndex] = null;
                }
              }
            }

            const newColorGrid = [...colorGrid];
            newColorGrid[row] = newColorRow;
            setColorGrid(newColorGrid);

            if (newColorRow.every(c => c === 'green')) {
              setDisabled(true);
              setWinner(user?.email || 'A player');
              if (onWin && !winner) onWin();
            }

            alert(`✅ "${word}" is a valid word!`);
          } else {
            alert(`❌ "${word}" is not a valid word.`);
          }
        });
    }
  };

  const handleKeyDown = (e, row, col) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newGrid = [...grid];
      if (grid[row][col] !== "") {
        newGrid[row][col] = "";
        setGrid(newGrid);
      } else if (col > 0) {
        const prevIndex = row * numCols + col - 1;
        inputRefs.current[prevIndex]?.focus();
        newGrid[row][col - 1] = "";
        setGrid(newGrid);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (col < numCols - 1) {
        const nextIndex = row * numCols + col + 1;
        inputRefs.current[nextIndex]?.focus();
      } else if (row < numRows - 1) {
        const nextIndex = (row + 1) * numCols;
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  return (
    <div className="grid-container">
      {winner && (
        <div style={{marginTop: 24, fontWeight: 700, fontSize: 20, color: '#d32f2f'}}>
          {winner} won the game!
        </div>
      )}
      {grid.map((rowArr, rowIndex) => (
        <div className="grid-row" key={rowIndex}>
          {rowArr.map((cell, colIndex) => {
            const inputIndex = rowIndex * numCols + colIndex;
            const bgColor = colorGrid[rowIndex][colIndex];
            return (
              <input
                key={inputIndex}
                ref={(el) => (inputRefs.current[inputIndex] = el)}
                className={`grid-cell${bgColor ? ` cell-${bgColor}` : ""}${bgColor === "green" ? " cell-green-animate" : ""}`}
                type="text"
                maxLength="1"
                value={grid[rowIndex][colIndex]}
                onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                disabled={disabled}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WordleGrid;
