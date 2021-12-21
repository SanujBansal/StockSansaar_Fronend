import {
  AppBar,
  Button,
  FormControlLabel,
  Grid,
  makeStyles,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import Alert from "../molecules/Alert";

const useStyles = makeStyles((theme: Theme) => ({
  themeSwitch: {
    marginLeft: "1rem",
  },
  toolbar: {
    alignSelf: "center",
    width: "90vw",
  },
  gridRoot: {
    alignItems: "center",
    justifyContent: "center",
  },
}));

function TopNav({ themeChange, isDarkMode }: any) {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [logoutError, setLogoutError] = React.useState("");
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [value, setValue] = React.useState("");

  // const handleChange = (event: any, newValue: any) => {
  //   setValue(newValue.split("/")[1]);
  // };

  const logoutHandler = () => {
    signOut(auth)
      .then((res) => {
        setOpenSnackbar(true);
        setTimeout(() => {
          history.push("/", 2000);
        });
      })
      .catch((error) => {
        setLogoutError(error.message);
      });
  };

  useEffect(() => {
    setValue(location.pathname.split("/")[1]);
  }, [location]);

  function a11yProps(index: any) {
    return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`,
    };
  }

  const auth = getAuth();
  auth.onAuthStateChanged((user: any) => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  });

  const handleClose = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Grid container spacing={1} className={classes.gridRoot}>
          <Grid item xs={2} onClick={() => history.push("/")}>
            <Typography variant="h6" component="div">
              StockSansaar
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <FormControlLabel
              control={
                <Switch defaultChecked={isDarkMode} onChange={themeChange} />
              }
              label="Dark Mode"
              className={classes.themeSwitch}
            />
          </Grid>
          {!loggedIn ? (
            <>
              <Grid item xs={5}></Grid>
              <Grid item xs={2}>
                <Button color="inherit" onClick={() => history.push("/login")}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => history.push("/signup")}>
                  Signup
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <Tabs
                  value={value}
                  // onChange={handleChange}
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="top bar navigation tabs"
                >
                  <Tab
                    label="Home"
                    value=""
                    {...a11yProps(0)}
                    onClick={() => history.push("/")}
                  />
                  <Tab
                    label="Strategies"
                    {...a11yProps(1)}
                    value="strategies"
                    onClick={() => history.push("/strategies")}
                  />

                  <Tab
                    label="Virtual Portfolio"
                    value="virtual-portfolio"
                    {...a11yProps(3)}
                    onClick={() => history.push("/virtual-portfolio")}
                  />
                  <Tab
                    label="Screener"
                    value="screener"
                    onClick={() => history.push("/screener")}
                    {...a11yProps(4)}
                  />
                </Tabs>
              </Grid>
              <Grid item xs={1}>
                <Button color="inherit" onClick={logoutHandler}>
                  Logout
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Toolbar>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={logoutError === "" ? "success" : "error"}
        >
          {logoutError === "" ? "You are now Logged Out!" : logoutError}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

export default TopNav;
