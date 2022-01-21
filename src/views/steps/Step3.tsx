import { useState } from "react";
import { Typography, Box, Button, CircularProgress, Grid } from "@mui/material";
import Web3 from "web3";

export default function Step3({
  handleNext,
  handleBack,
  swapAmount,
  allowanceAmount,
  approve,
  checkConnect,
}) {
  const [loading, setLoading] = useState(false);

  const increaseAllowance = async () => {
    if (!checkConnect()) {
      return;
    }
    setLoading(true);
    console.log("allowed to spend:", allowanceAmount);
    const diff = swapAmount - allowanceAmount;
    if (diff > 0) {
      const result = await approve(swapAmount);
      if (!result) {
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    handleNext();
  };

  return (
    <>
      <Typography fontSize={18} mb={2}>
        Your allowed to spend:{" "}
        {Web3.utils.fromWei(`${allowanceAmount}`, "ether")} MAI
      </Typography>
      <Typography fontSize={18}>
        Before initializing the swap, you should increase allowance so that your
        funds can be transferred by the swap contract.
      </Typography>
      <Typography fontSize={18}>
        The app will calculate the corresponding allowance value and either ask
        you to submit the transaction or skip this step.
      </Typography>
      <Typography fontSize={18}>Click "Increase allowance" button.</Typography>
      <Box sx={{ mb: 2, mt: 2 }}>
        <Grid container alig-items="center">
          <Grid item>
            <Button
              variant="contained"
              disabled={loading}
              onClick={increaseAllowance}
              sx={{ mt: 1, mr: 1 }}
            >
              Increase Allowance
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
