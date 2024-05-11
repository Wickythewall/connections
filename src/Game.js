// Game.js
import './Game.css';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';

// Box component
const Box = ({ word, handleClick, isSelected, isSolved, isSolution }) => {
    return (
        <Card
            title={word}
            className={`box ${isSelected ? 'selected' : ''} ${isSolved ? 'solved' : ''} ${isSolution ? 'solution' : ''}`}
            onClick={handleClick}
            style={{ pointerEvents: isSolved ? 'none' : 'auto' }} // Prevent interaction if solved
        />
    );
};


// Connection component
const Connection = ({ connection, solution }) => {
    return (
        <div className="connection">
            {connection.map((word, index) => (
                <span key={index}>{word}</span>
            ))}
            <span>Solution: {solution}</span>
        </div>
    );
};

// Game component
const Game = () => {
    // Define the correct groups of words and their solutions
    const correctGroups = [
        { words: ['Scotty', 'Kuscheln', 'Mais', 'Discounter'], solution: 'STERNE' },
        { words: ['Chef', 'Hothothot', 'Kartoffel', 'Griff'], solution: 'BOGEN' },
        { words: ['Expedition', 'Rexroth', 'Berg', 'Fell'], solution: 'BALLON' },
        { words: ['Komfort', 'Sitzen', 'Urlaub', 'Treten'], solution: 'WEIHNACHTEN' }
    ];
    const [lives, setLives] = useState(4);

    // Initialize state for tracking selected words, connections, and solution
    const [grid, setGrid] = useState([]);
    const [selectedWords, setSelectedWords] = useState({});
    const [connections, setConnections] = useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [solutions, setSolutions] = useState({});

    // Utility function to shuffle an array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    };

    // Function to initialize the game
    const initializeGame = () => {
        // Flatten all words and shuffle
        const allWords = shuffleArray(correctGroups.flatMap(group => group.words));
        const newGrid = [];
        while (allWords.length) newGrid.push(allWords.splice(0, 4)); // Assuming a grid of width 4

        const newSolutions = correctGroups.reduce((acc, group) => {
            acc[group.words.sort().join('-')] = group.solution;
            return acc;
        }, {});

        setGrid(newGrid);
        setSelectedWords({});
        setConnections([]);
        setIsButtonDisabled(true);
        setSolutions(newSolutions);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    // Function to handle word selection
    const handleWordClick = (word) => {
        setSelectedWords(prevState => {
            const newState = { ...prevState };
            if (newState[word]) {
                delete newState[word];  // Remove the word from the state entirely if deselected
            } else {
                newState[word] = true;  // Add the word with true if selected
            }
            return newState;
        });
    };



    const [solvedWords, setSolvedWords] = useState([]);

    // Function to create connection
    const createConnection = () => {
        const selectedGroup = Object.keys(selectedWords).filter(word => selectedWords[word]).sort();
        const selectedGroupString = selectedGroup.join('-');

        if (selectedGroup.length === 4) {
            const matchCount = countMatches(selectedGroup);
            if (matchCount == 4) {
                const newConnections = [...connections, { words: selectedGroup, solution: solutions[selectedGroupString] }];
                setConnections(newConnections);

                const newSolvedWords = [...solvedWords, ...selectedGroup];
                setSolvedWords(newSolvedWords);

                // Remove solved words from the grid and shuffle the remaining
                let remainingWords = grid.flat().filter(word => !newSolvedWords.includes(word));
                remainingWords = shuffleArray(remainingWords);

                // Create new grid with solved words at the top
                const newGrid = [];
                newConnections.forEach(connection => {
                    newGrid.push(connection.words); // Add each connection as a new row
                });

                // Fill in the rest of the grid with remaining words
                while (remainingWords.length) {
                    newGrid.push(remainingWords.splice(0, 4));
                }

                // Ensure the grid always has exactly 4 rows, filling with empty arrays if necessary
                while (newGrid.length < 4) {
                    newGrid.push(Array(4).fill('')); // Use empty strings to fill missing spots
                }

                setGrid(newGrid);
                setSelectedWords({}); // Clear selected words
                return;

            } else {

                if (lives > 1) {
                    setLives(lives - 1);
                } else {
                    alert('Oooohhh leider verloren. Mit nem Refresh kannst du es nochmal versuchen...');
                    return;
                }
                if (matchCount === 3) {
                    alert("Ganz knapp! Drei passen zusammen!");
                }
            }
        }

        alert('Leider faaaalsch, versuch es doch noch ein Mal! :*');
        setSelectedWords({});
    };

    function countMatches(selectedGroup) {
        let maxMatch = 0;
        correctGroups.forEach(group => {
            const matches = group.words.filter(word => selectedGroup.includes(word)).length;
            if (matches > maxMatch) maxMatch = matches;
        });
        return maxMatch;
    }

    // Update the useEffect dependency to track selectedWords changes
    useEffect(() => {
        setIsButtonDisabled(Object.keys(selectedWords).length !== 4);
        console.log(Object.keys(selectedWords).length);
    }, [selectedWords]);

    return (
        <div className="wrapContainer"><div className="game">
    {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
            {solvedWords.includes(row[0]) ? ( // Check if the first word of the row is in solvedWords
                <Box
                    word={connections.find(conn => conn.words.sort().join('-') === row.sort().join('-')).solution}
                    isSolution={true}
                    key={rowIndex}
                />
            ) : (
                row.map((word, colIndex) => (
                    <Box
                        key={`${rowIndex}-${colIndex}`}
                        word={word}
                        handleClick={() => !solvedWords.includes(word) && handleWordClick(word)}
                        isSelected={selectedWords[word]}
                        isSolved={solvedWords.includes(word)}
                    />
                ))
            )}
        </div>
    ))}
</div>
            <div className="lives-container">
                {Array.from({ length: lives }, (_, i) => <div key={i} className="life" />)}
            </div>


            <div className="button-container">
                <button onClick={createConnection} disabled={isButtonDisabled}>EINLOGGEN</button>
            </div>
        </div>
    );
};

export default Game;
