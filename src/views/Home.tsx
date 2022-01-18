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
  Select,
  MenuItem,
  Slider,
  Link,
} from "@mui/material";

import { AuthContext } from "../contexts/AuthContext";
import { useContracts } from "../contexts/Web3Context";
import { useSnackbar } from "../contexts/Snackbar";
import { config } from "../config";

function Step1({ handleNext, user, setUser, switchChain, showSnackbar }) {
  const handleChange = async (event) => {
    const chainId = parseInt(event.target.value);
    const switchSuccess = await switchChain(chainId);
    if (switchSuccess) {
      setUser((prevUser) => ({
        ...prevUser,
        chainId,
      }));
    }
  };

  const checkConnect = () => {
    if (!user.address) {
      showSnackbar({
        severity: "error",
        message: "Please connect your wallet.",
      });
      return;
    }
    handleNext();
  }

  return (
    <>
      <Typography fontSize={18} mb={2}>
        For example, to swap Ethereum (ERC20) MAI tokens for BSC (BEP20) MAI
        tokens, you should select "Ethereum → BSC" option in the selection field
        or just select network in your wallet.
      </Typography>
      <Select
        value={user.chainId}
        onChange={handleChange}
        displayEmpty
        sx={{ minWidth: 300 }}
      >
        <MenuItem value={1}>Ethereum → BSC</MenuItem>
        <MenuItem value={56}>BSC → Ethereum</MenuItem>
      </Select>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            variant="contained"
            onClick={checkConnect}
            sx={{ mt: 1, mr: 1 }}
          >
            Next
          </Button>
        </div>
      </Box>
      <Typography fontSize={18}>
        To be able to use MetaMask with Binance Smart Chain you should configure
        it first.
      </Typography>
      <Typography fontSize={18}>
        Please{" "}
        <Link
          href="https://docs.binance.org/smart-chain/wallet/metamask.html"
          underline="none"
        >
          read this article
        </Link>{" "}
        on how to use MetaMask with Binance Smart Chain.
      </Typography>
      <Typography fontSize={18}>
        Please make sure you are using the following settings:
      </Typography>
      <ul>
        <li>ChainID: 0x38, 56 in decimal (if 56 doesn’t work, try 0x38)</li>
        <li>Symbol: BNB</li>
        <li>Block Explorer: https://bscscan.com</li>
      </ul>
      <Typography fontSize={18}>
        If you use another wallet, such as Trust Wallet, see{" "}
        <Link
          href="https://docs.binance.org/wallets/bsc-wallets.html"
          underline="none"
        >
          BSC wallet support
        </Link>{" "}
        page.
      </Typography>
    </>
  );
}

function Step2({ handleNext, handleBack, balance, swapAmount, setSwapAmount }) {
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
            onClick={handleNext}
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

function Step3({
  handleNext,
  handleBack,
  swapAmount,
  allowanceAmount,
  approve,
}) {
  const increaseAllowance = async () => {
    console.log("allowed to spend:", allowanceAmount);
    const diff = swapAmount - allowanceAmount;
    if (diff > 0) {
      const result = await approve(swapAmount);
      if (!result) {
        return;
      }
    }
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
        <div>
          <Button
            variant="contained"
            onClick={increaseAllowance}
            sx={{ mt: 1, mr: 1 }}
          >
            Increase Allowance
          </Button>
          <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
            Back
          </Button>
        </div>
      </Box>
    </>
  );
}

function Step4({
  handleNext,
  handleBack,
  user,
  swapAmount,
  allowanceAmount,
  swapETHtoBSC,
  swapBSCtoETH,
  showSnackbar,
}) {
  const swap = async () => {
    const diff = swapAmount - allowanceAmount;
    if (diff > 0) {
      showSnackbar({
        severity: "error",
        message: "Step 3 missed. Amount to swap is not allowed to spend.",
      });
      return;
    }

    let tx;
    if (parseInt(user.chainId) === 1) {
      tx = await swapETHtoBSC(swapAmount);
    } else {
      tx = await swapBSCtoETH(swapAmount);
    }
    console.log("Swap tx:", tx);
    handleNext();
  };

  return (
    <>
      <Typography>This is step4</Typography>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button variant="contained" onClick={swap} sx={{ mt: 1, mr: 1 }}>
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
      .swapETH2BSC(config.BEP20ContractAddress, calculatedSwapValue)
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
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
