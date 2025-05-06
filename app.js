const { exec } = require('child_process');
const axios = require('axios')

function getCPUUsage () {
    return new Promise((resolve, reject) => {
        exec("mpstat 1 1 | awk '/all/ {print 100 - $NF}'", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }

            const cpuUsage = parseFloat(stdout.trim());
            if (!isNaN(cpuUsage)) {
                resolve(cpuUsage.toFixed(2));
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

            const diskUsage = parseFloat(stdout.replace('%', ''));
            resolve(diskUsage.toFixed(2));
        });
    });
}

function checkIn () {
    axios.post(`${process.env.EASY_CLOUD_URL}/api/${process.env.SERVER_ID}/check-in`).then(response => {
        console.log(response.data)
    }).catch(error => {
        console.log(error.response.data)
    })
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

    axios.postForm(url, data).then(response => {
        console.log(response.data)
    }).catch(error => {
        console.log(error.response.data)
    })
}


module.exports = { getCPUUsage, getRAMUsage, getDiskUsage, alertBot, checkIn };
