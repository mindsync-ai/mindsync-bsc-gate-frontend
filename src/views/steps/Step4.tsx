import { useState } from "react";
import { Typography, Box, Button, CircularProgress, Grid } from "@mui/material";

export default function Step4({
  handleNext,
  handleBack,
  user,
  swapAmount,
  allowanceAmount,
  swapETHtoBSC,
  swapBSCtoETH,
  showSnackbar,
  checkConnect,
}) {
  const [loading, setLoading] = useState(false);

  const swap = async () => {
    if (!checkConnect()) {
      return;
    }

    setLoading(true);
    const diff = swapAmount - allowanceAmount;
    if (diff > 0) {
      showSnackbar({
        severity: "error",
        message: "Step 3 missed. Amount to swap is not allowed to spend.",
      });
      setLoading(false);
      return;
    }

    let tx;
    if (parseInt(user.chainId) === 1) {
      tx = await swapETHtoBSC(swapAmount);
    } else {
      tx = await swapBSCtoETH(swapAmount);
    }
    console.log("Swap tx:", tx);
    setLoading(false);
    handleNext();
  };

  return (
    <>
      <Typography fontSize={18} mb={2}>
        Your allowed to spend: {swapAmount}
      </Typography>
      <Typography fontSize={18}>
        At this stage you we will send MAI tokens to swap contract.
      </Typography>
      <Typography fontSize={18} mb={2}>
        You will receive tokens to the same address on the selected network
        after the transactions are completed.
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Grid container alig-items="center">
          <Grid item>
            <Button
              variant="contained"
              disabled={loading}
              onClick={swap}
              sx={{ mt: 1, mr: 1 }}
            >
              Swap Token
            </Button>
            <Button
              variant="outlined"
              disabled={loading}
              color="secondary"
              onClick={handleBack}
              sx={{ mt: 1, mr: 1 }}
            >
              Back
            </Button>
          </Grid>
          <Grid item>{loading && <CircularProgress />}</Grid>
        </Grid>
      </Box>
    </>
  );
}
