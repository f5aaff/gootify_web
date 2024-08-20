import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Grid, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import './MediaPlayer.css'; // Import the CSS file for styling

function usePlayer(intervalTime) {
    const [queueData, setQueueData] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progressMs, setProgressMs] = useState(0);
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/devices/queue', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            const result = await response.json();

            // Validate and process the response
            if (typeof result !== 'object' || result === null) {
                throw new Error('Invalid JSON format');
            }

            // Convert the JSON object to a Map and retrieve the 'currently_playing' field
            const resultMap = new Map(Object.entries(result));
            const currentlyPlaying = resultMap.get('currently_playing');

            if (typeof currentlyPlaying !== 'object' || currentlyPlaying === null) {
                setLoading(true);
            }

            setQueueData(new Map(Object.entries(currentlyPlaying)));

            const playerResponse = await fetch('http://localhost:3000/player/currently_playing', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!playerResponse.ok) {
                const errorText = await playerResponse.text();
                throw new Error(`Network playerResponse was not ok: ${errorText}`);
            }
            const data = await playerResponse.json();
            if (typeof data !== 'object' || data === null) {
                throw new Error(`clearly a bad playerResponse: ${data}`);
            }
            setProgressMs(data.progress_ms || 0);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch queueData on component mount

        const intervalId = setInterval(() => {
            fetchData();
        }, intervalTime);

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [intervalTime]); // Dependency array includes `intervalTime`

    return { queueData, loading, error, progressMs };
}

function MediaPlayer({ intervalTime = 1000 }) { // Added intervalTime as a prop with a default of 1000ms
    const [isPlaying, setIsPlaying] = useState(false);
    const { queueData, loading, error, progressMs } = usePlayer(intervalTime); // Pass intervalTime to usePlayer
    const [name, setName] = useState("");
    const [artist, setArtist] = useState("");
    const [albumArt, setAlbumArt] = useState("");
    const [itemLength, setItemLength] = useState(0);
    const handlePlayPause = () => {
        const action = isPlaying ? "pause" : "play";
        fetch('http://localhost:3000/player/controls/' + action, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (queueData.size > 0) {
            const type = queueData.get("type");
            if (type === "episode") {
                setName(queueData.get("name") || "");
                const show = new Map(Object.entries(queueData.get("show")));
                setArtist(show.get("name") || "");
                const images = new Map(Object.entries(queueData.get("images")[0]));
                setAlbumArt(images.get("url" || "https://via.placeholder.com/150"));
                setItemLength(queueData.get("duration_ms") || 0);
            } else if (type === "track") {
                setName(queueData.get("name") || "");
                const artists = new Map(Object.entries(queueData.get("artists")[0]));
                setArtist(artists.get("name") || "");
                const images = new Map(Object.entries(new Map(Object.entries(queueData.get("album"))).get("images")[0]));
                setAlbumArt(images.get("url") || "https://via.placeholder.com/150");

            }
        }
    }, [queueData]); // Dependency array includes `queueData`

    const handleNext = () => {
        fetch('http://localhost:3000/player/controls/next', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const handlePrevious = () => {
        fetch('http://localhost:3000/player/controls/previous', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    const progressPercentage = (progressMs / itemLength) * 100;
    return (
        <Card className="media-player">
            <Grid container alignItems="center">
                <Grid item xs={4}>
                    <CardMedia
                        component="img"
                        height="160"
                        width="160"
                        image={albumArt}
                        alt="Album cover"
                        style={{ objectFit: 'contain' }} // Ensure album art isn't clipped
                    />
                </Grid>
                <Grid item xs={8}>
                    <CardContent>
                        <Typography variant="h5" component="div" color="primary">
                            {name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {artist}
                        </Typography>
                        <div>
                            <IconButton onClick={handlePrevious} color="primary">
                                <SkipPreviousIcon />
                            </IconButton>
                            <IconButton onClick={handlePlayPause} color="primary">
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={handleNext} color="primary">
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                        <div>
                            <span style={{ marginRight: '10px' }}>{formatTime(progressMs)}</span>
                            <div style={{ flex: 1, height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        width: `${progressPercentage}%`,
                                        height: '100%',
                                        backgroundColor: '#76c7c0',
                                        transition: 'width 0.25s ease-in-out',
                                    }}
                                >
                                </div>
                            </div>
                            <span style={{ marginLeft: '10px' }}>{formatTime(itemLength)}</span>
                        </div>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
}

export default MediaPlayer;

