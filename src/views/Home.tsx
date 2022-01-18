import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";

import { AuthContext } from "../contexts/AuthContext";
import { useContracts } from "../contexts/Web3Context";
import { useSnackbar } from "../contexts/Snackbar";

function Step1({ handleNext, user, switchChain, fetchUserInfo }) {
  const handleChange = async (event) => {
    const chainId = event.target.value;
    const switchSuccess = await switchChain(chainId);
    if (switchSuccess) {
      fetchUserInfo(user.address, chainId);
    }
  };

  return (
    <>
      <Typography>This is step1</Typography>
      <Select value={user.chainId} onChange={handleChange} displayEmpty>
        <MenuItem value={1}>Ethereum → BSC</MenuItem>
        <MenuItem value={56}>BSC → Ethereum</MenuItem>
      </Select>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            Next
          </Button>
        </div>
      </Box>
    </>
  );
}

function Step2({ handleNext, handleBack, user }) {
  console.log(user);
  return (
    <>
      <Typography>This is step2. Balance: {user.balance}</Typography>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            Next
          </Button>
          <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
            Back
          </Button>
        </div>
      </Box>
    </>
  );
}

function Step3({ handleNext, handleBack }) {
  return (
    <>
      <Typography>This is step3</Typography>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            Next
          </Button>
          <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
            Back
          </Button>
        </div>
      </Box>
    </>
  );
}

function Step4({ handleNext, handleBack }) {
  return (
    <>
      <Typography>This is step4</Typography>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            Swap Token
          </Button>
          <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
            Back
          </Button>
        </div>
      </Box>
    </>
  );
}

export default function Home() {
  const { address, chainId, switchChain } = useContext(AuthContext);
  const {
    contracts: {
      tokenContract,
      ethSwapContract,
      bscSwapContract,
    },
    wrongNetwork,
  } = useContracts();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState({ address: "", chainId: 56, balance: 0 });

  const steps = [
    {
      label: "Select swap direction",
    },
    {
      label: "Enter the desired swap amount",
    },
    {
      label: "Increase allowance",
    },
    {
      label: "Initialize token swap",
    },
  ];

  const fetchUserInfo = async (address, chainId) => {
    const balance = await tokenContract?.methods.balanceOf(address).call();
    console.log(tokenContract, balance);
    setUser({ address, chainId, balance });
  }

  useEffect(() => {
    if (!address || !chainId) {
      return;
    }
    if (wrongNetwork) {
      showSnackbar({
        severity: "error",
        message: "Please switch to Ethereum or BSC Network",
      });
      return;
    }
    fetchUserInfo(address, parseInt(chainId));
    console.log('+++++++++++++++', chainId);
  }, [address, chainId, tokenContract]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Container
      maxWidth="sm"
      style={{ display: "flex", height: "calc(100vh - 76px)" }}
    >
      <Box>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {(() => {
                  switch (index) {
                    case 0:
                      return (
                        <Step1
                          handleNext={handleNext}
                          user={user}
                          switchChain={switchChain}
                          fetchUserInfo={fetchUserInfo}
                        />
                      );
                    case 1:
                      return (
                        <Step2
                          handleNext={handleNext}
                          handleBack={handleBack}
                          user={user}
                        />
                      );
                    case 2:
                      return (
                        <Step3
                          handleNext={handleNext}
                          handleBack={handleBack}
                        />
                      );
                    case 3:
                      return (
                        <Step4
                          handleNext={handleNext}
                          handleBack={handleBack}
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
