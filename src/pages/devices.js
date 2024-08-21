import React, {useState, useEffect} from 'react';
import { TextField, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Slider, Radio, RadioGroup, FormControlLabel, FormLabel, Pagination, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, Battery0Bar } from '@mui/icons-material';


function Devices(){
    const [devices,setDevices] = useState([]);

    const fetchData = () => {
        fetch('http://localhost:3000/devices/all',{
            method: 'GET'
        }).then(response => response.json())
        .then()
    }
}
