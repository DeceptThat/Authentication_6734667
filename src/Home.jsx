import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useContext(UserContext);

  useEffect(() => {
    if (!isLoggedIn && !isInitializing) {
      navigate("/login");
    }
  }, [isInitializing, isLoggedIn, navigate]);

  if (isInitializing) return <div>Loading...</div>;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            My Frontend 1.0
          </Typography>
          <Button color="inherit" onClick={() => navigate("/item")}>
            Item
          </Button>
          <Button
            color="inherit"
            onClick={async () => {
              const result = await fetch(`${API_URL}/api/auth/logout`, {
                credentials: "include",
              });
              if (result.ok) {
                window.location.reload();
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: 2, pt: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
}
