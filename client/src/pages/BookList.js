import { Helmet } from 'react-helmet';
import { Box, Container } from '@material-ui/core';
import BooksResults from 'src/components/books/BooksResults';
import BooksToolbar from 'src/components/books/BooksToolbar';

import axios from 'axios';
import { useState, useEffect } from 'react';
const baseurl = process.env.REACT_APP_BASE_URL;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filter,setFilter]=useState({keywords:"", pageNumber:1, pageSize:10});
  useEffect(() => {
    var data = new Array();
    var userData = JSON.parse(localStorage.getItem("userData")) || null;
    var token = "";
    if(userData)
    {
      token = userData.token;
    }
      var config = {
        method: 'get',
        url: `${baseurl}/books`,
        data : {},
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        params:filter
      };
      axios(config)
      .then((response) => {
        console.log(response.data.books)
        setBooks(response.data.books);
      })
      .catch((error)=> {

      })
  },[]);
  return(
    <>
      <Helmet>
        <title>Books | Library</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <BooksToolbar />
          <Box sx={{ pt: 3 }}>
            <BooksResults books={books} />
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default BookList;
