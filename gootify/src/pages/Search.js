import React, { useState, useEffect } from 'react';
import { TextField, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Slider, Radio, RadioGroup, FormControlLabel, FormLabel, Pagination, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, Battery0Bar } from '@mui/icons-material';

function Search() {
    const [query, setQuery] = useState('');
    const [tags, setTags] = useState('');
    const [type, setType] = useState('track'); // Default to 'track'
    const [limit, setLimit] = useState(10); // Default limit value
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1); // Current page
    const itemsPerPage = 5; // Number of items per page

    const fetchData = () => {
        if (query.trim() === '') return;

        const requestData = {
            query,
            tags,
            types: [type],
            Market: "ES",
            Limit: limit,
        };

        fetch('http://localhost:3000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.tracks && data.tracks.items) {
                    setResults(data.tracks.items);
                } else if (data.episodes && data.episodes.items) {
                    setResults(data.episodes.items);
                } else {
                    setResults([]);
                }
                setPage(1); // Reset to first page on new search
            })
            .catch(error => console.error('Error fetching search results:', error));
    };

    const handlePlayNow = (result) => {
        const requestUrl = `http://localhost:3000/player/play`;

        const requestData = {
            uris: [result.uri],
            offset: {
                position: 0
            },
            position_ms: 0
        };


        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add to queue');
                }
                console.log('Item added to queue');
            })
            .catch(error => console.error('Error adding item to queue:', error));
    };
    const handleAddToQueue = (result) => {
        const requestUrl = `http://localhost:3000/devices/queue/add/${result.uri}`;

        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add to queue');
                }
                console.log('Item added to queue');
            })
            .catch(error => console.error('Error adding item to queue:', error));
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const displayedResults = results.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Container style={{ padding: 16, marginBottom: 150 }}>
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
            <TextField
                label="Tags"
                variant="outlined"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                fullWidth
                margin="normal"
                color="primary"
            />
            <FormLabel component="legend">Type</FormLabel>
            <RadioGroup
                row
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <FormControlLabel value="track" control={<Radio />} label="Track" />
                <FormControlLabel value="episode" control={<Radio />} label="Episode" />
            </RadioGroup>
            <Typography gutterBottom>Limit</Typography>
            <Slider
                value={limit}
                onChange={(e, newValue) => setLimit(newValue)}
                aria-labelledby="limit-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={50}
            />
            <Button variant="contained" color="primary" onClick={fetchData}>
                Search
            </Button>
            <div style={{ padding: 16 }}>
                <Table style={{ marginTop: 0 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Artist/Show</TableCell>
                            <TableCell>Album/Description</TableCell>
                            <TableCell>Preview</TableCell>
                            <TableCell>Add to Queue</TableCell>
                            <TableCell>Play Now</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedResults.map((result, index) => (
                            <TableRow key={index}>
                                <TableCell>{result.name}</TableCell>
                                <TableCell>{result.artists ? result.artists.map(artist => artist.name).join(', ') : 'N/A'}</TableCell>
                                <TableCell>{result.album ? result.album.name : result.description}</TableCell>
                                <TableCell>
                                    {result.preview_url || result.audio_preview_url ? (
                                        <audio controls>
                                            <source src={result.preview_url || result.audio_preview_url} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        'No Preview Available'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained" color="secondary" onClick={() => handleAddToQueue(result)}>
                                        Add to Queue
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained" color="secondary" onClick={() => handlePlayNow(result)}>
                                        Play Now
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="pagination-container" style={{ padding: 30, margin: 30 }}>
                    <Pagination
                        count={Math.ceil(results.length / itemsPerPage)}
                        page={page}
                        onChange={handleChangePage}
                        color="primary"
                    />
                </div>
            </div>
        </Container>
    );
}

export default Search;
