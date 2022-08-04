const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {pool} = require('./config');
const { request, response } = require('express');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const saltRounds = 10;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

const getBooks = (request, response) => {
  const{keywords,pageSize,pageNumber}=request.body;
  if(request.user)
  {
    pool.query(`SELECT id FROM users WHERE email='${request.user.email}'`,(error,results)=>{
      if(error)
      {
        throw error
      }
      else
      {
        userid = results.rows[0].id;
        pool.query(`SELECT *, CASE WHEN id in (SELECT book_id from favorite WHERE user_id=${userid}) THEN 'T' ELSE'F' END AS favorite FROM books`, (error1, results1) => {
          if (error1) {
            throw error1
          }
          pool.query(`SELECT count(*) FROM books WHERE title like '%${keywords}%'`, (error2, results2) => {
            if (error2) {
              throw error2
            }
            response.status(200).json({books:results1.rows, totalCount:results2.rows[0].count});
          })
        })
      }
    });

  }
  else{
    const{keywords, pageNumber, pageSize}  = request.query;
    pool.query(`SELECT * FROM books WHERE title like '%${keywords}%' LIMIT ${pageSize} OFFSET ${(pageNumber-1) * pageSize}`, (error, results) => {
      if (error) {
        throw error
      }
      pool.query(`SELECT count(*) FROM books WHERE title like '%${keywords}%'`, (error1, results1) => {
        if (error1) {
          throw error1
        }
        response.status(200).json({books:results.rows, totalCount:results1.rows[0].count});
      })   
    })
  }

}

const addBook = (request, response) => {
  const {title} = request.body
  
  if(!request.files.file) {
    response.status(400).json({status:"error", message: 'No file uploaded' });
  }
  else{
    let book = request.files.file;
    let filename = uuid.v1();
    let type = book.name.split(".")[1];
    book.mv(`./uploads/${filename+ "." + type}`);
    pool.query(`SELECT id FROM users WHERE email='${request.user.email}'`,(error,results)=>{
      if(error)
      {
        throw error
      }
      else
      {
        register = results.rows[0].id;
        pool.query(
          `INSERT INTO books (title, register, url) VALUES ('${title}', '${register}', '/uploads/${filename+"."+type}')`,
          (error) => {
            if (error) {
              throw error
            }
            response.status(201).json({status: 'success', message: 'Book added.'})
          },
        )
      }
    });
  }
}

const deleteBook = (request, response) => {
  const {id} = request.query
    pool.query(`DELETE FROM books WHERE id=${id}`,
      (error) => {
        if (error) {
          throw error
        }
        response.status(204).json({status: 'success', message: 'Deleted.'})
      }
    )
}


const registerUser = async(request,response) => {

  const {firstName,lastName,email,password} = request.body;
  const encryptedPassword = await bcrypt.hash(password, saltRounds)
  pool.query(`SELECT count(*) FROM users WHERE email='${email}'`, (error, results)=>{
    if(error){
      throw error
    }
    if(results.rows[0].count>0)
    {
      response.status(409).json({status:"error",message:"This email is already exist"})
    }
    else{
      pool.query('SELECT count(*) FROM users',(error1, results1)=>{
        if(error1){
          throw error1
        }
        
        pool.query(
          `INSERT INTO users (firstName, lastName, email, password, role) VALUES ('${firstName}', '${lastName}', '${email}', '${encryptedPassword}', '${results1.rows[0].count>0 ? 0 : 1}')`,
          (error2) => {
            if (error2) {
              throw error2
            }
            response.status(201).json({status:"success",token:generateAccessToken({email:email}),role:results1.rows[0].count>0 ? 0 : 1});
          },
        )
      })
    }
  })
}

const  loginUser = (request, response) =>{
  const {email,password} = request.body;
  pool.query(`SELECT * FROM users WHERE email='${email}'`, async(error, results)=>{
    if(error){
      throw error
    }
    if(results.rows.length>0)
    {
      const validPassword = await bcrypt.compare(password, results.rows[0].password);

      if(validPassword)
      {
        response.status(200).json({status:"success",token:generateAccessToken({email:email}), role:results.rows[0].role});
      }     
    }
    response.status(401).json({status:"error",message:"authontification error"});
  })
}

const getFavrite = (request,response)=>{
  pool.query(`SELECT id FROM users WHERE email='${request.user.email}'`,(error,results)=>{
    if(error)
    {
      throw error
    }
    else
    {
      userid = results.rows[0].id;
      const{keywords, pageNumber, pageSize}  = request.query;
      pool.query(`SELECT * FROM books AS b WHERE  title LIKE '%${keywords}%' LIMIT ${pageSize} OFFSET ${(pageNumber-1) * pageSize}`, (error1, results) => {
        if (error1) {
          throw error1
        }
        pool.query(`SELECT count(*) FROM books WHERE register='${userid}' AND title like '%${keywords}%'`, (error2, results1) => {
          if (error2) {
            throw error2
          }
          response.status(200).json({books:results.rows, totalCount:results1.rows[0].count});
        })   
      })
    }
  });

}


const addFavrite = (request,response)=>{
  var bookid = request.body.id;
  
  pool.query(`SELECT id FROM users WHERE email='${request.user.email}'`,(error,results)=>{
    if(error)
    {
      throw error
    }
    else
    {
      userid = results.rows[0].id;
      console.log(bookid,userid)
      pool.query(`INSERT INTO favorite (user_id, book_id) VALUES ('${userid}', '${bookid}')`, (error1, results1) => {
        if (error1) {
          throw error1
        }
        response.status(201).json({status: 'success', message: 'favorite added.'})
      })
    }
  });
}


const deleteFavrite = (request, response) => {
  const {id} = request.query
  pool.query(`SELECT id FROM users WHERE email='${request.user.email}'`,(error,results)=>{
      if(error)
      {
        throw error
      }
      userid = results.rows[0].id;
      pool.query(`DELETE FROM favorite WHERE book_id=${id} AND user_id=${userid}`,
      (error) => {
        if (error) {
          throw error
        }
        response.status(204).json({status: 'success', message: 'Deleted.'})
      }
    )
    })
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

function authenticateTokenTogetFav(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]
  
  if (token == null){
    next()
  } 
  else{
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) next()
      req.user = user
      next()
    })
  } 
}


function generateAccessToken(email) {
  return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}


app.route('/register').post(registerUser);
app.route('/login').post(loginUser);
app.route('/books')
   .get(authenticateTokenTogetFav,getBooks)
   .post(authenticateToken,addBook)
   .delete(authenticateToken,deleteBook);
app.route('/favbooks')
   .get(authenticateToken,getFavrite)
   .delete(authenticateToken,deleteFavrite)
   .post(authenticateToken,addFavrite);

app.route('/uploads/:id').get((request, response) => {
  var {id} = request.params;
  response.sendFile(path.join(__dirname, `./../uploads/${id}`));
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server listening`)
});
