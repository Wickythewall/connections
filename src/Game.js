// Game.js
import './Game.css';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';

// Box component
const Box = ({ word, handleClick, isSelected, isSolved }) => {
    return (
        <Card
            title={word}
            className={`box ${isSelected ? 'selected' : ''} ${isSolved ? 'solved' : ''}`}
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
        { words: ['Scotty', 'Kuscheln', 'Mais', 'Discounter'], solution: 'Beamer' },
        { words: ['Chef', 'Schwer', 'Kartoffeln', 'Griff'], solution: 'Pfanne' },
        { words: ['Expedition', 'Tragen', 'Berg', 'Riegel'], solution: 'Rucksack' },
        { words: ['Komfort', 'Sitzen', 'Sport', 'Fahren'], solution: 'Radlerhose' }
    ];

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
        setSelectedWords(prevState => ({
            ...prevState,
            [word]: !prevState[word]
        }));
    };

    const [solvedWords, setSolvedWords] = useState([]);

    // Function to create connection
    const createConnection = () => {
    const selectedGroup = Object.keys(selectedWords).filter(word => selectedWords[word]).sort();
    const selectedGroupString = selectedGroup.join('-');

    if (selectedGroup.length === 4 && selectedGroupString in solutions) {
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
    }

    alert('Incorrect selection or solution! Please try again.');
    setSelectedWords({});
};




    // Update the useEffect dependency to track selectedWords changes
    useEffect(() => {
        setIsButtonDisabled(Object.keys(selectedWords).length !== 4);
    }, [selectedWords]);

    return (
        <div className="wrapContainer">
            <div className="game-container">
                <div className="game">
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((word, colIndex) => (
                                <Box
                                    key={`${rowIndex}-${colIndex}`}
                                    word={word}
                                    handleClick={() => !solvedWords.includes(word) && handleWordClick(word)}
                                    isSelected={selectedWords[word]}
                                    isSolved={solvedWords.includes(word)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="button-container">
                <button onClick={createConnection} disabled={isButtonDisabled}>Create Connection</button>
            </div>
            <div className="connections">
                {connections.map((connection, index) => (
                    <Connection key={index} connection={connection.words} solution={connection.solution} />
                ))}
            </div>
        </div>
    );
};

export default Game;
