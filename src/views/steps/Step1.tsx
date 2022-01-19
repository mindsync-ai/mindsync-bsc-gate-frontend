import { Typography, Select, MenuItem, Box, Button, Link } from "@mui/material";

export default function Step1({
  handleNext,
  user,
  setUser,
  switchChain,
  showSnackbar,
}) {
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
  };

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
