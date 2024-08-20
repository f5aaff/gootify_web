import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Container } from '@mui/material';

function Search({ intervalTime = 1000 }) { // Added intervalTime as a prop with a default of 1000ms
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const fetchSearchResults = () => {
        if (query.trim() === '') return;

        fetch(`http://localhost:3000/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => setResults(data.results || []))
            .catch(error => console.error('Error fetching search results:', error));
    };

    useEffect(() => {
        if (query.trim() !== '') {
            fetchSearchResults(); // Fetch results when the component mounts and query is not empty

            const intervalId = setInterval(() => {
                fetchSearchResults();
            }, intervalTime);

            return () => clearInterval(intervalId); // Clean up the interval on unmount
        }
    }, [query, intervalTime]);

    const handleSearch = () => {
        fetchSearchResults();
    };

    const handleAddToQueue = (result) => {
        fetch('http://localhost:3000/player/queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add to queue');
                }
                console.log('Song added to queue');
            })
            .catch(error => console.error('Error adding song to queue:', error));
    };

    return (
        <Container>
            <Typography variant="h6" color="primary">Search</Typography>
            <TextField
                label="Search"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                margin="normal"
                color="primary"
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
                Search
            </Button>
            <Table style={{ marginTop: 20 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Artist</TableCell>
                        <TableCell>Add to Queue</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results.map((result, index) => (
                        <TableRow key={index}>
                            <TableCell>{result.title}</TableCell>
                            <TableCell>{result.artist}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary" onClick={() => handleAddToQueue(result)}>
                                    Add to Queue
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default Search;

