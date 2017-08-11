const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cookieSession = require('cookie-session')
const fs = require('fs')

const publicPath = path.join(__dirname, 'public')
const textFilePath = path.join(__dirname, 'data/users.txt')
const app = express()
const PORT = 3001

app.use(express.static(publicPath)) // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })) // parse application/json
app.use(bodyParser.json())
app.use(cookieSession({
  name: 'CookieOfLoginMiniApp',
  keys: ['hipopotomonstrosesquipedaliofobia', 'supercalifragilisticoespialidoso']
}))

let users = fs.readFileSync(textFilePath).toString().split('\r\n')

app.set('view engine', 'pug')
app.locals.pretty = true

app.get('/', (req, res) => {
  if (req.session.logedin) {
    res.redirect('/wellcome')
  }

  res.redirect('/login')
})

app.get('/login', (req, res) => {
  if (req.session.logedin) {
    res.redirect('/wellcome')
  }

  res.render('pages/login')
})

app.get('/wellcome', (req, res) => {
  if (!req.session.logedin) {
    res.redirect('/unauthorized')
  }
  res.render('pages/wellcome')
})

app.get('/unauthorized', (req, res) => {
  res.render('pages/unauthorized')
})

app.get('/sign-up', (req, res) => {
  res.render('pages/registration')
})

app.get('/logout', (req, res) => {
  req.session.logedin = null
  res.redirect('/login')
})

app.post('/registrationForm', (req, res) => {
  const newUsername = req.body.newUsername
  const newPass = req.body.newPassword
  const newUserTxt = `\r\n${newUsername}:${newPass}`
  const newUserUsers = `${newUsername}:${newPass}`
  if (newUsername && newPass) {
    fs.appendFile(textFilePath, newUserTxt, (err) => {
      if (err) throw err
      console.log('The "data to append" was appended to file!')
      console.dir(users)
      res.redirect('/login')
    })
    users.push(newUserUsers)
  } else { res.redirect('/sign-up') }
})

app.post('/loginForm', (req, res) => {
  req.session.username = req.body.username
  req.session.password = req.body.password
  console.log(req.session.username)
  const userCheck = req.session.username + ':' + req.session.password
  if (users.includes(userCheck)) {
    req.session.logedin = true
  }
  if (req.session.logedin) {
    res.redirect('/wellcome')
  } else { res.redirect('/unauthorized') }
})

app.listen(PORT)
console.log(`Listening to PORT ${PORT}`)
