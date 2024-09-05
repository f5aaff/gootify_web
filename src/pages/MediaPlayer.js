import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Select, IconButton, Popover, Grid, Slider, Box, LinearProgress, MenuItem } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import './MediaPlayer.css'; // Import the CSS file for styling

function usePlayer(intervalTime) {

    const [devices, setDevices] = useState([]);
    const [queueData, setQueueData] = useState(new Map());
    const [device, setDevice] = useState(new Map());
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


            const deviceResponse = await fetch('http://localhost:3000/devices', {
                method: 'GET',
            });
            if (!deviceResponse.ok) {
                const errorText = await deviceResponse.text();
                throw new Error(`device response was not ok: ${errorText}`);
            }
            const device = await deviceResponse.json();
            if (typeof device !== "object" || device === null) {
                throw new Error(`clearly a bad device: ${data}`);
            }
            setDevice(new Map(Object.entries(device)));
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const getDevices = async () => {
        const devicesReq = await fetch('http://localhost:3000/devices/all', {
            method: 'GET'
        })
        if (!devicesReq.ok) {
            const errorText = await devicesReq.text();
            throw new Error(`error retrieving devices: ${errorText}`);
        }
        const devices = await devicesReq.json();

        if (typeof devices !== "object" || devices === null) {
            throw new Error(`clearly a bad device: ${devices}`);
        }
        setDevices(devices)
    }

    useEffect(() => {
        fetchData(); // Fetch queueData on component mount
        getDevices();
        const intervalId = setInterval(() => {

            getDevices();
            fetchData();
        }, intervalTime);

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [intervalTime]); // Dependency array includes `intervalTime`

    return { queueData, loading, error, progressMs, device, devices };
}

function MediaPlayer({ intervalTime = 1000 }) { // Added intervalTime as a prop with a default of 1000ms
    const [isPlaying, setIsPlaying] = useState(false);
    const { queueData, loading, error, progressMs, device, devices } = usePlayer(intervalTime); // Pass intervalTime to usePlayer
    const [name, setName] = useState("");
    const [artist, setArtist] = useState("");
    const [albumArt, setAlbumArt] = useState("");
    const [durationMs, setDurationMs] = useState(0);
    const [volume, setVolume] = useState(0);

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
                setDurationMs(queueData.get("duration_ms") || 0);
            } else if (type === "track") {
                setName(queueData.get("name") || "");
                const artists = new Map(Object.entries(queueData.get("artists")[0]));
                setArtist(artists.get("name") || "");
                const images = new Map(Object.entries(new Map(Object.entries(queueData.get("album"))).get("images")[0]));
                setAlbumArt(images.get("url") || "https://via.placeholder.com/150");
                setDurationMs(queueData.get("duration_ms") || 0);

            }
        }
    }, [queueData, device]); // Dependency array includes `queueData`

    const handleNext = () => {
        fetch('http://localhost:3000/player/controls/next', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };


    const handleMakeActive = (result) => {
        var jsonBody = {
            device_ids: [result.target.value]
        }
        const requestUrl = `http://localhost:3000/devices/transfer`
        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonBody),
        })
    }

    const handlePrevious = () => {
        fetch('http://localhost:3000/player/controls/previous', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const handleVolume = (_, newValue) => {
        setVolume(newValue);
        fetch(`http://localhost:3000/player/setVol/${newValue}`, {
            method: 'GET',
        });
    };

    const handleSeek = (_, newValue) => {

        console.info(durationMs);
        fetch(`http://localhost:3000/player/seek/${newValue}`, {
            method: 'GET',
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

    return (
        <Card className="media-player">
            <Grid container alignItems="center">
                <Grid item xs={1}>
                    <Select
                        onChange={handleMakeActive}
                        displayEmpty
                        defaultValue=""
                        autoWidth
                    >
                        <MenuItem value="" disabled>{device.get("name")}</MenuItem>
                        {
                            devices.devices.map((device) => (
                                <MenuItem value={device.id}>{device.name}</MenuItem>
                            ))
                        }
                    </Select>
                </Grid>
                <Grid item xs={1}>
                    <CardMedia
                        component="img"
                        height="160"
                        width="160"
                        image={albumArt}
                        alt="Album cover"
                        style={{ objectFit: 'contain' }} // Ensure album art isn't clipped
                    />
                    <div><Box alignItems="center">
                        <IconButton onClick={handlePrevious} color="primary">
                            <SkipPreviousIcon />
                        </IconButton>
                        <IconButton onClick={handlePlayPause} color="primary">
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton onClick={handleNext} color="primary">
                            <SkipNextIcon />
                        </IconButton>
                    </Box></div>
                </Grid>
                <Grid item xs={4}>
                    <CardContent>
                        <Typography variant="h5" component="div" color="primary">
                            {name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {artist}
                        </Typography>
                        <div><Box display="flex" alignItems="center">
                            {/* Current position */}
                            <Typography variant="body2" style={{ marginRight: '10px' }}>
                                {formatTime(progressMs)}
                            </Typography>

                            {/* Slider */}
                            <Slider
                                value={progressMs}
                                min={0}
                                max={durationMs}
                                onChange={handleSeek}
                                sx={{
                                    flex: 1,
                                    marginX: '10px',
                                    color: '#f5adff',
                                    height: 6,
                                    '& .MuiSlider-track': {
                                        border: 'none',
                                    },
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                        '&:hover, &.Mui-focusVisible, &.Mui-active': {
                                            boxShadow: 'none',
                                        },
                                    },
                                }}
                            />

                            {/* Total duration */}
                            <Typography variant="body2" style={{ marginLeft: '10px' }}>
                                {formatTime(durationMs)}
                            </Typography>
                        </Box>
                        </div>
                        <div>
                            <Slider
                                step={10}
                                value={device.volume_percent}
                                disabled={!device.supports_volume}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100}
                                onChange={handleVolume}
                            />

                            <Typography disabled={!device.supports_volume} variant="h10">This Device Does Not Support Volume</Typography>
                        </div>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
}

export default MediaPlayer;

