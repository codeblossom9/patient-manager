import Box from "@mui/material/Box";

export default function AppHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        component="img"
        sx={{
          height: 300,
          width: 1500,
          objectFit: "cover",
        }}
        alt="Healthcare"
        src="https://thumbs.dreamstime.com/b/doctor-medical-background-24834402.jpg?w=992"
      />
    </Box>
  );
}