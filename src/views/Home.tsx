import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
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
} from "@mui/material";

import { AuthContext } from "../contexts/AuthContext";
import { useContracts } from "../contexts/Web3Context";
import { useSnackbar } from "../contexts/Snackbar";
import { config } from "../config";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";

export default function Home() {
  const { address, chainId, switchChain } = useContext(AuthContext);
  const {
    contracts: { tokenContract, ethSwapContract, bscSwapContract },
    wrongNetwork,
  } = useContracts();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState({ address: "", chainId: 56 });
  const [balance, setBalance] = useState(0);
  const [swapAmount, setSwapAmount] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);

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

  const fetchInfo = async () => {
    if (!tokenContract || !address) {
      return;
    }
    const balance = await tokenContract.methods.balanceOf(address).call();
    const balanceMAI = parseInt(Web3.utils.fromWei(`${balance}`, "ether"));
    console.log(tokenContract, balanceMAI);
    setBalance(balanceMAI);
    setSwapAmount(balanceMAI);
    const allowedToSpend = await getAllowance(user.address);
    setAllowanceAmount(allowedToSpend);
  };

  useEffect(() => {
    if (!address || !chainId) {
      setUser({ address: "", chainId: 56 });
      return;
    }
    if (wrongNetwork) {
      showSnackbar({
        severity: "error",
        message: "Please switch to Ethereum or BSC Network",
      });
      return;
    }
    setUser({ address, chainId: parseInt(chainId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId, wrongNetwork]);

  useEffect(() => {
    if (!tokenContract) {
      return;
    }
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenContract]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getSwapContractAddress = (chainId) => {
    return parseInt(chainId) === 1
      ? config.ETHSwapContractAddress
      : config.BSCSwapContractAddress;
  };

  const convertToWei = (amount) => {
    return Web3.utils.toWei(amount.toString(), "ether");
  };

  const getAllowance = async (account) => {
    if (!tokenContract) {
      showSnackbar({
        severity: "error",
        message: "Can't access to token contract",
      });
      return null;
    }
    const swapContractAddress = getSwapContractAddress(chainId);
    const allowed_to_spend = await tokenContract.methods
      .allowance(account, swapContractAddress)
      .call();
    return allowed_to_spend;
  };

  const approve = async (amount) => {
    if (!tokenContract) {
      showSnackbar({
        severity: "error",
        message: "Can't access to token contract",
      });
      return null;
    }

    const tokenAmountToApprove = Web3.utils.toBN(amount);
    const calculatedApproveValue = Web3.utils.toHex(tokenAmountToApprove);
    const swapContractAddress = getSwapContractAddress(chainId);

    let tx = await tokenContract.methods
      .approve(swapContractAddress, calculatedApproveValue)
      .send({ from: address, gasLimit: 50000 }, function (error, txnHash) {
        if (error) {
          showSnackbar({
            severity: "error",
            message: error.message,
          });
          return null;
        }
      });
    console.log("Approve Tx:", tx);

    const allowanceAmount = await getAllowance(address);
    setAllowanceAmount(allowanceAmount);
    return tx;
  };

  const swapETHtoBSC = async (amount) => {
    if (!ethSwapContract) {
      showSnackbar({
        severity: "error",
        message: "Can't access to ETH swap contract",
      });
      return null;
    }
    const tokenAmountToSwap = Web3.utils.toBN(amount);
    const calculatedSwapValue = Web3.utils.toHex(tokenAmountToSwap);

    const tx = await ethSwapContract.methods
      .swapETH2BSC(config.ERC20ContractAddress, calculatedSwapValue)
      .send({ from: address, gasLimit: 75000 }, (error, txnHash) => {
        if (error) {
          showSnackbar({
            severity: "error",
            message: error.message,
          });
          return null;
        } else {
          showSnackbar({
            severity: "info",
            message: "Swap transaction complete: " + txnHash,
          });
        }
      });
    console.log("Swap Tx:", tx);
    const allowanceAmount = await getAllowance(address);
    setAllowanceAmount(allowanceAmount);
  };

  const swapBSCtoETH = async (amount) => {
    if (!bscSwapContract) {
      showSnackbar({
        severity: "error",
        message: "Can't access to BSC swap contract",
      });
      return null;
    }
    const tokenAmountToSwap = Web3.utils.toBN(amount);
    const calculatedSwapValue = Web3.utils.toHex(tokenAmountToSwap);

    const tx = await bscSwapContract.methods
      .swapBSC2ETH(config.BEP20ContractAddress, calculatedSwapValue)
      .send({ from: address, gasLimit: 100000 }, (error, txnHash) => {
        if (error) {
          showSnackbar({
            severity: "error",
            message: error.message,
          });
          return null;
        } else {
          showSnackbar({
            severity: "info",
            message: "Swap transaction complete: " + txnHash,
          });
        }
      });
    console.log("Swap Tx:", tx);
    const allowanceAmount = await getAllowance(address);
    setAllowanceAmount(allowanceAmount);
  };

  return (
    <Container maxWidth="sm" style={{ height: "calc(100vh - 76px)" }}>
      <Grid container flexDirection="column" justifyContent="center">
        <Grid item pt={3}>
          <Typography variant="h3" fontWeight="500" fontSize={30}>
            Mindsync (MAI) tokens
          </Typography>
          <Typography variant="h3" fontSize={22}>
            Binance Smart Chain &lt;-&gt; Ethereum bridge
          </Typography>
          <Typography fontSize={18} mt={2}>
            Mindsync is excited to release the Binance Smart Chain (BSC) bridge,
            which marks the inception of tokens in BSC. It allows MAI token
            holders to seamlessly bridge their MAI tokens over to the Binance
            Smart Chain (BEP20) standard.
          </Typography>
        </Grid>
        <Grid item mt={3} mb={10}>
          <Typography variant="h3" fontWeight="700" fontSize={22}>
            Swap your MAI tokens between blockchains
          </Typography>
          <Box mt={3}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="h3" fontSize={18}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    {(() => {
                      switch (index) {
                        case 0:
                          return (
                            <Step1
                              handleNext={handleNext}
                              user={user}
                              setUser={setUser}
                              switchChain={switchChain}
                              showSnackbar={showSnackbar}
                            />
                          );
                        case 1:
                          return (
                            <Step2
                              handleNext={handleNext}
                              handleBack={handleBack}
                              balance={balance}
                              swapAmount={swapAmount}
                              setSwapAmount={setSwapAmount}
                            />
                          );
                        case 2:
                          return (
                            <Step3
                              handleNext={handleNext}
                              handleBack={handleBack}
                              swapAmount={convertToWei(swapAmount)}
                              allowanceAmount={allowanceAmount}
                              approve={approve}
                            />
                          );
                        case 3:
                          return (
                            <Step4
                              handleNext={handleNext}
                              handleBack={handleBack}
                              user={user}
                              swapAmount={convertToWei(swapAmount)}
                              allowanceAmount={allowanceAmount}
                              swapETHtoBSC={swapETHtoBSC}
                              swapBSCtoETH={swapBSCtoETH}
                              showSnackbar={showSnackbar}
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
                <Typography>
                  All steps completed - you&apos;re finished
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Swap again
                </Button>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
