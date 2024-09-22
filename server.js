const http = require('http');
const fs = require('fs');
const url = require('url');
const PORT = 3000;
const filePath = './hospitals.json';


// Function to read the JSON file
function readHospitals() {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data); // Convert JSON to JavaScript object
}

// Function to write to the JSON file
function writeHospitals(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); // Convert JavaScript object to JSON
}

// Simple request handler for the server
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true); // Parse URL
    const method = req.method; // Get the HTTP method
    const id = parseInt(parsedUrl.query.id); // Get the ID from the query string

    // Set the response content type to JSON
    res.setHeader('Content-Type', 'application/json');

    // If the path is '/hospitals', we handle it
    if (parsedUrl.pathname === '/hospitals') {
        // Handle GET request - fetch hospitals
        if (method === 'GET') {
            const hospitals = readHospitals(); // Read the hospitals from the file
            if (id) {
                const hospital = hospitals.find(h => h.id === id); // Find hospital by ID
                if (hospital) {
                    res.writeHead(200); // Send success status
                    res.end(JSON.stringify(hospital)); // Send the hospital data
                } else {
                    res.writeHead(404); // Send not found status
                    res.end(JSON.stringify({ message: 'Hospital not found' }));
                }
            } else {
                res.writeHead(200); // Send success status
                res.end(JSON.stringify(hospitals)); // Send all hospitals data
            }
        }

        // Handle POST request - add new hospital
        else if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk; // Collect the request body
            });
            req.on('end', () => {
                const newHospital = JSON.parse(body); // Parse the request body
                const hospitals = readHospitals(); // Get current hospitals
                newHospital.id = hospitals.length + 1; // Set new hospital ID
                hospitals.push(newHospital); // Add new hospital
                writeHospitals(hospitals); // Write the updated data to the file
                res.writeHead(201); // Send created status
                res.end(JSON.stringify(newHospital)); // Send the new hospital data
            });
        }

        // Handle PUT request - update hospital
        else if (method === 'PUT') {
            let body = '';
            req.on('data', chunk => {
                body += chunk; // Collect the request body
            });
            req.on('end', () => {
                const updatedData = JSON.parse(body); // Parse the request body
                let hospitals = readHospitals(); // Get current hospitals
                const hospital = hospitals.find(h => h.id === id); // Find hospital by ID

                if (hospital) {
                    Object.assign(hospital, updatedData); // Update hospital with new data
                    writeHospitals(hospitals); // Write updated data to file
                    res.writeHead(200); // Send success status
                    res.end(JSON.stringify(hospital)); // Send updated hospital data
                } else {
                    res.writeHead(404); // Send not found status
                    res.end(JSON.stringify({ message: 'Hospital not found' }));
                }
            });
        }

        // Handle DELETE request - delete hospital
        else if (method === 'DELETE') {
            let hospitals = readHospitals(); // Get current hospitals
            const filteredHospitals = hospitals.filter(h => h.id !== id); // Remove the hospital by ID

            if (hospitals.length === filteredHospitals.length) {
                res.writeHead(404); // Send not found status
                res.end(JSON.stringify({ message: 'Hospital not found' }));
            } else {
                writeHospitals(filteredHospitals); // Write the updated data to the file
                res.writeHead(200); // Send success status
                res.end(JSON.stringify({ message: 'Hospital deleted' }));
            }
        }

        // If the method is not supported
        else {
            res.writeHead(405); // Method not allowed
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
        }
    } else {
        res.writeHead(404); // Not found
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
}

// Create the server
const server = http.createServer(handleRequest);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
