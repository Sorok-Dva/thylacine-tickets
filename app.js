require('dotenv').config()
const CronJob = require('cron').CronJob

const thylacine = require('./config/thylacine')

const thylacine_job = new CronJob(process.env.THYLACINE_CRONJOB, async () => {
  if (thylacine.browser) await thylacine.close()
  await thylacine.init()
})

thylacine_job.start()
