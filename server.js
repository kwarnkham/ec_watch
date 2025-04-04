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

let counter = 0;

alertBot(`Node program on ${process.env.MY_IP} has been (re)started`)

io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        counter += 1;

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
                //every 5 minutes
                if (counter >= 60 * 5) {
                    counter = 0;
                    if (cpuUsage >= 70 || ramUsage >= 70 || diskUsage >= 70) {
                        alertBot(`
                            Server Name: ${process.env.NAME}
                            \nIP: ${process.env.MY_IP}
                            \nStatus: Server is in high usage
                            \nCPU Usage: ${cpuUsage}%
                            \nRAM Usage: ${ramUsage}%
                            \nDisk Usage: ${diskUsage}%
                            `);
                    }
                }

                if (cpuUsage > cpuThreshold) {
                    cpuExceedTime += 1;
                    if (cpuExceedTime >= 10) {
                        // alertBot(`${process.env.MY_IP}: CPU usage exceeded ${cpuThreshold}% for 10 seconds: ${cpuUsage}%`)
                        cpuExceedTime = 0;
                    }
                } else {
                    cpuExceedTime = 0;
                }

                if (ramUsage > memoryThreshold) {
                    ramExceedTime += 1;
                    if (ramExceedTime >= 10) {
                        // alertBot(`${process.env.MY_IP}: RAM usage exceeded ${memoryThreshold}% for 10 seconds: ${ramUsage}%`);
                        ramExceedTime = 0;
                    }
                } else {
                    ramExceedTime = 0;
                }

                if (diskUsage > diskThreshold) {
                    diskExceedTime += 1;
                    if (diskExceedTime >= 10) {
                        // alertBot(`${process.env.MY_IP}: Disk usage exceeded ${diskThreshold}% for 10 seconds: ${diskUsage}%`);
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