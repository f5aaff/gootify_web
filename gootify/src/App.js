import React, { useState } from 'react';
import MediaPlayer from './pages/MediaPlayer';
import Recommendations from './pages/Recommendations';
import Search from './pages/Search';
import SongsList from './pages/SongsList';
import { AppBar, Toolbar, IconButton, Drawer, Tabs, Tab, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const baseAddress = "http://localhost:3000";

function App() {
    const [activeTab, setActiveTab] = useState('songslist');
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setDrawerOpen(!isDrawerOpen);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (isMobile) setDrawerOpen(false); // Close drawer on mobile when a tab is selected
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'recommendations':
                return <Recommendations />;
            case 'search':
                return <Search />;
            case 'songslist':
                return <SongsList />;
            default:
                return null;
        }
    };

    return (
        <div className="App">
            <CssBaseline />
            <AppBar position="static" color="primary">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                        <MenuIcon />
                    </IconButton>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        scrollButtons={isMobile ? "auto" : "off"}
                    >
                        <Tab label="Recommendations" value="recommendations" />
                        <Tab label="Search" value="search" />
                        <Tab label="Queue" value="songslist" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={handleDrawerToggle}
                variant={isMobile ? "temporary" : "persistent"}
            >
                {renderContent()}
            </Drawer>
            <div className="content" style={{ marginTop: theme.spacing(2), padding: theme.spacing(2) }}>
                {renderContent()}
            </div>
            <MediaPlayer />
        </div>
    );
}

export default App;

