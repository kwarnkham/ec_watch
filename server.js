const os = require('os');
const http = require('http');
const { Server } = require('socket.io');
const { exec } = require('child_process');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

function getCPUUsage () {
    return new Promise((resolve, reject) => {
        exec("top -b -n 1 | grep 'Cpu(s)'", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            console.log(stdout);
            const cpuUsage = stdout.match(/(\d+\.\d+)\s*us,\s*(\d+\.\d+)\s*sy,\s*(\d+\.\d+)\s*ni,\s*(\d+\.\d+)\s*id/);
            console.log(cpuUsage);
            if (cpuUsage) {
                const user = parseFloat(cpuUsage[1]);
                const sys = parseFloat(cpuUsage[2]);
                const idle = parseFloat(cpuUsage[4]);
                const usage = user + sys;
                resolve(usage.toFixed(2));
            } else {
                reject(new Error('Failed to parse CPU usage'));
            }
        });
    });
}

function getRAMUsage () {
    return new Promise((resolve, reject) => {
        exec("free | awk '/Mem/{printf(\"%.2f\", ($2-$7)/$2*100)}'", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            console.log(stdout);
            const ramUsage = parseFloat(stdout);
            resolve(ramUsage.toFixed(2));
        });
    });
}

function getDiskUsage () {
    return new Promise((resolve, reject) => {
        exec("df -h / | awk 'NR==2 {print $5}'", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            console.log(stdout);
            const diskUsage = parseFloat(stdout.replace('%', ''));
            resolve(diskUsage.toFixed(2));
        });
    });
}

io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        Promise.all([getCPUUsage(), getRAMUsage(), getDiskUsage()])
            .then(([cpuUsage, ramUsage, diskUsage]) => {
                console.log(`CPU: ${cpuUsage}%, RAM: ${ramUsage}%, Disk: ${diskUsage}%`);
                socket.emit('usage', { cpu: `${cpuUsage}%`, ram: `${ramUsage}%`, disk: `${diskUsage}%` });
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