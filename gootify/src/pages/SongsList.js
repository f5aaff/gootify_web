import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Pagination } from '@mui/material';
import './SongsList.css'; // Import the CSS file

function useQueue(intervalTime = 1000) { // Added intervalTime as a parameter with a default of 1000ms
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/devices/queue', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.json();

            if (typeof result !== 'object' || result === null) {
                throw new Error('Invalid JSON format');
            }

            const resultMap = new Map(Object.entries(result));
            const queueData = resultMap.get('queue');

            if (!Array.isArray(queueData)) {
                throw new Error('Expected queue to be an array');
            }

            setData(queueData);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch data immediately on component mount

        const intervalId = setInterval(() => {
            fetchData(); // Fetch data every intervalTime milliseconds
        }, intervalTime);

        return () => clearInterval(intervalId); // Clean up the interval on component unmount
    }, [intervalTime]);

    return { data, loading, error };
}

function SongsList() {
    const { data: queue, loading, error } = useQueue(2000); // Use the custom hook with a 2-second interval
    const [displayedSongs, setDisplayedSongs] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (queue && queue.length > 0) {
            setDisplayedSongs(queue.slice((page - 1) * itemsPerPage, page * itemsPerPage));
        }
    }, [queue, page]);

    const handleAddSong = () => {
        // Add your logic for adding a song here
    };

    const handleRemoveSong = (id) => {
        // Logic for removing a song
        fetch(`http://localhost:3000/player/queue/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(() => {
            setDisplayedSongs(displayedSongs.filter(song => song.id !== id));
        }).catch(error => console.error('Error removing song:', error));
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div style={{ padding: 16 }}>
            <Button variant="contained" color="primary" onClick={handleAddSong}>Add Song</Button>
            <div className="table-container">
                <List>
                    {displayedSongs.map(song => (
                        <ListItem key={song.id}>
                            <ListItemText primary={song.name} />
                            <Button variant="contained" color="secondary" onClick={() => handleRemoveSong(song.id)}>
                                Remove
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </div>
            <div className="pagination-container">
                <Pagination
                    count={Math.ceil(queue.length / itemsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </div>
        </div>
    );
}

export default SongsList;

