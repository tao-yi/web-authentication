const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const TWO_HOURS = 1000 * 60 * 60 * 2
const { PORT = 3000, NODE_ENV = 'development' } = process.env

const users = [
  { id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret1' },
  { id: 2, name: 'Max', email: 'max@gmail.com', password: 'secret2' },
  { id: 3, name: 'Hagard', email: 'hagard@gmail.com', password: 'secret3' }
]

const redirectLogin = (req,res,next) => {
  if(!req.session.userId) {
    res.redirect('/login')
  } else {
    next()
  }
}

const redirectHome = (req, res, next) => {
  if(req.session.userId){
    res.redirect('/home')
  }else{
    next()
  }
}

const app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(
  session({
    cookie: {
      // default to apply to the current domain
      // domain: "/",

      // default to true
      httpOnly: true,
      maxAge: TWO_HOURS,
      // path default to '/'
      path: '/',
      // prevent CSRF, browser will only accept the cookie from same domain
      sameSite: true,
      // only set to true in prod env, because HTTPs is required to use secure cookie
      secure: !!NODE_ENV
    },
    // force server to send cookie for every response
    rolling: false,
    // force new and not modified session to be saved to the store
    saveUninitialized: false,
    // force the session to be resaved in session store even if not modified,
    resave: false,
    // custom name for session name,
    name: 'sid',
    // symmetric key used to sign the cookie,
    secret: 'symmetric-key'
    // default to in memory store
    // store:
  })
)

app.get('/', (req, res, next) => {
  const { userId } = req.session
  console.log(userId)
  res.send(
    '<h1>Welcome!</h1>' +
      (userId
        ? `
      <a href='/home'>Home</a>
      <form method="post" action="/logout">
        <button>Logout</button>
      </form>
      `
        : `
      <a href='/login'>Login</a>
      <a href='/register'>Register</a>
      `)
  )
})

app.get('/home', redirectLogin, (req,res,next) => {
  res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Name: </li>
      <li>Email: </li>
    </ul>
  `)
})

app.get('/login', redirectHome, (req, res, next) => {
  // req.session.userId =
  res.send(
    `
    <h1>Login</h1>
    <form method="post" action="/login">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <input type="submit" />
    </form>
    <a href="/register">Register</a>
    `
  )
})

app.get('/register', redirectHome, (req, res, next) => {
  res.send(`
  <h1>Register</h1>
  <form method="post" action="/register">
    <input type="name" name="name" placeholder="Name" required />
    <input type="email" name="email" placeholder="Email" required />
    <input type="password" name="password" placeholder="Password" required />
    <input type="submit" />
  </form>
  <a href="/login">Login</a>
  `)
})

app.post('/login', redirectHome, (req, res, next) => {
  const { email, password } = req.body
  if(email && password) {
    const user = users.find(user => user.email === email && user.password === password)
    if(user) {
      req.session.userId = user.id
      return res.redirect('/home')
    }
  }
  res.redirect('/login')
})

app.post('/register', redirectHome, (req, res, next) => {
  const { email, password, name } = req.body
  // TODO: validation
  if(name && email && password) {
    const exists = users.some(
      user => user.email === email
    )

    if(!exists) {
      const user = {
        id: users.length + 1 ,
        name,
        email,
        password
      }
      users.push(user)
      req.session.userId = user.id
      return res.redirect('/home')
    }
  }
  res.redirect('/register') // 
})

app.post('/logout', (req,res,next) => {
  req.session.destroy(err => {
    if(err){
      return res.redirect('/home')
    }

    res.clearCookie('sid')
    res.redirect('/login')
  })
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT || 3000}`)
})
