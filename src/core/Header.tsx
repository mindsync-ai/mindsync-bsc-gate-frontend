import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { AppBar, Container } from "@mui/material";

import Logo from "../assets/logo.png";

import { minimizeAddress } from "../helper/utils";
import useAuth from "../hooks/useAuth";


export const Header = () => {
  const { address, loading, connect, disconnect } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    handleClose();
    disconnect();
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          height="76px"
        >
          <Grid item>
            <Grid container alignItems="center">
              <img src={Logo} width={61} alt="Open Oasis" />
              <Typography component="span" variant="h4" ml={3} color="white">
                Mindsync
              </Typography>
            </Grid>
          </Grid>

          <Grid item display={{ lg: "flex" }}>
            {address ? (
              <Grid container alignItems="center">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClick}
                  style={{ marginLeft: 24 }}
                >
                  {minimizeAddress(address, 4, -4)}
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem
                    onClick={() => {
                      handleDisconnect();
                    }}
                  >
                    Disconnect
                  </MenuItem>
                </Menu>
              </Grid>
            ) : (
              <Button
                color="primary"
                style={{ color: "white" }}
                disabled={loading}
                onClick={connect}
              >
                Connect
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>
    </AppBar>
  );
};
