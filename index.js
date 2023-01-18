const express = require('express')
const app = express()
app.use(express.static('public'))
const bodyParser = require('body-parser')
const { default: mongoose } = require('mongoose')
const AppointmentService = require('./services/AppointmentService')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

mongoose.connect('mongodb://127.0.0.1:27017/calendario')
mongoose.set('strictQuery', false)

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/cadastro/', (req, res) => {
    res.render('create')
})
app.post('/create', async (req, res) => {
    try {
        const result = await AppointmentService.create(
            req.body.name,
            req.body.email,
            req.body.description,
            req.body.cpf,
            req.body.data,
            req.body.time
        )
        if (result) {
            res.redirect('/')
        } else {
            res.status(400).json({ error: "Falha na requesição" })
        }
    } catch (error) {
        console.log(error)
    }
})
app.get('/getcalander', async (req, res) => {
    const result = await AppointmentService.getAll(false)
    res.json(result)
})
app.get('/event/:id', async (req, res) => {
    const apppointment = await AppointmentService.getById(req.params.id)
    console.log(apppointment)
    res.render('event', { appo: apppointment })
})
app.post('/finish', async (req, res) => {
    const id = req.body.id
    const result = await AppointmentService.Finish(id)
    console.log(result)
    res.redirect('/')
})
app.get('/list', async (req, res) => {
    const appos = await AppointmentService.getAll(true)
    res.render('list', { appos })
})
app.get('/search', async (req, res) => {
    const appos = await AppointmentService.Search(req.query.search)
    res.render('list', { appos })
})

setInterval(async () => {
    await AppointmentService.SendNotification()
}, 60000 * 5);

app.listen(3000, () => {
    console.log('server is running in port 3000')
})