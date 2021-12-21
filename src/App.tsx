import React, { useEffect, useState } from "react";
import routes from "./routes";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import TopNav from "./components/organisms/Header";
import { AuthProvider } from "./AuthContext";
import LoginPage from "./pages/login/Login";
import PrivateRoute from "./ProtectedRoute";
import SignUpPage from "./pages/signup/SignUp";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import HomePage from "./pages/Homepage";
import PageNotFound from "./pages/PageNotFound";
import KiteProvider from "./KiteContext";

function App() {
  const [darkState, setDarkState] = useState(true);
  const palletType = darkState ? "dark" : "light";
  const darkTheme = createTheme({
    palette: {
      type: palletType,
    },
  });
  const handleThemeChange = () => {
    if (darkState) {
      localStorage.setItem("darkMode", "false");
      setDarkState(false);
    } else {
      localStorage.setItem("darkMode", "true");
      setDarkState(true);
    }
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkState(isDarkMode);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="App">
          <KiteProvider>
            <BrowserRouter>
              <TopNav
                isDarkMode={darkState ? true : false}
                themeChange={handleThemeChange}
              />

              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/signup" component={SignUpPage} />
                {routes.map((route: any) => (
                  <PrivateRoute {...route}></PrivateRoute>
                ))}
                <Route component={PageNotFound} />
              </Switch>
            </BrowserRouter>
          </KiteProvider>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
