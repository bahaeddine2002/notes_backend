const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.static('dist'))
app.use(cors())

const requestLogger = (request, response, next) =>{
    console.log('Methode:',request.method)
    console.log('Path:   ',request.path)
    console.log('Body:   ', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(requestLogger)

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
      },
      {
        id: "2",
        content: "Browser can execute only JavaScript",
        important: false
      },
      {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
      }
]




app.get('/api/notes',(request, response)=>{
    response.json(notes)
})

app.get('/api/notes/:id',(request,reponse)=>{
    const id = request.params.id
    const note = notes.find(note=>note.id===id)
    if(note){
        reponse.json(note)
    }else{
        reponse.status(404).end()
    }
    
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    console.log(id)
    notes = notes.filter(note => note.id !== id)
  
    response.status(204).end()
  })

  const generateId =(()=>{
    const maxId = notes.length>0
    ?Math.max(...notes.map(n=>Number(n.id)))
    :0
    return String(maxId +1)
  })


app.post('/api/notes', (request, response)=>{
    const body = request.body
    if(!body.content){
        return response.status(400).json({
            error : 'contetn missing'
        })
    }
    
    const note ={
        content: body.content,
        import	: body.important || false,
        id: generateId()
    }
    
    notes = notes.concat(note)
    response.json(note)
})

const unkownEndPoint = (request, response)=>{
    response.status(404).send({error: 'unkown endpoint'})
}
app.use(unkownEndPoint)


const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})