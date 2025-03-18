const { exec } = require('child_process');
const axios = require('axios')

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

function alertBot (message) {
    const url = process.env.URL ?? 'https://admin.ctests.xyz/send'
    const group_id = process.env.GROUP_ID ?? '-4693903019'
    const user_id = process.env.USER_ID ?? '1'
    const secret = process.env.SECRET ?? '6WKF1500VEx5Rd8CHgubgZKf9kxoO3Pdd'

    const data = {
        telegram_id: group_id,
        user_id,
        secret,
        message
    };

    console.log(url, data)

    axios.postForm(url, data).then(response => {
        console.log(response.data)
    }).catch(error => {
        console.log(error.response.data)
    })
}


module.exports = { getCPUUsage, getRAMUsage, getDiskUsage, alertBot };
