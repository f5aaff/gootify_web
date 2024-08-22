import React, { useState } from 'react';
import MediaPlayer from './pages/MediaPlayer';
import SearchRecommend from './pages/SearchRecommend';
import SongsList from './pages/SongsList';
import Devices from './pages/devices.js';
import { AppBar, Toolbar, Tabs, Tab, CssBaseline } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';


function App() {
    const [activeTab, setActiveTab] = useState('songslist');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'SearchRecommend':
                return <SearchRecommend />;
            case 'songslist':
                return <SongsList />;
            case 'devices':
                return <Devices />;
            default:
                return null;
        }
    };

    return (
        <div className="App">
            <CssBaseline />
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        scrollButtons={isMobile ? "auto" : "off"}
                    >
                        <Tab label="Search & Recommendations" value="SearchRecommend" />
                        <Tab label="Queue" value="songslist" />
                        <Tab label="Devices" value="devices" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <div className="content" style={{ marginTop: theme.spacing(2), padding: theme.spacing(2) }}>
                {renderContent()}
            </div>
            <MediaPlayer />
        </div>
    );
}

export default App;

