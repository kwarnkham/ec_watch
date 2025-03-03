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

function getCPUUsage (callback) {
    exec("top -b -n 1 | grep 'Cpu(s)'", (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        const cpuUsage = stdout.match(/(\d+\.\d+)\s*us,\s*(\d+\.\d+)\s*sy,\s*(\d+\.\d+)\s*id/);
        if (cpuUsage) {
            const user = parseFloat(cpuUsage[1]);
            const sys = parseFloat(cpuUsage[2]);
            const idle = parseFloat(cpuUsage[3]);
            const usage = user + sys;
            callback(usage.toFixed(2));
        }
    });
}

io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        getCPUUsage((cpuUsage) => {
            console.log(cpuUsage)
            socket.emit('cpu', { usage: `${cpuUsage}%` });
        });
    }, 1000);

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`CPU Monitor WebSocket Server running on port ${PORT}`);
});