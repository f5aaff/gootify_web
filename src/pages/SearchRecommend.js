import React, { useState, useCallback } from 'react';
import {
    Slider, TextField, Button, Container, Box, Typography, Chip,
    FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Radio, RadioGroup, FormControlLabel, FormLabel, Pagination, Drawer, IconButton, Autocomplete
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
// Constants for genres
const genres = ["acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music"];

// Slider Component
const RangeSlider = ({ label, value, onChange, min, max, step = 1 }) => (
    <Box sx={{ paddingTop: 2 }}>
        <Typography>{label}</Typography>
        <Slider
            value={value}
            onChange={onChange}
            valueLabelDisplay="auto"
            min={min}
            max={max}
            step={step}
        />
    </Box>
);

// Combined Component
function SearchRecommend() {
    const [filters, setFilters] = useState({
        acousticness: [0, 1],
        danceability: [0, 1],
        durationMs: [0, 600000],
        energy: [0, 1],
        instrumentalness: [0, 1],
        key: [0, 11],
        liveness: [0, 1],
        loudness: [-60, 0],
        popularity: [0, 100],
        speechiness: [0, 1],
        tempo: [0, 200],
        valence: [0, 1]
    });
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [seedArtists, setSeedArtists] = useState('');
    const [seedTracks, setSeedTracks] = useState('');
    const [recommendationResults, setRecommendationResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('track');
    const [searchLimit, setSearchLimit] = useState(10);
    const [searchPage, setSearchPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const itemsPerPage = 5;

    const seedArtistLength = seedArtists ? seedArtists.split(',').length : 0;
    const seedTrackLength = seedTracks ? seedTracks.split(',').length : 0;
    const seedGenresLength = selectedGenres.length;
    const totalSeeds = seedArtistLength + seedTrackLength + seedGenresLength;
    const maxSeedsReached = totalSeeds >= 5;
    const noSeeds = totalSeeds == 0;

    const handleFilterChange = useCallback((key) => (event, newValue) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: newValue
        }));
    }, []);

    const handleGetRecommendations = useCallback(() => {
        // Construct the request data
        const requestData = {
            ...Object.fromEntries(Object.entries(filters).map(([key, [min, max]]) => [
                `min_${key}`, min,
                `max_${key}`, max,
                `target_${key}`, (min + max) / 2 // Assuming target is the midpoint
            ])),
            seed_artists: seedArtists.split(',').map(encodeURIComponent).join(','),
            seed_tracks: seedTracks.split(',').map(encodeURIComponent).join(','),
            seed_genres: selectedGenres.map(encodeURIComponent).join(',')
        };

        // URL encode the request data
        const encodedData = new URLSearchParams(requestData).toString();

        // Make the fetch request
        fetch('http://localhost:3000/recommendations/get/' + encodedData, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Return the parsed JSON response
                } else {
                    console.error('Failed to fetch recommendations');
                    return []; // Return an empty array or suitable fallback in case of failure
                }
            })
            .then(result => {
                setRecommendationResults(result.tracks); // Update state with fetched recommendations
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });

    }, [filters, seedArtists, seedTracks, selectedGenres]);

    // Handlers for Search
    const handleSearch = () => {
        if (searchQuery.trim() === '') return;
        const requestData = {
            query: searchQuery, tags: '', types: [searchType], Market: "ES", Limit: searchLimit,
        };

        fetch('http://localhost:3000/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.tracks && data.tracks.items) {
                    setSearchResults(data.tracks.items);
                } else if (data.episodes && data.episodes.items) {
                    setSearchResults(data.episodes.items);
                } else {
                    setSearchResults([]);
                }
                setSearchPage(1);
            })
            .catch(error => console.error('Error fetching search results:', error));
    };

    const handleAddToSeedTracks = (trackId) => {
        if (!maxSeedsReached) {
            setSeedTracks(prev => prev ? `${prev},${trackId}` : trackId);
        }
    };

    const handleAddToSeedArtists = (artistId) => {
        if (!maxSeedsReached) {
            setSeedArtists(prev => prev ? `${prev},${artistId}` : artistId);
        }
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

    // Handlers for Recommendations
    const handleGenreChange = useCallback((event, newValue) => {
        // Check if the total seeds including genres does not exceed the maximum allowed seeds.
        if (!maxSeedsReached) {
            setSelectedGenres(newValue);
        }
        console.log(selectedGenres);
    }, [selectedGenres, maxSeedsReached]);


    const handleRemoveGenre = useCallback((genreToRemove) => {
        setSelectedGenres((prevSelectedGenres) =>
            prevSelectedGenres.filter(genre => genre !== genreToRemove)
        );
    }, []);
    const displayedResults = searchResults.slice((searchPage - 1) * itemsPerPage, searchPage * itemsPerPage);

    return (
        <Container style={{ padding: 16 }}>
            {/* Search Section */}
            <Typography variant="h6" color="primary">Search</Typography>
            <TextField
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                margin="normal"
                color="primary"
            />
            <FormLabel component="legend">Type</FormLabel>
            <RadioGroup
                row
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
            >
                <FormControlLabel value="track" control={<Radio />} label="Track" />
                <FormControlLabel value="episode" control={<Radio />} label="Episode" />
            </RadioGroup>
            <Typography gutterBottom>Limit</Typography>
            <Slider
                value={searchLimit}
                onChange={(e, newValue) => setSearchLimit(newValue)}
                aria-labelledby="limit-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={50}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
                Search
            </Button>

            {/* Search Results */}
            <Table style={{ marginTop: 16 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Artist/Show</TableCell>
                        <TableCell>Album/Description</TableCell>
                        <TableCell>Add to Seed Tracks</TableCell>
                        <TableCell>Add to Seed Artists</TableCell>
                        <TableCell>Add to Queue</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayedResults.map((result, index) => (
                        <TableRow key={index}>
                            <TableCell>{result.name}</TableCell>
                            <TableCell>{result.artists ? result.artists.map(artist => artist.name).join(', ') : 'N/A'}</TableCell>
                            <TableCell>{result.album ? result.album.name : result.description}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary" onClick={() => handleAddToSeedTracks(result.id)}>
                                    Add to Seed Tracks
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary" onClick={() => handleAddToSeedArtists(result.artists[0].id)}>
                                    Add to Seed Artists
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary" onClick={() => handleAddToQueue(result)}>
                                    Add to Queue
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div style={{ padding: 16 }}>
                <Pagination
                    count={Math.ceil(searchResults.length / itemsPerPage)}
                    page={searchPage}
                    onChange={(event, value) => setSearchPage(value)}
                    color="primary"
                />
            </div>

            {/* Recommendations Drawer */}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 800, padding: 20 }}>
                    <Typography variant="h6">Recommendations</Typography>
                    {Object.entries(filters).map(([key, value]) => (
                        <RangeSlider
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            value={value}
                            onChange={handleFilterChange(key)}
                            min={key === 'durationMs' ? 0 : (key === 'loudness' ? -60 : 0)}
                            max={key === 'durationMs' ? 600000 : (key === 'loudness' ? 0 : 1)}
                            step={0.01}
                        />
                    ))}

                    <Typography variant="h6">Seeds:{totalSeeds}/5</Typography>
                    <FormControl fullWidth style={{ marginTop: 16 }}>
                        <Autocomplete
                            multiple
                            options={genres}
                            value={selectedGenres}
                            onChange={handleGenreChange}
                            renderTags={(selectedGenres, getTagProps) =>
                                selectedGenres.map((option, index) => (
                                    <Chip
                                        key={option}
                                        label={option}
                                        {...getTagProps({ index })}
                                        onDelete={() => handleRemoveGenre(option)}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="seedGenres"
                                />
                            )}
                        />
                    </FormControl>
                    <TextField
                        label="Seed Artists (comma separated)"
                        variant="outlined"
                        fullWidth
                        value={seedArtists}
                        onChange={(e) => setSeedArtists(e.target.value)}
                        style={{ marginTop: 16 }}
                    />
                    <TextField
                        label="Seed Tracks (comma separated)"
                        variant="outlined"
                        fullWidth
                        value={seedTracks}
                        onChange={(e) => setSeedTracks(e.target.value)}
                        style={{ marginTop: 16 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={noSeeds}
                        onClick={handleGetRecommendations}
                        style={{ marginTop: 16 }}
                    >
                        Get Recommendations
                    </Button>
                    <TableContainer component={Paper} style={{ marginTop: 16 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Album</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recommendationResults.map((track, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{track.name}</TableCell>
                                        <TableCell>{track.artists.map(artist => artist.name).join(', ')}</TableCell>
                                        <TableCell>{track.album.name}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="secondary" onClick={() => handleAddToQueue(track)}>
                                                Add to Queue
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Drawer>

            {/* Open Drawer Button */}
            <IconButton
                style={{ position: 'fixed', top: '50%', left: 0 }}
                onClick={() => setDrawerOpen(true)}
            >
                <ArrowForward />
            </IconButton>
        </Container>
    );
}

export default SearchRecommend;

