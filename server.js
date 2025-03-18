const http = require('http');
const { Server } = require('socket.io');
const { getCPUUsage, getRAMUsage, getDiskUsage, alertBot } = require('./app');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const cpuThreshold = 80;
const memoryThreshold = 80;
const diskThreshold = 80;

let cpuExceedTime = 0;
let ramExceedTime = 0;
let diskExceedTime = 0;

io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        Promise.all([getCPUUsage(), getRAMUsage(), getDiskUsage()])
            .then(([cpuUsage, ramUsage, diskUsage]) => {
                socket.emit('usage', {
                    cpu: `${cpuUsage}%`,
                    ram: `${ramUsage}%`,
                    disk: `${diskUsage}%`,
                    cpuThreshold: `${cpuThreshold}%`,
                    memoryThreshold: `${memoryThreshold}%`,
                    diskThreshold: `${diskThreshold}%`
                });

                if (cpuUsage > cpuThreshold) {
                    cpuExceedTime += 1;
                    if (cpuExceedTime >= 10) {
                        alertBot(`CPU usage exceeded ${cpuThreshold}% for 10 seconds: ${cpuUsage}%`)
                        cpuExceedTime = 0;
                    }
                } else {
                    cpuExceedTime = 0;
                }

                if (ramUsage > memoryThreshold) {
                    ramExceedTime += 1;
                    if (ramExceedTime >= 10) {
                        alertBot(`RAM usage exceeded ${memoryThreshold}% for 10 seconds: ${ramUsage}%`);
                        ramExceedTime = 0;
                    }
                } else {
                    ramExceedTime = 0;
                }

                if (diskUsage > diskThreshold) {
                    diskExceedTime += 1;
                    if (diskExceedTime >= 10) {
                        alertBot(`Disk usage exceeded ${diskThreshold}% for 10 seconds: ${diskUsage}%`);
                        diskExceedTime = 0;
                    }
                } else {
                    diskExceedTime = 0;
                }
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