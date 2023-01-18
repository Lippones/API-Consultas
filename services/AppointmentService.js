const appointment = require('../model/Appointment')
const mongoose = require('mongoose')
const Appo = mongoose.model('Appointment', appointment)
const AppointmentFactory = require('../factories/AppointmentFactory')
const mailer = require('nodemailer')
const { text } = require('body-parser')

class AppointmentService {
    async create(name, email, description, cpf, date, time) {
        try {
            const newModel = new Appo({
                name,
                email,
                description,
                cpf,
                date,
                time,
                finished: false,
                notified: false
            })
            await newModel.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async getAll(showFinished) {
        if (showFinished) {
            return await Appo.find()
        } else {
            const appos = await Appo.find({ "finished": false })
            const appointments = [];
            appos.map(appointment => {
                if (appointment.date != undefined) {
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            })
            return appointments
        }
    }
    async getById(id) {
        try {
            const res = await Appo.findOne({ '_id': id })
            return res
        } catch (error) {
            console.log(error)
        }
    }
    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, { "finished": true })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async Search(query) {
        try {
            return await Appo.find().or([{ "email": query }, { cpf: query }])
        } catch (error) {
            console.log(error)
            return []
        }
    }
    async SendNotification() {
        const appo = await this.getAll(false)
        var transport = mailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "656f0e166b37c9",
                pass: "0e2420bef36c39"
            }
        });
        appo.map(async (app) => {
            const data = app.start.getTime()
            const hour = 1000 * 60 * 60

            const gap = data - Date.now()
            if (gap <= hour) {
                if (!app.notified) {
                    await Appo.findByIdAndUpdate(app.id, { notified: true })
                    transport.sendMail({
                        from: "Filipe Vieira <filipe@dev.com>",
                        to: app.email,
                        subject: "Sua consulta esta proxima, favor verificar o horario",
                        text: "Caso precisa cancelar favor ligar com antecendia"
                    }).then(() => {
                        console.log("Sent mail")
                    }).catch(err => {
                        console.log("Failed to send mail", err)
                    })
                }
            }

        })
    }
}
module.exports = new AppointmentService()