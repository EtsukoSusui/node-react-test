import { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';

import axios from 'axios';
const baseurl = process.env.REACT_APP_BASE_URL;

const BookListResults = ({ books, mybooks, ...rest }) => {
  var userData = JSON.parse(localStorage.getItem("userData")) || null;
  var role = userData?userData.role:"";
  const [selectedBookIds, setSelectedBooksIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  
  const handleSelectAll = (event) => {
    let newSelectedBooksIds;

    if (event.target.checked) {
      newSelectedBooksIds = books.map((book) => books.id);
    } else {
      newSelectedBooksIds = [];
    }

    setSelectedBooksIds(newSelectedBooksIds);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedBookIds.indexOf(id);
    let newSelectedBooksIds = [];

    if (selectedIndex === -1) {
      newSelectedBooksIds = newSelectedBooksIds.concat(selectedBookIds, id);
    } else if (selectedIndex === 0) {
      newSelectedBooksIds = newSelectedBooksIds.concat(selectedBookIds.slice(1));
    } else if (selectedIndex === selectedBookIds.length - 1) {
      newSelectedBooksIds = newSelectedBooksIds.concat(selectedBookIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedBooksIds = newSelectedBooksIds.concat(
        selectedBookIds.slice(0, selectedIndex),
        selectedBookIds.slice(selectedIndex + 1)
      );
    }

    setSelectedBooksIds(newSelectedBooksIds);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDelete = (id)=>{
    var userData = JSON.parse(localStorage.getItem("userData")) || null;
    var token = userData?userData.token:"";
    var config = {
      method: 'delete',
      url: `${baseurl}/books?id=${id}`,
      headers: { 
        'Authorization': 'Bearer ' + token,
    },
      data : {}
    };
    axios(config)
    .then((response) => {
      window.location.reload();       
    })
    .catch((error)=> {
        
    });
  }

  const removeFav = (id) =>{
    var userData = JSON.parse(localStorage.getItem("userData")) || null;
    var token = userData?userData.token:"";
    var config = {
      method: 'delete',
      url: `${baseurl}/favbooks?id=${id}`,
      headers: { 
        'Authorization': 'Bearer ' + token,
    },
      data : {}
    };
    axios(config)
    .then((response) => {
       window.location.reload();       
    })
    .catch((error)=> {
        
    });
  }

  const addFav = (id)=>{
    var userData = JSON.parse(localStorage.getItem("userData")) || null;
    var token = userData?userData.token:"";
    var config = {
      method: 'post',
      url: `${baseurl}/favbooks`,
      headers: { 
        'Authorization': 'Bearer ' + token,
    },
      data : {id:id}
    };
    axios(config)
    .then((response) => {
       window.location.reload();       
    })
    .catch((error)=> {
        
    });
  }

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedBookIds.length === books.length}
                    color="primary"
                    indeterminate={
                      selectedBookIds.length > 0
                      && selectedBookIds.length < books.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  Title
                </TableCell>
                <TableCell>
                  URL
                </TableCell>
                {
                  mybooks==true || role==1||role==0 ?
                  <TableCell>
                    Actoin
                  </TableCell>
                  :
                  ""
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {books.slice(0, limit).map((book) => (
                <TableRow
                  hover
                  key={book.id}
                  selected={selectedBookIds.indexOf(book.id) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedBookIds.indexOf(book.id) !== -1}
                      onChange={(event) => handleSelectOne(event, book.id)}
                      value="true"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Avatar
                        src={book.avatarUrl}
                        sx={{ mr: 2 }}
                      >
                        {getInitials(book.title)}
                      </Avatar>
                      <Typography
                        color="textPrimary"
                        variant="body1"
                      >
                        {book.title}
                      </Typography>
                    </Box>
                  </TableCell>
       
                  <TableCell>
                    <a href={`${baseurl}${book.url}`}>{book.title}</a>
                  </TableCell>
                  {
                    role==1 ?
                    <TableCell>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={()=>{
                          handleDelete(book.id)
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    :
                    ""
                  }
                  {
                    mybooks==true?
                    <TableCell>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={()=>{
                          removeFav(book.id)
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    :
                    ""
                  }
                  {
                    mybooks!=true && role===0?
                    <TableCell>
                      {
                        book.favorite=='T' ?
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={()=>{
                            removeFav(book.id)
                          }}
                        >
                          Unfav  
                        </Button>                      
                        :
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={()=>{
                            addFav(book.id)
                          }}
                        >
                        AddFav
                        </Button>
                      } 
                    </TableCell>
                    :
                    ""
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={books.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

BookListResults.propTypes = {
  books: PropTypes.array.isRequired
};

export default BookListResults;
