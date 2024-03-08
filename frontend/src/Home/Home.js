import { Box, Typography } from "@mui/material";
import sport from "../assets/sports.jpg";
import art from "../assets/art.jpg";
import edu from "../assets/edu.jpg";
import React from "react";
import ProductCategories from "./ProductCategories";

function Home() {
  return (
    <div>
      <Box>
        <Typography variant="h3" component="p">
          HPLaserChads E-Commerce Solution
        </Typography>

        <Box className="roundedD"></Box>
      </Box>
      <Box className="p-8">
        <Typography variant="h5" component="p" sx={{ color: "grey" }}>
          Welcome to the LaserChads
        </Typography>
        <Box py={2} sx={{ textAlign: "center", width: "70%", margin: "auto" }}>
          <Typography variant="p" component="p" sx={{ color: "grey" }}>
            HPLaserChads E-Commerce Solution is a platform where you can buy and
            sell products. We have a wide range of products from different
            merchants. You can buy and sell products of your choice.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "1100px",
          margin: "auto",
          flexWrap: "wrap",
        }}
      >
        <ProductCategories img={sport} title={"Sports"} />
        <ProductCategories img={art} title={"Arts"} />
        <ProductCategories img={edu} title={"Edcation"} />
      </Box>
    </div>
  );
}

export default Home;
