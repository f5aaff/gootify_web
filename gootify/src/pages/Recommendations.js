import React, { useState, useCallback } from 'react';
import './Recommendations.css'; // Import the CSS file
import {
    Slider,
    TextField,
    Button,
    Container,
    Box,
    Typography,
    MenuItem,
    Select,
    Chip,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

// Constants
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

// Recommendations Component
function Recommendations() {
    // State for range sliders and selections
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
    const [results, setResults] = useState([]);

    // Handler for genre selection
    const handleGenreChange = useCallback((event) => {
        const { target: { value } } = event;
        setSelectedGenres(typeof value === 'string' ? value.split(',') : value);
    }, []);

    const handleRemoveGenre = useCallback((genreToRemove) => {
        setSelectedGenres(selectedGenres.filter(genre => genre !== genreToRemove));
    }, [selectedGenres]);

    const handleFilterChange = useCallback((key) => (event, newValue) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: newValue
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
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

        try {
            const response = await fetch('http://localhost:3000/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: encodedData
            });

            if (response.ok) {
                const result = await response.json();
                setResults(result);
            } else {
                console.error('Failed to fetch recommendations');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }, [filters, seedArtists, seedTracks, selectedGenres]);

    return (
        <Container style={{ padding: 16, marginBottom: 300 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
                {/* Sliders Section */}
                <Box sx={{ flex: 1, width: '30%', padding: 2 }}>
                    <Typography variant="h6">Filters</Typography>
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
                    <Box sx={{ paddingTop: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Genres</InputLabel>
                            <Select
                                multiple
                                value={selectedGenres}
                                onChange={handleGenreChange}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} onDelete={() => handleRemoveGenre(value)} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {genres.map((genre) => (
                                    <MenuItem key={genre} value={genre}>
                                        {genre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ paddingTop: 2 }}>
                        <TextField
                            label="Seed Artists (comma separated)"
                            variant="outlined"
                            fullWidth
                            value={seedArtists}
                            onChange={(e) => setSeedArtists(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ paddingTop: 2 }}>
                        <TextField
                            label="Seed Tracks (comma separated)"
                            variant="outlined"
                            fullWidth
                            value={seedTracks}
                            onChange={(e) => setSeedTracks(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ paddingTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            Get Recommendations
                        </Button>
                    </Box>
                </Box>

                {/* Results Table Section */}
                <Box sx={{ flex: 3, width: '70%', padding: 2 }}>
                    <Typography variant="h6">Results</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Track Name</TableCell>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Genre</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.name}</TableCell>
                                        <TableCell>{result.artist}</TableCell>
                                        <TableCell>{result.genre}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Container>
    );
}

export default Recommendations;

