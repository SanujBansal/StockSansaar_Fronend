import {
  Grid,
  makeStyles,
  Popover,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useState } from "react";
import { useHistory } from "react-router";
import Alert from "../../components/molecules/Alert";
import CenterCard from "../../components/organisms/CenterCard";
import {
  PASSWORD_PATTERN_NOT_MATCH_TEXT,
  PASSWORDS_DONT_MATCH,
} from "../../constants/formValidation";
import { SIGNUP_SUCCESS_MESSAGE } from "../../constants/userInfoMessages";
import formValidation from "../../helpers/formValidation";

const auth = getAuth();
const useStyles = makeStyles({
  gridContainer: {
    width: "40rem",
    margin: "1rem",
  },
  signupImage: {
    borderRadius: "3rem",
    margin: "1rem",
  },
  alert: {
    width: "20rem",
  },
});

//snackbar

function SignUpPage() {
  const WELCOME_MSG = "Welcome To StockSansaar";
  const TRADING_IMAGE_TEXT = "We will Trade Good Stocks";
  const GO_TO_SIGNIN = "Back To Sign In";
  const SIGNUP_BUTTON = "Sign Up";
  const history = useHistory();
  const classes = useStyles();
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const handleClose = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorMessage("");
    setOpenSnackbar(false);
  };

  const signUp = (email?: string, password?: string) => {
    if (!email || !password) {
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        setOpenSnackbar(true);
        setTimeout(() => history.push("/"), 3000);
      })
      .catch((error) => {
        setOpenSnackbar(true);
        setErrorMessage(error.message);
      });
  };

  const signUpContent = () => (
    <>
      <Typography variant="h5">{WELCOME_MSG}</Typography>
      <Grid container className={classes.gridContainer}>
        <Grid item xs={6} className="marginY">
          <TextField
            autoFocus
            type="email"
            id="login-email"
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() =>
              formValidation.checkEmailValidity(email, setEmailError)
            }
            helperText={emailError ? "Enter Correct Email" : null}
            error={emailError}
          />
          <TextField
            type="Password"
            id="login-password"
            label="password"
            onChange={(e: any) => setPassword(e.target.value)}
            onClick={(e: any) => {
              setAnchorEl(e.currentTarget);
            }}
            onBlur={() =>
              formValidation.checkPasswordValidity(password, setPasswordError)
            }
            helperText={passwordError ? PASSWORD_PATTERN_NOT_MATCH_TEXT : null}
            error={passwordError}
          />
          <TextField
            type="password"
            id="login-password"
            label="Confirm Password"
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            helperText={
              password !== confirmPassword && confirmPassword
                ? PASSWORDS_DONT_MATCH
                : null
            }
            error={password !== confirmPassword && confirmPassword !== ""}
          />
          <div>
            <Button
              color="primary"
              variant="contained"
              disabled={
                password === confirmPassword && !passwordError ? false : true
              }
              onClick={() => signUp(email, password)}
            >
              {SIGNUP_BUTTON}
            </Button>
          </div>
          <div>or</div>
          <div>
            <Button
              color="primary"
              onClick={() => {
                history.push("/");
              }}
            >
              {GO_TO_SIGNIN}
            </Button>
          </div>
        </Grid>
        <Grid item xs={6}>
          <img
            src="/images/signUp.jpg"
            height="240"
            alt="Stocks Page"
            className={classes.signupImage}
          />
          <Typography variant="body2">{TRADING_IMAGE_TEXT}</Typography>
        </Grid>
      </Grid>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Alert
          className={classes.alert}
          onClose={handleInfoClose}
          severity="info"
        >
          {PASSWORD_PATTERN_NOT_MATCH_TEXT}
        </Alert>
      </Popover>
    </>
  );
  return (
    <>
      <CenterCard content={signUpContent()} />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        {errorMessage ? (
          <Alert onClose={handleClose} severity="error">
            {errorMessage}
          </Alert>
        ) : (
          <Alert onClose={handleClose} severity="success">
            {SIGNUP_SUCCESS_MESSAGE}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}

export default SignUpPage;
