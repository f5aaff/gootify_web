import React, { useState, useEffect } from 'react';

import {
    Button, Typography, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';

function Devices() {
    const [devices, setDevices] = useState([]);

    const fetchData = () => {
        fetch('http://localhost:3000/devices/all', {
            method: 'GET'
        }).then(response => response.json())
            .then(data => {
                setDevices(data.devices);
                console.log(data);
            }).catch(error => console.error(`error fetching devices: ${error}`))
    }

    const handleMakeActive = (result) => {
        var jsonBody = {
            device_ids: [result.id]
        }
        const requestUrl = `http://localhost:3000/devices/transfer`
        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonBody,
        })
    }

    return (
        <div style={{ padding: 1 }}>
            <Button variant="contained" onClick={fetchData}>Refresh</Button>
            <div className="table-container">

                <Table style={{ marginTop: 16 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Volume Support</TableCell>
                            <TableCell>Active</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {devices.map((result, index) => (
                            <TableRow key={index} onClick={() => handleMakeActive(result)}>
                                <TableCell>{result.name}</TableCell>
                                <TableCell>{result.type}</TableCell>
                                <TableCell>{result.supports_volume.toString()}</TableCell>
                                <TableCell>
                                    <Typography variant="h6" color="primary" hidden={!result.is_active}>✓</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default Devices;
