import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import Users from 'src/components/dashboard/Users';
import LatestBooks from 'src/components/dashboard/LatestBooks';
import LatestUsers from 'src/components/dashboard/LatestUsers';
import Register from 'src/components/dashboard/Register';
import Books from 'src/components/dashboard/Books';
import TrafficByDevice from 'src/components/dashboard//TrafficByDevice';

const Dashboard = () => (
  <>
    <Helmet>
      <title>Dashboard | Library</title>
    </Helmet>
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100%',
        py: 3
      }}
    >
      <Container maxWidth={false}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={6}
            sm={6}
            xl={6}
            xs={12}
          >
            <Users />
          </Grid>
          <Grid
            item
            lg={6}
            sm={6}
            xl={6}
            xs={12}
          >
            <Books />
          </Grid>
          <Grid
            item
            lg={6}
            sm={6}
            xl={6}
            xs={12}
          >
            <Register />
          </Grid>
          <Grid
            item
            lg={6}
            md={6}
            xl={6}
            xs={12}
          >
            <TrafficByDevice sx={{ height: '100%' }} />
          </Grid>
          <Grid
            item
            lg={3}
            md={3}
            xl={3}
            xs={12}
          >
            <LatestUsers sx={{ height: '100%' }} />
          </Grid>
          <Grid
            item
            lg={9}
            md={9}
            xl={9}
            xs={12}
          >
            <LatestBooks />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
);

export default Dashboard;
