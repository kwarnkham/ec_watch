const http = require('http');
const { Server } = require('socket.io');
const { getCPUUsage, getRAMUsage, getDiskUsage } = require('./app');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const cpuThreshold = 80;
const memoryThreshold = 80;
const diskThreshold = 80;

io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        Promise.all([getCPUUsage(), getRAMUsage(), getDiskUsage()])
            .then(([cpuUsage, ramUsage, diskUsage]) => {
                console.log(`CPU: ${cpuUsage}%, RAM: ${ramUsage}%, Disk: ${diskUsage}%`);
                socket.emit('usage', {
                    cpu: `${cpuUsage}%`,
                    ram: `${ramUsage}%`,
                    disk: `${diskUsage}%`,
                    cpuThreshold: `${cpuThreshold}%`,
                    memoryThreshold: `${memoryThreshold}%`,
                    diskThreshold: `${diskThreshold}%`
                });
            })
            .catch(error => {
                console.error(`Error fetching usage data: ${error}`);
            });
    }, 1000);

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`CPU, RAM, and Disk Monitor WebSocket Server running on port ${PORT}`);
});