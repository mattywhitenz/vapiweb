const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Config file path
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ assistants: [] }));
}

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get all assistants
app.get('/api/assistants', (req, res) => {
    try {
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        res.json(configData.assistants);
    } catch (error) {
        console.error('Error reading config file:', error);
        res.status(500).json({ error: 'Failed to read assistants data' });
    }
});

// API endpoint to save an assistant
app.post('/api/assistants', (req, res) => {
    try {
        const assistant = req.body;
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        configData.assistants.push(assistant);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
        res.status(201).json(configData.assistants);
    } catch (error) {
        console.error('Error saving assistant:', error);
        res.status(500).json({ error: 'Failed to save assistant' });
    }
});

// API endpoint to update an assistant
app.put('/api/assistants/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const assistant = req.body;
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        
        if (index >= 0 && index < configData.assistants.length) {
            configData.assistants[index] = assistant;
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
            res.json(configData.assistants);
        } else {
            res.status(404).json({ error: 'Assistant not found' });
        }
    } catch (error) {
        console.error('Error updating assistant:', error);
        res.status(500).json({ error: 'Failed to update assistant' });
    }
});

// API endpoint to delete an assistant
app.delete('/api/assistants/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        
        if (index >= 0 && index < configData.assistants.length) {
            configData.assistants.splice(index, 1);
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
            res.json(configData.assistants);
        } else {
            res.status(404).json({ error: 'Assistant not found' });
        }
    } catch (error) {
        console.error('Error deleting assistant:', error);
        res.status(500).json({ error: 'Failed to delete assistant' });
    }
});

// API endpoint to get the current assistant ID
app.get('/api/current-assistant', (req, res) => {
    try {
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        res.json({ currentAssistantId: configData.currentAssistantId || null });
    } catch (error) {
        console.error('Error reading current assistant ID:', error);
        res.status(500).json({ error: 'Failed to read current assistant ID' });
    }
});

// API endpoint to set the current assistant ID
app.post('/api/current-assistant', (req, res) => {
    try {
        const { currentAssistantId } = req.body;
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        configData.currentAssistantId = currentAssistantId;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
        res.json({ currentAssistantId });
    } catch (error) {
        console.error('Error setting current assistant ID:', error);
        res.status(500).json({ error: 'Failed to set current assistant ID' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 