const express = require('express')
const crypto = require('node:crypto')
const movies = require('./API/movies.json')
const { validateSchema, validateUpdateMovie } = require('./schemas/movies')

const app = express()

app.use(express.json())
app.disable('x-powered-by')

const port = process.env.PORT ?? 4000

// Recuperar todas las peliculas
app.get('/movies', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const { genre } = req.query
  if (genre) {
    const movieFiltered = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(movieFiltered)
  }
  return res.json(movies)
})

// Recuperar una pelucla por ID
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  return res.json(404, { message: 'Not found Movie' })
})

// Recuperar una pelicula con filtro de terror
app.post('/movies', (req, res) => {
  const result = validateSchema(req.body)

  if (!result.success) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // No se deberia hacer porque estanos guardando
  // data en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params

  const result = validateUpdateMovie(req.body)

  if (result.error) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return res.json(404, { message: 'Id Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.status(200).json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const { id } = req.params

  const movieDelete = movies.findIndex(movie => movie.id === id)

  if (movieDelete < 0) return res.json(404, { message: 'Id Movie not found' })

  movies.splice(movieDelete, 1)

  res.status(200).json({ message: 'Movie Delete' })
})

app.options('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  res.send(200)
})

app.listen(port, () => {
  console.log(`server lisening port in: http://localhost:${port}`)
})
