import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useNavigate } from "react-router-dom";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function SearchAppBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Patienten", icon: <PeopleIcon />, path: "/" },
    { text: "Über uns", icon: <InfoIcon />, path: "/" },
    { text: "Kontakt", icon: <ContactMailIcon />, path: "/" },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" }, cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/")}
          >
            Healthcare Hospital
          </Typography>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>

            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Toolbar>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 280, pt: 2 }} role="presentation">
            <Typography variant="h6" sx={{ px: 2, pb: 2, color: "primary.main", fontWeight: "bold" }}>
              Healthcare Hospital
            </Typography>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                    }}>
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </AppBar>
    </Box>
  );
}