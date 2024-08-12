const schedule = require('node-schedule');
const {io} = require('./socketapi.js');

// Construct the cronExpression
const cronExpresss = [];
//to save the job objects to cancel them later
const schedules = [];

// create the schedule for each day of the week
function createSchedule(users) {
    for (let i = 0; i < 7; i++) {
        // This is the tempCron variable to store the cron expression
        let tempCron = "";
        let dayofWeek = getDayofWeek(i);

        users.forEach(user => {
            let time = user.time[i];
            if (!time) {
                return;
            }
            for (let y = 0; y < time.split(',').length; y++) {
                let hour = time.split(',')[y].split(':')[0];
                let minute = time.split(',')[y].split(':')[1];
                tempCron = `0 ${minute} ${hour} * * ${dayofWeek}`;
                cronExpresss.push(tempCron);
                const job = schedule.scheduleJob(tempCron, function (fireDate) {
                    console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
                    console.log(tempCron);
                    io.emit('/esp/new-card-found', { uid: user.uid });
                });
                schedules.push({ job: job, user: `${user.username}-${dayofWeek}-${y}` });
                tempCron = "";
            }
        });
    }
}


// Function to get the day of the week
function getDayofWeek(day) {
    switch (day) {
        case 0: return 'MON';
        case 1: return 'TUE';
        case 2: return 'WED';
        case 3: return 'THU';
        case 4: return 'FRI';
        case 5: return 'SAT';
        case 6: return 'SUN';
    }
}

// Function to cancel all scheduled jobs
function cancelAllJobs() {
    for (let job of schedules) {
        job.job.cancel();
    }
    console.log('All scheduled jobs have been canceled.');
}

const fs = require('fs');
const users = JSON.parse(fs.readFileSync('user.json', 'utf8'));
createSchedule(users);

console.log(cronExpresss);
console.log(schedules[0]);

module.exports = {
    createSchedule: createSchedule,
    cancelAllJobs: cancelAllJobs,
    schedules: schedules,
    cronExpresss: cronExpresss
}