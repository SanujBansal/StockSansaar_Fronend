import { Snackbar, TextField, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import Alert from "../../components/molecules/Alert";
import CenterCard from "../../components/organisms/CenterCard";
import formValidation from "../../helpers/formValidation";

const WELCOME_MSG = "Welcome Back";
const SIGNIN_BUTTON = "Sign In";
const SIGNUP_BUTTON = "Sign Up";
const auth = getAuth();

function LoginPage() {
  const history = useHistory();
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("testuser@test.com");
  const [password, setPassword] = useState<string>("TestUser@123");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const handleClose = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorMessage("");
    setOpenSnackbar(false);
  };

  const signIn = (email?: string, password?: string) => {
    if (!email || !password) {
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Signed in
        history.push("/");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };
  useEffect(() => {
    if (auth.currentUser) {
      history.push("/");
    }
  });
  useEffect(() => {
    if (errorMessage !== "") {
      setOpenSnackbar(true);
    }
  }, [errorMessage]);
  const loginCardContent = () => (
    <div className="flex-column marginY">
      <Typography variant="h5">{WELCOME_MSG}</Typography>
      <TextField
        autoFocus
        type="email"
        id="login-email"
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => formValidation.checkEmailValidity(email, setEmailError)}
        helperText={emailError ? "Enter Correct Email" : null}
        error={emailError}
        autoComplete="on"
      />
      <TextField
        type="password"
        id="login-password"
        variant="outlined"
        label="Password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />
      <div className="marginY">
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => signIn(email, password)}
          >
            {SIGNIN_BUTTON}
          </Button>
        </div>
        <Typography variant="body2">OR</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => history.push("/signup")}
        >
          {SIGNUP_BUTTON}
        </Button>
      </div>
    </div>
  );
  return (
    <>
      <CenterCard width="20rem" content={loginCardContent()} />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LoginPage;
