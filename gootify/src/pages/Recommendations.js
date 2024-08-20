import React, { useState, useEffect } from 'react';
import { Slider, Typography, Table, TableBody, TableCell, TableHead, TableRow, Container, Pagination } from '@mui/material';
import './Recommendations.css'; // Import the CSS file

function Recommendations() {
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;

    // State variables for options
    const [option1, setOption1] = useState(50);
    const [option2, setOption2] = useState(50);
    const [option3, setOption3] = useState(50);
    const [option4, setOption4] = useState(50);
    const [option5, setOption5] = useState(50);

    // Sample recommendations data
    const [recommendations, setRecommendations] = useState([
        { id: 1, name: 'Recommendation A', description: 'Description 1' },
        { id: 2, name: 'Recommendation B', description: 'Description 2' },
        { id: 3, name: 'Recommendation C', description: 'Description 3' },
        { id: 4, name: 'Recommendation D', description: 'Description 4' },
        { id: 5, name: 'Recommendation E', description: 'Description 5' },
    ]);

    useEffect(() => {
        // This useEffect could be used to fetch recommendations periodically
        const fetchRecommendations = async () => {
            // Fetch logic here
            // Assuming you replace the setRecommendations with real data fetching
        };

        // Fetch recommendations every second (can be made configurable)
        const intervalId = setInterval(fetchRecommendations, 1000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const displayedRecommendations = recommendations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Container>
            <Typography variant="h6" color="primary">Recommendations</Typography>
            <div className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedRecommendations.map((rec) => (
                            <TableRow key={rec.id}>
                                <TableCell>{rec.name}</TableCell>
                                <TableCell>{rec.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="pagination-container">
                <Pagination
                    count={Math.ceil(recommendations.length / itemsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </div>

            <Typography variant="h6" color="primary">Adjust Preferences</Typography>
            {['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'].map((label, index) => (
                <div key={index}>
                    <Typography>{label}</Typography>
                    <Slider
                        value={[option1, option2, option3, option4, option5][index]}
                        onChange={(e, val) => [setOption1, setOption2, setOption3, setOption4, setOption5][index](val)}
                        color="primary"
                    />
                </div>
            ))}
        </Container>
    );
}

export default Recommendations;

