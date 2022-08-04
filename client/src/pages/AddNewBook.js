import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
const baseurl = process.env.REACT_APP_BASE_URL;

const AddNewBook = () => {
  const navigate = useNavigate();
  var userData = JSON.parse(localStorage.getItem("userData")) || null;
  var token = "";
  if(userData)
  {
    token = userData.token;
  }
  return (
    <>
      <Helmet>
        <title>Login | Library</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              file: null,
              title: ''
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(255).required('Title is required'),
              file: Yup.mixed().required('A file is required')
            })}
            onSubmit={(values) => {
              console.log(values);
              const fd = new FormData();
              fd.append("title", values.title);
              fd.append("file", values.file);
              axios.post(`${baseurl}/books`, fd, {
                headers: {
                  'Authorization': 'Bearer ' + token,
                }
              }).then((response)=>{
                 navigate('/app/library', { replace: true });
              }).catch((error)=>{
                // setAlertmodal(true);
                // setAlertTitle("Login Failed");
                // setAlertContent("Password is not correct!");
              });
             }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    color="textPrimary"
                    variant="h2"
                  >
                    ADD New Book
                  </Typography>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                  </Typography>
                </Box>
                <input id="file" name="file" type="file" accept=".doc,.pdf,.docx,.txt" onChange={(event) => {
                    setFieldValue("file", event.currentTarget.files[0]);
                  }} 
                  className={
                    errors.file && touched.file
                    ? 'form-control is-invalid'
                    : 'form-control'
                 }
                />
                <TextField
                  error={Boolean(touched.title && errors.title)}
                  fullWidth
                  helperText={touched.title && errors.title}
                  label="Book Title"
                  margin="normal"
                  name="title"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.title}
                  variant="outlined"
                />
                <Box sx={{ py: 2 }}>
                  <Button
                    color="primary"
                    // disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Add New
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </>
  );
};

export default AddNewBook;
