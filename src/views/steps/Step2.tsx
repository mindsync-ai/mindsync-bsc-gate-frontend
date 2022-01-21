import { Typography, Box, Slider, Button } from "@mui/material";

export default function Step2({
  handleNext,
  handleBack,
  balance,
  swapAmount,
  setSwapAmount,
  checkConnect,
}) {
  const marks = [
    {
      value: 0,
      label: "0",
    },
    {
      value: balance,
      label: `${balance} MAI`,
    },
  ];

  const valuetext = (value: number) => {
    return `${value} MAI`;
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSwapAmount(newValue);
  };

  const onNext = () => {
    if (!checkConnect()) {
      return;
    }
    handleNext();
  }

  return (
    <>
      <Typography fontSize={18}>Your MAI balance: {balance} MAI</Typography>
      <Typography fontSize={18}>
        Enter the desired swap amount and click "Next".
      </Typography>
      <Box sx={{ width: 300 }} key={1} mt={4}>
        <Slider
          value={typeof swapAmount === "number" ? swapAmount : 0}
          getAriaValueText={valuetext}
          step={1}
          min={0}
          max={balance}
          marks={marks}
          valueLabelDisplay="on"
          onChange={handleSliderChange}
        />
      </Box>
      <Box sx={{ mb: 2 }} key={2}>
        <div>
          <Button
            variant="contained"
            onClick={onNext}
            sx={{ mt: 1, mr: 1 }}
          >
            Next
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleBack}
            sx={{ mt: 1, mr: 1 }}
          >
            Back
          </Button>
        </div>
      </Box>
    </>
  );
}
