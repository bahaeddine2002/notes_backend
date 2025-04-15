require('dotenv').config() //to acces the .env where we will find the env variable
const express = require('express')

const app = express()
app.use(express.static('dist'))

const requestLogger = (request, response, next) =>{
    console.log('Methode:',request.method)
    console.log('Path:   ',request.path)
    console.log('Body:   ', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(requestLogger)

const Note = require('./models/note')


app.get('/api/notes',(request, response)=>{
    
    Note.find({}).then(notes=>{
        response.json(notes) 
    })
})

app.get('/api/notes/:id',(request,response,next)=>{
   Note.findById(request.params.id).then(note=>{
        if(note) {
            response.json(note)
        } else{
            response.status(404).end()
        }
   })
   .catch(error=> next(error))
    
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result=>{
            response.status(204).end() //status 204:no content
        })
        .catch(error=> next(error))
  })


app.post('/api/notes', (request, response, next) => {
    const body = request.body
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
    })
  
    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
  })

app.put('/api/notes/:id', (request, response, next)=>{
    const{content, important } = request.body
    Note.findById(request.params.id)
        .then(note =>{
            if(!note){
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save().then(updatedNote=>{
                response.json(updatedNote)
            })
        }).catch(error=>next(error))
})


const unkownEndPoint = (request, response)=>{
    response.status(404).send({error: 'unkown endpoint'})
}
app.use(unkownEndPoint)


const errorHandler = (error, request, response, next)=>{
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({ error : "malformatted id"})
    }else if(error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}



app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})